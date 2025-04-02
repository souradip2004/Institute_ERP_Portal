"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ClassSectionFormProps {
  teacherId: string;
}

export default function ClassSectionForm({ teacherId }: ClassSectionFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    sectionName: "",
    batchId: "",
    courseId: "",
    semesterId: "",
    maxStudents: 50,
  });

  const { data: batches } = useQuery({
    queryKey: ["batches", teacherId],
    queryFn: async () => (await axios.get("/api/batches")).data,
  });

  const { data: courses } = useQuery({
    queryKey: ["courses", teacherId],
    queryFn: async () => (await axios.get("/api/courses")).data,
  });

  const { data: semesters } = useQuery({
    queryKey: ["semesters", teacherId],
    queryFn: async () => (await axios.get("/api/semesters")).data,
  });

  const mutation = useMutation({
    mutationFn: (data: any) =>
      axios.post("/api/class-sections", { ...data, teacherId }),
    onSuccess: (response) => {
      router.push(`/dashboard/teacher/student-mapping/${response.data.id}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-md shadow-md mb-4">
      <h2 className="text-lg font-semibold mb-2">Create Class Section</h2>
      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Section Name"
          value={formData.sectionName}
          onChange={(e) => setFormData({ ...formData, sectionName: e.target.value })}
          className="border p-2 rounded"
        />
        <select
          value={formData.batchId}
          onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
          className="border p-2 rounded"
        >
          <option value="">Select Batch</option>
          {batches?.map((batch: any) => (
            <option key={batch.id} value={batch.id}>
              {batch.batchName}
            </option>
          ))}
        </select>
        <select
          value={formData.courseId}
          onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
          className="border p-2 rounded"
        >
          <option value="">Select Course</option>
          {courses?.map((course: any) => (
            <option key={course.id} value={course.id}>
              {course.name}
            </option>
          ))}
        </select>
        <select
          value={formData.semesterId}
          onChange={(e) => setFormData({ ...formData, semesterId: e.target.value })}
          className="border p-2 rounded"
        >
          <option value="">Select Semester</option>
          {semesters?.map((semester: any) => (
            <option key={semester.id} value={semester.id}>
              {semester.name}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Max Students"
          value={formData.maxStudents}
          onChange={(e) =>
            setFormData({ ...formData, maxStudents: Number(e.target.value) })
          }
          className="border p-2 rounded"
        />
      </div>
      <button
        type="submit"
        className="mt-4 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        disabled={mutation.isPending}
      >
        {mutation.isPending ? "Creating..." : "Create Class Section"}
      </button>
    </form>
  );
}