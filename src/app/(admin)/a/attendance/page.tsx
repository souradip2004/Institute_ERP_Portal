"use client"
import React, {useState, useEffect} from 'react';
import {ChevronLeft, ChevronRight, Calendar} from 'lucide-react';
import {useSearchParams} from "next/navigation";
import AttendanceProgressBar from "@/components/admin/AttendanceProgressBar";

interface StudentAttendanceDetail {
  studentId: string;
  studentName: string;
  studentRoll: string;
  todaysStatus: 'PRESENT' | 'ABSENT' | 'LATE' | 'NOT_MARKED';
  overallAttendancePercentage: number;
}

interface AttendanceApiResponse {
  sessionStartDate: string;
  classSectionName: string;
  courseName: string;
  date: string;
  students: StudentAttendanceDetail[];
}

interface ApiErrorResponse {
  message: string;
}

// --- HELPER FUNCTIONS ---

// Formats a Date object to 'YYYY-MM-DD' string for API calls and date inputs.
const formatDateForApi = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Formats a Date object for display in the UI header.
const formatDateForDisplay = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export default function DailyAttendanceTable() {

  const searchParams = useSearchParams();

  // 2. STATE MANAGEMENT
  const [attendanceData, setAttendanceData] = useState<AttendanceApiResponse | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [classSectionId, setClassSectionId] = useState( searchParams?.get('classSectionId'));

  useEffect(() => {
    if (!classSectionId) {
      setError("Error: No Class Section ID found in the URL.");
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      console.log("")
      const dateString = formatDateForApi(currentDate);
      const apiUrl = `/api/attendance/class-section-attendance?classSectionId=${classSectionId}&date=${dateString}`;

      try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (!response.ok) {
          const errorData = data as ApiErrorResponse;
          throw new Error(errorData.message || 'An unknown error occurred.');
        }

        setAttendanceData(data as AttendanceApiResponse);
      } catch (err: any) {
        setError(err.message);
        setAttendanceData(null); // Clear data on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentDate, classSectionId]); // Re-run effect when date or ID changes

  // 4. EVENT HANDLERS
  const handlePrevDay = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() - 1);
      return newDate;
    });
  };

  const handleNextDay = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() + 1);
      return newDate;
    });
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = event.target.value;
    // Adjust for timezone offset from the date input, which provides date in UTC
    const newDate = new Date(dateValue);
    const timezoneOffset = newDate.getTimezoneOffset() * 60000;
    setCurrentDate(new Date(newDate.getTime() + timezoneOffset));
  };

  // 5. STATUS BADGE RENDERER
  const getStatusBadge = (status: StudentAttendanceDetail['todaysStatus']) => {
    const baseClasses = "px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full";
    switch (status) {
      case 'PRESENT':
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>Present</span>;
      case 'ABSENT':
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>Absent</span>;
      case 'LATE':
        return <span className={`${baseClasses} bg-orange-100 text-orange-800`}>Late</span>;
      case 'NOT_MARKED':
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>Not Marked</span>;
    }
  };

  // 6. DYNAMIC VALUES FOR UI
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize for accurate date-only comparison

  // Disable previous button if current date is on or before the session start date
  const isPrevDisabled = attendanceData?.sessionStartDate
    ? new Date(formatDateForApi(currentDate)) <= new Date(attendanceData.sessionStartDate)
    : true;

  // Disable next button if current date is today or in the future
  const isNextDisabled = new Date(formatDateForApi(currentDate)) >= today;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md m-3 md:m-6">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Daily Attendance: {attendanceData?.classSectionName || (isLoading ? 'Loading...' : 'N/A')}
          </h2>
          <p className="text-sm text-gray-500">
            Course: {attendanceData?.courseName || 'N/A'}
          </p>
        </div>

        {/* Date Navigation Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevDay}
            disabled={isPrevDisabled || isLoading}
            className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous day"
          >
            <ChevronLeft className="h-5 w-5"/>
          </button>

          <div className="relative">
            <input
              type="date"
              value={formatDateForApi(currentDate)}
              min={attendanceData?.sessionStartDate}
              max={formatDateForApi(new Date())}
              onChange={handleDateChange}
              disabled={isLoading || !attendanceData}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 mr-5"
            />
          </div>

          <button
            onClick={handleNextDay}
            disabled={isNextDisabled || isLoading}
            className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next day"
          >
            <ChevronRight className="h-5 w-5"/>
          </button>
        </div>
      </div>

      {/* Content Area: Renders loading, error, or table view */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading Attendance Data...</div>
        ) : error ? (
          <div className="text-center py-12 text-red-600 bg-red-50 p-4 rounded-md">
            <h3 className="font-bold">An Error Occurred</h3>
            <p>{error}</p>
          </div>
        ) : attendanceData && attendanceData.students.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll
                Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status
                for {formatDateForDisplay(currentDate)}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Overall
                Attendance
              </th>
            </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
            {attendanceData.students.map(student => (
              <tr key={student.studentId} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{student.studentName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{student.studentRoll}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(student.todaysStatus)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <AttendanceProgressBar value={student.overallAttendancePercentage} />
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <Calendar className="h-12 w-12"/>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No Attendance Records</h3>
            <p className="mt-1 text-sm text-gray-500">There is no attendance data available for the selected date.</p>
          </div>
        )}
      </div>
    </div>
  );
}