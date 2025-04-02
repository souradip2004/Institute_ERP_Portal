"use client";

import { useRouter } from "next/navigation";

export default function ListAllSemester({ semesters }) {
    const router = useRouter();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {semesters.map((semester) => (
                <div
                    key={semester.id}
                    className="p-4 border rounded shadow cursor-pointer hover:shadow-lg"
                    onClick={() => router.push(`/admin/semesters/${semester.id}`)}
                >
                    <h2 className="text-xl font-semibold">{semester.name}</h2>
                    <p className="text-gray-600">Start Date: {new Date(semester.startDate).toLocaleDateString()}</p>
                    <p className="text-gray-600">End Date: {new Date(semester.endDate).toLocaleDateString()}</p>
                </div>
            ))}
        </div>
    );
}
