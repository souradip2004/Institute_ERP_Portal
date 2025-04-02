"use client";

import { useRouter } from "next/navigation";

export default function BatchDetailComponent({ batch, departmentId, onBack }) {
    const router = useRouter();

    return (
        <div>
            <h2 className="text-xl font-bold">{batch.batchName} ({batch.year})</h2>
            <p><strong>Max Students:</strong> {batch.maxStudents}</p>

            <div className="mt-4 space-x-4">
                <button
                    onClick={() => router.push(`/admin/students?departmentId=${departmentId}&batchId=${batch.id}`)}
                    className="bg-purple-500 text-white px-4 py-2 rounded"
                >
                    Students
                </button>
                <button
                    onClick={onBack}
                    className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                    Back
                </button>
            </div>
        </div>
    );
}
