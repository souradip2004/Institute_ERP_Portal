"use client";
import { useState, useEffect, JSX } from "react";
import { useAddClass } from "@/hooks/useAddClass"; // Assuming this hook can handle arrays for teachers and courses
import { X } from "lucide-react";
import axios from "axios";

interface AddClassProps {
  id: string; // Institution ID
  userid: string; // Current user ID (e.g., admin creating the class)
  isOpen: boolean;
  onClose: () => void;
}

// Interface definitions (remain the same)
interface Department {
  id: string;
  name: string;
  institutionId: string;
}

interface Teacher {
  id: string;
  departmentId: string;
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

// Helper function to get course name from ID
const namedCourse = (id: string, courses: Course[]): string | undefined => {
  const found = courses.find(course => course.id === id);
  return found?.name;
};

export default function AddClassModal({ id, userid, isOpen, onClose }: AddClassProps): JSX.Element | null {
  // State for class section data
  const [classData, setClassData] = useState({
    sectionName: "",
    maxStudents: 60,
    semester: "", // Holds semester name for dropdown selection
    batch: "",    // Holds batch name for dropdown selection
    department: "", // Holds department name for dropdown selection
    institutionId: id,
  });
  const [creditsData, setcreditsData] = useState(null)
  useEffect(() => {
    if (localStorage.getItem("user")) {
      const getData = async () => {
        const now = new Date();
        const month = now.getMonth() + 1; // getMonth() is zero-based
        const year = now.getFullYear();
        const result = await fetch(`/api/credits/${id}?month=${month}&year=${year}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        })
        if (result.ok) {
          const res = await result.json();
          setcreditsData(res);
          console.log(res);
        }
      }
      getData()
    }
  }, [])
  const updateCoins = async () => {
    const now = new Date();
    const month = now.getMonth() + 1; // getMonth() is zero-based
    const year = now.getFullYear();
    console.log("Current Credit Balance", creditsData)

    const result = await fetch(`/api/credits/${id}?month=${month}&year=${year}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        sectionCreditsBalance:
          creditsData ? creditsData?.sectionCreditsBalance + 200
            : 0,
        total: creditsData ? creditsData?.total + 200 : 0
      })

    })
    if (result.ok) {
      const res = await result.json();
      const id1 = JSON.parse(localStorage.getItem("user") || "{}")?.id;
      const resul1 = await fetch(`/api/coins/${id1
        }?coins=200`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      })
      if (resul1.ok) {
        const res1 = await resul1.json();
        console.log("Updated Coins", res1)
      } else {
        console.error("Failed to update coins")
      }
      console.log("Updated Credits", res);
    } else {
    }
  }
  // States for selected IDs (arrays for multi-select)
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<string[]>([]);
  // State to manage specific course assignments per teacher using checkboxes
  // Updated: Each teacher's assignment now contains an array of course objects with isOptional flag
  const [teacherCourseAssignments, setTeacherCourseAssignments] = useState<
    Array<{ teacherId: string; courses: Array<{ courseId: string; isOptional: boolean }> }>
  >([]);

  // States for fetched data and dropdown options
  const [teacherData, setTeacherData] = useState<Teacher[]>([]);
  const [semesterOptions, setSemesterOptions] = useState<string[]>([]);
  const [batchOptions, setBatchOptions] = useState<string[]>([]);
  const [batchData, setBatchData] = useState<Batch[]>([]);
  const [courseData, setCourseData] = useState<Course[]>([]);
  const [semesterData, setSemesterData] = useState<Semester[]>([]);
  const [courseOptions, setCourseOptions] = useState<string[]>([]);
  const [departmentOptions, setDepartmentOptions] = useState<string[]>([]);
  const [allDepartments, setAllDepartments] = useState<Department[]>([]); // Stores full department objects

  // States for "Add New" functionality
  const [toggler, setToggler] = useState(false); // Used to trigger re-fetches after adding new options
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [newSemesterName, setNewSemesterName] = useState("");
  const [newBatchName, setNewBatchName] = useState("");
  const [newCourseName, setNewCourseName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [courseCredits, setCourseCredits] = useState(0);
  const [showInput, setShowInput] = useState({ semester: false, batch: false, course: false, department: false });

  // State to hold the ID of the currently selected department for filtering related data
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null);

  // --- Data Fetching Hooks ---
  // Fetch Departments
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/departments`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((data) => {
        const filteredDepartments = data.filter((department: Department) => department.institutionId === id);
        setDepartmentOptions(filteredDepartments.map((department: Department) => department.name));
        setAllDepartments(filteredDepartments);
      })
      .catch((error) => {
        console.error("Error fetching departments:", error);
      });
  }, [id, toggler]);

  // Fetch Semesters
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/semesters`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
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
      setBatchOptions([]);
      setBatchData([]);
      setClassData(prev => ({ ...prev, batch: "" })); // Clear selected batch when department changes
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/batches`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
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
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/teachers`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data)
        console.log(id)
        const filteredTeachers = data.filter((teacher: Teacher) => teacher.user.institutionId === id);
        setTeacherData(filteredTeachers);
        console.log("here are filtered Teachers", filteredTeachers)

      })
      .catch((error) => {
        console.error("Error fetching teachers:", error);
      });
  }, [id, toggler]);

  // Fetch Courses based on selectedDepartmentId
  useEffect(() => {
    if (!selectedDepartmentId) {
      setCourseOptions([]);
      setCourseData([]);
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/courses`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
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

  // --- Add Class Hook ---
  const { addClass, loading, error } = useAddClass();

  // --- Form Submission Handler ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const verified = JSON.parse(localStorage.getItem("verified") || "false"); // Get verification status from localStorage

    if (!verified) {
      alert("You are not yet verified to perform this action. Please wait for verification");
      return;
    }

    // Find IDs for submission based on selected names
    const departmentIdToSubmit = allDepartments.find((dept) => dept.name === classData.department)?.id;
    const batchIdToSubmit = batchData.find((batch) => batch.batchName === classData.batch)?.id;
    const semesterIdToSubmit = semesterData.find((semester) => semester.name === classData.semester)?.id;

    // Validate if any teacher has at least one course assigned
    const hasAnyTeacherCourseAssignment = teacherCourseAssignments.some(assignment => assignment.courses.length > 0);

    // Validation: Ensure all required fields are selected, and at least one teacher with assigned courses is chosen
    if (
      !departmentIdToSubmit ||
      !batchIdToSubmit ||
      !semesterIdToSubmit ||
      !classData.sectionName.trim() ||
      classData.maxStudents <= 0 ||
      selectedTeacherIds.length === 0 || // Ensure at least one teacher is selected
      !hasAnyTeacherCourseAssignment      // Ensure at least one teacher has assigned courses
    ) {
      alert("Please ensure all required fields (Section Name, Max Students, Department, Batch, Semester, at least one Teacher, and at least one Course assigned to a teacher) are selected/filled.");
      return;
    }

    const id1 = JSON.parse(localStorage.getItem("user") || "{}")?.id;

    const coinRes = await axios.get(`/api/coins/${id1}`);
    console.log('coinRes ---', coinRes)

    if (coinRes.data.coins < 200) {
      alert('Institute dosenot have enough Coins! Please Contact Institute Admin.');
      return;
    }

    updateCoins()


    // Prepare the payload for `addClass`
    // Flatten teacherCourseAssignments into an array of objects suitable for backend (e.g., a join table)
    const flattenedAssignments = teacherCourseAssignments.flatMap(teacherAssignment =>
      teacherAssignment.courses.map(course => ({
        teacherId: teacherAssignment.teacherId,
        courseId: course.courseId,
        isOptional: course.isOptional,
      }))
    );

    // Extract all unique course IDs for the main class section
    const allUniqueCourseIds = Array.from(new Set(flattenedAssignments.map(assignment => assignment.courseId)));

    // Handle MotherClass creation
    let motherClassIdToSubmit: string | undefined;
    try {
      const motherClassResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/motherclass`, { // Assuming this endpoint exists
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionName: classData.sectionName,
          institution: JSON.parse(localStorage.getItem("user") || "{}")?.institutionId // Assuming user data in localStorage
        })
      });
      if (motherClassResponse.ok) {
        const motherRes = await motherClassResponse.json();
        motherClassIdToSubmit = motherRes.id;
      } else {
        console.error("Failed to create MotherClass:", await motherClassResponse.text());
        alert("Failed to create MotherClass. Please try again.");
        return; // Stop submission if MotherClass creation fails
      }
    } catch (err) {
      console.error("Error creating MotherClass:", err);
      alert("Error creating MotherClass. Please check your network and try again.");
      return; // Stop submission on error
    }

    const promises = [];
    // Iterate through the teacherCourseAssignments to create separate ClassSection entries
    for (const teacherAssignment of teacherCourseAssignments) {
      for (const course of teacherAssignment.courses) {
        const promise = addClass({
          batchId: batchIdToSubmit,
          semesterId: semesterIdToSubmit,
          departmentId: departmentIdToSubmit,
          maxStudents: classData.maxStudents,
          sectionName: classData.sectionName + ` - ${namedCourse(course.courseId, courseData)}`, // Dynamic name for each section
          teacherId: teacherAssignment.teacherId, // Assign specific teacher
          courseId: course.courseId,             // Assign specific course
          optional: course.isOptional,         // Pass optional status
          motherClassId: motherClassIdToSubmit,  // Pass the created MotherClass ID
        });
        promises.push(promise);
      }
    }

    try {
      await Promise.all(promises);
      if (!error) {
        onClose();
        window.location.reload(); // only after all finish
      }
    } catch (err) {
      console.error("Error adding one or more classes:", err);
      alert("An error occurred while creating one or more class sections.");
    }
  };

  // --- Dropdown Change Handlers ---
  const handleDropdownChange = (type: string, value: string) => {
    if (value === "add-new") {
      setShowInput({ ...showInput, [type]: true });
    } else {
      setClassData({ ...classData, [type]: value });
      setShowInput({ ...showInput, [type]: false });

      // Special handling for Department to filter other dropdowns
      if (type === "department") {
        const selectedDept = allDepartments.find((dept) => dept.name === value);
        setSelectedDepartmentId(selectedDept ? selectedDept.id : null);
        // Clear dependent selections when department changes
        setClassData(prev => ({ ...prev, batch: "" }));
        // Reset teacherCourseAssignments when department changes, as courses/teachers might change
        setSelectedTeacherIds([]);
        setTeacherCourseAssignments([]);
      }
    }
  };

  // Handler for teacher checkboxes
  const handleTeacherCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const teacherId = e.target.value;
    if (e.target.checked) {
      setSelectedTeacherIds(prev => [...prev, teacherId]);
      // Initialize with an empty 'courses' array
      setTeacherCourseAssignments(prev => [...prev, { teacherId, courses: [] }]);
    } else {
      setSelectedTeacherIds(prev => prev.filter(id => id !== teacherId));
      setTeacherCourseAssignments(prev => prev.filter(assignment => assignment.teacherId !== teacherId)); // Remove assignment for deselected teacher
    }
  };

  // Handler for course selection checkboxes for a specific teacher
  const handleCourseSelectionChange = (teacherId: string, courseId: string, isChecked: boolean) => {
    setTeacherCourseAssignments(prevAssignments => {
      return prevAssignments.map(assignment => {
        if (assignment.teacherId === teacherId) {
          const updatedCourses = isChecked
            ? [...assignment.courses, { courseId, isOptional: false }] // Default to not optional
            : assignment.courses.filter(c => c.courseId !== courseId);
          return { ...assignment, courses: updatedCourses };
        }
        return assignment;
      });
    });
  };

  // Handler for the 'optional' checkbox for a specific course assigned to a specific teacher
  const handleCourseOptionalToggle = (teacherId: string, courseId: string, isOptional: boolean) => {
    setTeacherCourseAssignments(prevAssignments => {
      return prevAssignments.map(assignment => {
        if (assignment.teacherId === teacherId) {
          const updatedCourses = assignment.courses.map(course =>
            course.courseId === courseId ? { ...course, isOptional: isOptional } : course
          );
          return { ...assignment, courses: updatedCourses };
        }
        return assignment;
      });
    });
  };

  // Determine disabled state for dropdowns based on previous selections
  const isSectionNameAndMaxStudentsFilled = !!classData.sectionName.trim() && classData.maxStudents > 0;
  const isDepartmentSelected = !!classData.department && selectedDepartmentId !== null;
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

          {/* Section Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Section Name</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Students</label>
            <p className="text-xs text-gray-500 mb-2">The maximum number of students allowed in this section.</p>
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
            <p className="text-xs text-gray-500 mb-2">Select the academic department this class belongs to.</p>
            <select
              value={classData.department}
              onChange={(e) => handleDropdownChange("department", e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={!isSectionNameAndMaxStudentsFilled}
            >
              <option value="" disabled>Select Department</option>
              {departmentOptions.map((department, index) => (
                <option key={index} value={department}>{department}</option>
              ))}

            </select>
            {showInput.department && (
              <div className="mt-3 p-3 border border-gray-200 rounded-md bg-gray-50">
                <input
                  type="text"
                  placeholder="Department Name"
                  value={newDepartmentName}
                  onChange={(e) => setNewDepartmentName(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-md mb-2"
                  required
                />
                <button
                  type="button"
                  onClick={async () => {
                    if (!newDepartmentName.trim()) return;
                    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/departments`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ name: newDepartmentName, institutionId: id }),
                    }).then((res) => {
                      if (res.ok) {
                        setToggler(!toggler);
                        setShowInput({ ...showInput, department: false });
                        setNewDepartmentName("");
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

          {/* Teachers (Checkbox List) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Teachers for this Class Section</label>
            <p className="text-xs text-gray-500 mb-2">Choose all teachers who will teach in this class section.</p>
            <div className={`border p-2 rounded-md h-32 overflow-y-auto ${!isDepartmentSelected ? 'bg-gray-100 text-gray-400' : 'bg-white'}`}>
              {teacherData.filter((c) => {
                const departmentIdToSubmit = allDepartments.find((dept) => dept.name === classData.department)?.id;
                return c.departmentId == departmentIdToSubmit
              }).map((teacher) => (
                <label key={teacher.id} className={`flex items-center space-x-2 py-1 ${!isDepartmentSelected ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                  <input
                    type="checkbox"
                    value={teacher.id}
                    checked={selectedTeacherIds.includes(teacher.id)}
                    onChange={handleTeacherCheckboxChange}
                    className="form-checkbox h-4 w-4 text-blue-600 rounded"
                    disabled={!isDepartmentSelected}
                  />
                  <span>{teacher.user.name}</span>
                </label>
              ))}
            </div>
            {selectedTeacherIds.length > 0 && (
              <p className="text-xs text-gray-600 mt-1">Overall Selected Teachers: {selectedTeacherIds.map(id => teacherData.find(t => t.id === id)?.user.name).join(', ')}</p>
            )}
          </div>

          {/* Semester */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
            <p className="text-xs text-gray-500 mb-2">Choose the academic semester for this class. Requires Department selection.</p>
            <select
              value={classData.semester}
              onChange={(e) => handleDropdownChange("semester", e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={!isDepartmentSelected}
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
                  value={newSemesterName}
                  onChange={(e) => setNewSemesterName(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-md"
                  required
                />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    if (!newSemesterName.trim() || !startDate || !endDate) {
                      alert("Please fill all fields for the new semester.");
                      return;
                    }
                    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/semesters`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ name: newSemesterName, startDate, endDate, institutionId: id, isCurrent: true }),
                    }).then((res) => {
                      if (res.ok) {
                        setToggler(!toggler);
                        setShowInput({ ...showInput, semester: false });
                        setNewSemesterName("");
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
            <p className="text-xs text-gray-500 mb-2">Select the student batch (e.g., 2025) for this class. Requires Department and Semester selections.</p>
            <select
              value={classData.batch}
              onChange={(e) => handleDropdownChange("batch", e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={!isDepartmentSelected || !isSemesterSelected}
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
                  value={newBatchName}
                  onChange={(e) => setNewBatchName(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-md mb-2"
                  required
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newBatchName.trim()) return;
                    if (!selectedDepartmentId) {
                      alert("Please select a department first to add a batch.");
                      return;
                    }
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/batches`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        batchName: newBatchName,
                        institutionId: id,
                        year: new Date().getFullYear(),
                        maxStudents: 60,
                        departmentId: selectedDepartmentId,
                      }),
                    }).then((res) => {
                      if (res.ok) {
                        setToggler(!toggler);
                        setShowInput({ ...showInput, batch: false });
                        setNewBatchName("");
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

          {/* Individual Teacher-Course Assignments */}
          {selectedTeacherIds.length > 0 && isDepartmentSelected && isBatchSelected && (
            <div className="space-y-4 border p-4 rounded-md bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-800">Assign Courses to Teachers</h3>
              <p className="text-xs text-gray-500 mb-2">For each selected teacher, choose the specific courses they will teach in this class section. This section is enabled after Department and Batch are selected.</p>
              {selectedTeacherIds.map((teacherId) => {
                const teacher = teacherData.find(t => t.id === teacherId);
                const assignedCourses = teacherCourseAssignments.find(a => a.teacherId === teacherId)?.courses || [];

                return (
                  <div key={teacherId} className="border p-3 rounded-md bg-white">
                    <h4 className="font-medium text-gray-700 mb-2">{teacher?.user.name || "Unknown Teacher"}</h4>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Courses for {teacher?.user.name}</label>
                    <div className={`border p-2 rounded-md h-28 overflow-y-auto ${!isDepartmentSelected || !isBatchSelected ? 'bg-gray-100 text-gray-400' : 'bg-white'}`}>
                      {courseData.map((course) => {
                        // Check if this course is assigned to ANY OTHER teacher
                        const isCourseAssignedToAnotherTeacher = teacherCourseAssignments.some(
                          assignment => assignment.teacherId !== teacherId && assignment.courses.some(c => c.courseId === course.id)
                        );
                        // Check if this course is already assigned to the current teacher
                        const isCourseAssignedToCurrentTeacher = assignedCourses.some(c => c.courseId === course.id);

                        // Determine if the main course selection checkbox should be disabled
                        const isDisabledCourseSelection = (!isDepartmentSelected || !isBatchSelected) ||
                          (isCourseAssignedToAnotherTeacher && !isCourseAssignedToCurrentTeacher);

                        // Find the optional status for the current course by the current teacher
                        const currentCourseOptionalStatus = assignedCourses.find(c => c.courseId === course.id)?.isOptional || false;

                        return (
                          <div key={course.id} className="flex items-center justify-between space-x-2 py-1">
                            <label className={`flex items-center space-x-2 flex-grow ${isDisabledCourseSelection ? 'cursor-not-allowed text-gray-400' : 'cursor-pointer'}`}>
                              <input
                                type="checkbox"
                                value={course.id}
                                checked={isCourseAssignedToCurrentTeacher}
                                onChange={(e) => handleCourseSelectionChange(
                                  teacherId,
                                  course.id,
                                  e.target.checked
                                )}
                                className="form-checkbox h-4 w-4 text-blue-600 rounded"
                                disabled={isDisabledCourseSelection} // Apply the calculated disabled state
                              />
                              <span>{course.name} ({course.department?.id ? allDepartments.find(d => d.id === course.department?.id)?.name : 'N/A'})</span>
                            </label>

                            {isCourseAssignedToCurrentTeacher && ( // Only show optional checkbox if course is selected
                              <label className="flex items-center text-xs text-gray-600 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={currentCourseOptionalStatus}
                                  onChange={(e) => handleCourseOptionalToggle(
                                    teacherId,
                                    course.id,
                                    e.target.checked
                                  )}
                                  className="form-checkbox h-3 w-3 text-purple-600 rounded mr-1"
                                />
                                Optional
                              </label>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {assignedCourses.length > 0 && (
                      <p className="text-xs text-gray-600 mt-1">Assigned: {assignedCourses.map(ac => `${courseData.find(c => c.id === ac.courseId)?.name}${ac.isOptional ? ' (Optional)' : ''}`).join(', ')}</p>
                    )}
                  </div>
                );
              })}
              {/* Global "Add New Course" button moved here for better visibility in relation to courses */}
              <button
                type="button"
                onClick={() => setShowInput({ ...showInput, course: true })}
                className="mt-4 w-full p-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                disabled={!isDepartmentSelected || !isBatchSelected}
              >
                Add New Course
              </button>
            </div>
          )}

          {showInput.course && (
            <div className="mt-3 p-3 border border-gray-200 rounded-md bg-gray-50 space-y-2">
              <h4 className="text-md font-medium text-gray-700">Add New Course Details</h4>
              <input
                type="text"
                placeholder="Course Name (e.g., Introduction to Programming)"
                value={newCourseName}
                onChange={(e) => setNewCourseName(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-md"
                required
              />
              <input
                type="text"
                placeholder="Course Code (e.g., CS101)"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-md"
                required
              />
              <input
                type="text"
                placeholder="Course Description"
                value={courseDescription}
                onChange={(e) => setCourseDescription(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-md"
                required
              />
              <input
                type="number"
                placeholder="Course Credits"
                value={courseCredits}
                onChange={(e) => setCourseCredits(Number(e.target.value))}
                className="w-full p-2.5 border border-gray-300 rounded-md"
                required
              />
              <button
                type="button"
                onClick={() => {
                  if (!newCourseName.trim() || !courseCode.trim() || !courseDescription.trim() || courseCredits <= 0) {
                    alert("Please fill all fields for the new course.");
                    return;
                  }
                  if (!selectedDepartmentId) {
                    alert("Please select a department first to add a course.");
                    return;
                  }
                  console.log({
                    name: newCourseName,
                    courseCode,
                    description: courseDescription,
                    creditHours: courseCredits,
                    departmentId: selectedDepartmentId,
                    courseType: "CORE", // Consider making this selectable
                    createdById: selectedTeacherIds[0]
                  })
                  fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/courses`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      name: newCourseName,
                      courseCode,
                      description: courseDescription,
                      creditHours: courseCredits,
                      departmentId: selectedDepartmentId,
                      courseType: "CORE", // Consider making this selectable
                      createdById: selectedTeacherIds[0]
                    }),
                  }).then((res) => {
                    if (res.ok) {
                      setToggler(!toggler);
                      setShowInput({ ...showInput, course: false });
                      setNewCourseName("");
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
