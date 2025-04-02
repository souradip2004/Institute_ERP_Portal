"use client";

import { useState } from "react";

export default function AddBatchComponent({ departmentId, onSuccess }) {
    const [batchName, setBatchName] = useState("2022-2026");
    const [year, setYear] = useState("2026");
    const [maxStudents, setMaxStudents] = useState("60");
    const [error, setError] = useState(null);

    const handleSubmit = async () => {
        if (!batchName || !year || !maxStudents) {
            setError("All fields are required");
            return;
        }

        try {
            const response = await fetch("/api/batches", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ departmentId, batchName, year: parseInt(year), maxStudents: parseInt(maxStudents) }),
            });
            if (!response.ok) throw new Error("Failed to create batch");
            onSuccess();
        } catch (err) {
            setError("Error creating batch");
        }
    };

    return (
        <div className="p-4 bg-white shadow-lg rounded-md max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4">Add Batch</h2>
            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
            <input
                type="text"
                placeholder="Batch Name"
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
                className="w-full p-2 mb-2 border rounded"
            />
            <input
                type="number"
                placeholder="Year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full p-2 mb-2 border rounded"
            />
            <input
                type="number"
                placeholder="Max Students"
                value={maxStudents}
                onChange={(e) => setMaxStudents(e.target.value)}
                className="w-full p-2 mb-4 border rounded"
            />
            <button
                onClick={handleSubmit}
                className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            >
                Create Batch
            </button>
        </div>
    );
}