"use client"
import { useState } from "react";

interface Teacher {
  name: string;
  empId: string;
}

interface Attendance {
  date: string;
  day: string;
  status: string;
}

interface Notification {
  id: number;
  message: string;
}

interface Section {
  id: number;
  title: string;
}

const TeacherPortal = () => {
  const teacher: Teacher = { name: "John Doe", empId: "EMP12345" };

  const [attendance, setAttendance] = useState<Attendance[]>([
    { day: "Monday", date: "2025-03-25", status: "Present" },
    { day: "Tuesday", date: "2025-03-26", status: "Absent" },
  ]);

  const [showAttendance, setShowAttendance] = useState(false);

  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, message: "Staff meeting at 3 PM." },
    { id: 2, message: "Submit grades by Friday." },
  ]);

  const [sections, setSections] = useState<Section[]>([
    { id: 1, title: "Mathematics - Grade 10" },
    { id: 2, title: "Physics - Grade 12" },
  ]);

  return (
    <div className="min-h-screen flex flex-col p-4 bg-gray-100">
      {/* Header */}
      <div className="flex justify-between items-center bg-blue-600 text-white p-4 rounded-md">
        <div>
          <h2 className="text-xl font-bold">{teacher.name}</h2>
          <p className="text-sm">Employee ID: {teacher.empId}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {/* Attendance Section */}
        <div className="bg-white p-4 rounded-md shadow-md">
          <h3 className="text-lg font-semibold mb-2">Attendance</h3>
          <button 
            className="bg-blue-500 text-white px-4 py-2 rounded-md mb-2"
            onClick={() => setShowAttendance(!showAttendance)}
          >
            {showAttendance ? "Hide Attendance" : "Show Attendance"}
          </button>
          {showAttendance && (
            <table className="w-full border-collapse border border-gray-300 mt-2">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">Day</th>
                  <th className="border p-2">Date</th>
                  <th className="border p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((record, index) => (
                  <tr key={index} className="text-center">
                    <td className="border p-2">{record.day}</td>
                    <td className="border p-2">{record.date}</td>
                    <td className={`border p-2 ${record.status === "Present" ? "text-green-600" : "text-red-600"}`}>
                      {record.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Notification Section */}
        <div className="bg-white p-4 rounded-md shadow-md">
          <h3 className="text-lg font-semibold mb-2">Notifications</h3>
          <ul>
            {notifications.map((note) => (
              <li key={note.id} className="border-b py-1">
                {note.message}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Sections List */}
      <div className="mt-4 bg-white p-4 rounded-md shadow-md">
        <h3 className="text-lg font-semibold mb-2">Enrolled Sections</h3>
        <ul>
          {sections.map((section) => (
            <li
              key={section.id}
              className="border-b py-2 cursor-pointer text-blue-600 hover:underline"
              onClick={() => alert(`Navigating to ${section.title}`)}
            >
              {section.title}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TeacherPortal;