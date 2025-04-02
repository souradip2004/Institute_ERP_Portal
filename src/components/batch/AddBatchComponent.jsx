"use client";

import { useState } from "react";

export default function AddBatchComponent({ departmentId, onSuccess }) {
    const [batchName, setBatchName] = useState("");
    const [year, setYear] = useState("");

    const handleSubmit = async () => {
        await fetch("/api/batches", {
            method: "POST",
            body: JSON.stringify({ departmentId, batchName, year }),
        });
        onSuccess();
    };

    return (
        <div>
            <h2>Add Batch</h2>
            <input type="text" placeholder="Batch Name" value={batchName} onChange={(e) => setBatchName(e.target.value)} />
            <input type="number" placeholder="Year" value={year} onChange={(e) => setYear(e.target.value)} />
            <button onClick={handleSubmit}>Create</button>
        </div>
    );
}
