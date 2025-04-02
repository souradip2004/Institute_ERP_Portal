import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";

export const useCourses = (departmentId: string) => {
  const query = useQuery({
    queryKey: ["courses", departmentId],
    queryFn: async () => (await axios.get(`/api/courses?departmentId=${departmentId}`)).data,
  });

  const mutation = useMutation({
    mutationFn: (data: any) => axios.post("/api/courses", data),
  });

  return { ...query, createCourse: mutation };
};