// app/(admin)/a/(panel)/teachers/page.tsx
import ViewTeachers from "@/components/admin/ViewTeachersComponent";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function TeachersPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  // Fetch user details to get institutionId
  const userRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`,
    { cache: "no-store" }
  );
  const userData = await userRes.json();

  let institutionData = null;

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

  const id = institutionData.id;

  return (
    <div className="space-y-6">
      <ViewTeachers id={id} />
    </div>
  );
}
