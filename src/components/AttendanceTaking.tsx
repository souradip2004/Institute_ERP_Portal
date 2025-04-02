"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useParams } from "next/navigation";
import { useState } from "react";
import ExamForm from "./ExamForm";

export default function AttendanceTaking() {
  const { id } = useParams();
  const [attendance, setAttendance] = useState<Record<string, string>>({});

  const { data: session, isLoading } = useQuery({
    queryKey: ["attendanceSession", id],
    queryFn: async () => (await axios.get(`/api/attendance-sessions/${id}`)).data,
  });

  const { data: students } = useQuery({
    queryKey: ["students", session?.classSectionId],
    queryFn: async () =>
      (await axios.get(`/api/student-class-enrollments?classSectionId=${session?.classSectionId}`)).data,
    enabled: !!session?.classSectionId,
  });

  const mutation = useMutation({
    mutationFn: (data: any[]) => Promise.all(data.map((item) => axios.post("/api/attendance", item))),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const attendanceData = Object.entries(attendance).map(([studentId, status]) => ({
      attendanceSessionId: id,
      studentId,
      status,
      recordedById: session.teacherId,
      recordedAt: new Date().toISOString(),
    }));
    mutation.mutate(attendanceData);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        Attendance for {session.classSection.sectionName}
      </h1>
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded-md shadow-md">
        <div className="grid grid-cols-4 gap-4 mb-4">
          <p className="font-semibold">Name</p>
          <p className="font-semibold">ID</p>
          <p className="font-semibold">Photo</p>
          <p className="font-semibold">Status</p>
          {students?.map((enrollment: any) => {
            const student = enrollment.student;
            return (
              <div key={student.id} className="contents">
                <p>{student.name}</p>
                <p>{student.studentRoll}</p>
                <p>{student.image ? <img src={student.image} alt="Photo" className="w-10 h-10" /> : "N/A"}</p>
                <select
                  value={attendance[student.id] || "PRESENT"}
                  onChange={(e) => setAttendance({ ...attendance, [student.id]: e.target.value })}
                  className="border p-2 rounded"
                >
                  <option value="PRESENT">Present</option>
                  <option value="ABSENT">Absent</option>
                  <option value="LATE">Late</option>
                </select>
              </div>
            );
          })}
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Saving..." : "Save Attendance"}
        </button>
      </form>
      <ExamForm classSectionId={session.classSectionId} teacherId={session.teacherId} />
    </div>
  );
}