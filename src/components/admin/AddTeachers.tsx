"use client"

import { useState, useEffect, FormEvent } from "react";
import { Card } from "@/components/ui/card";
import Loader from "@/components/ui/Loader";

interface Department {
  id: string;
  name: string;
  institutionId: string;
  code: string;
}

interface AddTeacherProps {
  id: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddTeacherModal = ({ id, isOpen, onClose, onSuccess }: AddTeacherProps) => {
  const [departmentData, setDepartmentData] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showNewDepartment, setShowNewDepartment] = useState(false);
  
  const [teacherData, setTeacherData] = useState({
    name: "",
    email: "",
    password: "",
    institutionid: id,
    department: "",
    employeeCode: "",
    newDepartment: "",
  });

  useEffect(() => {
    if (isOpen) {
      fetchDepartments();
    }
  }, [id, isOpen]);

  const fetchDepartments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/departments", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      const data = await response.json();
      const filteredDepartments = data.filter((department: Department) => department.institutionId === id);
      setDepartmentData(filteredDepartments);
    } catch (error) {
      console.error("Error fetching departments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Create user
      const userResponse = await fetch("/api/users", {
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
      });
      
      if (!userResponse.ok) {
        throw new Error("Failed to create user");
      }
      
      const user = await userResponse.json();
      
      // Create teacher
      const departmentId = departmentData.find(
        (department) => department.name === teacherData.department
      )?.id;
      
      const teacherResponse = await fetch("/api/teachers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teacherCode: teacherData.employeeCode,
          employmentStatus: "FULL_TIME",
          user: { connect: { id: user.id } },
          department: { connect: { id: departmentId } },
        }),
      });
      
      if (!teacherResponse.ok) {
        throw new Error("Failed to create teacher");
      }
      
      // Reset form and close modal
      resetForm();
      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error("Error creating teacher:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      alert("Error creating teacher: " + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewDepartment = async () => {
    if (!teacherData.newDepartment) {
      alert("Please enter a department name");
      return;
    }
    
    try {
      setIsLoading(true);
      const randomCode = Math.floor(1000 + Math.random() * 9000).toString();
      
      const response = await fetch("/api/departments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: teacherData.newDepartment,
          institutionId: id,
          code: randomCode,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to create department");
      }
      
      const newDepartment = await response.json();
      setDepartmentData([...departmentData, newDepartment]);
      setTeacherData({
        ...teacherData,
        department: newDepartment.name,
        newDepartment: "",
      });
      setShowNewDepartment(false);
    } catch (error: unknown) {
      console.error("Error creating department:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      alert("Error creating department: " + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetForm = () => {
    setTeacherData({
      name: "",
      email: "",
      password: "",
      institutionid: id,
      department: "",
      employeeCode: "",
      newDepartment: "",
    });
    setShowNewDepartment(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <Card className="bg-white w-full max-w-md shadow-lg rounded-lg">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Add New Teacher</h2>
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
          
          {isLoading ? (
            <Loader size="medium" message="Processing..." />
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name*
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={teacherData.name}
                    onChange={(e) => setTeacherData({ ...teacherData, name: e.target.value })}
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
                    value={teacherData.email}
                    onChange={(e) => setTeacherData({ ...teacherData, email: e.target.value })}
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
                    value={teacherData.password}
                    onChange={(e) => setTeacherData({ ...teacherData, password: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="employeeCode" className="block text-sm font-medium text-gray-700 mb-1">
                    Employee Code*
                  </label>
                  <input
                    id="employeeCode"
                    type="text"
                    required
                    value={teacherData.employeeCode}
                    onChange={(e) => setTeacherData({ ...teacherData, employeeCode: e.target.value })}
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
                        value={teacherData.newDepartment}
                        onChange={(e) => setTeacherData({ ...teacherData, newDepartment: e.target.value })}
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
                        value={teacherData.department}
                        onChange={(e) => setTeacherData({ ...teacherData, department: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">Select Department</option>
                        {departmentData.map((department) => (
                          <option key={department.id} value={department.name}>
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
              </div>
              
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
                  className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                >
                  Add Teacher
                </button>
              </div>
            </form>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AddTeacherModal;