"use client";

import { useEffect, useState } from "react";

export function useFetchAllStudentByBatchId(batchId: string | null) {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStudents = async () => {
            if (!batchId) return;

            try {
                const response = await fetch(`/api/students?batchId=${batchId}`);
                if (!response.ok) throw new Error("Failed to fetch students");
                const data = await response.json();
                setStudents(data);
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, [batchId]);

    return { students, loading, error };
}
