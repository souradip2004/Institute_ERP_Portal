"use client"
import React, { useState } from 'react';

const TeacherPage: React.FC = () => {
  const [showTestOptions, setShowTestOptions] = useState(false);
  const [showAdminList, setShowAdminList] = useState(false);
  const [mode, setMode] = useState('');
  const [questionCount, setQuestionCount] = useState(0);
  const [language, setLanguage] = useState('');

  const handleTakeTestClick = () => setShowTestOptions(true);
  const handleAdminPanelClick = () => setShowAdminList(!showAdminList);

  const admins = [
    { name: 'John Doe', subject: 'Mathematics' },
    { name: 'Jane Smith', subject: 'Physics' },
    { name: 'Alice Johnson', subject: 'Chemistry' }
  ];

  return (
    <div className="flex flex-col h-screen">
      {/* Top Navigation with Sections */}
      <nav className="flex justify-around bg-gray-800 text-white p-4">
        <h2 className="text-xl font-bold cursor-pointer" onClick={handleAdminPanelClick}>Admin Panel</h2>
        <div className="flex space-x-8">
          <span>Attendance</span>
          <span>Reports</span>
          <span>Copy Checking</span>
          <span>Settings</span>
        </div>
      </nav>

      {/* Admin List */}
      {showAdminList && (
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-4">Admin List</h3>
          <ul className="list-disc pl-6">
            {admins.map((admin, index) => (
              <li key={index} className="mb-2">
                {admin.name} - <span className="font-medium">{admin.subject}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow p-6 flex flex-col items-center justify-center">
        {/* Search Box */}
        <input 
          type="text" 
          placeholder="Search..." 
          className="w-2/3 mb-8 p-4 border border-gray-300 rounded-lg shadow-md text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Upload Blocks */}
        <div className="flex space-x-8 mb-8">
          <div className="w-1/3 h-40 bg-gray-100 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center text-lg font-semibold text-gray-600">
            Upload PDF
          </div>
          <div className="w-1/3 h-40 bg-gray-100 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center text-lg font-semibold text-gray-600">
            Upload Notes
          </div>
        </div>

        {/* Take Test Block */}
        <div 
          className="w-1/3 h-40 bg-gray-100 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center text-lg font-semibold text-gray-600 cursor-pointer"
          onClick={handleTakeTestClick}
        >
          Take Test
        </div>

        {/* Test Options */}
        {showTestOptions && (
          <div className="mt-8 w-2/3 p-4 border border-gray-300 rounded-lg shadow-md">
            <h3 className="text-xl mb-4">Select Test Mode:</h3>
            <select className="w-full p-2 mb-4 border border-gray-300 rounded" onChange={(e) => setMode(e.target.value)}>
              <option value="">Select Mode</option>
              <option value="Answer Sheet">Answer Sheet</option>
              <option value="MCQ Based">MCQ Based</option>
              <option value="Viva Mode">Viva Mode</option>
            </select>

            {mode && (
              <div>
                <h3 className="text-xl mb-4">Select Number of Questions:</h3>
                <select className="w-full p-2 mb-4 border border-gray-300 rounded" onChange={(e) => setQuestionCount(parseInt(e.target.value))}>
                  <option value="">Select Count</option>
                  <option value="10">10 Questions</option>
                  <option value="20">20 Questions</option>
                  <option value="30">30 Questions</option>
                </select>

                <h3 className="text-xl mb-4">Select Language:</h3>
                <select className="w-full p-2 mb-4 border border-gray-300 rounded" onChange={(e) => setLanguage(e.target.value)}>
                  <option value="">Select Language</option>
                  <option value="Hindi">Hindi</option>
                  <option value="English">English</option>
                </select>

                <button className="mt-4 bg-blue-500 text-white p-2 rounded-lg">Send</button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default TeacherPage;