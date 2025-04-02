"use client";

import { useState } from "react";

export default function AddHodComponent({ departmentId, onSuccess }) {
    const [teacherId, setTeacherId] = useState("");

    const requestBody = {
        teacherId: teacherId,
        departmentId: departmentId,
        appointmentDate: new Date().toISOString() // or use a specific date
    };
    const handleSubmit = async () => {
        await fetch("/api/departmentHead", {
            method: "POST",
            body: JSON.stringify(requestBody),
        });
        onSuccess();
    };

    return (
        <div className="p-4 border rounded">
            <h2 className="text-lg font-semibold">Assign HOD</h2>
            <input 
                type="text" 
                placeholder="Enter Teacher ID" 
                value={teacherId} 
                onChange={(e) => setTeacherId(e.target.value)}
                className="border p-2 w-full mt-2"
            />
            <button onClick={handleSubmit} className="bg-blue-500 text-white px-4 py-2 rounded mt-4">
                Assign
            </button>
        </div>
    );
}
