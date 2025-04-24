import { auth } from "@/auth";
import { LogoutButton } from "@/components/auth/logout-button";
import Image from "next/image";
import CreateInstitutionForm from "@/components/ui/createInstitution";
import DeleteInstitutionButton from "@/components/ui/deleteInstitutions";
import Loader from "@/components/ui/Loader";
import { Suspense } from "react";

export default async function DashboardPage() {
  await auth();
  const session = await auth();
   const userId = session?.user?.id;
   const email = session?.user?.email;
  // Todo custom login not work properly ie after successful login, session is null
  //const userId ="cm9q0nf8z0004bowkhzw2d3s0";

  if (!userId) {
    return <p className="text-center text-red-500">User not found.</p>;
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
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Suspense fallback={<Loader size="large" fullScreen message="Loading dashboard..." />}>
        <main className="container mx-auto px-4 py-10 max-w-5xl">
          {/* Profile Section */}
          <div className="mb-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 bg-white rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-purple-400 rounded-full blur-sm opacity-70"></div>
              <Image
                src={userData?.image || "/placeholder.png"}
                alt={userData?.name || "Avatar"}
                className="relative w-24 h-24 rounded-full object-cover border-4 border-white"
                width={96}
                height={96}
              />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-purple-500">
                Welcome, {userData?.name || "User"}
              </h1>
              <p className="text-gray-500 mt-1">
                {userData?.role === "ADMIN" ? "Administrator Dashboard" : "User Dashboard"}
              </p>
              <div className="mt-4">
                <LogoutButton />
              </div>
            </div>
          </div>

          {/* Institution Section */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Institution Management</h2>
            
            {institutionData ? (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm transition-all hover:shadow-md">
                <div className="p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-6 border-b border-gray-100">
                    <h3 className="text-2xl font-bold text-purple-700 mb-2 sm:mb-0">
                      <a href="http://localhost:3000/a" className="hover:underline transition-all">
                        {institutionData.name}
                      </a>
                    </h3>
                    <span className="px-3 py-1 text-xs font-medium text-purple-800 bg-purple-100 rounded-full">
                      {institutionData.type}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm uppercase text-gray-500 font-medium mb-2">Contact Information</h4>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <a href={`mailto:${institutionData.email}`} className="text-purple-600 hover:text-purple-800 transition-colors">
                            {institutionData.email}
                          </a>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span>{institutionData.phone || "N/A"}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                          </svg>
                          <a href={institutionData.website} target="_blank" className="text-purple-600 hover:text-purple-800 transition-colors">
                            {institutionData.website}
                          </a>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-sm uppercase text-gray-500 font-medium mb-2">Location</h4>
                      <p className="flex items-start gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{institutionData.address}, {institutionData.city}, {institutionData.state}, {institutionData.country}</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                    <DeleteInstitutionButton institutionId={institutionData.id} userId={userId} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">Create New Institution</h3>
                <CreateInstitutionForm userId={userId} email={email} />
              </div>
            )}
          </section>
        </main>
      </Suspense>
    </div>
  );
}

