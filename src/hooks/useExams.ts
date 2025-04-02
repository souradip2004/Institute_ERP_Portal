import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";

export const useExams = (classSectionId: string) => {
  const query = useQuery({
    queryKey: ["exams", classSectionId],
    queryFn: async () =>
      (await axios.get(`/api/exams?classSectionId=${classSectionId}&status=DRAFT`)).data,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => axios.post("/api/exams", data),
  });

  const startMutation = useMutation({
    mutationFn: (examId: string) => axios.put(`/api/exams/${examId}`, { status: "IN_PROGRESS" }),
  });

  return { ...query, createExam: createMutation, startExam: startMutation };
};