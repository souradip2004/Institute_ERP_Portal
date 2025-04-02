"use client";

import { useFetchAllStudentByBatchId } from "@/hooks/useFetchAllStudentByBatchId";

interface ListOfStudentComponentProps {
    batchId: string;
    onBack: () => void;
}

export default function ListOfStudentComponent({ batchId, onBack }: ListOfStudentComponentProps) {
    const { students, loading, error } = useFetchAllStudentByBatchId(batchId);

    if (loading) return <p>Loading students...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div>
            <h2 className="text-xl font-bold">Student List</h2>

            {students.length === 0 ? (
                <p className="text-gray-500">No students available.</p>
            ) : (
                students.map((student) => (
                    <div key={student.userId} className="border p-4 my-2">
                        <p><strong>Roll No:</strong> {student.studentRoll}</p>
                        <p><strong>Enrollment Status:</strong> {student.enrollmentStatus}</p>
                    </div>
                ))
            )}

            <button onClick={onBack} className="mt-4 bg-gray-500 text-white px-4 py-2 rounded">
                Back
            </button>
        </div>
    );
}
