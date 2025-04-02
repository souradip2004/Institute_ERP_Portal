"use client";

import { useState } from "react";
import ViewHodComponent from "@/components/hod/ViewHodComponent";
import ListOfBatchComponent from "@/components/batch/ListOfBatchComponent";

export default function DepartmentDetailComponent({ department, onClose }) {
    const [activeSection, setActiveSection] = useState("details");

    return (
        <div className="container mx-auto p-4">
            {activeSection === "details" && (
                <>
                    <h1 className="text-2xl font-bold">{department.name}</h1>
                    <p><strong>Code:</strong> {department.code}</p>
                    <p><strong>Description:</strong> {department.description || "No description available."}</p>
                    
                    <div className="mt-4 space-x-4">
                        <button 
                            onClick={() => setActiveSection("hod")}
                            className="bg-blue-500 text-white px-4 py-2 rounded"
                        >
                            HOD
                        </button>
                        <button 
                            onClick={() => setActiveSection("batch")}
                            className="bg-green-500 text-white px-4 py-2 rounded"
                        >
                            Batch
                        </button>
                        <button 
                            onClick={onClose} 
                            className="bg-gray-500 text-white px-4 py-2 rounded"
                        >
                            Back
                        </button>
                    </div>
                </>
            )}

            {activeSection === "hod" && <ViewHodComponent departmentId={department.id} onBack={() => setActiveSection("details")} />}
            {activeSection === "batch" && <ListOfBatchComponent departmentId={department.id} onBack={() => setActiveSection("details")} />}
        </div>
    );
}
