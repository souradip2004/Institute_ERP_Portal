"use client";

import { useState, useEffect, FormEvent } from "react";
import { Card } from "@/components/ui/card";
import Loader from "@/components/ui/Loader";
import { Button } from "../ui/button"; // Assuming this is your Button component
import { X } from "lucide-react"; // Importing X icon from lucide-react for consistency

interface Department {
  id: string;
  name: string;
  institutionId: string;
  code: string;
}

interface AddTeacherProps {
  id: string; // Institution ID
  isOpen: boolean; // Controls modal visibility
  onClose: () => void; // Function to close the modal
  onSuccess: () => void; // Callback after successful teacher addition
}

const AddTeacherModal = ({ id, isOpen, onClose, onSuccess }: AddTeacherProps) => {
  const [departmentData, setDepartmentData] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showNewDepartment, setShowNewDepartment] = useState(false);
  const [isMultiple, setMultiple] = useState(false); // Changed name to isMultiple for clarity
  const [isSubmitting, setIsSubmitting] = useState(false); // New state to manage submission specific loading

  const [teacherData, setTeacherData] = useState({
    name: "",
    email: "",
    password: "",
    institutionid: id,
    department: "", // Stores the name of the selected department
    employeeCode: "",
    newDepartment: "", // For the new department name input
  });

  // Fetch departments when the modal opens or institution ID changes
  useEffect(() => {
    if (isOpen) {
      fetchDepartments();
    }
  }, [id, isOpen]);

  const fetchDepartments = async () => {
    try {
      setIsLoading(true); // Loading for fetching departments
      const response = await fetch("/api/departments", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch departments");
      }

      const data: Department[] = await response.json();
      const filteredDepartments = data.filter((department: Department) => department.institutionId === id);
      setDepartmentData(filteredDepartments);
    } catch (error) {
      console.error("Error fetching departments:", error);
      alert("Failed to load departments."); // User-friendly alert
    } finally {
      setIsLoading(false); // End loading for fetching departments
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {

    e.preventDefault();
    const verified = JSON.parse(localStorage.getItem("verified") || "false"); // Get verification status from localStorage
    console.log("Verification status:", verified); // Debugging line to check verification status
    // alert for debugging
    // console.log("Verification status:", verified);
    //  
    // alert(verified)
    if (!verified) {
      alert("You are not yet verified to perform this action. Please wait for verification");
      return;
    }
    setIsSubmitting(true); // Start submission loading

    if (!isMultiple) {
      // Logic for adding a single teacher
      try {
        // Create user
        const userResponse = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
          const errorData = await userResponse.json();
          throw new Error(errorData.error || "Failed to create user");
        }

        const user = await userResponse.json();

        // Send login details email (fire and forget, or handle errors gracefully)
        const sendEmailRes = await fetch("/api/emails/logindetails", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: teacherData.email, password: teacherData.password }),
        });
        if (!sendEmailRes.ok) {
          const data = await sendEmailRes.json();
          console.warn("Error sending welcome email (might be ignorable):", data.error);
        }

        // Create teacher
        const departmentId = departmentData.find(
          (department) => department.name === teacherData.department
        )?.id;

        if (!departmentId) {
          throw new Error("Selected department not found.");
        }

        const teacherResponse = await fetch("/api/teachers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            teacherCode: teacherData.employeeCode,
            employmentStatus: "FULL_TIME",
            userId: user.id,
            departmentId: departmentId,
          }),
        });

        if (!teacherResponse.ok) {
          const errorText = await teacherResponse.text();
          console.error("Error creating teacher response:", teacherResponse);
          throw new Error(`Failed to create teacher: ${errorText}`);
        }

        resetForm();
        onSuccess();
        onClose();
        alert("Teacher added successfully!");
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        alert(`Error adding teacher: ${errorMessage}`);
        console.error("Error creating single teacher:", error);
      } finally {
        setIsSubmitting(false); // End submission loading
      }
    } else {
      // Logic for adding multiple teachers
      const emails = teacherData.email.split(",").map((email) => email.trim()).filter(Boolean); // Filter out empty strings
      const names = teacherData.name.split(",").map((name) => name.trim()).filter(Boolean); // Filter out empty strings
      const employeeCodes = teacherData.employeeCode.split(",").map((code) => code.trim()).filter(Boolean); // Filter out empty strings

      if (emails.length === 0 || employeeCodes.length === 0) {
        alert("Please enter at least one email and employee code.");
        setIsSubmitting(false);
        return;
      }
      if (emails.length !== employeeCodes.length) {
        alert("Number of emails and employee codes must match.");
        setIsSubmitting(false);
        return;
      }
      if (emails.length !== names.length) {
        alert("Number of emails and names must match.");
        setIsSubmitting(false);
        return;
      }
      try {
        const departmentId = departmentData.find(
          (department) => department.name === teacherData.department
        )?.id;

        if (!departmentId) {
          throw new Error("Selected department not found.");
        }
        // Use Promise.allSettled to allow some failures without stopping others
        const results = await Promise.allSettled(
          emails.map(async (email, index) => {
            const randomPassword = Math.random().toString(36).slice(-8);
            const teacherName = names[index]  // Default name if email format is odd

            // Create user
            const userResponse = await fetch("/api/users", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: teacherName,
                email,
                password: randomPassword,
                role: "TEACHER",
                institutionId: id,
                emailVerified: new Date(),
              }),
            });

            if (!userResponse.ok) {
              const errorData = await userResponse.json();
              throw new Error(`Failed to create user ${email}: ${errorData.error || userResponse.statusText}`);
            }
            const user = await userResponse.json();

            // Send login details email (non-blocking)
            fetch("/api/emails/logindetails", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, password: randomPassword }),
            }).catch(emailError => console.warn(`Failed to send email to ${email}:`, emailError)); // Log email errors

            // Create teacher
            const teacherResponse = await fetch("/api/teachers", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                teacherCode: employeeCodes[index],
                employmentStatus: "FULL_TIME",
                userId: user.id,
                departmentId: departmentId,
              }),
            });

            if (!teacherResponse.ok) {
              const errorText = await teacherResponse.text();
              throw new Error(`Failed to create teacher for user ${email}: ${errorText}`);
            }
            return { user, teacher: await teacherResponse.json() }; // Return created data
          })
        );

        const failedTeachers: string[] = [];
        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            failedTeachers.push(emails[index]);
            console.error(`Failed to add teacher ${emails[index]}:`, result.reason);
          }
        });

        if (failedTeachers.length > 0) {
          alert(`Successfully added some teachers, but failed for: ${failedTeachers.join(", ")}. Check console for details.`);
        } else {
          alert("All teachers added successfully!");
        }

        resetForm();
        onSuccess();
        onClose();
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        alert(`Error adding multiple teachers: ${errorMessage}`);
        console.error("Error creating multiple teachers:", error);
      } finally {
        setIsSubmitting(false); // End submission loading
      }
    }
  };

  const createNewDepartment = async () => {
    if (!teacherData.newDepartment.trim()) {
      alert("Please enter a valid department name.");
      return;
    }

    try {
      setIsLoading(true); // Loading for department creation
      const randomCode = Math.floor(1000 + Math.random() * 9000).toString(); // Simple random code

      const response = await fetch("/api/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: teacherData.newDepartment,
          institutionId: id,
          code: randomCode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create department");
      }

      const newDepartment: Department = await response.json();
      setDepartmentData((prev) => [...prev, newDepartment]);
      setTeacherData((prev) => ({
        ...prev,
        department: newDepartment.name, // Select the newly created department
        newDepartment: "", // Clear the new department input
      }));
      setShowNewDepartment(false); // Hide the new department input
      alert("Department created successfully!");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      alert(`Error creating department: ${errorMessage}`);
      console.error("Error creating department:", error);
    } finally {
      setIsLoading(false); // End loading for department creation
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
    setMultiple(false); // Reset multiple teacher toggle
  };

  // If modal is not open, return null to render nothing
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <Card className="bg-white w-full max-w-md shadow-lg rounded-lg max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-800">Add New Teacher</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close modal"
          >
            <X className="h-6 w-6" /> {/* Using Lucide X icon */}
          </button>
        </div>

        {/* Modal Content (Scrollable Area) */}
        {/* The form tag should wrap the entire form content including the conditional loading */}
        <form id="teacherForm" onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col"> {/* Added id="teacherForm" and flex-col */}
          <div className="p-6 py-4 flex-1"> {/* flex-1 to make this div take remaining space and handle its own overflow */}
            {isLoading ? ( // This isLoading is for fetching departments or creating new department
              <Loader size="medium" message="Loading departments..." />
            ) : (
              <div className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full mb-4"
                  type="button" // Important: set type to "button" to prevent form submission
                  onClick={() => {
                    resetForm(); // Reset form when switching mode
                    setMultiple(!isMultiple);
                  }}
                >
                  {isMultiple ? "Add Single Teacher" : "Add Multiple Teachers"}
                </Button>

                {/* Single Teacher Fields */}
                {isMultiple &&
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Enter Teacher Names
                      <span className="text-gray-500 text-xs">(separated by commas)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="John Doe, Jane Smith"
                      value={teacherData.name}
                      onChange={(e) => setTeacherData({ ...teacherData, name: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                }
                {!isMultiple && (
                  <>
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
                  </>
                )}

                {/* Multiple Teachers Fields */}
                {isMultiple && (
                  <>
                    <div>
                      <label htmlFor="emails" className="block text-sm font-medium text-gray-700 mb-1">
                        Emails (separated by commas)*
                      </label>
                      <input
                        id="emails"
                        type="text"
                        required
                        placeholder="email1@example.com, email2@example.com"
                        value={teacherData.email}
                        onChange={(e) => setTeacherData({ ...teacherData, email: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label htmlFor="employeeCode" className="block text-sm font-medium text-gray-700 mb-1">
                    Employee Code {isMultiple ? "(separated by commas)*" : "*"}
                  </label>
                  <input
                    id="employeeCode"
                    type="text"
                    required
                    placeholder={isMultiple ? "EMP001, EMP002" : "EMP001"}
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
                          disabled={isLoading} // Disable while creating department
                        >
                          {isLoading ? "Creating..." : "Create Department"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowNewDepartment(false)}
                          className="px-3 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                          disabled={isLoading} // Disable while creating department
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
                        disabled={isLoading} // Disable while loading departments
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
                        disabled={isLoading} // Disable while loading departments
                      >
                        New
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div> {/* End of scrollable content area */}

          {/* Modal Footer (Sticky) */}
          <div className="p-6 pt-4 border-t border-gray-200 flex justify-end space-x-3 sticky bottom-0 bg-white z-10">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="px-4 py-2 bg-white text-gray-700 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              disabled={isSubmitting} // Disable while submitting
            >
              Cancel
            </button>
            <button
              type="submit"
              form="teacherForm" // Associate button with the form's ID
              className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
              disabled={isSubmitting || isLoading} // Disable while submitting OR loading departments
            >
              {isSubmitting ? "Adding..." : "Add Teacher"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AddTeacherModal;