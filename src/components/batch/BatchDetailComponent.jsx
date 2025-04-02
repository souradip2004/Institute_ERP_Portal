"use client";

export default function BatchDetailComponent({ batch, onBack }) {
    return (
        <div>
            <h2 className="text-xl font-bold">{batch.batchName} ({batch.year})</h2>
            <p><strong>Max Students:</strong> {batch.maxStudents}</p>
            <button onClick={onBack} className="mt-4 bg-gray-500 text-white px-4 py-2 rounded">Back</button>
        </div>
    );
}
