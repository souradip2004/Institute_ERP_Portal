"use client";

import { useState, useEffect } from "react";
import BatchDetailComponent from "@/components/batch/BatchDetailComponent";
import AddBatchComponent from "@/components/batch/AddBatchComponent";

export default function ListOfBatchComponent({ departmentId, onBack }) {
    const [batches, setBatches] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [showAddBatch, setShowAddBatch] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBatches = async () => {
            try {
                const response = await fetch(`/api/departments/${departmentId}/batches`);
                if (!response.ok) throw new Error("Failed to fetch batches");
                const data = await response.json();
                setBatches(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        if (departmentId) fetchBatches();
    }, [departmentId]);

    if (loading) return <p>Loading batches...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    if (selectedBatch) {
        return <BatchDetailComponent batch={selectedBatch} onBack={() => setSelectedBatch(null)} departmentId={departmentId}/>;
    }

    if (showAddBatch) {
        return <AddBatchComponent departmentId={departmentId} onSuccess={() => setShowAddBatch(false)} />;
    }

    return (
        <div>
            <h2 className="text-xl font-bold">Batches</h2>
            <button onClick={() => setShowAddBatch(true)} className="bg-blue-500 text-white px-4 py-2 rounded my-4">
                Add Batch
            </button>

            {batches.length === 0 ? (
                <p className="text-gray-500">No batches available.</p>
            ) : (
                batches.map((batch) => (
                    <div key={batch.id} className="border p-4 cursor-pointer hover:shadow-md" onClick={() => setSelectedBatch(batch)}>
                        <p><strong>Batch:</strong> {batch.batchName}</p>
                        <p><strong>Year:</strong> {batch.year}</p>
                    </div>
                ))
            )}

            <button onClick={onBack} className="mt-4 bg-gray-500 text-white px-4 py-2 rounded">Back</button>
        </div>
    );
}
