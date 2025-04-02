"use client";

import { useParams } from "next/navigation";
import DetailSemester from "@/components/semester/DetailSemester";

export default function Page() {
    const params = useParams();
    console.log('params:', params);

    const semesterId = params?.semesterId || params?.id; // Handle different route params

    if (!semesterId) {
        return <p className="text-red-500">Error: Semester ID not found.</p>;
    }

    return (
        <div className="container mx-auto p-4">
            <DetailSemester semesterId={semesterId} />
        </div>
    );
}
