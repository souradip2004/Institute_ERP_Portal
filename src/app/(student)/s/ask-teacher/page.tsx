"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Loader from '@/components/ui/Loader';


interface Teacher {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  department?: {
    name: string;
  };
}

interface Message {
  id: string;
  content: string;
  sender: 'student' | 'teacher';
  timestamp: Date;
}

export default function AskTeacherPage() {
  const router = useRouter();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
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
      const response = await fetch('/api/teachers', {
        credentials: 'include' // This will send the auth_token cookie
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          // Redirect to login if not authenticated
          router.push('/login');
          return;
        }
        throw new Error(errorData.error || 'Failed to fetch teachers');
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
    setMessages([]);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedTeacher) return;

    // Store the message input in case we need to restore it on error
    const currentMessage = messageInput.trim();
    let newMessageId: string | null = null;

    try {
      // Add message to local state immediately for instant feedback
      const newMessage: Message = {
        id: Date.now().toString(),
        content: currentMessage,
        sender: 'student',
        timestamp: new Date(),
      };
      newMessageId = newMessage.id;
      setMessages(prev => [...prev, newMessage]);

      // Clear input
      setMessageInput('');

      // Send message to API
      const response = await fetch('/api/chat/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies in the request
        body: JSON.stringify({
          message: currentMessage,
          teacherId: selectedTeacher.id
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response from server:', errorData);
        throw new Error(errorData.error || errorData.details || 'Failed to send message');
      }

      const result = await response.json();
      console.log("Message sent successfully:", result);

    } catch (error) {
      console.error('Error sending message:', error);
      setError(error instanceof Error ? error.message : 'Failed to send message. Please try again.');
      // Add the failed message back to the input
      setMessageInput(currentMessage);
      // Remove the failed message from the messages list
      if (newMessageId) {
        setMessages(prev => prev.filter(msg => msg.id !== newMessageId));
      }
    }
  };

  if (loading) {
    return (

      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <Loader size="large" />
      </div>

    );
  }

  if (error) {
    return (

      <div className="p-8">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
          {error.includes("User data not found") && (
            <button
              onClick={() => router.push('/login')}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Go to Login
            </button>
          )}
        </div>
      </div>

    );
  }

  if (selectedTeacher) {
    return (
      <div className="p-8">

        <div className="min-h-screen bg-gray-100 p-4">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-purple-600 text-white p-4 flex items-center">
              <button
                onClick={handleBackClick}
                className="mr-4 p-2 hover:bg-purple-700 rounded-full"
              >
                ←
              </button>
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-purple-600 font-bold">
                  {selectedTeacher.user.name.charAt(0)}
                </div>
                <div className="ml-3">
                  <h3 className="font-semibold">{selectedTeacher.user.name}</h3>
                  <p className="text-sm">{selectedTeacher.department?.name}</p>
                </div>
              </div>
            </div>

            <div className="h-96 p-4 bg-gray-50 overflow-y-auto">
              <div className="flex flex-col space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`${msg.sender === 'student'
                      ? 'self-end bg-purple-100'
                      : 'self-start bg-white shadow-sm'
                      } p-3 rounded-lg max-w-xs`}
                  >
                    <p>{msg.content}</p>
                    <span className="text-xs text-gray-500 mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t">
              <form onSubmit={handleSendMessage} className="flex items-center">
                <input
                  type="text"
                  placeholder="Type your doubt"
                  className="flex-1 p-2 border rounded-l-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                />
                <button
                  type="submit"
                  className="bg-purple-600 text-white px-4 py-2 rounded-r-lg hover:bg-purple-700 transition-colors"
                  disabled={!messageInput.trim()}
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>

      </div>
    );
  }

  return (

    <div className="p-8">
      <div className="mb-8">
        {/* <h1 className="text-gray-400 text-sm mb-1">
            <Link href="/s/dashboard" className="inline-flex items-center hover:text-gray-600">
              Student Dashboard
            </Link>
            <span className="mx-1">/</span>
            Ask a Teacher
          </h1> */}
        <h2 className="text-2xl font-semibold text-gray-800">Your Department Teachers</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {teachers.length > 0 ? (
          teachers.map((teacher) => (
            <div key={teacher.id} className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium mb-3 text-purple-700">
                {teacher.department?.name || 'Teacher'}
              </h3>
              <div
                className="flex items-center p-2 hover:bg-gray-100 rounded-md cursor-pointer"
                onClick={() => handleTeacherClick(teacher)}
              >
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold mr-3">
                  {teacher.user.name.charAt(0)}
                </div>
                <span className="text-gray-700">{teacher.user.name}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center text-gray-500">
            No teachers found in your department. Please try again later.
          </div>
        )}
      </div>
    </div>

  );
}