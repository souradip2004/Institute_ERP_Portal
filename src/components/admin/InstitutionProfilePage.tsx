"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import InstitutionDetail from "@/components/admin/InstitutionDetailComponent"; 
import InstitutionEdit from "@/components/admin/InstitutionEditComponent";
import useFetchInstituteById from '@/hooks/useFetchInstituteById';

export default function InstitutionProfile() {
 const [institution, setInstitution] = useState(null);
const [activeSection, setActiveSection] = useState("viewInstitution");
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState(null);
const [institutionId, setInstitutionId] = useState("cm8yyte2r0000bobv9amvosiy");

const { institution: fetchedData, loading: institutionLoading, error: institutionError } = 
  useFetchInstituteById(institutionId);

useEffect(() => {
  setIsLoading(institutionLoading);
  setError(institutionError);
  if (!institutionLoading && !institutionError) {
    setInstitution(fetchedData);
  }
}, [fetchedData, institutionLoading, institutionError]);

    const handleEdit = () => {
        setActiveSection("editInstitution");
    };

    const handleSave = (updatedInstitution) => {
        setInstitution(updatedInstitution);
        setActiveSection("viewInstitution");
    };

    if (isLoading) {
        return <p>Loading institution details...</p>;
    }

    if (error) {
        return <p className="text-red-500">{error}</p>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Institution Profile</h1>
            {activeSection === "viewInstitution" && (
                <Card className="shadow-md p-4">
                    <InstitutionDetail institution={institution} onEdit={handleEdit} />
                </Card>
            )}
            {activeSection === "editInstitution" && (
                <Card className="shadow-md p-4">
                    <InstitutionEdit institution={institution} onSave={handleSave} />
                </Card>
            )}
        </div>
    );
}
