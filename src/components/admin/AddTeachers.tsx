"use client"
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const AddTeacherComponent = ({ id }) => {
    const router = useRouter();
    const [departmentData, setDepartmentData] = useState([]);
    useEffect(() => {
        fetch("http://localhost:3000/api/departments", {
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
    }, [id]);

    const [teacherData, setTeacherData] = useState({
        name: "",
        email: "",
        password: "",
        institutionid: id,
        department: "",
        class: "",
        employeeCode: "", // Added employeeCode field
    });

    return (
        <div className="flex">
            <form
                onSubmit={async (e) => {
                    e.preventDefault();
                    console.log("Submitting Teacher Data:", teacherData);
                    /*
                    const res = await fetch("http://localhost:3000/api/teachers", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(teacherData),
                    });
                    if (res.ok) {
                        alert("Teacher added successfully!");
                        router.refresh();
                    } else {
                        alert("Failed to add teacher.");
                    }
                        */
                       try{
                       let user=await fetch("http://localhost:3000/api/users", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            name: teacherData.name,
                            email: teacherData.email,
                            password: teacherData.password,
                            role: "TEACHER",
                            institutionId: id,
                            emailVerified: new Date(),
                        }),
                    }).then((data) => {return data.json()}).catch((error) => {
                        console.error("Error creating user:", error);
                        alert("Error creating user");
                    }
                    );
                    console.log("User Created:", user);
                    let teacher=await fetch("http://localhost:3000/api/teachers", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ 
                            teacherCode: teacherData.employeeCode,
                            employmentStatus:"FULL_TIME",
                            user:{connect:{id:user.id}},
                            department:{connect:{id:departmentData.find((department) => department.name === teacherData.department)?.id}},
                        }),
                    }).then((data) => {return data}).catch((error) => {
                        console.error("Error creating user:", error);
                        alert("Error creating user");
                    }
                    );
                    console.log("User Created:", teacher);
                    if (!user.ok) {
                        throw new Error("Failed to create user.");
                    }
                    

                }catch(error){
                    console.error("Error creating user:", error);
                    alert("Error creating user");
                } 
            }
            }
            >
                <h2 className="p-5">Add Teacher</h2>
                <input
                    type="text"
                    placeholder="Name"
                    value={teacherData.name}
                    onChange={(e) => setTeacherData({ ...teacherData, name: e.target.value })}
                    className="border border-black w-45 m-5 p-2"
                />
                <input
                    type="email"
                    placeholder="Email (Optional)"
                    value={teacherData.email}
                    onChange={(e) => setTeacherData({ ...teacherData, email: e.target.value })}
                    className="border border-black w-45 m-5 p-2"
                />
                <input
                    type="password"
                    placeholder="Password (Optional)"
                    value={teacherData.password}
                    onChange={(e) => setTeacherData({ ...teacherData, password: e.target.value })}
                    className="border border-black w-45 m-5 p-2"
                />
                <input
                    type="text"
                    placeholder="Employee Code"
                    value={teacherData.employeeCode}
                    onChange={(e) => setTeacherData({ ...teacherData, employeeCode: e.target.value })}
                    className="border border-black w-45 m-5 p-2"
                />
                <select
                    value={teacherData.department}
                    onChange={(e) => setTeacherData({ ...teacherData, department: e.target.value })}
                    className="border border-black w-45 m-5 p-2"
                >
                    <option value="">Select Department</option>
                    {departmentData.map((department) => (
                        <option key={department.id} value={department.name}>
                            {department.name}
                        </option>
                    ))}
                    <option value="NEW_DEPARTMENT">Add New Department</option>
                </select>
                {teacherData.department === "NEW_DEPARTMENT" && (
                    <div className="mt-5">
                        <input
                            type="text"
                            placeholder="New Department Name"
                            value={teacherData.newDepartment || ""}
                            onChange={(e) => setTeacherData({ ...teacherData, newDepartment: e.target.value })}
                            className="border border-black w-45 m-5 p-2"
                        />
                        <button
                            type="button"
                            onClick={async () => {
                                let randomdigits = "" + Math.floor(1000 + Math.random() * 9000);
                                alert(id)
                                fetch("http://localhost:3000/api/departments", {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({
                                        name: teacherData.newDepartment,
                                        institutionId: id,
                                        code: randomdigits,
                                    }),
                                })
                                    .then((res) => res.json())
                                    .then((data) => {
                                        console.log("New Department Created:", data);
                                        alert("New Department Created");
                                        router.refresh();
                                    })
                                    .catch((error) => {
                                        console.error("Error creating department:", error);
                                    });
                            }}
                        >
                            Create New Department
                        </button>
                    </div>
                )}
                <button type="submit" className="border border-black w-45 m-5 p-2">
                    Add Teacher
                </button>
            </form>
        </div>
    );
};
export default AddTeacherComponent;