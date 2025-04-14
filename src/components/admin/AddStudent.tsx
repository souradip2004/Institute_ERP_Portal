"use client";
import { useState,useEffect } from "react";
import { useAddStudent } from "@/hooks/useAddStudent";

export default function AddStudentComponent({ id }) {
  const [classData, setClassData] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);
  useEffect(() => {
    fetch("http://localhost:3000/api/departments",{
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Department Data:", data);
        const filteredDepartments = data.filter((department) => department.institutionId === id);
        setDepartmentData(filteredDepartments);
        console.log("Filtered Departments:", filteredDepartments);
      })
      .catch((error) => {
        console.error("Error fetching departments:", error);
      });
    })
  const [studentData, setStudentData] = useState({
    rollNumber: "",
    department: "",
    email: "",
    password: "",
    institutionid: id,
    class: "",
    newDepartment: "",
  });

  const { addStudent, loading, error } = useAddStudent();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting Student Data:", studentData);
    await addStudent(studentData);
  };

  return (
    <div className="flex">
      <form onSubmit={handleSubmit}>
        <h2 className="p-5">Add Student</h2>
        <input
          type="text"
          placeholder="Roll Number"
          value={studentData.rollNumber}
          onChange={(e) => setStudentData({ ...studentData, rollNumber: e.target.value })}
          className="border border-black w-45 m-5 p-2"
        />
      
        <input
          type="email"
          placeholder="Email (Optional)"
          value={studentData.email}
          onChange={(e) => setStudentData({ ...studentData, email: e.target.value })}
          className="border border-black w-45 m-5 p-2"
        />
        <input
          type="password"
          placeholder="Password (Optional)"
          value={studentData.password}
          onChange={(e) => setStudentData({ ...studentData, password: e.target.value })}
          className="border border-black w-45 m-5 p-2"
        />
        <div className="m-5">
          <select
            value={studentData.department}
            onChange={(e) => setStudentData({ ...studentData, department: e.target.value })}
            className="border border-black w-45 p-2"
          >
            <option value="" disabled>
              Select Department
            </option>
            {departmentData.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
            <option value="NEW_DEPARTMENT">Add New Department</option>
            {/* Existing departments will be dynamically populated */}
          </select>
          {studentData.department === "NEW_DEPARTMENT" && (
            <div className="mt-5">
              <input
                type="text"
                placeholder="New Department Name"
                value={studentData.newDepartment || ""}
                onChange={(e) =>
                  setStudentData({ ...studentData, newDepartment: e.target.value })
                }
                className="border border-black w-45 m-5 p-2"
              />
              <button
                type="button"
                onClick={async () => {
                  let randomdigits=""+Math.floor(1000 + Math.random() * 9000);
                  fetch("http://localhost:3000/api/departments", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      name: studentData.newDepartment,
                      institutionId: id,
                      code: randomdigits
                    }),
                  })
                    .then((res) => res.json())
                    .then((data) => {
                      console.log("New Department Created:", data);
                      setStudentData({ ...studentData, department: data.id });
                    })
                    .catch((error) => {
                      console.error("Error creating department:", error);
                    })
                    .finally(() => {
                      alert("Department added successfully!");
                      window.location.reload();
                    }
                  )
                }}
                className="border border-black w-25 rounded-2xl bg-black text-white"
              >
                Add Department
              </button>
            </div>
          )}
        </div>
        <div className="m-5">
          <select
            value={studentData.class}
            onChange={(e) => setStudentData({ ...studentData, class: e.target.value })}
            className="border border-black w-45 p-2"
          >
            <option value="" disabled>
              Select Class
            </option>
            {/* Existing classes will be dynamically populated */}
          </select>
          
        </div>
        <button type="submit" disabled={loading} className="border border-black w-25 rounded-2xl bg-black text-white">
          {loading ? "Adding Student..." : "Add Student"}
        </button>
      </form>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
