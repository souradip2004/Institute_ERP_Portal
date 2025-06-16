// app/admin/page.tsx
import { auth } from "@/auth";
import Link from "next/link";
import { fetchTeachers, fetchStudents, fetchClasses } from "@/lib/fetchAdminData";
import AddClassComponent from "@/components/admin/AddClass";
import ViewTeachers from "@/components/admin/ViewTeachersComponent";
import ViewClassSectionsPage from "@/components/admin/ViewClassSectionPage";
import ViewStudentPage from "@/components/admin/ViewStudentPage";
import Sider from "@/components/admin/navigator";
import { redirect } from "next/navigation";
import Head from "next/head";

export default async function AdminPage() {
  const session = await auth();

  const userId = session?.user?.id;

  console.log(session)
  if (!userId) {
    redirect("/login");
  }

  // Fetch user details
  const userRes = await fetch(`https://commercial.aiclassroom.in/api/users/${userId}`, { cache: "no-store" });
  const userData = await userRes.json();

  let institutionData = null;

  // Fetch institution details if institutionId exists
  if (userData?.institutionId) {
    const institutionRes = await fetch(`https://commercial.aiclassroom.in/api/institutions/${userData.institutionId}`, {
      cache: "no-store",
    });
    institutionData = await institutionRes.json();
  }
  console.log(userData)
  if (!institutionData) {
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        <h1 style={{ color: "red" }}>No institution found. Please create one.</h1>
        <Link href="/a/dashboard">Create Institution</Link>
      </div>
    );
  }
  console.log(institutionData)
  const id = institutionData.id
  const teachers = await fetchTeachers(institutionData.id);
  const students = await fetchStudents();
  const classes = await fetchClasses();

  return (
    // Removed the outer <div> with display: "flex"
    <>
      <Sider id={id} userId={userId} />
    </>
  );
}