// app/admin/AdminPage.tsx
"use client";
import { useState } from "react";
import Sidebar from "@/components/admin not use/Sidebar";
import AddTeacher from "@/components/admin not use/AddTeacher";
import AddStudent from "@/components/admin not use/AddStudent";
import AddClass from "@/components/admin/AddClass";
import ViewTeachers from "@/components/admin not use/ViewTeachers";
import ViewStudents from "@/components/admin not use/ViewStudents";
import ViewClasses from "@/components/admin not use/ViewClasses";
import { useFileUpload } from "@/hooks/admin/useFileUpload";

export default function AdminPage() {
  const { teachers, setTeachers, students, setStudents, classes, setClasses, fileError, handleFileUpload } = useFileUpload();
  const [activeSection, setActiveSection] = useState<string>("classManagement");

  return (
    <div className="flex">
      <Sidebar setActiveSection={setActiveSection} />
      <div className="p-6 space-y-4 flex-1">
        {fileError && <div className="text-red-500">{fileError}</div>}
        {activeSection === "addTeacher" && <AddTeacher setTeachers={setTeachers} />}
        {activeSection === "addStudent" && <AddStudent setStudents={setStudents} />}
        {activeSection === "addClass" && <AddClass setClasses={setClasses} />}
        {activeSection === "viewTeachers" && <ViewTeachers teachers={teachers} />}
        {activeSection === "viewStudents" && <ViewStudents students={students} />}
        {activeSection === "viewClasses" && <ViewClasses classes={classes} />}
      </div>
    </div>
  );
}
