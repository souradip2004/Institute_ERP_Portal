"use client"
import React, { useState } from 'react';

const Dashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [studentInfo, setStudentInfo] = useState({ name: '', rollNumber: '', university: '', uniqueCode: '' });
  const [activeSection, setActiveSection] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (studentInfo.name && studentInfo.rollNumber && studentInfo.university && studentInfo.uniqueCode) {
      setIsAuthenticated(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStudentInfo({ ...studentInfo, [e.target.name]: e.target.value });
  };

  const handleSectionClick = (section: string) => {
    setActiveSection(section);
    setSelectedSubject('');
  };

  const handleSubjectClick = (subject: string) => {
    setSelectedSubject(subject);
  };

  const subjects = ['Mathematics', 'Science', 'English', 'History'];
  const testSchedule = [
    { subject: 'Mathematics', time: '10:00 AM' },
    { subject: 'Science', time: '12:00 PM' },
    { subject: 'English', time: '2:00 PM' },
  ];

  const attendanceData = subjects.map((sub) => ({
    subject: sub,
    percentage: Math.floor(Math.random() * 21) + 80,
    teacher: `${sub} Teacher`,
  }));

  const assignments = subjects.map((sub) => ({
    subject: sub,
    tasks: [`${sub} Assignment 1`, `${sub} Assignment 2`],
  }));

  const videoNotes = subjects.map((sub) => ({
    subject: sub,
    videos: [`${sub} Video Lecture 1`, `${sub} Video Lecture 2`],
  }));

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <form onSubmit={handleLogin} className="bg-white p-8 shadow-md rounded-xl">
          <h2 className="text-2xl font-semibold mb-4">Student Portal Login</h2>
          <input name="name" type="text" placeholder="Student Name" onChange={handleInputChange} className="block mb-3 p-2 border rounded w-full" required />
          <input name="rollNumber" type="text" placeholder="Roll Number" onChange={handleInputChange} className="block mb-3 p-2 border rounded w-full" required />
          <input name="university" type="text" placeholder="University/School Name" onChange={handleInputChange} className="block mb-3 p-2 border rounded w-full" required />
          <input name="uniqueCode" type="password" placeholder="Unique Code" onChange={handleInputChange} className="block mb-4 p-2 border rounded w-full" required />
          <button type="submit" className="bg-blue-500 text-white p-2 rounded w-full">Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Student: {studentInfo.name}</h2>
          <p>Roll No: {studentInfo.rollNumber}</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Institution: {studentInfo.university}</h2>
        </div>
        <div className="flex space-x-4">
          <button onClick={() => handleSectionClick('report')}>Report</button>
          <button onClick={() => handleSectionClick('test')}>Test</button>
          <button onClick={() => handleSectionClick('attendance')}>Attendance</button>
          <button onClick={() => handleSectionClick('copyChecked')}>Copy Checked</button>
          <button onClick={() => handleSectionClick('feedback')}>Feedback</button>
          <button onClick={() => handleSectionClick('assignment')}>Assignment</button>
          <button onClick={() => handleSectionClick('videoNotes')}>Video Notes</button>
        </div>
      </div>

      {/* Middle Screen - Subject Reports */}
      <div className="flex-grow p-6 grid grid-cols-2 gap-6">
        {subjects.map((sub, idx) => (
          <div key={idx} className="bg-white p-4 shadow-md rounded-lg">
            <h2 className="text-xl font-semibold mb-2">{sub} Report</h2>
            <p>Marks: {Math.floor(Math.random() * 21) + 80}/100</p>
            <p>Tests: {Math.floor(Math.random() * 5) + 1}</p>
            <p>Attendance: {Math.floor(Math.random() * 21) + 80}%</p>
          </div>
        ))}
      </div>

      {/* Dynamic Content */}
      <div className="flex-grow p-6">
        {activeSection === 'report' && (
          <div>
            <h2>Choose a Subject for Report</h2>
            {subjects.map((sub, idx) => (
              <p key={idx} onClick={() => handleSubjectClick(sub)}>{sub}</p>
            ))}
            {selectedSubject && <p>Selected Report for {selectedSubject}</p>}
          </div>
        )}

        {activeSection === 'test' && (
          <div>
            <h2>Upcoming Tests</h2>
            {testSchedule.map((test, idx) => (
              <p key={idx}>{test.subject} - {test.time}</p>
            ))}
          </div>
        )}

        {activeSection === 'attendance' && (
          <div>
            <h2>Attendance Summary</h2>
            {attendanceData.map((att, idx) => (
              <p key={idx}>{att.subject} by {att.teacher} - {att.percentage}%</p>
            ))}
          </div>
        )}

        {activeSection === 'copyChecked' && (
          <div>
            <h2>Checked Copies</h2>
            {subjects.map((sub, idx) => (
              <p key={idx}>{sub} - View Checked Copies</p>
            ))}
          </div>
        )}

        {activeSection === 'feedback' && (
          <div>
            <h2>Feedback Section</h2>
            <textarea placeholder="Enter your feedback here..." className="block w-full p-2 border mb-3"></textarea>
            <button className="bg-blue-500 text-white p-2 rounded">Submit Feedback</button>
          </div>
        )}

        {activeSection === 'assignment' && (
          <div>
            <h2>Assignments</h2>
            {assignments.map((assign, idx) => (
              <div key={idx}>
                <h3>{assign.subject}</h3>
                {assign.tasks.map((task, tidx) => (
                  <p key={tidx}>{task}</p>
                ))}
                <input type="file" className="mt-2 mb-4" />
              </div>
            ))}
          </div>
        )}

        {activeSection === 'videoNotes' && (
          <div>
            <h2>Video Notes</h2>
            {videoNotes.map((video, idx) => (
              <div key={idx}>
                <h3>{video.subject}</h3>
                {video.videos.map((vid, vidx) => (
                  <p key={vidx}>{vid}</p>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;