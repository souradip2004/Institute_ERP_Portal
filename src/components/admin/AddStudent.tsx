"use client";
import { Button } from "@/components/ui/button";
import { v4 as uuidv4 } from "uuid";

export default function AddStudent({ setStudents }: { setStudents: any }) {
  const handleAddStudent = () => {
    const name = (document.getElementById("studentName") as HTMLInputElement).value;
    const email = (document.getElementById("studentEmail") as HTMLInputElement).value;
    const rollNumber = (document.getElementById("studentRoll") as HTMLInputElement).value;

    if (!name) {
      alert("Please enter student name.");
      return;
    }

    setStudents((prev: any) => [...prev, { name, email, rollNumber, id: uuidv4() }]);
  };

  return (
    <div className="p-4 shadow-xl">
      <h2 className="text-xl font-bold mb-4">Add Student</h2>
      <input id="studentName" type="text" placeholder="Enter student's name" className="border px-2 py-1 w-full" />
      <input id="studentEmail" type="email" placeholder="Enter student's email" className="border px-2 py-1 w-full" />
      <input id="studentRoll" type="text" placeholder="Enter roll number" className="border px-2 py-1 w-full" />
      <Button onClick={handleAddStudent}>Add Student</Button>
    </div>
  );
}
