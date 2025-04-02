"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";

interface ExamFormProps {
  classSectionId: string;
  teacherId: string;
}

export default function ExamForm({ classSectionId, teacherId }: ExamFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    examTypeId: "",
    examDate: "",
    startTime: "",
    endTime: "",
  });

  const { data: examTypes } = useQuery({
    queryKey: ["examTypes"],
    queryFn: async () => (await axios.get("/api/exam-types")).data,
  });

  const { data: exams } = useQuery({
    queryKey: ["exams", classSectionId],
    queryFn: async () =>
      (await axios.get(`/api/exams?classSectionId=${classSectionId}&status=DRAFT`)).data,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) =>
      axios.post("/api/exams", { ...data, classSectionId, createdById: teacherId, status: "DRAFT" }),
  });

  const startMutation = useMutation({
    mutationFn: (examId: string) => axios.put(`/api/exams/${examId}`, { status: "IN_PROGRESS" }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div className="mt-4">
      <h2 className="text-lg font-semibold mb-2">Manage Exams</h2>
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded-md shadow-md mb-4">
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Exam Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="border p-2 rounded"
          />
          <select
            value={formData.examTypeId}
            onChange={(e) => setFormData({ ...formData, examTypeId: e.target.value })}
            className="border p-2 rounded"
          >
            <option value="">Select Exam Type</option>
            {examTypes?.map((type: any) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={formData.examDate}
            onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
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
        </div>
        <button
          type="submit"
          className="mt-4 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? "Creating..." : "Create Exam"}
        </button>
      </form>
      <div>
        <h3 className="text-md font-semibold mb-2">Start an Exam</h3>
        <select className="border p-2 rounded mr-2">
          <option value="">Select Exam</option>
          {exams?.map((exam: any) => (
            <option key={exam.id} value={exam.id}>
              {exam.title}
            </option>
          ))}
        </select>
        <button
          onClick={() => {
            const selectedExam = (document.querySelector("select") as HTMLSelectElement).value;
            if (selectedExam) startMutation.mutate(selectedExam);
          }}
          className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
          disabled={startMutation.isPending}
        >
          {startMutation.isPending ? "Starting..." : "Start Exam"}
        </button>
      </div>
    </div>
  );
}