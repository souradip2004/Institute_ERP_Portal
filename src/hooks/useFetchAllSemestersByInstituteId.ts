"use client";

import { useState, useEffect } from "react";

export default function useFetchAllSemestersByInstituteId(institutionId: string) {
    const [semesters, setSemesters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!institutionId) return;

        const fetchSemesters = async () => {
            try {
                const response = await fetch(`/api/institutions/${institutionId}/semesters`);
                if (!response.ok) throw new Error("Failed to fetch semesters");

                const data = await response.json();
                setSemesters(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSemesters();
    }, [institutionId]);

    return { semesters, loading, error };
}
