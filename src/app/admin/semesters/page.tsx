"use client";

import { useState } from "react";
import ListAllSemester from "@/components/semester/ListAllSemester";
import AddSemester from "@/components/semester/AddSemester";
import useFetchAllSemestersByInstituteId from "@/hooks/useFetchAllSemestersByInstituteId";

export default function ViewSemesterPage() {
    const [showAddSemester, setShowAddSemester] = useState(false);
    const institutionId = "cm8yyte2r0000bobv9amvosiy"; // Replace with dynamic value if needed
    const { semesters, loading, error } = useFetchAllSemestersByInstituteId(institutionId);

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Semesters</h1>
                <button
                    onClick={() => setShowAddSemester(true)}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                    Add Semester
                </button>
            </div>
            
            {showAddSemester ? (
                <AddSemester onClose={() => setShowAddSemester(false)} />
            ) : loading ? (
                <p>Loading semesters...</p>
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : (
                <ListAllSemester semesters={semesters} />
            )}
        </div>
    );
}
