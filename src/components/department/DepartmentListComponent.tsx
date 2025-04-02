"use client";

import { Card } from "@/components/ui/card";

export default function DepartmentListComponent({ departments, onDepartmentClick }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map((dept) => (
                <Card
                    key={dept.id}
                    className="p-4 cursor-pointer hover:shadow-lg"
                    onClick={() => onDepartmentClick(dept)}
                >
                    <h2 className="text-xl font-semibold">{dept.name}</h2>
                    <p className="text-gray-600">Code: {dept.code}</p>
                    <p className="text-gray-500 text-sm">{dept.description}</p>
                </Card>
            ))}
        </div>
    );
}
