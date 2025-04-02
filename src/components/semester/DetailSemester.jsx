"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DetailSemester({ semesterId }) {
    const router = useRouter();
    const [semester, setSemester] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
console.log('semesterId: ', semesterId);
    useEffect(() => {
        if (!semesterId) return;

        async function fetchSemester() {
            try {
                const response = await fetch(`/api/semesters/${semesterId}`);
                if (!response.ok) throw new Error("Failed to fetch semester details");
                const data = await response.json();
                setSemester(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchSemester();
    }, [semesterId]);

    if (loading) return <p>Loading semester details...</p>;
    if (error) return <p className="text-red-500">{error}</p>;
    if (!semester) return <p className="text-gray-500">Semester not found.</p>;

    return (
        <div className="p-4 bg-white shadow-lg rounded-md max-w-md mx-auto">
            <h1 className="text-2xl font-bold">{semester.name}</h1>
            <p><strong>Start Date:</strong> {new Date(semester.startDate).toLocaleDateString()}</p>
            <p><strong>End Date:</strong> {new Date(semester.endDate).toLocaleDateString()}</p>
            <button
                onClick={() => router.back()}
                className="mt-4 bg-gray-500 text-white px-4 py-2 rounded"
            >
                Back
            </button>
        </div>
    );
}
