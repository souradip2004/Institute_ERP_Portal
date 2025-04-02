"use client";

import { useState, useEffect } from "react";
import AddHodComponent from "@/components/hod/AddHodComponent";

export default function ViewHodComponent({ departmentId, onBack }) {
    const [hod, setHod] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAddHod, setShowAddHod] = useState(false);
    let fetchHod;
    useEffect(() => {
         fetchHod = async () => {
            try {
                const response = await fetch(`/api/departments/${departmentId}/departmentHead`);
                const data = await response.json();
                setHod(data.hod || null);
            } catch (error) {
                console.error("Error fetching HOD:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHod();
    }, [departmentId]);

    if (loading) return <p>Loading HOD details...</p>;

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    return (
        <div className="p-4 space-y-4">
            {hod ? (
                <>
                    <h2 className="text-xl font-semibold">Head of Department</h2>
                    <div className="space-y-2">
                        <p><strong>Name:</strong> {hod.teacher.user.name}</p>
                        <p><strong>Email:</strong> {hod.teacher.user.email}</p>
                        <p><strong>Teacher Code:</strong> {hod.teacher.teacherCode}</p>
                        <p><strong>Qualification:</strong> {hod.teacher.qualification}</p>
                        <p><strong>Appointment Date:</strong> {formatDate(hod.appointmentDate)}</p>
                        <p><strong>End Date:</strong> {formatDate(hod.endDate)}</p>
                    </div>
                </>
            ) : (
                <>
                    <p>No HOD assigned for this department.</p>
                    <button
                        onClick={() => setShowAddHod(true)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mt-4 transition-colors"
                    >
                        Assign HOD
                    </button>
                </>
            )}

            {showAddHod && (
                <AddHodComponent
                    departmentId={departmentId}
                    onSuccess={() => {
                        setShowAddHod(false);
                        // Refresh the HOD data
                        setLoading(true);
                        fetchHod();
                    }}
                    onCancel={() => setShowAddHod(false)}
                />
            )}

            <button
                onClick={onBack}
                className="mt-4 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
            >
                Back to Departments
            </button>
        </div>
    );
}