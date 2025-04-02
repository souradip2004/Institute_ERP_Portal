"use client";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { v4 as uuidv4 } from "uuid";
import * as XLSX from "xlsx";
import { useAddTeacher } from "@/hooks/useAddTeacher";
import { useFetchTeacher } from "@/hooks/useFetchTeacher";
import { useFetchStudent } from "@/hooks/useFetchStudent";
import { useFetchClass } from "@/hooks/useFetchClass";
import AddClassComponent from "@/components/admin/AddClass";
import AddStudentComponent from "@/components/admin/AddStudent";
import ViewClassSection from "@/components/admin/ViewClassSection";
import StudentsList from "@/components/admin/StudentsListComponent";
import StudentDetail from "@/components/admin/StudentdetailComponent";
import ViewTeachers from "@/components/admin/ViewTeachersComponent";

export default function AdminPage() {
  const { getAllTeachers, error: teacherError } = useFetchTeacher();
  const { getAllStudents, error: studentError } = useFetchStudent();
  const { getAllClasses, error: classError } = useFetchClass();
  const [teachers, setTeachers] = useState<{ name: string; email: string; id: string, [key: string]: any; }[]>([]);

  const [students, setStudents] = useState<{ name: string; id: string; email?: string; rollNumber?: string }[]>([]);

  const [classes, setClasses] = useState<{ name: string; token?: string; id: string; teachers: string[]; students: string[];[key: string]: any }[]>([]);

  const { addTeacher, loading } = useAddTeacher();
  const [activeSection, setActiveSection] = useState("classManagement");
  const [fileError, setFileError] = useState("");

  // const [activeSection, setActiveSection] = useState("viewStudents");
  const [selectedStudent, setSelectedStudent] = useState(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "Teacher" | "Student" | "Class") => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData: any[] = XLSX.utils.sheet_to_json(sheet);

        jsonData.forEach((row) => {
          if (type === "Teacher" && row.Name && row.Email) {
            setTeachers((prev) => [
              ...prev,
              { name: row.Name, email: row.Email, id: uuidv4() },
            ]);
          } else if (type === "Student" && row.Name) {
            setStudents((prev) => [
              ...prev,
              {
                name: row.Name,
                id: uuidv4(),
                email: row.Email || undefined,
                rollNumber: row.RollNumber || undefined,
              },
            ]);
          } else if (type === "Class" && row.Name) {
            setClasses((prev) => [
              ...prev,
              {
                name: row.Name,
                token: uuidv4(),
                teachers: [],
                students: [],
              },
            ]);
          } else {
            throw new Error("Invalid row format");
          }
        });
        setFileError("");
      } catch (error) {
        setFileError("Invalid file format. Please check the demo format.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleManualAdd = (type: "Teacher" | "Student" | "Class", data: any) => {
    if (type === "Teacher" && data.name && data.email) {
      setTeachers((prev) => [...prev, { name: data.name, email: data.email, id: uuidv4() }]);
    } else if (type === "Student" && data.name) {
      setStudents((prev) => [
        ...prev,
        { name: data.name, email: data.email, rollNumber: data.rollNumber, id: uuidv4() },
      ]);
    } else if (type === "Class" && data.name) {
      setClasses((prev) => [...prev, { name: data.name, token: uuidv4(), teachers: [], students: [] }]);
    } else {
      alert("Invalid input. Please fill in all required fields.");
    }
  };

  useEffect(() => {
    const fetchTeachers = async () => {
      if (activeSection === "viewTeachers") {
        const temp = await getAllTeachers();
        setTeachers(temp);
        console.log("teachers: ", temp);
      }
      else if (activeSection === "viewStudents") {
        const temp = await getAllStudents();
        setStudents(temp);
        console.log("students: ", temp);
      } else if (activeSection === "viewClasses") {
        const temp = await getAllClasses();
        setClasses(temp);
        console.log("classes: ", temp);
      }
    };

    fetchTeachers();
  }, [activeSection]);



  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="w-1/4 p-4 bg-gray-100 h-screen">
        <h2 className="text-2xl font-bold mb-4">Admin Panel</h2>
        <ul className="space-y-2">
          <li
            onClick={() => setActiveSection("classManagement")}
            className="cursor-pointer hover:text-blue-500"
          >
            Class Management
          </li>
          <li
            onClick={() => setActiveSection("addTeacher")}
            className="cursor-pointer hover:text-blue-500"
          >
            Add Teacher
          </li>
          <li
            onClick={() => setActiveSection("addStudent")}
            className="cursor-pointer hover:text-blue-500"
          >
            Add Student
          </li>
          <li
            onClick={() => setActiveSection("addClass")}
            className="cursor-pointer hover:text-blue-500"
          >
            Add Class
          </li>
          <li
            onClick={() => setActiveSection("viewTeachers")}
            className="cursor-pointer hover:text-blue-500"
          >
            View Teachers
          </li>
          <li
            onClick={() => setActiveSection("viewStudents")}
            className="cursor-pointer hover:text-blue-500"
          >
            View Students
          </li>
          <li
            onClick={() => setActiveSection("viewClasses")}
            className="cursor-pointer hover:text-blue-500"
          >
            View Classes
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-4 flex-1">
        {fileError && <div className="text-red-500">{fileError}</div>}
        {activeSection === "addTeacher" && (
          <Card className="p-4 shadow-xl">
            <h2 className="text-xl font-bold mb-4">Add Teacher</h2>
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={(e) => handleFileUpload(e, "Teacher")}
              className="mb-4"
            />
            <div className="space-y-4">
              <div>
                <label className="block font-semibold mb-1">Name</label>
                <input
                  type="text"
                  id="teacherName"
                  className="border border-gray-300 rounded px-2 py-1 w-full"
                  placeholder="Enter teacher's name"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Email</label>
                <input
                  type="email"
                  id="teacherEmail"
                  className="border border-gray-300 rounded px-2 py-1 w-full"
                  placeholder="Enter teacher's email"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1"> user id</label>
                <input
                  type="text"
                  id="userId"
                  className="border border-gray-300 rounded px-2 py-1 w-full"
                  placeholder="Enter userId "
                />
              </div>

              <Button
                onClick={async () => {
                  const name = (document.getElementById("teacherName") as HTMLInputElement).value;
                  const email = (document.getElementById("teacherEmail") as HTMLInputElement).value;
                  const userId = (document.getElementById("userId") as HTMLInputElement).value;

                  if (!name || !email || !userId) {
                    alert("Please fill in all fields.");
                    return;
                  }

                  const success = await addTeacher({ name, email, userId });

                  // if (success) {
                  //     setTeachers((prev) => [...prev, { name, email, id: uuidv4() }]);
                  // }
                }}
                disabled={loading}
              >
                {loading ? "Adding..." : "Add Teacher"}
              </Button>
            </div>
          </Card>
        )}
        {activeSection === "addClass" && (
          < AddClassComponent />
        )}
        {activeSection === "addStudent" && (
          < AddStudentComponent />
        )}
        {activeSection === "viewTeachers" && (
          <Card className="p-4 shadow-xl">
            <ViewTeachers/>
          </Card>
        )}
        {activeSection === "viewStudents" && (
          <Card className="shadow-xl">
            <StudentsList students={students} />
          </Card>
        )}


        {activeSection === "viewClasses" && (
          <Card className="shadow-xl">
            <ViewClassSection classes={classes} />
            </Card>
        )}
      </div>
    </div>
  );
}
