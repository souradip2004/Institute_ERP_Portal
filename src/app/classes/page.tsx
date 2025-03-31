"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { v4 as uuidv4 } from "uuid";
import * as XLSX from "xlsx";

export default function ClassesPage() {
  const [classes, setClasses] = useState([
    {
      name: "Example Class",
      token: uuidv4(),
      teachers: [],
      students: [],
    },
  ]);

  const [selectedClass, setSelectedClass] = useState(null);

  const handleFileUpload = (e, type) => {
    const file = e.target.files?.[0];
    if (!file || !selectedClass) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      setClasses((prev) =>
        prev.map((cls) =>
          cls.token === selectedClass
            ? {
                ...cls,
                [type.toLowerCase() + "s"]: [
                  ...cls[type.toLowerCase() + "s"],
                  ...jsonData.map((row) => ({
                    name: row.Name,
                    email: row.Email || "N/A",
                    rollNumber: row.RollNumber || "N/A",
                    id: uuidv4(),
                  })),
                ],
              }
            : cls
        )
      );
    };
    reader.readAsArrayBuffer(file);
  };

  const handleManualAdd = (type) => {
    if (!selectedClass) return;

    const newItem = {
      name: `New ${type}`,
      email: `${type.toLowerCase()}@example.com`,
      id: uuidv4(),
    };

    setClasses((prev) =>
      prev.map((cls) =>
        cls.token === selectedClass
          ? { ...cls, [type.toLowerCase() + "s"]: [...cls[type.toLowerCase() + "s"], newItem] }
          : cls
      )
    );
  };

  const handleRemove = (type, id) => {
    if (!selectedClass) return;
    setClasses((prev) =>
      prev.map((cls) =>
        cls.token === selectedClass
          ? {
              ...cls,
              [type.toLowerCase() + "s"]: cls[type.toLowerCase() + "s"].filter((item) => item.id !== id),
            }
          : cls
      )
    );
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Classes</h2>
      <ul>
        {classes.map((cls) => (
          <li
            key={cls.token}
            className="cursor-pointer text-blue-500 underline mb-2"
            onClick={() => setSelectedClass(cls.token)}
          >
            {cls.name}
          </li>
        ))}
      </ul>

      {selectedClass && (
        <Card className="p-4 mt-4 shadow-lg border border-gray-300">
          <h3 className="text-xl font-bold mb-2">Manage Class</h3>
          <h4 className="mt-2 font-semibold">Teachers</h4>
          <ul className="mb-2">
            {classes.find((cls) => cls.token === selectedClass)?.teachers.map((teacher) => (
              <li key={teacher.id} className="flex justify-between items-center">
                {teacher.name} ({teacher.email})
                <Button className="ml-2 bg-red-500 text-white" onClick={() => handleRemove("Teacher", teacher.id)}>
                  Remove
                </Button>
              </li>
            ))}
          </ul>
          <input type="file" accept=".xlsx, .xls" onChange={(e) => handleFileUpload(e, "Teacher")} />
          <Button className="mt-2 bg-green-500 text-white" onClick={() => handleManualAdd("Teacher")}>
            Add Teacher
          </Button>

          <h4 className="mt-4 font-semibold">Students</h4>
          <ul className="mb-2">
            {classes.find((cls) => cls.token === selectedClass)?.students.map((student) => (
              <li key={student.id} className="flex justify-between items-center">
                {student.name} ({student.email})
                <Button className="ml-2 bg-red-500 text-white" onClick={() => handleRemove("Student", student.id)}>
                  Remove
                </Button>
              </li>
            ))}
          </ul>
          <input type="file" accept=".xlsx, .xls" onChange={(e) => handleFileUpload(e, "Student")} />
          <Button className="mt-2 bg-green-500 text-white" onClick={() => handleManualAdd("Student")}>
            Add Student
          </Button>
        </Card>
      )}
    </div>
  );
}
