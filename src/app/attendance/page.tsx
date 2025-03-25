"use client";
import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";

const teachers:string[] = [];

type Student = {
  id: string;
  name: string;
  roll: string;
  email: string;
  attendance: Record<string, string>; // date: "Present" | "Absent"
};

// Initialize default data structure for teachers and their students
type TeacherData = Record<string, Student[]>;

// Alert message type with teacher ID
type AlertMessage = {
  show: boolean;
  message: string;
  isError: boolean;
  teacherId: string | null;
};
type Department={
  name:string;
  code:string;
  description:string;
  institutionId:string;
  createdAt:Date;
  updatedAt:Date;
}

export default function Home() {
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const [departmentid,setdepartmentid]=useState<string | null>(null);
  useEffect(() => {
    let department:Department={
      name:"CSE",
      code:"CSE",
      description:"Computer Science and Engineering",
      institutionId:"123",
      createdAt:new Date(),
      updatedAt:new Date()
    } 
    fetch("/api/attendance/department", {
      method: "POST",
      body: JSON.stringify(department),
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(res => res.json())
      .then(data => {
setdepartmentid(data.id);
        console.log(data);
      });
    },[]);
    useEffect(() => {
    fetch("/api/attendance/fetchTeachers", {
      method: "POST",
      body: JSON.stringify({ classId: departmentid }),
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(res => res.json())
      .then(data => {
        teachers.push(data);
      });
  }
  , [departmentid]);
  const [teacherData, setTeacherData] = useState<TeacherData>(() => {
    // Initialize with empty student arrays for each teacher
    const initialData: TeacherData = {};
    teachers.forEach(teacher => {
      initialData[teacher] = [];
    });
    return initialData;
  });
  
  // New student form states
  const [newStudent, setNewStudent] = useState({
    name: "",
    roll: "",
    email: ""
  });
  
  // Fixed current date for attendance (today only)
  const today = new Date().toISOString().split('T')[0];
  
  // Alert message for CSV import with teacher ID
  const [csvAlert, setCsvAlert] = useState<AlertMessage>({ 
    show: false, 
    message: "", 
    isError: false,
    teacherId: null
  });
  
  // Reference to file input for CSV
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle input change for new student
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewStudent(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add new student for the selected teacher
  const addStudent = () => {
    if (!selectedTeacher) return;
    if (newStudent.name.trim() === "" || newStudent.roll.trim() === "") return;

    const student: Student = {
      id: Date.now().toString(),
      name: newStudent.name,
      roll: newStudent.roll,
      email: newStudent.email,
      attendance: {
        [today]: "Present" // Default to present when added
      }
    };

    setTeacherData(prev => ({
      ...prev,
      [selectedTeacher]: [...prev[selectedTeacher], student]
    }));

    // Reset form
    setNewStudent({
      name: "",
      roll: "",
      email: ""
    });
  };

  // Remove student from selected teacher's list
  const removeStudent = (studentId: string) => {
    if (!selectedTeacher) return;
    
    setTeacherData(prev => ({
      ...prev,
      [selectedTeacher]: prev[selectedTeacher].filter(s => s.id !== studentId)
    }));
  };

  // Toggle attendance for a specific student on the fixed date (today)
  const toggleAttendance = (studentId: string, status: "Present" | "Absent") => {
    if (!selectedTeacher) return;
    
    setTeacherData(prev => {
      const updatedStudents = prev[selectedTeacher].map(student => {
        if (student.id === studentId) {
          return {
            ...student,
            attendance: {
              ...student.attendance,
              [today]: status
            }
          };
        }
        return student;
      });

      return {
        ...prev,
        [selectedTeacher]: updatedStudents
      };
    });
  };
  
  // Handle teacher selection - reset alert when changing teachers
  const handleTeacherSelect = (teacher: string) => {
    setSelectedTeacher(teacher);
    if (csvAlert.teacherId !== teacher) {
      setCsvAlert({ show: false, message: "", isError: false, teacherId: null });
    }
  };
  
  // Handle CSV file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedTeacher) {
      setCsvAlert({
        show: true,
        message: "Please select a teacher first",
        isError: true,
        teacherId: null
      });
      return;
    }
    
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const csvData = event.target?.result as string;
        const lines = csvData.split('\n');
        
        // Check for header row
        if (lines.length < 2) {
          setCsvAlert({
            show: true,
            message: "CSV file is empty or invalid",
            isError: true,
            teacherId: selectedTeacher
          });
          return;
        }
        
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        // Validate headers
        const nameIndex = headers.indexOf('name');
        const rollIndex = headers.indexOf('roll');
        const emailIndex = headers.indexOf('email');
        
        if (nameIndex === -1 || rollIndex === -1) {
          setCsvAlert({
            show: true,
            message: "CSV must contain 'name' and 'roll' columns",
            isError: true,
            teacherId: selectedTeacher
          });
          return;
        }
        
        // Process student data
        const newStudents: Student[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          
          const values = lines[i].split(',').map(v => v.trim());
          
          const name = values[nameIndex];
          const roll = values[rollIndex];
          const email = emailIndex !== -1 ? values[emailIndex] : "";
          
          if (name && roll) {
            newStudents.push({
              id: `${Date.now()}-${i}`,
              name,
              roll,
              email,
              attendance: {
                [today]: "Present" // Default to present
              }
            });
          }
        }
        
        // Add students to the teacher's data
        if (newStudents.length > 0) {
          setTeacherData(prev => ({
            ...prev,
            [selectedTeacher]: [...prev[selectedTeacher], ...newStudents]
          }));
          
          setCsvAlert({
            show: true,
            message: `Successfully imported ${newStudents.length} students`,
            isError: false,
            teacherId: selectedTeacher
          });
        } else {
          setCsvAlert({
            show: true,
            message: "No valid student data found in CSV",
            isError: true,
            teacherId: selectedTeacher
          });
        }
      } catch (error) {
        setCsvAlert({
          show: true,
          message: "Error processing CSV file",
          isError: true,
          teacherId: selectedTeacher
        });
      }
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };
    
    reader.onerror = () => {
      setCsvAlert({
        show: true,
        message: "Error reading CSV file",
        isError: true,
        teacherId: selectedTeacher
      });
    };
    
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-gray-900 text-black p-4">
        <h2 className="text-lg font-bold mb-4">Select a Teacher</h2>
        <ul>
          {teachers.map((teacher) => (
            <li
              key={teacher}
              className={`cursor-pointer p-2 rounded-md mb-1 text-black ${
                selectedTeacher === teacher ? "bg-gray-700" : "hover:bg-gray-800"
              }`}
              onClick={() => handleTeacherSelect(teacher)}
            >
              {teacher}
            </li>
          ))}
        </ul>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 bg-gray-100 overflow-auto">
        {!selectedTeacher ? (
          <div className="text-center mt-10">
            <h2 className="text-2xl font-semibold">Please select a teacher to view their dashboard</h2>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-semibold mb-4">
              {selectedTeacher}'s Attendance Dashboard
            </h2>

            {/* Today's Date Display */}
            <Card className="p-4 mb-4">
              <h3 className="text-lg font-medium mb-2">Today's Date</h3>
              <p className="font-semibold text-lg">{new Date().toLocaleDateString()}</p>
            </Card>

            {/* CSV Import */}
            <Card className="p-4 mb-4">
              <h3 className="text-lg font-medium mb-2">Import Students from CSV</h3>
              <p className="text-sm text-gray-500 mb-2">CSV should have columns: name, roll, email</p>
              <div className="flex flex-col gap-2">
                <Input
                  type="file"
                  accept=".csv"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                />
                {csvAlert.show && csvAlert.teacherId === selectedTeacher && (
                  <Alert className={csvAlert.isError ? "bg-red-50" : "bg-green-50"}>
                    <AlertDescription className={csvAlert.isError ? "text-red-600" : "text-green-600"}>
                      {csvAlert.message}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </Card>

            {/* Student Entry Form */}
            <Card className="p-4 mb-4">
              <h3 className="text-lg font-medium mb-2">Add New Student</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <Input
                  placeholder="Student Name"
                  name="name"
                  value={newStudent.name}
                  onChange={handleInputChange}
                />
                <Input
                  placeholder="Roll Number"
                  name="roll"
                  value={newStudent.roll}
                  onChange={handleInputChange}
                />
                <Input
                  placeholder="Email"
                  name="email"
                  type="email"
                  value={newStudent.email}
                  onChange={handleInputChange}
                />
                <Button onClick={addStudent}>
                  Add Student
                </Button>
              </div>
            </Card>

            {/* Students Table */}
            <Card className="p-4">
              <h3 className="text-lg font-medium mb-2">Students & Attendance (Today)</h3>
              
              {teacherData[selectedTeacher].length === 0 ? (
                <p className="text-gray-500 text-center py-6">
                  No students added yet. Add students using the form above or import from CSV.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Roll</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Attendance</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teacherData[selectedTeacher].map(student => (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">{student.name}</TableCell>
                          <TableCell>{student.roll}</TableCell>
                          <TableCell>{student.email}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant={student.attendance[today] === "Present" ? "default" : "outline"}
                                onClick={() => toggleAttendance(student.id, "Present")}
                              >
                                Present
                              </Button>
                              <Button
                                size="sm"
                                variant={student.attendance[today] === "Absent" ? "default" : "outline"}
                                onClick={() => toggleAttendance(student.id, "Absent")}
                              >
                                Absent
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => removeStudent(student.id)}
                            >
                              Remove
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </Card>

            {/* Attendance Statistics */}
            {teacherData[selectedTeacher].length > 0 && (
              <Card className="p-4 mt-4">
                <h3 className="text-lg font-medium mb-2">Attendance Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Total Students: {teacherData[selectedTeacher].length}</p>
                    <p className="text-sm font-medium">Present: {
                      teacherData[selectedTeacher].filter(s => s.attendance[today] === "Present").length
                    }</p>
                    <p className="text-sm font-medium">Absent: {
                      teacherData[selectedTeacher].filter(s => s.attendance[today] === "Absent").length
                    }</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Attendance Rate: {
                      teacherData[selectedTeacher].length > 0 
                        ? `${Math.round((teacherData[selectedTeacher].filter(s => s.attendance[today] === "Present").length / teacherData[selectedTeacher].length) * 100)}%`
                        : "N/A"
                    }</p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}