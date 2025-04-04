"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import ClassSectionForm from "@/components/ClassSectionForm";
import AttendanceSessionList from "@/components/AttendanceSessionList";
import useSession from "@/hooks/useSession";
import { useEffect } from "react";


export default  function TeacherDashboard()  {
  const session="txz";
  console.log("session",session)
  const teacherId = "cm8yz7ur40001nhqcqck6i7d1";

  console.log(teacherId);

  const { data: classSections, isLoading } = useQuery({
    queryKey: ["classSections", teacherId],
    queryFn: async () => {
      const response = await axios.get(`/api/class-sections?teacherId=${teacherId}`);
      return response.data;
    },
    enabled: !!teacherId,
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Teacher Dashboard</h1>

      {/* First-time setup: Prompt to add class sections */}
      {classSections?.length === 0 ? (
        <div className="bg-yellow-100 p-4 rounded-md mb-4">
          <p className="mb-2">Welcome! Please create your first class section.</p>
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