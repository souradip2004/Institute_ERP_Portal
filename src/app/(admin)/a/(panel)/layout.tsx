// app/(admin)/a/(panel)/layout.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  // Fetch user details
  const userRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`,
    { cache: "no-store" }
  );
  const userData = await userRes.json();
  const userVerified = userData.isVerified;
  const coins = userData.coins || 0;

  let institutionData = null;

  // Fetch institution details if institutionId exists
  if (userData?.institutionId) {
    const institutionRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/institutions/${userData.institutionId}`,
      { cache: "no-store" }
    );
    institutionData = await institutionRes.json();
  }

  if (!institutionData) {
    redirect("/a/dashboard");
  }

  const institutionLogo = institutionData?.logoUrl || null;
  const id = institutionData.id;

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar
        id={id}
        userId={userId}
        logo={institutionLogo}
        name={institutionData.name}
        primaryColor={institutionData.primaryColor}
        verified={userVerified}
        coins={coins}
      />
      <main className="flex-1 p-6 overflow-y-auto ml-0 md:ml-64 transition-all duration-300 ease-in-out">
        {children}
      </main>
    </div>
  );
}
