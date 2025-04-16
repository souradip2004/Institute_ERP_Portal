import { auth } from "@/auth";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import ClassSectionForm from "@/components/ClassSectionForm";
import AttendanceSessionList from "@/components/AttendanceSessionList";
import useSession from "@/hooks/useSession";
import { cookies } from "next/headers";


export default async function TeacherDashboard()  {
  const session = await auth();
  function decodeJWT(token:any) {
    const [headerB64, payloadB64] = token.split('.');
    
    const decodeBase64 = (str:any) =>
      decodeURIComponent(
        atob(str)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
  
    const header = JSON.parse(decodeBase64(headerB64));
    const payload = JSON.parse(decodeBase64(payloadB64));
  
    return { header, payload };
  }
  console.log("session",session);
  const fetchClassSections = async (teacherId: string) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/class-sections?teacherId=${teacherId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching class sections:", error);
      return [];
    }
  };
    const cookieStore = cookies();
const p=decodeJWT((await cookieStore).get("next-auth.session-token")?.value)
console.log("cookieStore",p)
const userResponse = await axios.get(`http://localhost:3000/api/teachersbyid/${p.payload?.user.id}`);
const teacherId = userResponse.data?.id;
console.log("teacherId",teacherId)
  const classSections = teacherId ? await fetchClassSections(teacherId) : [];
  const isLoading = false;

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Teacher Dashboard</h1>

      {/* First-time setup: Prompt to add class sections */}
      {classSections?.length === 0 ? (
        <div className="bg-yellow-100 p-4 rounded-md mb-4">
          <p className="mb-2">Welcome! {p.payload?.user?.name} Please create your first class section.</p>
          <ClassSectionForm teacherId={teacherId!} />
        </div>
      ) : (
        <>
          <ClassSectionForm teacherId={teacherId!} />
          <AttendanceSessionList teacherId={teacherId!} />
        </>
      )}
    </div>
  );
}