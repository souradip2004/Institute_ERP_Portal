// /src/hooks/useAddStudent.ts
import { useState } from "react";

interface Student {
  rollNumber: string;
  userId: string; 
}

export function useAddStudent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addStudent = async (student: Student): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(student),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add student");
      }

      alert("Student added successfully!");
      return true;
    } catch (err: any) {
      setError(err.message);
      alert(`Error: ${err.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { addStudent, loading, error };
}
