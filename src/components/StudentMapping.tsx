"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface StudentMappingProps {
  classSectionId: string;
}

export default function StudentMapping({ classSectionId }: StudentMappingProps) {
  const router = useRouter();
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const { data: students } = useQuery({
    queryKey: ["students", classSectionId],
    queryFn: async () => (await axios.get("/api/students")).data, // Adjust endpoint as needed
  });

  const mutation = useMutation({
    mutationFn: (studentIds: string[]) =>
      Promise.all(
        studentIds.map((studentId) =>
          axios.post("/api/student-class-enrollments", {
            studentId,
            classSectionId,
            enrollmentStatus: "ENROLLED",
          })
        )
      ),
    onSuccess: () => {
      router.push("/dashboard/teacher");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(selectedStudents);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-md shadow-md">
      <h2 className="text-lg font-semibold mb-2">Map Students to Class Section</h2>
      <div className="max-h-64 overflow-y-auto">
        {students?.map((student: any) => (
          <div key={student.id} className="flex items-center mb-2">
            <input
              type="checkbox"
              value={student.id}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedStudents([...selectedStudents, student.id]);
                } else {
                  setSelectedStudents(selectedStudents.filter((id) => id !== student.id));
                }
              }}
              className="mr-2"
            />
            <span>{student.name} ({student.studentRoll})</span>
          </div>
        ))}
      </div>
      <button
        type="submit"
        className="mt-4 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        disabled={mutation.isPending}
      >
        {mutation.isPending ? "Mapping..." : "Map Students"}
      </button>
    </form>
  );
}