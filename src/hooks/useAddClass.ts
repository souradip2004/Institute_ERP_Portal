"use client";
import { useState } from "react";

interface Class {
  sectionName: string;
  maxStudents: number;
  batchId: string;
  courseId: string;
  semesterId: string;
  teacherId: string;
  createdAt?: string;
  departmentId?: string;
}

export function useAddClass() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addClass = async (newClass: Class): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/class-sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newClass),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add class");
      }

      alert("Class added successfully!");
      return true;
    } catch (err: any) {
      setError(err.message);
      alert(`Error: ${err.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { addClass, loading, error };
}
