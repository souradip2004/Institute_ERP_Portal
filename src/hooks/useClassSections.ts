import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";

export const useClassSections = (teacherId: string) => {
  const query = useQuery({
    queryKey: ["classSections", teacherId],
    queryFn: async () => (await axios.get(`/api/class-sections?teacherId=${teacherId}`)).data,
  });

  const mutation = useMutation({
    mutationFn: (data: any) => axios.post("/api/class-sections", data),
  });

  return { ...query, createClassSection: mutation };
};