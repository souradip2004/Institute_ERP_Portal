"use client";
import { useState,useEffect } from "react";
import { useAddStudent } from "@/hooks/useAddStudent";

export default function AddStudentComponent({ id }) {
  const [classData, setClassData] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);
  const [batchData, setBatchData] = useState([]);
  useEffect(() => {
    fetch("http://localhost:3000/api/teachers",{
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Teachers Data:", data);
        console.log("Institution ID:", id);
        const filteredTeachers = data.filter((teacher) => teacher.user.institutionId === id);
        console.log("Filtered Teachers:", filteredTeachers);
        fetch("http://localhost:3000/api/class-sections", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((res) => res.json())
          .then((classData) => {
            console.log("Class Data:", classData);
            const filteredClassSections = classData.filter((section: any) => {
              return filteredTeachers.some((teacher: any) => {
                return section.teacherId === teacher.id;
              });
            });
            console.log("Filtered Class Sections:", filteredClassSections);

            setClassData(filteredClassSections);
            console.log("Class Data filtered:", filteredClassSections.map((section) => section.sectionName));
            // Filter class sections based on the institution ID
          })
        console.log("Filtered Teachers:", filteredTeachers);
      })
      .catch((error) => {
        console.error("Error fetching teachers:", error);
      }); 
    },[id])
    const [studentData, setStudentData] = useState({
      rollNumber: "",
      department: "",
      email: "",
      password: "",
      institutionid: id,
      class: "",
      newDepartment: "",
      batch:""
    });
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
    },[id])
    useEffect(() => {
      fetch("http://localhost:3000/api/batches", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("Batch Data:", data);
          const filteredBatches = data.filter((batch) => batch.department.id === studentData.department);
          setBatchData(filteredBatches);
          console.log("Filtered Batches:", filteredBatches);
        })
        .catch((error) => {
          console.error("Error fetching batches:", error);
        });
    }, [studentData.department]);
 

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
          value={studentData.batch}
          onChange={(e)=>setStudentData({...studentData,batch:e.target.value})}
          className="border border-black w-45 p-2"
>
<option value="" disabled>
              Select Batch
            </option>
  {batchData.map((batches)=>(
    <option key={batches.id} value={batches.id}>
      {batches.batchName}
    </option>
  ))}
</select>
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
            {classData.map((section) => (
              <option key={section.id} value={section.id}>
                {section.sectionName}
              </option>
            ))}
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
