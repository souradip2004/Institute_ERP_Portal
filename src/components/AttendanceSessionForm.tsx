"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";

interface AttendanceSessionFormProps {
  teacherId: string;
}

export default function AttendanceSessionForm({ teacherId }: AttendanceSessionFormProps) {
  const [formData, setFormData] = useState({
    classSectionId: "",
    sessionDate: "",
    startTime: "",
    endTime: "",
    sessionType: "LECTURE",
  });

  const { data: classSections } = useQuery({
    queryKey: ["classSections", teacherId],
    queryFn: async () =>
      (await axios.get(`/api/class-sections?teacherId=${teacherId}`)).data,
  });

  const mutation = useMutation({
    mutationFn: (data: any) =>
      axios.post("/api/attendance-sessions", { ...data, teacherId, status: "SCHEDULED" }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-md shadow-md mb-4">
      <h2 className="text-lg font-semibold mb-2">Create Attendance Session</h2>
      <div className="grid grid-cols-2 gap-4">
        <select
          value={formData.classSectionId}
          onChange={(e) => setFormData({ ...formData, classSectionId: e.target.value })}
          className="border p-2 rounded"
        >
          <option value="">Select Class Section</option>
          {classSections?.map((section: any) => (
            <option key={section.id} value={section.id}>
              {section.sectionName}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={formData.sessionDate}
          onChange={(e) => setFormData({ ...formData, sessionDate: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          type="time"
          value={formData.startTime}
          onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          type="time"
          value={formData.endTime}
          onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
          className="border p-2 rounded"
        />
        <select
          value={formData.sessionType}
          onChange={(e) => setFormData({ ...formData, sessionType: e.target.value })}
          className="border p-2 rounded"
        >
          <option value="LECTURE">Lecture</option>
          <option value="LAB">Lab</option>
          <option value="TUTORIAL">Tutorial</option>
        </select>
      </div>
      <button
        type="submit"
        className="mt-4 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        disabled={mutation.isPending}
      >
        {mutation.isPending ? "Creating..." : "Create Session"}
      </button>
    </form>
  );
}