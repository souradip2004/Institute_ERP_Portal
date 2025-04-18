"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface Teacher {
  id: string;
  user: {
    name: string;
    email: string;
  };
  department?: {
    name: string;
  };
}

export default function AskTeacherPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [studentData, setStudentData] = useState<any>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get user data from localStorage
        const userDataStr = localStorage.getItem('user');
        if (!userDataStr) {
          setError("User data not found. Please log in again.");
          setLoading(false);
          return;
        }

        const userData = JSON.parse(userDataStr);
        setStudentData(userData);

        // Fetch teachers
        await fetchTeachers();
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to load user data. Please refresh the page.");
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/teachers');
      
      if (!response.ok) {
        throw new Error('Failed to fetch teachers');
      }
      
      const data = await response.json();
      setTeachers(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching teachers:', err);
      setError('Failed to load teachers. Please try again later.');
      setLoading(false);
    }
  };

  const handleTeacherClick = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
  };

  const handleBackClick = () => {
    setSelectedTeacher(null);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, this would send the message to the backend
    console.log("Sending message to", selectedTeacher?.user.name, ":", messageInput);
    setMessageInput('');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 text-red-500 rounded-md">
        <p>{error}</p>
      </div>
    );
  }

  if (selectedTeacher) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-blue-600 text-white p-4 flex items-center">
            <button 
              onClick={handleBackClick}
              className="mr-4 p-2 hover:bg-blue-700 rounded-full"
            >
              ←
            </button>
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-blue-600 font-bold">
                {selectedTeacher.user.name.charAt(0)}
              </div>
              <div className="ml-3">
                <h3 className="font-semibold">{selectedTeacher.user.name}</h3>
                <p className="text-sm">{selectedTeacher.department?.name || 'Physics Instructor'}</p>
              </div>
            </div>
          </div>
          
          <div className="h-96 p-4 bg-gray-50 overflow-y-auto">
            <div className="flex flex-col space-y-4">
              <div className="self-end bg-blue-100 p-3 rounded-lg max-w-xs">
                <p>Sir, I have a doubt in Thermodynamics. Could you please help me out with that.</p>
              </div>
              
              <div className="self-start bg-white p-3 rounded-lg shadow-sm max-w-xs">
                <p>Tell me what it is!</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 border-t">
            <form onSubmit={handleSendMessage} className="flex items-center">
              <input
                type="text"
                placeholder="Type your doubt"
                className="flex-1 p-2 border rounded-l-lg focus:outline-none"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
              />
              <button 
                type="submit" 
                className="bg-blue-600 text-white px-4 py-2 rounded-r-lg"
                disabled={!messageInput.trim()}
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Select Subject and Teacher</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-medium mb-3 text-gray-700">Physics</h2>
            <div 
              className="flex items-center p-2 hover:bg-gray-100 rounded-md cursor-pointer"
              onClick={() => {
                const physicsTeacher = teachers.find(t => t.department?.name === 'Physics' || t.id === 'physics-teacher-id');
                if (physicsTeacher) handleTeacherClick(physicsTeacher);
                else handleTeacherClick({
                  id: 'physics-teacher-id',
                  user: { name: 'Floyd Miles', email: 'floyd.miles@example.com' },
                  department: { name: 'Physics' }
                });
              }}
            >
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold mr-3">
                F
              </div>
              <span>Floyd Miles</span>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-medium mb-3 text-gray-700">Chemistry</h2>
            <div 
              className="flex items-center p-2 hover:bg-gray-100 rounded-md cursor-pointer"
              onClick={() => {
                const chemistryTeacher = teachers.find(t => t.department?.name === 'Chemistry' || t.id === 'chemistry-teacher-id');
                if (chemistryTeacher) handleTeacherClick(chemistryTeacher);
                else handleTeacherClick({
                  id: 'chemistry-teacher-id',
                  user: { name: 'Jerome Bell', email: 'jerome.bell@example.com' },
                  department: { name: 'Chemistry' }
                });
              }}
            >
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold mr-3">
                J
              </div>
              <span>Jerome Bell</span>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-medium mb-3 text-gray-700">Mathematics</h2>
            <div 
              className="flex items-center p-2 hover:bg-gray-100 rounded-md cursor-pointer"
              onClick={() => {
                const mathTeacher = teachers.find(t => t.department?.name === 'Mathematics' || t.id === 'math-teacher-id');
                if (mathTeacher) handleTeacherClick(mathTeacher);
                else handleTeacherClick({
                  id: 'math-teacher-id',
                  user: { name: 'Dianne Russell', email: 'dianne.russell@example.com' },
                  department: { name: 'Mathematics' }
                });
              }}
            >
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-3">
                D
              </div>
              <span>Dianne Russell</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 