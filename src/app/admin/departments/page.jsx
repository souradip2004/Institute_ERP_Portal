"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import AddDepartmentComponent from "@/components/department/AddDepartmentComponent";
import DepartmentListComponent from "@/components/department/DepartmentListComponent";
import DepartmentDetailComponent from "@/components/department/DepartmentDetailComponent";
import useFetchDepartments from "@/hooks/useFetchDepartments";

export default function DepartmentPage() {
    const [institutionId] = useState("cm8yyte2r0000bobv9amvosiy");
    const [showAddDepartment, setShowAddDepartment] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const { departments, loading, error } = useFetchDepartments(institutionId);
    const router = useRouter();

    if (loading) return <p>Loading departments...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    const handleDepartmentClick = (department) => {
        setSelectedDepartment(department);
    };

    const handleCloseDetail = () => {
        setSelectedDepartment(null);
    };

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Departments</h1>
                {!showAddDepartment && !selectedDepartment && (
                    <button
                        onClick={() => setShowAddDepartment(true)}
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                        Add Department
                    </button>
                )}
            </div>

            {showAddDepartment ? (
                <AddDepartmentComponent onClose={() => setShowAddDepartment(false)} />
            ) : selectedDepartment ? (
                <DepartmentDetailComponent
                    department={selectedDepartment}
                    onClose={handleCloseDetail}
                />
            ) : (
                <DepartmentListComponent
                    departments={departments}
                    onDepartmentClick={handleDepartmentClick}
                />
            )}
        </div>
    );
}
