"use client";

import { useState, useEffect, FormEvent } from "react";
import { Card } from "@/components/ui/card";
import Loader from "@/components/ui/Loader";
import { Button } from "../ui/button"; // Assuming this is your Button component
import { X } from "lucide-react"; // Importing X icon for consistency

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
  // Add other properties if available on your ClassSection objects
  // e.g., course: { name: string }, semester: { name: string }
}

interface AddStudentProps {
  id: string; // Institution ID
  isOpen: boolean; // Controls modal visibility
  onClose: () => void; // Function to close the modal
  onSuccess: () => void; // Callback after successful student addition
}

export default function AddStudentModal({ id, isOpen, onClose, onSuccess }: AddStudentProps) {
  const [classData, setClassData] = useState<ClassSection[]>([]);
  const [departmentData, setDepartmentData] = useState<Department[]>([]);
  const [batchData, setBatchData] = useState<Batch[]>([]);
  const [initialLoading, setInitialLoading] = useState(true); // For initial data fetches
  const [isSubmitting, setIsSubmitting] = useState(false); // For form submission loading
  const [isDepartmentActionLoading, setIsDepartmentActionLoading] = useState(false); // For creating new department
  const [error, setError] = useState<string | null>(null);
  const [showNewDepartment, setShowNewDepartment] = useState(false);
  const [isMultipleStudent, setMultipleStudent] = useState(false); // Renamed for clarity

  const [studentData, setStudentData] = useState({
    rollNumber: "",
    department: "", // Stores ID of selected department
    email: "",
    password: "",
    institutionid: id,
    newDepartment: "", // For new department name input
    batch: "", // Stores ID of selected batch
    classes: [] as string[], // Stores IDs of selected classes
  });

  // Fetch initial data when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        setInitialLoading(true);
        try {
          await Promise.all([
            fetchTeachersAndClasses(),
            fetchDepartments()
          ]);
          setError(null);
        } catch (err: any) {
          console.error("Error fetching initial data:", err);
          setError(err.message || "Failed to load initial data.");
        } finally {
          setInitialLoading(false);
        }
      };
      fetchData();
    }
  }, [id, isOpen]); // Depend on id and isOpen

  // Fetch batches when a department is selected
  useEffect(() => {
    const getBatches = async () => {
      if (studentData.department && studentData.department !== "NEW_DEPARTMENT") {
        await fetchBatches();
      } else {
        setBatchData([]); // Clear batches if no department or "NEW_DEPARTMENT" is selected
        setStudentData(prev => ({ ...prev, batch: "" })); // Clear selected batch
      }
    };
    getBatches();
  }, [studentData.department]);

  const fetchTeachersAndClasses = async () => {
    try {
      // Fetch teachers to filter classes by institution
      const teachersResponse = await fetch("/api/teachers");
      if (!teachersResponse.ok) {
        throw new Error("Failed to fetch teachers");
      }
      const teachersData = await teachersResponse.json();
      const filteredTeachers = teachersData.filter((teacher: any) => teacher.user.institutionId === id);
      const teacherIds = new Set(filteredTeachers.map((t: any) => t.id));

      // Fetch class sections
      const classesResponse = await fetch("/api/class-sections");
      if (!classesResponse.ok) {
        throw new Error("Failed to fetch classes");
      }
      const classesData = await classesResponse.json();

      // Filter classes by teachers belonging to the current institution
      const filteredClassSections = classesData.filter((section: any) =>
        teacherIds.has(section.teacherId)
      );

      setClassData(filteredClassSections);
    } catch (error: any) {
      console.error("Error fetching teachers and classes:", error);
      throw new Error(error.message || "Failed to load teachers and classes.");
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch("/api/departments");
      if (!response.ok) {
        throw new Error("Failed to fetch departments");
      }
      const data: Department[] = await response.json();
      const filteredDepartments = data.filter((department: Department) => department.institutionId === id);
      setDepartmentData(filteredDepartments);
    } catch (error: any) {
      console.error("Error fetching departments:", error);
      throw new Error(error.message || "Failed to load departments.");
    }
  };

  const fetchBatches = async () => {
    try {
      setInitialLoading(true); // Show loading while fetching batches
      const response = await fetch("/api/batches");
      if (!response.ok) {
        throw new Error("Failed to fetch batches");
      }
      const data: Batch[] = await response.json();
      // Filter batches by the selected department ID
      const filteredBatches = data.filter((batch: Batch) => batch.department?.id === studentData.department);
      setBatchData(filteredBatches);
    } catch (error: any) {
      console.error("Error fetching batches:", error);
      throw new Error(error.message || "Failed to load batches.");
    } finally {
      setInitialLoading(false); // End loading for batches
    }
  };

  const createNewDepartment = async () => {
    if (!studentData.newDepartment.trim()) {
      setError("Please enter a department name.");
      return;
    }

    try {
      setIsDepartmentActionLoading(true); // Set loading for this specific action
      const randomCode = Math.floor(1000 + Math.random() * 9000).toString(); // Simple random code

      const response = await fetch("/api/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: studentData.newDepartment,
          institutionId: id,
          code: randomCode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create department");
      }

      const newDepartment: Department = await response.json();
      setDepartmentData((prev) => [...prev, newDepartment]); // Add new department to options
      setStudentData((prev) => ({
        ...prev,
        department: newDepartment.id, // Set the newly created department as selected
        newDepartment: "", // Clear new department input
      }));
      setShowNewDepartment(false); // Hide new department input
      setError(null); // Clear any previous error
      alert("Department created successfully!");
    } catch (error: any) {
      console.error("Error creating department:", error);
      setError(error.message || "Failed to create department.");
    } finally {
      setIsDepartmentActionLoading(false); // End loading for department creation
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true); // Start form submission loading
    setError(null);

    // Common data for all student creation types
    const commonStudentFields = {
      department: { connect: { id: studentData.department } },
      batch: { connect: { id: studentData.batch } },
      classEnrollments: studentData.classes.length > 0
        ? { create: studentData.classes.map((classId) => ({ classSection: { connect: { id: classId } } })) }
        : undefined, // Changed to classEnrollments with create for many-to-many
      enrollmentStatus: "ACTIVE",
      currentSemester: 1, // Assuming default values
      currentYear: 1,     // Assuming default values
      institutionId: id,
    };

    if (!isMultipleStudent) {
      // Logic for adding a single student
      try {
        if (!studentData.department || !studentData.batch || !studentData.rollNumber || !studentData.email || !studentData.password) {
            throw new Error("Please fill all required fields: Roll Number, Email, Password, Department, Batch.");
        }

        const userResponse = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: studentData.rollNumber, // Using rollNumber as user name
            email: studentData.email,
            password: studentData.password,
            role: "STUDENT",
            institutionId: id,
            emailVerified: new Date(),
          }),
        });

        if (!userResponse.ok) {
          const errorData = await userResponse.json();
          throw new Error(errorData.error || "Failed to create user.");
        }
        const userData = await userResponse.json();

        // Send login details email (fire and forget)
        fetch("/api/emails/logindetails", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: studentData.email, password: studentData.password }),
        }).catch(emailError => console.warn("Error sending welcome email:", emailError));

        const studentResponse = await fetch("/api/students", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentRoll: studentData.rollNumber,
            user: { connect: { id: userData.id } },
            ...commonStudentFields, // Spread common fields
          }),
        });

        if (!studentResponse.ok) {
          const errorText = await studentResponse.text();
          throw new Error(`Failed to create student: ${errorText}`);
        }

        resetForm();
        onSuccess();
        onClose();
        alert("Student added successfully!");
      } catch (error: any) {
        console.error("Error adding single student:", error);
        setError(error.message || "Failed to add single student.");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Logic for adding multiple students
      const rollNumbers = studentData.rollNumber.split(",").map((roll) => roll.trim()).filter(Boolean);
      const emails = studentData.email.split(",").map((email) => email.trim()).filter(Boolean);

      if (rollNumbers.length === 0 || emails.length === 0 || rollNumbers.length !== emails.length) {
        setError("Please ensure roll numbers and emails are provided and match in count.");
        setIsSubmitting(false);
        return;
      }
      if (!studentData.department || !studentData.batch) {
          setError("Please select a Department and Batch for all students.");
          setIsSubmitting(false);
          return;
      }

      try {
        const results = await Promise.allSettled( // Use Promise.allSettled to report on individual failures
          rollNumbers.map(async (roll, index) => {
            const email = emails[index];
            const randomPassword = Math.random().toString(36).slice(-8); // Generate random password for bulk

            // Create user
            const userResponse = await fetch("/api/users", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: roll, // Using roll number as user name
                email: email,
                password: randomPassword,
                role: "STUDENT",
                institutionId: id,
                emailVerified: new Date(),
              }),
            });

            if (!userResponse.ok) {
              const errorData = await userResponse.json();
              throw new Error(`Failed to create user for ${email}: ${errorData.error || userResponse.statusText}`);
            }
            const userData = await userResponse.json();

            // Send login details email (fire and forget)
            fetch("/api/emails/logindetails", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: email, password: randomPassword }),
            }).catch(emailError => console.warn(`Error sending welcome email to ${email}:`, emailError));

            // Create student
            const studentResponse = await fetch("/api/students", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                studentRoll: roll,
                user: { connect: { id: userData.id } },
                ...commonStudentFields, // Spread common fields
              }),
            });

            if (!studentResponse.ok) {
              const errorText = await studentResponse.text();
              throw new Error(`Failed to create student ${roll}: ${errorText}`);
            }
            return studentResponse.json(); // Return created student data
          })
        );

        const failedStudents: string[] = [];
        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            failedStudents.push(rollNumbers[index]);
            console.error(`Failed to add student ${rollNumbers[index]}:`, result.reason);
          }
        });

        if (failedStudents.length > 0) {
          alert(`Successfully added some students, but failed for: ${failedStudents.join(", ")}. Check console for details.`);
        } else {
          alert("All students added successfully!");
        }

        resetForm();
        onSuccess();
        onClose();
      } catch (error: any) {
        console.error("Error adding multiple students:", error);
        setError(error.message || "Failed to add multiple students.");
      } finally {
        setIsSubmitting(false);
      }
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
    setMultipleStudent(false); // Reset the multiple student toggle
    setError(null); // Clear error on form reset
  };

  if (!isOpen) return null;

  const disableFormFields = initialLoading || isSubmitting || isDepartmentActionLoading;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <Card className="bg-white w-full max-w-md shadow-lg rounded-lg max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-800">Add New Student</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close modal"
          >
            <X className="h-6 w-6" /> {/* Using Lucide X icon */}
          </button>
        </div>

        {/* Modal Content & Form */}
        {/* FORM TAG MOVED HERE TO WRAP ALL FORM ELEMENTS */}
        <form id="studentForm" onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col">
          <div className="p-6 py-4 flex-1"> {/* This div will handle its own scrolling */}
            {initialLoading ? (
              <Loader size="medium" message="Loading initial data..." />
            ) : (
              <div className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full mb-4"
                  type="button" // Important: set type to "button" to prevent form submission
                  onClick={() => {
                                        resetForm(); // Reset form when switching mode

                    setMultipleStudent(!isMultipleStudent);
                  }}
                  disabled={isSubmitting || isDepartmentActionLoading} // Disable button if submitting or creating department
                >
                  {isMultipleStudent ? "Add Single Student" : "Add Multiple Students"}
                </Button>

                {/* Roll Number */}
                <div>
                  <label htmlFor="rollNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Roll Number* {isMultipleStudent ? "(separated by commas)" : ""}
                  </label>
                  <input
                    id="rollNumber"
                    type="text"
                    required
                    value={studentData.rollNumber}
                    onChange={(e) => setStudentData({ ...studentData, rollNumber: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    disabled={disableFormFields}
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email* {isMultipleStudent ? "(separated by commas)" : ""}
                  </label>
                  <input
                    id="email"
                    type={isMultipleStudent ? "text" : "email"} // Text for multiple, email for single for validation
                    required
                    placeholder={isMultipleStudent ? "student1@example.com, student2@example.com" : "student@example.com"}
                    value={studentData.email}
                    onChange={(e) => setStudentData({ ...studentData, email: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    disabled={disableFormFields}
                  />
                </div>

                {/* Password (only for single student) */}
                {!isMultipleStudent && (
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
                      disabled={disableFormFields}
                    />
                  </div>
                )}

                {/* Department */}
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
                        disabled={disableFormFields} // Disable when department action is loading
                      />
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2"> {/* Added flex-col/sm:flex-row for mobile button stacking */}
                        <button
                          type="button"
                          onClick={createNewDepartment}
                          className="bg-purple-600 text-white px-3 py-2 rounded-md hover:bg-purple-700 transition-colors w-full sm:w-auto" 
                          disabled={disableFormFields || !studentData.newDepartment.trim()} // Disable if form fields disabled or input is empty
                        >
                          {isDepartmentActionLoading ? "Creating..." : "Create Department"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowNewDepartment(false)}
                          className="bg-gray-200 text-gray-800 px-3 py-2 rounded-md hover:bg-gray-300 transition-colors w-full sm:w-auto" 
                          disabled={disableFormFields}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2"> {/* Added flex-col/sm:flex-row for mobile button stacking */}
                      <select
                        id="department"
                        required
                        value={studentData.department}
                        onChange={(e) => setStudentData({ ...studentData, department: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        disabled={disableFormFields || departmentData.length === 0} // Disable if no departments
                      >
                        <option value="">Select Department</option>
                        {departmentData.map((d) => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setShowNewDepartment(true)}
                        className="bg-gray-200 text-gray-800 px-3 py-2 rounded-md hover:bg-gray-300 transition-colors w-full sm:w-auto flex-shrink-0" 
                        disabled={disableFormFields}
                      >
                        New
                      </button>
                    </div>
                  )}
                </div>

                {/* Batch */}
                {studentData.department && ( // Only show if a department is selected
                  <div>
                    <label htmlFor="batch" className="block text-sm font-medium text-gray-700 mb-1">Batch*</label>
                    <select
                      id="batch"
                      required
                      value={studentData.batch}
                      onChange={(e) => setStudentData({ ...studentData, batch: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      disabled={disableFormFields || batchData.length === 0} // Disable if no batches are available
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
                  <label htmlFor="classes" className="block text-sm font-medium text-gray-700 mb-1">Classes</label>
                  <div id="classes" className="border p-2 rounded-md max-h-40 overflow-y-auto bg-white"
                       style={{ opacity: disableFormFields ? 0.6 : 1, pointerEvents: disableFormFields ? 'none' : 'auto' }} // Visually disable and prevent clicks
                  >
                    {classData.length === 0 ? (
                      <p className="text-gray-500 text-sm">No classes available.</p>
                    ) : (
                      classData.map((c) => (
                        <label key={c.id} className="flex items-center space-x-2 py-1 hover:bg-gray-50 rounded-sm cursor-pointer">
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
                            className="form-checkbox h-4 w-4 text-purple-600 rounded"
                            disabled={disableFormFields}
                          />
                          <span>{c.sectionName}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>

                {/* Error Message */}
                {error && <div className="text-red-600 text-sm py-2">{error}</div>}
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
              disabled={isSubmitting || isDepartmentActionLoading} // Disable during any processing
            >
              Cancel
            </button>
            <button
              type="submit"
              form="studentForm" // Associate button with the form
              disabled={isSubmitting || initialLoading || isDepartmentActionLoading} // Disable based on all loading states
              className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Adding..." : "Add Student"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}