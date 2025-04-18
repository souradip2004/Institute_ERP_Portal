"use client";
import React, { useState, useEffect } from 'react';

interface Exam {
  id: string;
  title: string;
  subject?: string;
  duration?: string;
  examDate: string | Date;
  startTime: string | Date;
  endTime?: string | Date;
  durationMinutes?: number;
  status: string;
  score?: string | number;
  // Add additional fields that might be in the API response
  examType?: {
    name: string;
  };
  classSection?: {
    id: string;
    course?: {
      name: string;
    };
  };
}

export default function ExamsPage() {
  const [activeExams, setActiveExams] = useState<Exam[]>([]);
  const [pastExams, setPastExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentData, setStudentData] = useState<any>(null);
  const [rawExamData, setRawExamData] = useState<any[]>([]);
  const [debugMode, setDebugMode] = useState(false);

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

        // Fetch exams
        await fetchExams(userData.studentId || userData.id);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to load user data. Please refresh the page.");
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const fetchExams = async (studentId: string) => {
    try {
      setLoading(true);
      
      // Fetch from the backend API
      const response = await fetch(`/api/exams?studentId=${studentId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch exams');
      }
      
      const data = await response.json();
      console.log('Raw exam data received:', data);
      
      // Store raw data for debugging
      setRawExamData(data);
      
      // Check if data is empty
      if (!data || data.length === 0) {
        console.log('No exam data returned from API');
        setActiveExams([]);
        setPastExams([]);
        setLoading(false);
        return;
      }
      
      // Map API data to our Exam interface, handling different structures
      const mappedExams = data.map((exam: any) => {
        // Get subject from different possible locations
        const subject = 
          exam.subject || 
          (exam.examType && exam.examType.name) || 
          (exam.classSection && exam.classSection.course && exam.classSection.course.name) || 
          'Unknown Subject';
        
        // Get duration either from durationMinutes or calculate from start/end time
        let duration = exam.duration || (exam.durationMinutes ? `${exam.durationMinutes} Minutes` : '');
        
        return {
          id: exam.id,
          title: exam.title,
          subject: subject,
          duration: duration,
          examDate: exam.examDate,
          startTime: exam.startTime,
          status: exam.status,
          score: exam.score,
          // Keep original fields for debugging
          ...exam
        };
      });
      
      console.log('Mapped exams:', mappedExams);
      
      // Check for valid status values in the data
      const statusValues = [...new Set(mappedExams.map((e: any) => e.status))];
      console.log('Status values found in data:', statusValues);
      
      // Filter exams by status to get active and past exams - accept more possible status values
      const active = mappedExams.filter((exam: any) => 
        exam.status === 'UPCOMING' || 
        exam.status === 'ONGOING' || 
        exam.status === 'DRAFT' || 
        exam.status === 'IN_PROGRESS' || 
        exam.status === 'SCHEDULED'
      );
      
      const past = mappedExams.filter((exam: any) => 
        exam.status === 'COMPLETED' || 
        exam.status === 'CLOSED' || 
        exam.status === 'GRADED' || 
        exam.status === 'ARCHIVED'
      );
      
      console.log('Active exams after filtering:', active);
      console.log('Past exams after filtering:', past);
      
      setActiveExams(active);
      setPastExams(past);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching exams:', err);
      // If error, set empty arrays instead of mock data
      setActiveExams([]);
      setPastExams([]);
      setLoading(false);
    }
  };

  const handleNotify = (examId: string) => {
    console.log(`Notification set for exam ${examId}`);
    // Implementation would notify the user when the exam is about to start
  };

  const handleJoinExam = (examId: string) => {
    console.log(`Joining exam ${examId}`);
    // Implementation would navigate to the exam page
  };

  const handleViewPaper = (examId: string) => {
    console.log(`Viewing paper for exam ${examId}`);
    // Implementation would navigate to the exam paper review page
  };

  const toggleDebugMode = () => {
    setDebugMode(!debugMode);
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

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Active Exams</h1>
          <button 
            onClick={toggleDebugMode}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            {debugMode ? 'Hide Debug Info' : 'Show Debug Info'}
          </button>
        </div>

        {debugMode && (
          <div className="bg-white p-4 rounded-lg shadow-sm mb-4 overflow-auto max-h-60">
            <h3 className="font-semibold mb-2">Raw Exam Data:</h3>
            <pre className="text-xs">{JSON.stringify(rawExamData, null, 2)}</pre>
          </div>
        )}
        
        {activeExams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {activeExams.map((exam) => (
              <div key={exam.id} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex justify-between mb-2">
                  <h2 className="text-lg font-semibold">{exam.title}</h2>
                  <div className={`px-3 py-1 rounded-full text-sm ${
                    exam.status === 'ONGOING' || exam.status === 'IN_PROGRESS' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    Status: {
                      (exam.status === 'ONGOING' || exam.status === 'IN_PROGRESS') 
                        ? 'Ongoing' 
                        : exam.status === 'DRAFT' 
                          ? 'Draft' 
                          : 'Upcoming'
                    }
                  </div>
                </div>
                
                <p className="text-blue-600 font-medium mb-4">{exam.subject}</p>
                
                <div className="flex justify-between mb-4">
                  <p className="text-gray-600">Duration: {exam.duration || `${exam.durationMinutes} Minutes`}</p>
                  <p className="text-gray-600">{
                    exam.examDate instanceof Date 
                      ? exam.examDate.toLocaleDateString() 
                      : typeof exam.examDate === 'string' && exam.examDate.includes('T')
                        ? new Date(exam.examDate).toLocaleDateString()
                        : exam.examDate
                  }</p>
                </div>
                
                <div className="flex justify-center">
                  {(exam.status === 'UPCOMING' || exam.status === 'SCHEDULED' || exam.status === 'DRAFT') ? (
                    <button 
                      onClick={() => handleNotify(exam.id)}
                      className="bg-purple-800 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-purple-900 transition"
                    >
                      <span>Notify</span>
                      <span className="text-lg">🔔</span>
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleJoinExam(exam.id)}
                      className="bg-green-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-green-800 transition"
                    >
                      <span>Join Now</span>
                      <span className="text-lg">🔔</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-sm mb-8 text-center">
            <p className="text-gray-500">No active exams found.</p>
          </div>
        )}
        
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Past Exams</h1>
        </div>
        
        {pastExams.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-lg font-semibold text-gray-800 bg-gray-50">Exam Name</th>
                  <th className="px-6 py-3 text-left text-lg font-semibold text-gray-800 bg-gray-50">Date</th>
                  <th className="px-6 py-3 text-left text-lg font-semibold text-gray-800 bg-gray-50">Subject</th>
                  <th className="px-6 py-3 text-left text-lg font-semibold text-gray-800 bg-gray-50">Score</th>
                  <th className="px-6 py-3 text-left text-lg font-semibold text-gray-800 bg-gray-50">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pastExams.map((exam) => (
                  <tr key={exam.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{exam.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{
                      exam.examDate instanceof Date 
                        ? exam.examDate.toLocaleDateString() 
                        : typeof exam.examDate === 'string' && exam.examDate.includes('T')
                          ? new Date(exam.examDate).toLocaleDateString()
                          : exam.examDate
                    }</td>
                    <td className="px-6 py-4 whitespace-nowrap">{exam.subject}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{exam.score || 'Pending'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => handleViewPaper(exam.id)}
                        className="text-purple-800 font-medium hover:text-purple-900"
                      >
                        View Paper
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <p className="text-gray-500">No past exams found.</p>
          </div>
        )}
      </div>
    </div>
  );
} 