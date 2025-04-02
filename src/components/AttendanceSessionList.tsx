"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Link from "next/link";
import AttendanceSessionForm from "./AttendanceSessionForm";

interface AttendanceSessionListProps {
  teacherId: string;
}

export default function AttendanceSessionList({ teacherId }: AttendanceSessionListProps) {
  const { data: sessions, isLoading } = useQuery({
    queryKey: ["attendanceSessions", teacherId],
    queryFn: async () =>
      (await axios.get(`/api/attendance-sessions?teacherId=${teacherId}`)).data,
  });

  if (isLoading) return <div>Loading sessions...</div>;

  return (
    <div>
      <AttendanceSessionForm teacherId={teacherId} />
      <h2 className="text-lg font-semibold mb-2">Attendance Sessions</h2>
      <div className="grid gap-4">
        {sessions?.map((session: any) => (
          <Link
            key={session.id}
            href={`/dashboard/teacher/attendance-session/${session.id}`}
            className="bg-white p-4 rounded-md shadow-md hover:bg-gray-100"
          >
            <p>
              <strong>{session.classSection.sectionName}</strong> - {session.sessionType}
            </p>
            <p>
              {session.sessionDate} {session.startTime} - {session.endTime}
            </p>
            <p>Status: {session.status}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}