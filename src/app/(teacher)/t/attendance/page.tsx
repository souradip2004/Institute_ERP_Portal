"use client"
import TodaySessionsList from '@/components/teacher/TodaySessionWindow';
import { useState, useEffect } from 'react';

// Define interfaces for API responses to ensure type safety
interface ClassData {
  id: string;
  className: string;
  sectionId: string;
  sectionName: string;
  subject: string;
  studentCount: number;
  attendancePercentage: number | null; // Overall class attendance from initial API
  lastAssignment: {
    title: string;
    daysAgo: number;
    date: string;
  };
  nextExam: {
    date: string;
    day: string;
  };
  averageStudentAttendance: number | null; // Calculated average from student list
  students: StudentAttendance[] | null; // To store individual student data for display
}

interface StudentAttendance {
  id: string;
  name: string;
  rollNo: string;
  user: {
    name: string;
    email: string;
  };
  status: string;
  attendancePercentage: number | null; // Individual student attendance
  message: string;
}

interface StudentAttendanceResponse {
  students: StudentAttendance[];
}

interface ClassAttendanceStatisticsProps {
  teacherId: string;
}

 function ClassAttendanceStatistics({ teacherId }: ClassAttendanceStatisticsProps) {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null); // State to hold the class data for the modal

  useEffect(() => {
    const fetchClassData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all classes for the teacher
        const classesResponse = await fetch(`/api/teachers/${teacherId}/classes`);
        if (!classesResponse.ok) {
          throw new Error(`Failed to fetch classes: ${classesResponse.statusText}`);
        }
        const classesData: ClassData[] = await classesResponse.json();

        // For each class, fetch detailed student attendance and calculate average
        const classesWithStudentDetails = await Promise.all(
          classesData.map(async (classItem) => {
            let averageStudentAttendance: number | null = null;
            let studentsData: StudentAttendance[] | null = null;

            try {
              const studentAttendanceResponse = await fetch(`/api/attendance/student-attendance?classSectionId=${classItem.sectionId}`);
              if (!studentAttendanceResponse.ok) {
                console.warn(`Failed to fetch student attendance for section ${classItem.sectionId}: ${studentAttendanceResponse.statusText}`);
                // If fetching student data fails, set students to null and average to null
                return { ...classItem, averageStudentAttendance: null, students: null };
              }
              const studentResponse: StudentAttendanceResponse = await studentAttendanceResponse.json();
              studentsData = studentResponse.students;

              const validAttendances = studentsData
                .filter(student => student.status === 'ENROLLED' && student.attendancePercentage !== null)
                .map(student => student.attendancePercentage as number);

              if (validAttendances.length > 0) {
                const sum = validAttendances.reduce((acc, curr) => acc + curr, 0);
                averageStudentAttendance = Math.round(sum / validAttendances.length);
              }
            } catch (studentFetchError: any) {
              console.error(`Error fetching student attendance for section ${classItem.sectionId}:`, studentFetchError);
              averageStudentAttendance = null;
              studentsData = null;
            }
            return { ...classItem, averageStudentAttendance, students: studentsData };
          })
        );
        setClasses(classesWithStudentDetails);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (teacherId) {
      fetchClassData();
    }
  }, [teacherId]); // Re-run effect if teacherId changes

  // Function to open the student attendance modal
  const handleViewStudents = (classItem: ClassData) => {
    setSelectedClass(classItem);
  };

  // Function to close the modal
  const handleCloseModal = () => {
    setSelectedClass(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="text-lg text-gray-700">Loading attendance statistics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50 p-4">
        <div className="text-lg text-red-700">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 font-inter">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-8 text-center rounded-lg p-3 bg-white shadow-sm">
        Class Attendance Overview
      </h1>

      {classes.length === 0 ? (
        <div className="text-center text-gray-600 text-lg mt-10 p-5 bg-white rounded-lg shadow-md">
          No classes found for this teacher.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((classItem) => (
            <div
              key={classItem.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 flex flex-col justify-between cursor-pointer"
              onClick={() => handleViewStudents(classItem)} // Make the card clickable
            >
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold text-indigo-700 mb-2">
                  {classItem.className}
                  <span className="text-base text-gray-500 block">({classItem.subject})</span>
                </h2>
                <p className="text-gray-600 mb-1">
                  <span className="font-medium">Section:</span> {classItem.sectionName}
                </p>
                <p className="text-gray-600 mb-3">
                  <span className="font-medium">Students:</span> {classItem.studentCount}
                </p>

                <div className="mt-4 border-t border-gray-200 pt-4">
                  <p className="text-lg font-bold text-gray-700">Attendance Statistics:</p>
                  {/* Displaying class overall attendance if available from initial API */}
                  {/* {classItem.attendancePercentage !== null ? (
                    <p className="text-green-600 font-bold text-2xl mt-2">
                      Class Overall: {classItem.attendancePercentage}%
                    </p>
                  ) : (
                    <p className="text-gray-500 italic mt-2">Overall class attendance not marked.</p>
                  )} */}

                  {/* Displaying average calculated from individual students */}
                  {classItem.averageStudentAttendance !== null ? (
                    <p className="text-blue-600 font-bold text-2xl mt-2">
                      Avg. Student: {classItem.averageStudentAttendance}%
                    </p>
                  ) : (
                    <p className="text-gray-500 italic mt-2">Avg. student attendance not available.</p>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 text-sm text-gray-500">
                {classItem.lastAssignment && (
                  <p className="mb-1">
                    <span className="font-medium text-gray-700">Last Assignment:</span> {classItem.lastAssignment.title} ({classItem.lastAssignment.date}, {classItem.lastAssignment.daysAgo} days ago)
                  </p>
                )}
                {/* {classItem.nextExam && ( // Re-added nextExam display
                  <p>
                    <span className="font-medium text-gray-700">Next Exam:</span> {classItem.nextExam.date} {classItem.nextExam.day}
                  </p>
                )} */}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Student Attendance Modal */}
      {selectedClass && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-3xl font-bold"
              onClick={handleCloseModal}
            >
              &times;
            </button>
            <h2 className="text-2xl sm:text-3xl font-bold text-indigo-700 mb-4 border-b pb-2">
              Attendance for {selectedClass.className} ({selectedClass.sectionName})
            </h2>

            {selectedClass.students && selectedClass.students.length > 0 ? (
              <ul className="space-y-3">
                {selectedClass.students.map((student) => (
                  <li key={student.id} className="p-3 bg-gray-50 rounded-lg shadow-sm flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-800 text-lg">{student.name}</p>
                      <p className="text-sm text-gray-600">Roll No: {student.rollNo}</p>
                    </div>
                    <div className="text-right">
                      {student.attendancePercentage !== null ? (
                        <p className="text-xl font-bold text-green-700">
                          {student.attendancePercentage}%
                        </p>
                      ) : (
                        <p className="text-red-500 italic">Not available</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-600 text-lg mt-5">
                No student attendance data available for this class.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AttendancePage() {
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [activeTab, setActiveTab] = useState<'markAttendance' | 'viewStatistics'>('markAttendance'); // State to manage active tab

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.id) {
        setTeacherId(parsedUser.teacherId);
      } else {
        console.warn("User object in localStorage does not contain an 'id' property.");
      }
    }
    setLoadingUser(false);
  }, []);

  if (loadingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen text-xl text-gray-700">
        Loading user data...
      </div>
    );
  }

  if (!teacherId) {
    return (
      <div className="flex items-center justify-center min-h-screen text-xl text-red-500">
        Teacher ID not found. Please log in.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      {/* Tab Navigation */}
      <div className="flex justify-center mb-6">
        <button
          className={`py-3 px-6 rounded-l-lg text-lg font-medium transition-colors duration-300
            ${activeTab === 'markAttendance'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          onClick={() => setActiveTab('markAttendance')}
        >
          Mark Attendance
        </button>
        <button
          className={`py-3 px-6 rounded-r-lg text-lg font-medium transition-colors duration-300
            ${activeTab === 'viewStatistics'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          onClick={() => setActiveTab('viewStatistics')}
        >
          View Statistics
        </button>
      </div>

      {/* Conditional Rendering of Content */}
      {activeTab === 'markAttendance' && (
        <TodaySessionsList teacherId={teacherId} />
      )}
      {activeTab === 'viewStatistics' && (
        <ClassAttendanceStatistics teacherId={teacherId} />
      )}
    </div>
  );
}