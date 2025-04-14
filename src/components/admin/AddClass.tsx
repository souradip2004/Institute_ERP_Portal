"use client";
import { useState, useEffect } from "react";
import { useAddClass } from "@/hooks/useAddClass";
import Department from "@/graphql/types/Department";

export default function AddClassComponent({ id,userid }) {
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
  const [teacherData, setTeacherData] = useState([]);
  const [semesterOptions, setSemesterOptions] = useState([]);
  const [batchOptions, setBatchOptions] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [newOption, setNewOption] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [department, setDepartment] = useState([]);
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
        const filteredDepartments = data.filter((department) => department.institutionId === id);
        setDepartmentOptions(filteredDepartments.map((department) => department.name));
        setDepartment(filteredDepartments);
      })
      .catch((error) => {
        console.error("Error fetching departments:", error);
      });
  }, [id]);

  useEffect(() => {
    fetch("http://localhost:3000/api/semesters", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const filteredSemesters = data.filter((semester) => semester.institutionId === id);
        setSemesterOptions(filteredSemesters.map((semester) => semester.name));
      })
      .catch((error) => {
        console.error("Error fetching semesters:", error);
      });
  }, [id]);

  useEffect(() => {
    fetch("http://localhost:3000/api/batches", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const filteredBatches = data.filter((batch) => batch.department.id === department[0]?.id);
        console.log("Filtered Batches:", filteredBatches);
        setBatchOptions(filteredBatches.map((batch) => batch.batchName));
      })
      .catch((error) => {
        console.error("Error fetching batches:", error);
      });
  }, [department]);

  useEffect(() => {
    fetch("http://localhost:3000/api/teachers", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const filteredTeachers = data.filter((teacher) => teacher.user.institutionId === id);
        setTeacherData(filteredTeachers);
      })
      .catch((error) => {
        console.error("Error fetching teachers:", error);
      });
  }, [id]);

  const { addClass, loading, error } = useAddClass();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addClass(classData);
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

  return (
    <div className="flex">
      <form onSubmit={handleSubmit}>
        <h2 className="p-5">Add Class</h2>
        <input
          type="text"
          placeholder="Section Name"
          value={classData.sectionName}
          onChange={(e) => setClassData({ ...classData, sectionName: e.target.value })}
          className="border border-black w-45 m-5 p-2"
        />
        <select
          value={classData.department}
          onChange={(e) => setClassData({ ...classData, department: e.target.value })}
          className="border border-black w-45 m-5 p-2"
        >
          <option value="" disabled>
            Select Department
          </option>
          {departmentOptions.map((department, index) => (
            <option key={index} value={department}>
              {department}
            </option>
          ))}
          <option value="add-new">Add New Department</option>
        </select>
        {showInput.department && (
          <div className="flex items-center">
            <input
              type="text"
              placeholder="Add New Department"
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              className="border border-black w-45 m-5 p-2"
            />
            <button
              type="button"
              onClick={() => handleAddNewOption("department")}
              className="border border-black w-25 rounded-2xl bg-black text-white"
            >
              Add
            </button>
          </div>
        )}
        <input
          type="number"
          placeholder="Max Students"
          value={classData.maxStudents}
          onChange={(e) => setClassData({ ...classData, maxStudents: Number(e.target.value) })}
          className="border border-black w-15 mr-5 p-2"
        />
        <select
          value={classData.teacherId}
          onChange={(e) => setClassData({ ...classData, teacherId: e.target.value })}
          className="border border-black w-45 m-5 p-2"
        >
          <option value="" disabled>
            Select Teacher
          </option>
          {teacherData.map((teacher) => (
            <option key={teacher.id} value={teacher.id}>
              {teacher.user.name}
            </option>
          ))}
        </select>

        {/* Semester Dropdown */}
        <select
          value={classData.semester}
          onChange={(e) => handleDropdownChange("semester", e.target.value)}
          className="border border-black w-45 m-5 p-2"
        >
          <option value="" disabled>
            Select Semester
          </option>
          {semesterOptions.map((semester, index) => (
            <option key={index} value={semester}>
              {semester}
            </option>
          ))}
          <option value="add-new">Add New Semester</option>
        </select>
        {showInput.semester && (
          <div className="flex flex-col items-start">
            <input
              type="text"
              placeholder="Add New Semester"
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              className="border border-black w-45 m-5 p-2"
            />
            <input
              type="date"
              placeholder="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-black w-45 m-5 p-2"
            />
            <input
              type="date"
              placeholder="End Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-black w-45 m-5 p-2"
            />
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
                    window.location.reload();
                  } else {
                    alert("Error adding semester");
                  }
                });

              }}
              className="border border-black w-25 rounded-2xl bg-black text-white"
            >
              Add
            </button>
          </div>
        )}

        {/* Batch Dropdown */}
        <select
          value={classData.batch}
          onChange={(e) => handleDropdownChange("batch", e.target.value)}
          className="border border-black w-45 m-5 p-2"
        >
          <option value="" disabled>
            Select Batch
          </option>
          {batchOptions.map((batch, index) => (
            <option key={index} value={batch}>
              {batch}
            </option>
          ))}
          <option value="add-new">Add New Batch</option>
        </select>
        {showInput.batch && (
          <div className="flex items-center">
            <input
              type="text"
              placeholder="Add New Batch"
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              className="border border-black w-45 m-5 p-2"
            />
            <button
              type="button"
              onClick={() => {
                console.log(classData.department);
                console.log("depart",department)
                console.log(department.find((dept) => dept.name === classData.department)?.id);
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
                    department:{connect:{id:departmentOptions.find((dept) => dept.name === classData.department)?.id}},
                  }),
                }).then((res) => {
                  if (res.ok) {
                    window.location.reload();
                  } else {
                    alert("Error adding batch");
                  }
                });
              }}
              className="border border-black w-25 rounded-2xl bg-black text-white"
            >
              Add
            </button>
          </div>
        )}

        {/* Course Dropdown */}
        <select
          value={classData.course}
          onChange={(e) => handleDropdownChange("course", e.target.value)}
          className="border border-black w-45 m-5 p-2"
        >
          <option value="" disabled>
            Select Course
          </option>
          {courseOptions.map((course, index) => (
            <option key={index} value={course}>
              {course}
            </option>
          ))}
          <option value="add-new">Add New Course</option>
        </select>
        {showInput.course && (
          <div className="flex items-center">
            <input
              type="text"
              placeholder="Add New Course"
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              className="border border-black w-45 m-5 p-2"
            />
            <input
              type="text"
              placeholder="Course Code"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
              className="border border-black w-45 m-5 p-2"
            />
            <input
              type="text"
              placeholder="Course Name"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              className="border border-black w-45 m-5 p-2"
            />
            <input
              type="text"
              placeholder="Course Description"
              value={courseDescription}
              onChange={(e) => setCourseDescription(e.target.value)}
              className="border border-black w-45 m-5 p-2"
            />
            <input
              type="number"
              placeholder="Course Credits"
              value={courseCredits}
              onChange={(e) => setCourseCredits(Number(e.target.value))}
              className="border border-black w-45 m-5 p-2"
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
                    courseType:"CORE",
                    createdBy:userid
                  }),
                }).then((res) => {
                  if (res.ok) {
                    window.location.reload();
                  } else {
                    alert("Error adding course");
                  }
                });
              }}
              className="border border-black w-25 rounded-2xl bg-black text-white"
            >
              Add
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="border border-black w-25 rounded-2xl bg-black text-white"
        >
          {loading ? "Adding Class..." : "Add Class"}
        </button>
      </form>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
