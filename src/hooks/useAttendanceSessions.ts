import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";

export const useAttendanceSessions = (teacherId: string) => {
  const query = useQuery({
    queryKey: ["attendanceSessions", teacherId],
    queryFn: async () => (await axios.get(`/api/attendance-sessions?teacherId=${teacherId}`)).data,
  });

  const mutation = useMutation({
    mutationFn: (data: any) => axios.post("/api/attendance-sessions", data),
  });

  return { ...query, createAttendanceSession: mutation };
};