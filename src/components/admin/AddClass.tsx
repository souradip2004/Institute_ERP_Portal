"use client";
import { useState, useEffect } from "react";
import { useAddClass } from "@/hooks/useAddClass";
import { X } from "lucide-react";

interface AddClassProps {
  id: string;
  userid: string;
  isOpen: boolean;
  onClose: () => void;
}

interface Department {
  id: string;
  name: string;
  institutionId: string;
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
}

export default function AddClassModal({ id, userid, isOpen, onClose }: AddClassProps) {
  const [classData, setClassData] = useState({
    sectionName: "",
    maxStudents: 60,
    teacherId: "",
    semester: "",
    batch: "",
    course: "",
    department: "", // Stores the name of the selected department
    institutionId: id,
  });
  const [teacherData, setTeacherData] = useState<Teacher[]>([]);
  const [semesterOptions, setSemesterOptions] = useState<string[]>([]);
  const [batchOptions, setBatchOptions] = useState<string[]>([]);
  const [batchData, setBatchData] = useState<Batch[]>([]);
  const [courseData, setCourseData] = useState<Course[]>([]);
  const [toggler, setToggler] = useState(false); // Used to trigger re-fetches after adding new options
  const [semesterData, setSemesterData] = useState<Semester[]>([]);
  const [courseOptions, setCourseOptions] = useState<string[]>([]);
  const [departmentOptions, setDepartmentOptions] = useState<string[]>([]);
  const [allDepartments, setAllDepartments] = useState<Department[]>([]); // Stores full department objects
  const [newOption, setNewOption] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [courseCredits, setCourseCredits] = useState(0);

  const [showInput, setShowInput] = useState({ semester: false, batch: false, course: false, department: false });

  // State to hold the ID of the currently selected department for filtering
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null);

  // Fetch Departments
  useEffect(() => {
    fetch("https://commercial.aiclassroom.in/api/departments", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const filteredDepartments = data.filter((department: Department) => department.institutionId === id);
        setDepartmentOptions(filteredDepartments.map((department: Department) => department.name));
        setAllDepartments(filteredDepartments); // Store full department objects
      })
      .catch((error) => {
        console.error("Error fetching departments:", error);
      });
  }, [id, toggler]);

  // Fetch Semesters
  useEffect(() => {
    fetch("https://commercial.aiclassroom.in/api/semesters", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const filteredSemesters = data.filter((semester: Semester) => semester.institutionId === id);
        setSemesterData(filteredSemesters);
        setSemesterOptions(filteredSemesters.map((semester: Semester) => semester.name));
      })
      .catch((error) => {
        console.error("Error fetching semesters:", error);
      });
  }, [id, toggler]);

  // Fetch Batches based on selectedDepartmentId
  useEffect(() => {
    if (!selectedDepartmentId) {
      setBatchOptions([]); // Clear batch options if no department is selected
      setBatchData([]);
      setClassData(prev => ({ ...prev, batch: "" })); // Clear selected batch
      return;
    }

    fetch("https://commercial.aiclassroom.in/api/batches", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const filteredBatches = data.filter((batch: Batch) => batch.department?.id === selectedDepartmentId);
        setBatchData(filteredBatches);
        setBatchOptions(filteredBatches.map((batch: Batch) => batch.batchName));
      })
      .catch((error) => {
        console.error("Error fetching batches:", error);
      });
  }, [selectedDepartmentId, toggler]);

  // Fetch Teachers
  useEffect(() => {
    fetch("https://commercial.aiclassroom.in/api/teachers", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const filteredTeachers = data.filter((teacher: Teacher) => teacher.user.institutionId === id);
        setTeacherData(filteredTeachers);
      })
      .catch((error) => {
        console.error("Error fetching teachers:", error);
      });
  }, [id, toggler]);

  // Fetch Courses based on selectedDepartmentId
  useEffect(() => {
    if (!selectedDepartmentId) {
      setCourseOptions([]); // Clear course options if no department is selected
      setCourseData([]);
      setClassData(prev => ({ ...prev, course: "" })); // Clear selected course
      return;
    }

    fetch("https://commercial.aiclassroom.in/api/courses", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const filteredCourses = data.filter((course: Course) => course.department?.id === selectedDepartmentId);
        setCourseData(filteredCourses);
        setCourseOptions(filteredCourses.map((course: Course) => course.name));
      })
      .catch((error) => {
        console.error("Error fetching courses:", error);
      });
  }, [selectedDepartmentId, toggler]);

  const { addClass, loading, error } = useAddClass();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Ensure all required IDs are present before submitting
    const departmentIdToSubmit = allDepartments.find((dept) => dept.name === classData.department)?.id;
    const batchIdToSubmit = batchData.find((batch) => batch.batchName === classData.batch)?.id;
    const courseIdToSubmit = courseData.find((course) => course.name === classData.course)?.id;
    const semesterIdToSubmit = semesterData.find((semester) => semester.name === classData.semester)?.id;

    if (!departmentIdToSubmit || !batchIdToSubmit || !courseIdToSubmit || !semesterIdToSubmit || !classData.teacherId) {
      alert("Please ensure all required fields (Department, Batch, Course, Semester, Teacher) are selected.");
      return;
    }

    await addClass({
      batchId: batchIdToSubmit,
      courseId: courseIdToSubmit,
      departmentId: departmentIdToSubmit,
      semesterId: semesterIdToSubmit,
      maxStudents: classData.maxStudents,
      teacherId: classData.teacherId,
      sectionName: classData.sectionName,
    });

    if (!error) {
      onClose();
      window.location.reload();
    }
  };

  // This function is simplified as API calls are now in the button onClick handlers
  const handleAddNewOption = (type: string) => {
    if (!newOption.trim()) return;
    // Reset common new option states
    setNewOption("");
    setStartDate("");
    setEndDate("");
  };

  const handleDropdownChange = (type: string, value: string) => {
    if (value === "add-new") {
      setShowInput({ ...showInput, [type]: true });
    } else {
      setClassData({ ...classData, [type]: value });
      setShowInput({ ...showInput, [type]: false });

      // Special handling for Department to enable/disable other dropdowns
      if (type === "department") {
        const selectedDept = allDepartments.find((dept) => dept.name === value);
        setSelectedDepartmentId(selectedDept ? selectedDept.id : null);
        // Clear batch and course selections when department changes
        setClassData(prev => ({ ...prev, batch: "", course: "" }));
      }
    }
  };

  // Determine disabled state for dropdowns based on previous selections
  const isSectionNameAndMaxStudentsFilled = !!classData.sectionName && classData.maxStudents > 0;
  const isDepartmentSelected = !!classData.department;
  const isTeacherSelected = !!classData.teacherId;
  const isSemesterSelected = !!classData.semester;
  const isBatchSelected = !!classData.batch;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Add New Class Section</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Use space-y-6 for vertical spacing between each field group */}
          
          {/* Section Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class Section Name</label>
            <p className="text-xs text-gray-500 mb-2">A unique name for this class section (e.g., "Section A", "Morning Batch").</p>
            <input
              type="text"
              placeholder="Section Name"
              value={classData.sectionName}
              onChange={(e) => setClassData({ ...classData, sectionName: e.target.value })}
              className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Max Students */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Students Count</label>
            <p className="text-xs text-gray-500 mb-2">The number of students allowed in this section.</p>
            <input
              type="number"
              placeholder="Max Students"
              value={classData.maxStudents}
              onChange={(e) => setClassData({ ...classData, maxStudents: Number(e.target.value) })}
              className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <p className="text-xs text-gray-500 mb-2">Select the academic department this class belongs to. Example - CSE,EEE,12,etc</p>
            <select
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
                          const randomCode = Math.floor(1000 + Math.random() * 9000).toString();

                    if (!newOption.trim()) return; // Prevent adding empty department
                    await fetch("/api/departments", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        name: newOption,
                        institutionId: id,
                        code: randomCode, // Generate a random code for the department
                      }),
                    }).then((res) => {
                      if (res.ok) {
                        setToggler(!toggler); // Trigger re-fetch for departments
                        setShowInput({ ...showInput, department: false });
                        setNewOption(""); // Clear the input field
                      } else {
                        alert("Error adding department");
                      }
                    });
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Teacher</label>
            <p className="text-xs text-gray-500 mb-2">Assign a primary teacher for this class section.</p>
            <select
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
            <p className="text-xs text-gray-500 mb-2">Choose the academic semester for this class.</p>
            <select
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
                    <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
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
                    await fetch("https://commercial.aiclassroom.in/api/semesters", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        name: newOption,
                        startDate,
                        endDate,
                        institutionId: id,
                        isCurrent: true,
                      }),
                    }).then((res) => {
                      if (res.ok) {
                        setToggler(!toggler); // Trigger re-fetch for semesters
                        setShowInput({ ...showInput, semester: false });
                        setNewOption("");
                        setStartDate("");
                        setEndDate("");
                      } else {
                        alert("Error adding semester");
                      }
                    });
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Batch Year</label>
            <p className="text-xs text-gray-500 mb-2">Select the student batch (e.g., 2025) for this class. Requires Department, Teacher, and Semester selections.</p>
            <select
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
                  placeholder="Batch Name 2025"
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-md mb-2"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newOption.trim()) return; // Prevent adding empty batch
                    if (!selectedDepartmentId) {
                      alert("Please select a department first to add a batch.");
                      return;
                    }
                    fetch("https://commercial.aiclassroom.in/api/batches", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        batchName: newOption,
                        institutionId: id,
                        year: new Date().getFullYear(), // Or allow user to input year
                        maxStudents: 60, // Default or allow user to input
                        departmentId: selectedDepartmentId,
                      }),
                    }).then((res) => {
                      if (res.ok) {
                        setToggler(!toggler); // Trigger re-fetch for batches
                        setShowInput({ ...showInput, batch: false });
                        setNewOption("");
                      } else {
                        alert("Error adding batch");
                      }
                    });
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
            <p className="text-xs text-gray-500 mb-2">Select the academic course this class section is for. Requires Department and Batch selection.</p>
            <select
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
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newOption.trim() || !courseCode.trim() || !courseDescription.trim() || courseCredits <= 0) {
                      alert("Please fill all fields for the new course.");
                      return;
                    }
                    if (!selectedDepartmentId) {
                      alert("Please select a department first to add a course.");
                      return;
                    }
                    fetch("https://commercial.aiclassroom.in/api/courses", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        name: newOption,
                        courseCode,
                        description: courseDescription,
                        creditHours: courseCredits,
                        departmentId: selectedDepartmentId,
                        courseType: "CORE", // Consider making this selectable
                        createdById: classData.teacherId // Ensure teacherId is selected
                      }),
                    }).then((res) => {
                      if (res.ok) {
                        setToggler(!toggler); // Trigger re-fetch for courses
                        setShowInput({ ...showInput, course: false });
                        setNewOption("");
                        setCourseCode("");
                        setCourseDescription("");
                        setCourseCredits(0);
                      } else {
                        alert("Error adding course");
                      }
                    });
                  }}
                  className="w-full p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Course
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
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