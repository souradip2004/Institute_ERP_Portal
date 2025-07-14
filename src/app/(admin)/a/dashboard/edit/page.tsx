'use client'
import React, { useEffect, useState } from "react";
import EditDashboardPage from "@/components/admin/EditInstitute"
import axios from "axios";

function Page() {

    const userdata = localStorage.getItem('user');

    const [instituteData, SetInstituteData] = React.useState<any>(null);

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (!user) return;
        const data = JSON.parse(user as string);

        const fetchInstituteData = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/institutions/${data.institutionId}`);
                console.log("Fetched institute data:", response.data);
                SetInstituteData(response.data);
            } catch (err) {
                console.log("error fetching institute data", err);
            }
        };


        fetchInstituteData();

    }, []);


    if (!instituteData) {
        return <div>Loading...</div>;
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
            primaryColor={instituteData.primaryColor}
        />
    );
}

export default Page;