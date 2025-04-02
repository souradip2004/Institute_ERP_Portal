import { useState } from "react";

export default function AddSemester({ onClose }) {
    const [name, setName] = useState("Spring 2024 - Rakesh Kumar");
    const [startDate, setStartDate] = useState("2024-01-10");
    const [endDate, setEndDate] = useState("2024-06-15");
    const [error, setError] = useState(null);

    const handleSubmit = async () => {
        if (!name || !startDate || !endDate) {
            setError("All fields are required");
            return;
        }
        try {
            const response = await fetch("/api/semesters", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    startDate,
                    endDate,
                    institutionId: "cm8yyte2r0000bobv9amvosiy", // Hardcoded for development
                    isCurrent: true, // Hardcoded for development
                }),
            });
            if (!response.ok) throw new Error("Failed to create semester");
        
            onClose();
        } catch (err) {
            setError("Error creating semester");
        }
    };

    return (
        <div className="p-4 bg-white shadow-lg rounded-md max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4">Add Semester</h2>
            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
            <input
                type="text"
                placeholder="Semester Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 mb-2 border rounded"
            />
            <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2 mb-2 border rounded"
            />
            <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2 mb-4 border rounded"
            />
            <button
                onClick={handleSubmit}
                className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            >
                Create Semester
            </button>
        </div>
    );
}
