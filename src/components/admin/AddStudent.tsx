"use client";

import { useState, useEffect, FormEvent } from "react";
import { Card } from "@/components/ui/card";
import Loader from "@/components/ui/Loader";

interface Department {
  id: string;
  name: string;
  institutionId: string;
  code: string;
}

interface Batch {
  id: string;
  batchName: string;
  department: {
    id: string;
  };
}

interface ClassSection {
  id: string;
  sectionName: string;
  teacherId: string;
}

interface AddStudentProps {
  id: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddStudentModal({ id, isOpen, onClose, onSuccess }: AddStudentProps) {
  const [classData, setClassData] = useState<ClassSection[]>([]);
  const [departmentData, setDepartmentData] = useState<Department[]>([]);
  const [batchData, setBatchData] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNewDepartment, setShowNewDepartment] = useState(false);

  const [studentData, setStudentData] = useState({
    rollNumber: "",
    department: "",
    email: "",
    password: "",
    institutionid: id,
    class: "",
    newDepartment: "",
    batch: ""
  });

  useEffect(() => {
    if (isOpen) {
      fetchTeachersAndClasses();
      fetchDepartments();
    }
  }, [id, isOpen]);

  useEffect(() => {
    if (studentData.department && studentData.department !== "NEW_DEPARTMENT") {
      fetchBatches();
    }
  }, [studentData.department]);

  const fetchTeachersAndClasses = async () => {
    try {
      setLoading(true);
      const teachersResponse = await fetch("/api/teachers", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!teachersResponse.ok) {
        throw new Error("Failed to fetch teachers");
      }

      const teachersData = await teachersResponse.json();
      const filteredTeachers = teachersData.filter((teacher: any) => teacher.user.institutionId === id);

      const classesResponse = await fetch("/api/class-sections", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!classesResponse.ok) {
        throw new Error("Failed to fetch classes");
      }

      const classesData = await classesResponse.json();
      const filteredClassSections = classesData.filter((section: any) => {
        return filteredTeachers.some((teacher: any) => section.teacherId === teacher.id);
      });

      setClassData(filteredClassSections);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      setError(error.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/departments", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch departments");
      }

      const data = await response.json();
      const filteredDepartments = data.filter((department: Department) => department.institutionId === id);
      setDepartmentData(filteredDepartments);
    } catch (error: any) {
      console.error("Error fetching departments:", error);
      setError(error.message || "Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/batches", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch batches");
      }

      const data = await response.json();
      const filteredBatches = data.filter((batch: Batch) => batch.department.id === studentData.department);
      setBatchData(filteredBatches);
    } catch (error: any) {
      console.error("Error fetching batches:", error);
      setError(error.message || "Failed to load batches");
    } finally {
      setLoading(false);
    }
  };

  const createNewDepartment = async () => {
    if (!studentData.newDepartment) {
      setError("Please enter a department name");
      return;
    }

    try {
      setLoading(true);
      const randomCode = Math.floor(1000 + Math.random() * 9000).toString();
      
      const response = await fetch("/api/departments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: studentData.newDepartment,
          institutionId: id,
          code: randomCode,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create department");
      }

      const newDepartment = await response.json();
      setDepartmentData([...departmentData, newDepartment]);
      setStudentData({
        ...studentData,
        department: newDepartment.id,
        newDepartment: "",
      });
      setShowNewDepartment(false);
      setError(null);
    } catch (error: any) {
      console.error("Error creating department:", error);
      setError(error.message || "Failed to create department");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      // Create user first
      const userResponse = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: studentData.rollNumber, // Using roll number as name temporarily
          email: studentData.email,
          password: studentData.password,
          role: "STUDENT",
          institutionId: id,
          emailVerified: new Date(),
        }),
      });
      
      if (!userResponse.ok) {
        throw new Error("Failed to create user");
      }
      
      const userData = await userResponse.json();
      
      // Create student with user reference
      const studentResponse = await fetch("/api/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentRoll: studentData.rollNumber,
          user: { connect: { id: userData.id } },
          department: { connect: { id: studentData.department } },
          batch: { connect: { id: studentData.batch } },
          class: studentData.class ? { connect: { id: studentData.class } } : undefined,
          enrollmentStatus: "ACTIVE",
          currentSemester: 1,
          currentYear: 1,
        }),
      });
      
      if (!studentResponse.ok) {
        throw new Error("Failed to create student");
      }
      
      resetForm();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error adding student:", error);
      setError(error.message || "Failed to add student");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStudentData({
      rollNumber: "",
      department: "",
      email: "",
      password: "",
      institutionid: id,
      class: "",
      newDepartment: "",
      batch: ""
    });
    setShowNewDepartment(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <Card className="bg-white w-full max-w-md shadow-lg rounded-lg">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Add New Student</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Close modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {loading && <Loader size="medium" message="Processing..." />}
          
          {!loading && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="rollNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Roll Number*
                </label>
                <input
                  id="rollNumber"
                  type="text"
                  required
                  value={studentData.rollNumber}
                  onChange={(e) => setStudentData({ ...studentData, rollNumber: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email*
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={studentData.email}
                  onChange={(e) => setStudentData({ ...studentData, email: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password*
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={studentData.password}
                  onChange={(e) => setStudentData({ ...studentData, password: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                  Department*
                </label>
                {showNewDepartment ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="New Department Name"
                      value={studentData.newDepartment}
                      onChange={(e) => setStudentData({ ...studentData, newDepartment: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={createNewDepartment}
                        className="px-3 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                      >
                        Create Department
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowNewDepartment(false)}
                        className="px-3 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <select
                      id="department"
                      required
                      value={studentData.department}
                      onChange={(e) => setStudentData({ ...studentData, department: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select Department</option>
                      {departmentData.map((department) => (
                        <option key={department.id} value={department.id}>
                          {department.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowNewDepartment(true)}
                      className="px-3 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                    >
                      New
                    </button>
                  </div>
                )}
              </div>
              
              {studentData.department && studentData.department !== "NEW_DEPARTMENT" && (
                <div>
                  <label htmlFor="batch" className="block text-sm font-medium text-gray-700 mb-1">
                    Batch*
                  </label>
                  <select
                    id="batch"
                    required
                    value={studentData.batch}
                    onChange={(e) => setStudentData({ ...studentData, batch: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select Batch</option>
                    {batchData.map((batch) => (
                      <option key={batch.id} value={batch.id}>
                        {batch.batchName}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div>
                <label htmlFor="class" className="block text-sm font-medium text-gray-700 mb-1">
                  Class
                </label>
                <select
                  id="class"
                  value={studentData.class}
                  onChange={(e) => setStudentData({ ...studentData, class: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select Class</option>
                  {classData.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.sectionName}
                    </option>
                  ))}
                </select>
              </div>
              
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                  {error}
                </div>
              )}
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    onClose();
                  }}
                  className="px-4 py-2 bg-white text-gray-700 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                >
                  Add Student
                </button>
              </div>
            </form>
          )}
        </div>
      </Card>
    </div>
  );
}
