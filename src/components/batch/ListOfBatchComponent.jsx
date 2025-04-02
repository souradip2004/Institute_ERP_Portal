"use client";

import { useState, useEffect } from "react";
import BatchDetailComponent from "@/components/batch/BatchDetailComponent";
import AddBatchComponent from "@/components/batch/AddBatchComponent";

export default function ListOfBatchComponent({ departmentId, onBack }) {
    const [batches, setBatches] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [showAddBatch, setShowAddBatch] = useState(false);

    useEffect(() => {
        const fetchBatches = async () => {
            const response = await fetch(`/api/${departmentId}/batches`);
            const data = await response.json();
            setBatches(data);
        };
        fetchBatches();
    }, [departmentId]);

    if (selectedBatch) return <BatchDetailComponent batch={selectedBatch} onBack={() => setSelectedBatch(null)} />;
    if (showAddBatch) return <AddBatchComponent departmentId={departmentId} onSuccess={() => setShowAddBatch(false)} />;

    return (
        <div>
            <h2 className="text-xl font-bold">Batches</h2>
            <button onClick={() => setShowAddBatch(true)} className="bg-blue-500 text-white px-4 py-2 rounded my-4">
                Add Batch
            </button>
            {batches.map((batch) => (
                <div key={batch.id} className="border p-4 cursor-pointer" onClick={() => setSelectedBatch(batch)}>
                    <p><strong>Batch:</strong> {batch.batchName}</p>
                    <p><strong>Year:</strong> {batch.year}</p>
                </div>
            ))}
            <button onClick={onBack} className="mt-4 bg-gray-500 text-white px-4 py-2 rounded">Back</button>
        </div>
    );
}
