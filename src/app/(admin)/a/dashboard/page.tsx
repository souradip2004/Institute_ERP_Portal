import { auth } from "@/auth";
import { LogoutButton } from "@/components/auth/logout-button";
import Image from "next/image";
import CreateInstitutionForm from "@/components/ui/createInstitution";
import DeleteInstitutionButton from "@/components/ui/deleteInstitutions";
import Loader from "@/components/ui/Loader";
import { Suspense } from "react";
import {
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Shield
} from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  await auth();
  const session = await auth();
  const userId = session?.user?.id;
  const email = session?.user?.email;
  // Todo custom login not work properly ie after successful login, session is null
  //const userId ="cm9q0nf8z0004bowkhzw2d3s0";

  if (!userId) {
    redirect("/login");
  }

  // Fetch user details
  const userRes = await fetch(`http://localhost:3000/api/users/${userId}`, { cache: "no-store" });
  const userData = await userRes.json();

  let institutionData = null;

  // Fetch institution details if institutionId exists
  if (userData?.institutionId) {
    const institutionRes = await fetch(`http://localhost:3000/api/institutions/${userData.institutionId}`, {
      cache: "no-store",
    });
    institutionData = await institutionRes.json();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-gray-100 dark:from-gray-900 dark:to-slate-950">
      <Suspense fallback={<Loader size="large" fullScreen message="Loading dashboard..." />}>
        <main className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Profile Section */}
          <div className="mb-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 sm:p-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md">
            <div className="relative">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full blur-sm opacity-75"></div>
              <div className="relative">
                <Image
                  src={userData?.image || "/placeholder.png"}
                  alt={userData?.name || "Avatar"}
                  className="w-28 h-28 rounded-full object-cover border-4 border-white dark:border-gray-800"
                  width={112}
                  height={112}
                  priority
                />
                {userData?.role === "ADMIN" && (
                  <div className="absolute -bottom-1 -right-1 bg-amber-500 rounded-full p-1.5 border-2 border-white dark:border-gray-800">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </div>

            <div className="text-center sm:text-left flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-700 to-indigo-500 dark:from-violet-500 dark:to-indigo-300">
                    Welcome, {userData?.name || "User"}
                  </h1>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">
                    {userData?.role === "ADMIN" ? "Administrator Dashboard" : "User Dashboard"}
                  </p>
                </div>
                <div className="flex justify-center">
                  <LogoutButton />
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{userData?.email || email || "No email"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Role: {userData?.role || "User"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Institution Section */}
          <section className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                <span className="inline-flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-500" />
                  Institution Management
                </span>
              </h2>

              {institutionData && (
                <div className="mt-2 sm:mt-0">
                  <Link
                    href="http://localhost:3000/a"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950"
                    )}
                  >
                    Go to Institution Portal
                  </Link>
                </div>
              )}
            </div>

            {institutionData ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm transition-all hover:shadow-md">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h3 className="text-2xl font-bold text-white">
                      {institutionData.name}
                    </h3>
                    <span className="px-3 py-1 text-xs font-medium text-indigo-800 bg-indigo-100 rounded-full self-start">
                      {institutionData.type}
                    </span>
                  </div>
                </div>

                <div className="p-6 sm:p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <h4 className="text-sm uppercase text-gray-500 dark:text-gray-400 font-medium flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          Contact Information
                        </h4>
                        <ul className="space-y-4 bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                          <li className="flex items-start gap-3">
                            <Mail className="w-5 h-5 text-indigo-500 dark:text-indigo-400 mt-0.5" />
                            <div>
                              <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Email</span>
                              <a href={`mailto:${institutionData.email}`} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors">
                                {institutionData.email}
                              </a>
                            </div>
                          </li>
                          <li className="flex items-start gap-3">
                            <Phone className="w-5 h-5 text-indigo-500 dark:text-indigo-400 mt-0.5" />
                            <div>
                              <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Phone</span>
                              <span className="text-gray-700 dark:text-gray-300">{institutionData.phone || "N/A"}</span>
                            </div>
                          </li>
                          <li className="flex items-start gap-3">
                            <Globe className="w-5 h-5 text-indigo-500 dark:text-indigo-400 mt-0.5" />
                            <div>
                              <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Website</span>
                              <a href={institutionData.website} target="_blank" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors">
                                {institutionData.website}
                              </a>
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm uppercase text-gray-500 dark:text-gray-400 font-medium flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Location
                      </h4>
                      <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-indigo-500 dark:text-indigo-400 mt-0.5" />
                          <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Address</span>
                            <span className="text-gray-700 dark:text-gray-300">
                              {institutionData.address}, {institutionData.city}, {institutionData.state}, {institutionData.country}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                        <DeleteInstitutionButton institutionId={institutionData.id} userId={userId} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 sm:p-8 shadow-sm">
                <div className="mb-6 bg-indigo-50 dark:bg-indigo-950/50 p-4 rounded-lg border border-indigo-100 dark:border-indigo-900/50">
                  <h3 className="text-xl font-semibold text-indigo-700 dark:text-indigo-400 mb-2">Create New Institution</h3>
                  <p className="text-sm text-indigo-600/80 dark:text-indigo-300/80">Set up your institution to start managing classes, teachers, and students.</p>
                </div>
                <CreateInstitutionForm userId={userId} email={email || ""} />
              </div>
            )}
          </section>
        </main>
      </Suspense>
    </div>
  );
}

