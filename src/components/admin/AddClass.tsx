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
    department: "",
    institutionId: id,
  });
  const [teacherData, setTeacherData] = useState<Teacher[]>([]);
  const [semesterOptions, setSemesterOptions] = useState<string[]>([]);
  const [batchOptions, setBatchOptions] = useState<string[]>([]);
  const [batchData, setBatchData] = useState<Batch[]>([]);
  const [courseData, setCourseData] = useState<Course[]>([]);
  const [toggler,setToggler] = useState(false);
  const [semesterData, setSemesterData] = useState<Semester[]>([]);
  const [courseOptions, setCourseOptions] = useState<string[]>([]);
  const [departmentOptions, setDepartmentOptions] = useState<string[]>([]);
  const [newOption, setNewOption] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [department, setDepartment] = useState<Department[]>([]);
  const [courseCode, setCourseCode] = useState("");
  const [courseName, setCourseName] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [courseCredits, setCourseCredits] = useState(0);

  const [showInput, setShowInput] = useState({ semester: false, batch: false, course: false, department: false });

  useEffect(() => {
    fetch("http://localhost:3000/api/departments", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const filteredDepartments = data.filter((department: Department) => department.institutionId === id);
        setDepartmentOptions(filteredDepartments.map((department: Department) => department.name));
        setDepartment(filteredDepartments);
      })
      .catch((error) => {
        console.error("Error fetching departments:", error);
      });
  }, [id,toggler]);

  useEffect(() => {
    fetch("http://localhost:3000/api/semesters", {
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
  }, [id,toggler]);

  useEffect(() => {
    if (!department[0]?.id) return;
    
    fetch("http://localhost:3000/api/batches", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const filteredBatches = data.filter((batch: Batch) => batch.department?.id === department[0]?.id);
        setBatchData(filteredBatches);
        setBatchOptions(filteredBatches.map((batch: Batch) => batch.batchName));
      })
      .catch((error) => {
        console.error("Error fetching batches:", error);
      });
  }, [department,toggler]);

  useEffect(() => {
    fetch("http://localhost:3000/api/teachers", {
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
  }, [id,toggler]);

  useEffect(() => {
    if (!department[0]?.id) return;
    
    fetch("http://localhost:3000/api/courses", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const filteredCourses = data.filter((course: Course) => course.department?.id === department[0]?.id);
        setCourseData(filteredCourses);
        setCourseOptions(filteredCourses.map((course: Course) => course.name));
      })
      .catch((error) => {
        console.error("Error fetching courses:", error);
      });
  }, [department,toggler]);

  const { addClass, loading, error } = useAddClass();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addClass({
      batchId: batchData.find((batch) => batch.batchName === classData.batch)?.id || "",
      courseId: courseData.find((course) => course.name === classData.course)?.id || "",
      departmentId: department.find((dept) => dept.name === classData.department)?.id || "",
      semesterId: semesterData.find((semester) => semester.name === classData.semester)?.id || "",
      maxStudents: classData.maxStudents,
      teacherId: classData.teacherId,
      sectionName: classData.sectionName,
    });
    
    if (!error) {
      onClose();
      window.location.reload();
    }
  };

  const handleAddNewOption = (type: string) => {
    if (!newOption.trim()) return;
    if (type === "semester") {
      setSemesterOptions([...semesterOptions, `${newOption} (Start: ${startDate}, End: ${endDate})`]);
    }
    if (type === "batch") setBatchOptions([...batchOptions, newOption]);
    if (type === "course") setCourseOptions([...courseOptions, newOption]);
    setNewOption("");
    setStartDate("");
    setEndDate("");
    setShowInput({ ...showInput, [type]: false });
  };

  const handleDropdownChange = (type: string, value: string) => {
    if (value === "add-new") {
      setShowInput({ ...showInput, [type]: true });
    } else {
      setClassData({ ...classData, [type]: value });
      setShowInput({ ...showInput, [type]: false });
    }
  };

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Section Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Section Name</label>
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
              <select
                value={classData.department}
                onChange={(e) => setClassData({ ...classData, department: e.target.value })}
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
                    onClick={() => handleAddNewOption("department")}
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
              <select
                value={classData.teacherId}
                onChange={(e) => setClassData({ ...classData, teacherId: e.target.value })}
                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
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
              <select
                value={classData.semester}
                onChange={(e) => handleDropdownChange("semester", e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
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
                    placeholder="Semester Name"
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
                    onClick={async() => {
                      await fetch("http://localhost:3000/api/semesters", {
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
                          setToggler(!toggler);
                          setShowInput({ ...showInput, semester: false });
                          
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
              <select
                value={classData.batch}
                onChange={(e) => handleDropdownChange("batch", e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
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
                    placeholder="Batch Name"
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-md mb-2"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      fetch("http://localhost:3000/api/batches", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          batchName: newOption,
                          institutionId: id,
                          year: new Date().getFullYear(),
                          maxStudents: 60,
                          departmentId: department.find((dept) => dept.name === classData.department)?.id,
                        }),
                      }).then((res) => {
                        if (res.ok) {
                          setToggler(!toggler);
                          setShowInput({ ...showInput, batch: false });
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
              <select
                value={classData.course}
                onChange={(e) => handleDropdownChange("course", e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
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
                    placeholder="Course Name"
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-md"
                  />
                  <input
                    type="text"
                    placeholder="Course Code"
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
                      fetch("http://localhost:3000/api/courses", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          name: newOption,
                          courseCode,
                          description: courseDescription,
                          creditHours: courseCredits,
                          departmentId: department.find((dept) => dept.name === classData.department)?.id,
                          courseType: "CORE",
                          createdById: classData.teacherId
                        }),
                      }).then((res) => {
                        if (res.ok) {
                          setToggler(!toggler);
                          setShowInput({ ...showInput, course: false });
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
