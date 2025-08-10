"use client"
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Users, Percent } from 'lucide-react';
import { useSearchParams } from "next/navigation";
import AttendanceProgressBar from "@/components/admin/AttendanceProgressBar";
import { FaEdit } from 'react-icons/fa';
import { Suspense } from 'react';

interface StudentAttendanceDetail {
  studentId: string;
  studentName: string;
  studentRoll: string;
  todaysStatus: 'PRESENT' | 'ABSENT' | 'LATE' | 'NOT_MARKED';
  overallAttendancePercentage: number | null; // Can be null
}

interface AttendanceApiResponse {
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  sessionStartDate: string;
  scheduledDays: number[]; // Array of weekdays (0=Sun, 1=Mon, etc.)
  classSectionName: string;
  courseName: string;
  date: string;
  students: StudentAttendanceDetail[];
}

interface ApiErrorResponse {
  message: string;
  scheduledDays?: number[];
  sessionStartDate?: string;
}

// --- HELPER FUNCTIONS ---

const formatDateForApi = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDateForDisplay = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export default function AttendancePage() {
  return (
    <Suspense fallback={<div className="p-6">Loading attendance table...</div>}>
      <DailyAttendanceTable />
    </Suspense>
  );
}

function DailyAttendanceTable() {

  const searchParams = useSearchParams();

  // --- STATE MANAGEMENT ---
  const [attendanceData, setAttendanceData] = useState<AttendanceApiResponse | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [classSectionId, setClassSectionId] = useState(searchParams?.get('classSectionId'));

  // NEW: State for schedule info, which persists even on error
  const [scheduledDays, setScheduledDays] = useState<number[] | null>(null);
  const [sessionStartDate, setSessionStartDate] = useState<string | null>(null);

  // State for inline editing
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<StudentAttendanceDetail['todaysStatus']>('NOT_MARKED');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  useEffect(() => {
    if (!classSectionId) {
      setError("Error: No Class Section ID found in the URL.");
      setIsLoading(false);
      return;
    }
    fetchData();
  }, [currentDate, classSectionId]);

  // --- DATA FETCHING (MODIFIED) ---
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    setUpdateError(null);

    const dateString = formatDateForApi(currentDate);
    const apiUrl = `/api/attendance/class-section-attendance?classSectionId=${classSectionId}&date=${dateString}`;

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();

      // Always try to set schedule info, even from an error response
      if (data.scheduledDays) setScheduledDays(data.scheduledDays);
      if (data.sessionStartDate) setSessionStartDate(data.sessionStartDate);

      if (!response.ok) {
        const errorData = data as ApiErrorResponse;
        setAttendanceData(null); // Clear previous data on error
        throw new Error(errorData.message || 'An unknown error occurred while fetching data.');
      }

      setAttendanceData(data as AttendanceApiResponse);
    } catch (err: any) {
      setError(err.message);
      // We already set attendanceData to null, so no need to do it again here.
    } finally {
      setIsLoading(false);
    }
  };

  // --- EVENT HANDLERS (MODIFIED FOR SMART NAVIGATION) ---

  /**
   * Finds the next or previous valid session day based on the schedule.
   * @param startDate The date to start searching from.
   * @param direction 'next' or 'prev'.
   * @returns A new Date object for the found day, or null if not found.
   */
  const findNextScheduledDay = (startDate: Date, direction: 'next' | 'prev'): Date | null => {
    if (!scheduledDays || scheduledDays.length === 0) return null;

    let newDate = new Date(startDate);
    // Search for up to 90 days to prevent infinite loops
    for (let i = 0; i < 90; i++) {
      const dayIncrement = direction === 'next' ? 1 : -1;
      newDate.setDate(newDate.getDate() + dayIncrement);

      const dayOfWeek = newDate.getDay(); // 0 for Sunday, 1 for Monday...

      if (scheduledDays.includes(dayOfWeek)) {
        return newDate;
      }
    }
    return null; // Return null if no valid day is found in the search range
  };

  const handlePrevDay = () => {
    const prevScheduledDate = findNextScheduledDay(currentDate, 'prev');
    if (prevScheduledDate) {
      setCurrentDate(prevScheduledDate);
    }
  };

  const handleNextDay = () => {
    const nextScheduledDate = findNextScheduledDay(currentDate, 'next');
    if (nextScheduledDate) {
      setCurrentDate(nextScheduledDate);
    }
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Correctly creates a Date object in the user's local timezone.
    const newDate = new Date(event.target.value + 'T00:00:00');
    setCurrentDate(newDate);
  };

  // --- (Edit and Update handlers remain unchanged) ---
  const handleEditClick = (studentId: string, currentStatus: StudentAttendanceDetail['todaysStatus']) => {
    setEditingStudentId(studentId);
    setSelectedStatus(currentStatus);
    setUpdateError(null);
  };

  const handleCancelEdit = () => {
    setEditingStudentId(null);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(e.target.value as StudentAttendanceDetail['todaysStatus']);
  };

  const handleUpdateAttendance = async () => {
    if (!editingStudentId || !classSectionId || !attendanceData) return;

    setIsUpdating(true);
    setUpdateError(null);

    const originalData = JSON.parse(JSON.stringify(attendanceData));

    const optimisticallyUpdatedData = {
      ...attendanceData,
      students: attendanceData.students.map(student =>
        student.studentId === editingStudentId
          ? { ...student, todaysStatus: selectedStatus }
          : student
      ),
    };
    setAttendanceData(optimisticallyUpdatedData);
    setEditingStudentId(null);

    try {
      const response = await fetch('/api/attendance/class-section-attendance', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: editingStudentId,
          classSectionId: classSectionId,
          date: formatDateForApi(currentDate),
          status: selectedStatus,
          teacherId: attendanceData.teacherId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update attendance.');
      }
      await fetchData();
    } catch (err: any) {
      setAttendanceData(originalData);
      setUpdateError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };


  // --- UI RENDERERS & DERIVED STATE (MODIFIED) ---
  const getStatusBadge = (status: StudentAttendanceDetail['todaysStatus']) => {
    const baseClasses = "px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full";
    switch (status) {
      case 'PRESENT': return <span className={`${baseClasses} bg-green-100 text-green-800`}>Present</span>;
      case 'ABSENT': return <span className={`${baseClasses} bg-red-100 text-red-800`}>Absent</span>;
      case 'LATE': return <span className={`${baseClasses} bg-orange-100 text-orange-800`}>Late</span>;
      default: return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>Not Marked</span>;
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isInteractionDisabled = isLoading || isUpdating;

  // MODIFIED: Smarter disabling logic using persistent schedule state
  const isPrevDisabled = (): boolean => {
    if (isInteractionDisabled || !sessionStartDate || !scheduledDays) return true;
    const prevDay = findNextScheduledDay(currentDate, 'prev');
    if (!prevDay) return true;
    // Compare date parts only
    return prevDay < new Date(sessionStartDate + 'T00:00:00');
  };

  const isNextDisabled = (): boolean => {
    if (isInteractionDisabled || !scheduledDays) return true;
    const nextDay = findNextScheduledDay(currentDate, 'next');
    if (!nextDay) return true;
    // today constant is already normalized
    return nextDay > today;
  };

  // Calculate daily stats for the header
  const dailyStats = !isLoading && attendanceData ? {
    total: attendanceData.students.length,
    present: attendanceData.students.filter(s => s.todaysStatus === 'PRESENT').length,
    absent: attendanceData.students.filter(s => s.todaysStatus === 'ABSENT').length,
    late: attendanceData.students.filter(s => s.todaysStatus === 'LATE').length,
    notMarked: attendanceData.students.filter(s => s.todaysStatus === 'NOT_MARKED').length,
  } : null;

  const attendedCount = (dailyStats?.present ?? 0) + (dailyStats?.late ?? 0);
  const markedCount = (dailyStats?.total ?? 0) - (dailyStats?.notMarked ?? 0);
  const dailyAttendancePercentage = markedCount > 0 ? Math.round((attendedCount / markedCount) * 100) : 0;


  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        {/* Header Card: Displayed only when there is valid attendance data */}
        {!isLoading && attendanceData && dailyStats && (
          <div className="p-4 sm:p-6 bg-violet-50/50 rounded-xl mb-6 border border-violet-100">
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-4xl font-bold">{attendanceData.teacherName.charAt(0)}</span>
                </div>
              </div>
              <div className="flex-grow text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-800">{attendanceData.teacherName}</h2>
                <p className="text-sm text-gray-500">{attendanceData.teacherEmail}</p>
                <div className="mt-2 text-sm font-medium text-violet-700 bg-violet-100 px-3 py-1 rounded-full inline-block">
                  {attendanceData.classSectionName}
                </div>
              </div>
              <div className="w-full md:w-auto grid grid-cols-2 sm:grid-cols-4 gap-4 text-center mt-4 md:mt-0">
                <div><p className="text-sm text-gray-500">Present</p><p className="text-2xl font-bold text-green-600">{dailyStats.present}</p></div>
                <div><p className="text-sm text-gray-500">Absent</p><p className="text-2xl font-bold text-red-600">{dailyStats.absent}</p></div>
                <div><p className="text-sm text-gray-500">Late</p><p className="text-2xl font-bold text-orange-500">{dailyStats.late}</p></div>
                <div><p className="text-sm text-gray-500">Attendance</p><p className="text-2xl font-bold text-green-600 flex items-center justify-center">{dailyAttendancePercentage}<Percent className="h-5 w-5 ml-0.5" /></p></div>
              </div>
            </div>
          </div>
        )}

        {/* Date Navigation & Table Title */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
          <h3 className="text-lg font-bold text-gray-800 order-2 sm:order-1">
            Student List for <span className="text-violet-600">{formatDateForDisplay(currentDate)}</span>
          </h3>
          <div className="flex items-center gap-2 order-1 sm:order-2 ">
            <button onClick={handlePrevDay} disabled={isPrevDisabled()} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Previous scheduled day">
              <ChevronLeft className="h-5 w-5"/>
            </button>
            <div className="relative">
              <input type="date" value={formatDateForApi(currentDate)} min={sessionStartDate || undefined} max={formatDateForApi(new Date())} onChange={handleDateChange} disabled={isInteractionDisabled || !sessionStartDate} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"/>
            </div>
            <button onClick={handleNextDay} disabled={isNextDisabled()} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Next scheduled day">
              <ChevronRight className="h-5 w-5"/>
            </button>
          </div>
        </div>

        {/* Update Error Display */}
        {updateError && (
          <div className="my-4 text-center text-red-700 bg-red-100 p-3 rounded-md border border-red-300">
            <p><span className="font-bold">Update Failed:</span> {updateError} The change has been reverted.</p>
          </div>
        )}

        {/* Content Area (MODIFIED RENDER LOGIC) */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-12 text-gray-500">Loading Attendance Data...</div>
          ) : attendanceData && attendanceData.students.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Overall Attendance</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
              {attendanceData.students.map(student => (
                <tr key={student.studentId} className={`hover:bg-gray-50 transition-opacity ${isUpdating && student.studentId !== editingStudentId ? 'opacity-50' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.studentName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.studentRoll}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingStudentId === student.studentId ? (
                      <div className="flex items-center gap-2">
                        <select value={selectedStatus} onChange={handleStatusChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2">
                          <option value="PRESENT">Present</option>
                          <option value="ABSENT">Absent</option>
                          <option value="LATE">Late</option>
                        </select>
                        <button onClick={handleUpdateAttendance} disabled={isUpdating} className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-wait">
                          {isUpdating ? 'Saving...' : 'Save'}
                        </button>
                        <button onClick={handleCancelEdit} disabled={isUpdating} className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50">
                          Cancel
                        </button>
                      </div>
                    ) : (
                      getStatusBadge(student.todaysStatus)
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <AttendanceProgressBar value={student.overallAttendancePercentage} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <button onClick={() => handleEditClick(student.studentId, 'PRESENT')} disabled={isInteractionDisabled} className="text-blue-600 hover:text-blue-900 disabled:text-gray-400 disabled:cursor-not-allowed p-2 rounded-full hover:bg-blue-50">
                      <FaEdit aria-hidden="true" />
                      <span className="sr-only">Edit</span>
                    </button>
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12 text-red-600 bg-red-50 p-4 rounded-md">
              <h3 className="font-bold">An Error Occurred</h3>
              <p>{error || "There is no attendance data available for the selected date."}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}