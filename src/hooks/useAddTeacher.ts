import { useState } from "react";

interface Teacher {
  name: string;
  email: string;
  userId:string;
}

export function useAddTeacher() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addTeacher = async (teacher: Teacher): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(teacher),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add teacher");
      }

      alert("Teacher added successfully!");
      return true;
    } catch (err: any) {
      setError(err.message);
      alert(`Error: ${err.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { addTeacher, loading, error };
}
