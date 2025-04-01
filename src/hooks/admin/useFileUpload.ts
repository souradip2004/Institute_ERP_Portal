// hooks/admin/useFileUpload.ts
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import * as XLSX from "xlsx";

interface Teacher {
  id: string;
  name: string;
  email: string;
}

interface Student {
  id: string;
  name: string;
  email?: string;
  rollNumber?: string;
}

interface ClassItem {
  name: string;
  token: string;
  teachers: string[];
  students: string[];
}

export function useFileUpload() {
  const [fileError, setFileError] = useState<string>("");
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);

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
            setTeachers((prev) => [...prev, { name: row.Name, email: row.Email, id: uuidv4() }]);
          } else if (type === "Student" && row.Name) {
            setStudents((prev) => [...prev, { name: row.Name, id: uuidv4(), email: row.Email || undefined, rollNumber: row.RollNumber || undefined }]);
          } else if (type === "Class" && row.Name) {
            setClasses((prev) => [...prev, { name: row.Name, token: uuidv4(), teachers: [], students: [] }]);
          } else {
            throw new Error(`Invalid row format for ${type}.`);
          }
        });

        setFileError("");
      } catch (error) {
        setFileError(`Invalid file format. Please check the demo format. Error: ${(error as Error).message}`);
      }
    };
    reader.readAsArrayBuffer(file);
  };
  return {
    teachers,
    setTeachers, 
    students,
    setStudents,
    classes,
    setClasses, 
    fileError,
    handleFileUpload,
  };
}
