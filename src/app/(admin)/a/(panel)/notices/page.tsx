// app/(admin)/a/(panel)/notices/page.tsx
import NoticeManagement from "@/components/admin/AminNotice";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function NoticesPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <NoticeManagement />
    </div>
  );
}
