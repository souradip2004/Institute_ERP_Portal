"use client";
import { useState, useEffect } from "react";
import { useAddClass } from "@/hooks/useAddClass"; // Assuming this hook exists and works as expected
import { X } from "lucide-react"; // Lucide icon for close button

// Define interfaces for better type safety and clarity
interface AddClassProps {
  id: string; // Institution ID
  userid: string; // User ID (e.g., admin or teacher creating the class)
  isOpen: boolean; // Controls modal visibility
  onClose: () => void; // Function to close the modal
}

interface Department {
  id: string;
  name: string;
  institutionId: string;
  code: string;
}

interface Teacher {
  id: string;
  user: {
    name: string;
    institutionId: string;
  };
}

interface Batch {
  id: string;
  batchName: string;
  department: {
    id: string;
  };
}

interface Course {
  id: string;
  name: string;
  department: {
    id: string;
  };
}

interface Semester {
  id: string;
  name: string;
  institutionId: string;
  startDate: string; // Assuming date strings
  endDate: string; // Assuming date strings
  isCurrent: boolean;
}

export default function AddClassModal({ id, userid, isOpen, onClose }: AddClassProps) {
  // State for the class data to be submitted
  const [classData, setClassData] = useState({
    sectionName: "",
    maxStudents: 60,
    teacherId: "", // Stores ID of selected teacher
    semester: "", // Stores name of selected semester
    batch: "", // Stores name of selected batch
    course: "", // Stores name of selected course
    department: "", // Stores name of the selected department
    institutionId: id,
  });

  // States for dropdown options and their full data objects
  const [teacherData, setTeacherData] = useState<Teacher[]>([]);
  const [semesterOptions, setSemesterOptions] = useState<string[]>([]);
  const [semesterData, setSemesterData] = useState<Semester[]>([]);
  const [batchOptions, setBatchOptions] = useState<string[]>([]);
  const [batchData, setBatchData] = useState<Batch[]>([]);
  const [courseOptions, setCourseOptions] = useState<string[]>([]);
  const [courseData, setCourseData] = useState<Course[]>([]);
  const [departmentOptions, setDepartmentOptions] = useState<string[]>([]);
  const [allDepartments, setAllDepartments] = useState<Department[]>([]); // Stores full department objects for ID lookup

  // State for adding new options (semester, batch, course, department)
  const [newOption, setNewOption] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [courseCredits, setCourseCredits] = useState(0);

  // State to control visibility of "Add New" input fields
  const [showInput, setShowInput] = useState({
    semester: false,
    batch: false,
    course: false,
    department: false,
  });

  // State to trigger re-fetches of dropdown data when new options are added
  const [toggler, setToggler] = useState(false);

  // State to hold the ID of the currently selected department, used for filtering batches and courses
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null);

  // Custom hook for adding a class (assumed to handle API call, loading, and error states)
  const { addClass, loading, error } = useAddClass();

  // --- Data Fetching UseEffects ---

  // Fetch Departments
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/departments", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error("Failed to fetch departments");
        const data: Department[] = await res.json();
        const filteredDepartments = data.filter((department) => department.institutionId === id);
        setDepartmentOptions(filteredDepartments.map((department) => department.name));
        setAllDepartments(filteredDepartments); // Store full department objects for ID lookup
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };
    fetchDepartments();
  }, [id, toggler]); // Re-fetch when institution ID changes or toggler is flipped

  // Fetch Semesters
  useEffect(() => {
    const fetchSemesters = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/semesters", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error("Failed to fetch semesters");
        const data: Semester[] = await res.json();
        const filteredSemesters = data.filter((semester) => semester.institutionId === id);
        setSemesterData(filteredSemesters);
        setSemesterOptions(filteredSemesters.map((semester) => semester.name));
      } catch (error) {
        console.error("Error fetching semesters:", error);
      }
    };
    fetchSemesters();
  }, [id, toggler]);

  // Fetch Batches based on selectedDepartmentId
  useEffect(() => {
    const fetchBatches = async () => {
      if (!selectedDepartmentId) {
        setBatchOptions([]); // Clear batch options if no department is selected
        setBatchData([]);
        setClassData(prev => ({ ...prev, batch: "" })); // Clear selected batch
        return;
      }
      try {
        const res = await fetch("http://localhost:3000/api/batches", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error("Failed to fetch batches");
        const data: Batch[] = await res.json();
        const filteredBatches = data.filter((batch) => batch.department?.id === selectedDepartmentId);
        setBatchData(filteredBatches);
        setBatchOptions(filteredBatches.map((batch) => batch.batchName));
      } catch (error) {
        console.error("Error fetching batches:", error);
      }
    };
    fetchBatches();
  }, [selectedDepartmentId, toggler]); // Re-fetch when selected department changes or toggler is flipped

  // Fetch Teachers
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/teachers", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error("Failed to fetch teachers");
        const data: Teacher[] = await res.json();
        const filteredTeachers = data.filter((teacher) => teacher.user.institutionId === id);
        setTeacherData(filteredTeachers);
      } catch (error) {
        console.error("Error fetching teachers:", error);
      }
    };
    fetchTeachers();
  }, [id, toggler]);

  // Fetch Courses based on selectedDepartmentId
  useEffect(() => {
    const fetchCourses = async () => {
      if (!selectedDepartmentId) {
        setCourseOptions([]); // Clear course options if no department is selected
        setCourseData([]);
        setClassData(prev => ({ ...prev, course: "" })); // Clear selected course
        return;
      }
      try {
        const res = await fetch("http://localhost:3000/api/courses", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error("Failed to fetch courses");
        const data: Course[] = await res.json();
        const filteredCourses = data.filter((course) => course.department?.id === selectedDepartmentId);
        setCourseData(filteredCourses);
        setCourseOptions(filteredCourses.map((course) => course.name));
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };
    fetchCourses();
  }, [selectedDepartmentId, toggler]);

  // --- Handlers ---

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Find the actual IDs from the fetched data based on the selected names
    const departmentIdToSubmit = allDepartments.find((dept) => dept.name === classData.department)?.id;
    const batchIdToSubmit = batchData.find((batch) => batch.batchName === classData.batch)?.id;
    const courseIdToSubmit = courseData.find((course) => course.name === classData.course)?.id;
    const semesterIdToSubmit = semesterData.find((semester) => semester.name === classData.semester)?.id;

    // Validate that all required IDs are found
    if (!departmentIdToSubmit || !batchIdToSubmit || !courseIdToSubmit || !semesterIdToSubmit || !classData.teacherId) {
      alert("Please ensure all required fields (Department, Batch, Course, Semester, Teacher) are selected.");
      return;
    }

    // Call the custom hook to add the class
    await addClass({
      batchId: batchIdToSubmit,
      courseId: courseIdToSubmit,
      departmentId: departmentIdToSubmit,
      semesterId: semesterIdToSubmit,
      maxStudents: classData.maxStudents,
      teacherId: classData.teacherId,
      sectionName: classData.sectionName,
    });

    // If no error from the hook, close the modal and reload the page
    if (!error) {
      onClose();
      window.location.reload(); // Consider a more React-friendly way to update parent state
    }
  };

  const handleAddNewOption = (type: string) => {
    // This function is now mainly conceptual as API calls are embedded in individual button handlers
    if (!newOption.trim()) return;
    setNewOption("");
    setStartDate("");
    setEndDate("");
    setCourseCode("");
    setCourseDescription("");
    setCourseCredits(0);
  };

  const handleDropdownChange = (type: string, value: string) => {
    if (value === "add-new") {
      setShowInput({ ...showInput, [type]: true });
    } else {
      setClassData({ ...classData, [type]: value });
      setShowInput({ ...showInput, [type]: false }); // Hide "Add New" input if an existing option is selected

      // Special handling for Department to filter other dropdowns
      if (type === "department") {
        const selectedDept = allDepartments.find((dept) => dept.name === value);
        setSelectedDepartmentId(selectedDept ? selectedDept.id : null);
        // Clear batch and course selections when department changes, as options will change
        setClassData(prev => ({ ...prev, batch: "", course: "" }));
      }
    }
  };

  // Determine disabled state for dropdowns based on previous selections to guide user
  const isSectionNameAndMaxStudentsFilled = !!classData.sectionName && classData.maxStudents > 0;
  const isDepartmentSelected = !!classData.department;
  const isTeacherSelected = !!classData.teacherId;
  const isSemesterSelected = !!classData.semester;
  const isBatchSelected = !!classData.batch;

  // If modal is not open, return null to render nothing
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10"> {/* Sticky header for better UX with scrolling */}
          <h2 className="text-xl font-bold text-gray-900">Add New Class Section</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
            aria-label="Close modal"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Section Name */}
          <div>
            <label htmlFor="sectionName" className="block text-sm font-medium text-gray-700 mb-1">Class Section Name</label>
            <p className="text-xs text-gray-500 mb-2">A unique name for this class section (e.g., "Section A", "Morning Batch").</p>
            <input
              type="text"
              id="sectionName"
              placeholder="Section Name"
              value={classData.sectionName}
              onChange={(e) => setClassData({ ...classData, sectionName: e.target.value })}
              className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Max Students */}
          <div>
            <label htmlFor="maxStudents" className="block text-sm font-medium text-gray-700 mb-1">Students Count</label>
            <p className="text-xs text-gray-500 mb-2">The number of students allowed in this section.</p>
            <input
              type="number"
              id="maxStudents"
              placeholder="Max Students"
              value={classData.maxStudents}
              onChange={(e) => setClassData({ ...classData, maxStudents: Number(e.target.value) })}
              className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              min="1" // Ensure at least 1 student
            />
          </div>

          {/* Department */}
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <p className="text-xs text-gray-500 mb-2">Select the academic department this class belongs to. Example - CSE,EEE,12,etc</p>
            <select
              id="department"
              value={classData.department}
              onChange={(e) => handleDropdownChange("department", e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="" disabled>Select Department</option>
              {departmentOptions.map((department, index) => (
                <option key={index} value={department}>{department}</option>
              ))}
              <option value="add-new">Add New Department</option>
            </select>
            {showInput.department && (
              <div className="mt-3 p-3 border border-gray-200 rounded-md bg-gray-50">
                <input
                  type="text"
                  placeholder="Department Name"
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-md mb-2"
                />
                <button
                  type="button"
                  onClick={async () => {
                    const randomCode = Math.floor(1000 + Math.random() * 9000).toString(); // Simple random code

                    if (!newOption.trim()) {
                      alert("Department name cannot be empty.");
                      return;
                    }
                    try {
                      const res = await fetch("/api/departments", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          name: newOption,
                          institutionId: id,
                          code: randomCode,
                        }),
                      });
                      if (res.ok) {
                        setToggler(!toggler); // Trigger re-fetch for departments
                        setShowInput({ ...showInput, department: false });
                        setNewOption(""); // Clear the input field
                      } else {
                        alert("Error adding department: " + (await res.text()));
                      }
                    } catch (err) {
                      console.error("Failed to add department:", err);
                      alert("Failed to add department due to network or server error.");
                    }
                  }}
                  className="w-full p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Department
                </button>
              </div>
            )}
          </div>

          {/* Teacher */}
          <div>
            <label htmlFor="teacher" className="block text-sm font-medium text-gray-700 mb-1">Teacher</label>
            <p className="text-xs text-gray-500 mb-2">Assign a primary teacher for this class section.</p>
            <select
              id="teacher"
              value={classData.teacherId}
              onChange={(e) => setClassData({ ...classData, teacherId: e.target.value })}
              className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              // Enable only if Section Name and Max Students are filled AND Department is selected
              disabled={!isSectionNameAndMaxStudentsFilled || !isDepartmentSelected}
            >
              <option value="" disabled>Select Teacher</option>
              {teacherData.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.user.name}
                </option>
              ))}
            </select>
          </div>

          {/* Semester */}
          <div>
            <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
            <p className="text-xs text-gray-500 mb-2">Choose the academic semester for this class.</p>
            <select
              id="semester"
              value={classData.semester}
              onChange={(e) => handleDropdownChange("semester", e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              // Enable only if Department and Teacher are selected
              disabled={!isDepartmentSelected || !isTeacherSelected}
            >
              <option value="" disabled>Select Semester</option>
              {semesterOptions.map((semester, index) => (
                <option key={index} value={semester}>{semester}</option>
              ))}
              <option value="add-new">Add New Semester</option>
            </select>
            {showInput.semester && (
              <div className="mt-3 p-3 border border-gray-200 rounded-md bg-gray-50 space-y-2">
                <input
                  type="text"
                  placeholder="Semester Name (e.g., Fall 2024)"
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-md"
                />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="startDate" className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      id="startDate"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label htmlFor="endDate" className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      id="endDate"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    if (!newOption.trim() || !startDate || !endDate) {
                      alert("Please fill all fields for the new semester.");
                      return;
                    }
                    try {
                      const res = await fetch("http://localhost:3000/api/semesters", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          name: newOption,
                          startDate,
                          endDate,
                          institutionId: id,
                          isCurrent: true, // Assuming new semester is current
                        }),
                      });
                      if (res.ok) {
                        setToggler(!toggler); // Trigger re-fetch for semesters
                        setShowInput({ ...showInput, semester: false });
                        setNewOption("");
                        setStartDate("");
                        setEndDate("");
                      } else {
                        alert("Error adding semester: " + (await res.text()));
                      }
                    } catch (err) {
                      console.error("Failed to add semester:", err);
                      alert("Failed to add semester due to network or server error.");
                    }
                  }}
                  className="w-full p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Semester
                </button>
              </div>
            )}
          </div>

          {/* Batch */}
          <div>
            <label htmlFor="batch" className="block text-sm font-medium text-gray-700 mb-1">Batch Year</label>
            <p className="text-xs text-gray-500 mb-2">Select the student batch (e.g., 2025) for this class. Requires Department, Teacher, and Semester selections.</p>
            <select
              id="batch"
              value={classData.batch}
              onChange={(e) => handleDropdownChange("batch", e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              // Enable only if Department, Teacher, and Semester are selected
              disabled={!isDepartmentSelected || !isTeacherSelected || !isSemesterSelected}
            >
              <option value="" disabled>Select Batch</option>
              {batchOptions.map((batch, index) => (
                <option key={index} value={batch}>{batch}</option>
              ))}
              <option value="add-new">Add New Batch</option>
            </select>
            {showInput.batch && (
              <div className="mt-3 p-3 border border-gray-200 rounded-md bg-gray-50">
                <input
                  type="text"
                  placeholder="Batch Name (e.g., 2025)"
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-md mb-2"
                />
                <button
                  type="button"
                  onClick={async () => {
                    if (!newOption.trim()) {
                      alert("Batch name cannot be empty.");
                      return;
                    }
                    if (!selectedDepartmentId) {
                      alert("Please select a department first to add a batch.");
                      return;
                    }
                    try {
                      const res = await fetch("http://localhost:3000/api/batches", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          batchName: newOption,
                          institutionId: id,
                          year: new Date().getFullYear(), // Could be user input or default
                          maxStudents: 60, // Could be user input or default
                          departmentId: selectedDepartmentId,
                        }),
                      });
                      if (res.ok) {
                        setToggler(!toggler); // Trigger re-fetch for batches
                        setShowInput({ ...showInput, batch: false });
                        setNewOption("");
                      } else {
                        alert("Error adding batch: " + (await res.text()));
                      }
                    } catch (err) {
                      console.error("Failed to add batch:", err);
                      alert("Failed to add batch due to network or server error.");
                    }
                  }}
                  className="w-full p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Batch
                </button>
              </div>
            )}
          </div>

          {/* Course */}
          <div>
            <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-1">Course</label>
            <p className="text-xs text-gray-500 mb-2">Select the academic course this class section is for. Requires Department and Batch selection.</p>
            <select
              id="course"
              value={classData.course}
              onChange={(e) => handleDropdownChange("course", e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              // Enable only if Department and Batch are selected
              disabled={!isDepartmentSelected || !isBatchSelected}
            >
              <option value="" disabled>Select Course</option>
              {courseOptions.map((course, index) => (
                <option key={index} value={course}>{course}</option>
              ))}
              <option value="add-new">Add New Course</option>
            </select>
            {showInput.course && (
              <div className="mt-3 p-3 border border-gray-200 rounded-md bg-gray-50 space-y-2">
                <input
                  type="text"
                  placeholder="Course Name (e.g., Introduction to Programming)"
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-md"
                />
                <input
                  type="text"
                  placeholder="Course Code (e.g., CS101)"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-md"
                />
                <input
                  type="text"
                  placeholder="Course Description"
                  value={courseDescription}
                  onChange={(e) => setCourseDescription(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-md"
                />
                <input
                  type="number"
                  placeholder="Course Credits"
                  value={courseCredits}
                  onChange={(e) => setCourseCredits(Number(e.target.value))}
                  className="w-full p-2.5 border border-gray-300 rounded-md"
                  min="0"
                />
                <button
                  type="button"
                  onClick={async () => {
                    if (!newOption.trim() || !courseCode.trim() || !courseDescription.trim() || courseCredits <= 0) {
                      alert("Please fill all fields for the new course.");
                      return;
                    }
                    if (!selectedDepartmentId) {
                      alert("Please select a department first to add a course.");
                      return;
                    }
                    try {
                      const res = await fetch("http://localhost:3000/api/courses", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          name: newOption,
                          courseCode,
                          description: courseDescription,
                          creditHours: courseCredits,
                          departmentId: selectedDepartmentId,
                          courseType: "CORE", // Consider making this selectable by the user
                          createdById: userid, // Ensure you use the userid prop passed to the component
                        }),
                      });
                      if (res.ok) {
                        setToggler(!toggler); // Trigger re-fetch for courses
                        setShowInput({ ...showInput, course: false });
                        setNewOption("");
                        setCourseCode("");
                        setCourseDescription("");
                        setCourseCredits(0);
                      } else {
                        alert("Error adding course: " + (await res.text()));
                      }
                    } catch (err) {
                      console.error("Failed to add course:", err);
                      alert("Failed to add course due to network or server error.");
                    }
                  }}
                  className="w-full p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Course
                </button>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 sticky bottom-0 bg-white z-10"> {/* Sticky footer for better UX with scrolling */}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            >
              {loading ? "Creating..." : "Create Class Section"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}