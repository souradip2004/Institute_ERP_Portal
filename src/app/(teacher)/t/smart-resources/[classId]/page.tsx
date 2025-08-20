"use client"
import React from 'react';
import {SmartResources} from "@/components/teacher/SmartResources";
import { useParams } from 'next/navigation';

function Page() {
     const params = useParams();
    const classId = params!.classId as string;
  return (
    <SmartResources classId={classId}/>
  );
}

export default Page;