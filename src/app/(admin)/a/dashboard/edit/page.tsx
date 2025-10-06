'use client'
import React, { useEffect, useState } from "react";
import EditDashboardPage from "@/components/admin/EditInstitute"
import axios from "axios";
import {Loader2} from "lucide-react";

function Page() {

    const [instituteData, SetInstituteData] = React.useState<any>(null);

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (!user) return;
        const data = JSON.parse(user as string);

        const fetchInstituteData = async () => {
            try {
                const response = await axios.get(`/api/institutions/${data.institutionId}`);
                console.log("Fetched institute data:", response.data);
                SetInstituteData(response.data);
            } catch (err) {
                console.log("error fetching institute data", err);
            }
        };


        fetchInstituteData();

    }, []);


    if (!instituteData) {
        return   <div className="flex flex-col items-center justify-center min-h-screen p-8 text-gray-500">
          <Loader2 className="h-12 w-12 animate-spin mb-4 text-indigo-600"/>
          <p className="text-lg font-medium">Loading Institute details...</p>
        </div>;
    }

    return (
        <EditDashboardPage
            instituteID={instituteData.id}
            name={instituteData.name}
            email={instituteData.email}
            phone={instituteData.phone}
            website={instituteData.website}
            address={instituteData.address}
            city={instituteData.city}
            state={instituteData.state}
            country={instituteData.country}
            type={instituteData.type}
            logoUrl={instituteData.logoUrl}
            primaryColor={instituteData.primaryColor}
        />
    );
}

export default Page;