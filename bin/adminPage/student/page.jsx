"use client";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ListOfStudentComponent from "@/components/student/ListOfStudentComponent";

export default function Page() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // Extracting query params
    const departmentId = searchParams.get("departmentId");
    const batchId = searchParams.get("batchId");

    // State management
    const [showStudentList, setShowStudentList] = useState(false);

    const navigateToAddStudent = () => {
        router.push(`/admin/students/add?departmentId=${departmentId}&batchId=${batchId}`);
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold">Manage Students</h1>
            <div className="mt-4 space-x-4">
                <button
                    onClick={() => setShowStudentList(true)}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                    View Students
                </button>
                <button
                    onClick={navigateToAddStudent}
                    className="bg-green-500 text-white px-4 py-2 rounded"
                >
                    Add Student
                </button>
            </div>
            {showStudentList && batchId && (
                <ListOfStudentComponent batchId={batchId} onBack={() => setShowStudentList(false)} />
            )}
        </div>
    );
}