'use client'
import React from 'react';
import EditDashboardPage from "@/components/admin/EditInstitute"

function Page() {
    return (

        <EditDashboardPage
            instituteID="inst_4d8f9b2c"
            name="Horizon Academy of Science"
            email="admissions@horizon-academy.edu"
            phone="+1 (555) 202-4567"
            website="https://www.horizon-academy.edu"
            address="452 Innovation Drive"
            city="Starlight City"
            state="Veridia"
            country="Republic of Innovatia"
            type="school"
            primaryColor="#059669" // A nice emerald green
        />

    );
}

export default Page;