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
    newDepartment: "",
    batch: "",
    classes: [] as string[],
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
      const teachersResponse = await fetch("/api/teachers");
      if (!teachersResponse.ok) throw new Error("Failed to fetch teachers");
      const teachersData = await teachersResponse.json();
      const filteredTeachers = teachersData.filter((teacher: any) => teacher.user.institutionId === id);

      const classesResponse = await fetch("/api/class-sections");
      if (!classesResponse.ok) throw new Error("Failed to fetch classes");
      const classesData = await classesResponse.json();
      const filteredClassSections = classesData.filter((section: any) =>
        filteredTeachers.some((teacher: any) => section.teacherId === teacher.id)
      );

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
      const response = await fetch("/api/departments");
      if (!response.ok) throw new Error("Failed to fetch departments");
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
      const response = await fetch("/api/batches");
      if (!response.ok) throw new Error("Failed to fetch batches");
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: studentData.newDepartment,
          institutionId: id,
          code: randomCode,
        }),
      });

      if (!response.ok) throw new Error("Failed to create department");
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

      const userResponse = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: studentData.rollNumber,
          email: studentData.email,
          password: studentData.password,
          role: "STUDENT",
          institutionId: id,
          emailVerified: new Date(),
        }),
      });

      if (!userResponse.ok) throw new Error("Failed to create user");
      const userData = await userResponse.json();

      const studentResponse = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: studentData.email,
          password: studentData.password,
          studentRoll: studentData.rollNumber,
          user: { connect: { id: userData.id } },
          department: { connect: { id: studentData.department } },
          batch: { connect: { id: studentData.batch } },
          classes: studentData.classes.length > 0
            ? { connect: studentData.classes.map((id) => ({ id })) }
            : undefined,
          enrollmentStatus: "ACTIVE",
          currentSemester: 1,
          currentYear: 1,
          institutionId: id
        }),
      });

      if (!studentResponse.ok) throw new Error("Failed to create student");

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
      newDepartment: "",
      batch: "",
      classes: [],
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
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {loading && <Loader size="medium" message="Processing..." />}

          {!loading && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Roll Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number*</label>
                <input
                  type="text"
                  required
                  value={studentData.rollNumber}
                  onChange={(e) => setStudentData({ ...studentData, rollNumber: e.target.value })}
                  className="w-full p-2 border rounded-md"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email*</label>
                <input
                  type="email"
                  required
                  value={studentData.email}
                  onChange={(e) => setStudentData({ ...studentData, email: e.target.value })}
                  className="w-full p-2 border rounded-md"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password*</label>
                <input
                  type="password"
                  required
                  value={studentData.password}
                  onChange={(e) => setStudentData({ ...studentData, password: e.target.value })}
                  className="w-full p-2 border rounded-md"
                />
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department*</label>
                {showNewDepartment ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="New Department Name"
                      value={studentData.newDepartment}
                      onChange={(e) => setStudentData({ ...studentData, newDepartment: e.target.value })}
                      className="w-full p-2 border rounded-md"
                    />
                    <div className="flex space-x-2">
                      <button type="button" onClick={createNewDepartment} className="bg-purple-600 text-white px-3 py-2 rounded-md">
                        Create Department
                      </button>
                      <button type="button" onClick={() => setShowNewDepartment(false)} className="bg-gray-200 px-3 py-2 rounded-md">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <select
                      required
                      value={studentData.department}
                      onChange={(e) => setStudentData({ ...studentData, department: e.target.value })}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">Select Department</option>
                      {departmentData.map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                    <button type="button" onClick={() => setShowNewDepartment(true)} className="bg-gray-200 px-3 py-2 rounded-md">
                      New
                    </button>
                  </div>
                )}
              </div>

              {/* Batch */}
              {studentData.department && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Batch*</label>
                  <select
                    required
                    value={studentData.batch}
                    onChange={(e) => setStudentData({ ...studentData, batch: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Select Batch</option>
                    {batchData.map((b) => (
                      <option key={b.id} value={b.id}>{b.batchName}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Classes (multi-select) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Classes</label>
              <div className="border p-2 rounded-md max-h-40 overflow-y-auto">
  {classData.map((c) => (
    <label key={c.id} className="flex items-center space-x-2">
      <input
        type="checkbox"
        value={c.id}
        checked={studentData.classes.includes(c.id)}
        onChange={(e) => {
          const value = e.target.value;
          setStudentData((prev) => ({
            ...prev,
            classes: e.target.checked
              ? [...prev.classes, value]
              : prev.classes.filter((id) => id !== value),
          }));
        }}
      />
      <span>{c.sectionName}</span>
    </label>
  ))}
</div>

              </div>

              {/* Error */}
              {error && <div className="text-red-600 text-sm">{error}</div>}

              {/* Actions */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    onClose();
                  }}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md"
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
