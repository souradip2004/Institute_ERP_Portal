"use client";
import React, {useState, useEffect} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import Loader from '@/components/ui/Loader';

// Interface for the API response from /api/notifications
interface Notification {
  id: string;
  userId: string;
  message: string;
  isRead: boolean;
  readAt: string | null;
  replyText: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
}

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
  teacherCode: string;
}

// Updated Message interface to include read status
interface Message {
  id: string;
  content: string;
  sender: 'student' | 'teacher';
  timestamp: Date;
  isRead?: boolean;
}

export default function AskTeacherPage() {
  const router = useRouter();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [teacherCode, setTeacherCode] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false); // State for loading chat history

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = localStorage.getItem("user")
        const userData = JSON.parse(user);
        const classdetails = await fetch(`/api/students/${userData.studentId}`, {
          method: "GET",
          headers: {
            'Content-Type': 'application/json',
          },
        })
        if (!classdetails.ok) {
          alert("no classes found")
          return;
        }
        const classes = await classdetails.json();
        const classenrollments = classes?.classEnrollments;
        const classd = []
        for (let i = 0; i < classenrollments.length; i++) {
          const teacher = await fetch(`/api/class-sections/${classenrollments[i].classSectionId}`, {
              method: "GET",
              headers: {
                'Content-Type': 'application/json',
              }
            }
          )
          if (teacher.ok) {
            const teachers = await teacher.json();
            classd.push(teachers?.teacher?.teacherCode)
          }
        }
        setTeacherCode(classd)
        await fetchTeachers();
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to load user data. Please refresh the page.");
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Effect to fetch chat history when a teacher is selected
  useEffect(() => {
    if (!selectedTeacher) return;

    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const response = await fetch(`/api/notifications?teacherId=${selectedTeacher.id}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch chat history');
        }

        const notifications: Notification[] = await response.json();

        // Transform notifications into a sorted list of messages
        const chatMessages = notifications.flatMap(notification => {
          const studentMessage: Message = {
            id: notification.id,
            content: notification.message,
            sender: 'student',
            timestamp: new Date(notification.createdAt),
            isRead: notification.isRead,
          };

          const conversation: Message[] = [studentMessage];

          if (notification.replyText) {
            const teacherMessage: Message = {
              id: `${notification.id}-reply`,
              content: notification.replyText,
              sender: 'teacher',
              // Use readAt for reply time, fallback to createdAt
              timestamp: new Date(notification.readAt || notification.createdAt),
            };
            conversation.push(teacherMessage);
          }
          return conversation;
        }).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

        setMessages(chatMessages);

      } catch (err) {
        console.error("Error fetching messages:", err);
        setError("Failed to load chat history. Please try again.");
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [selectedTeacher]);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/teachers', {
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
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

    const currentMessage = messageInput.trim();
    const tempId = Date.now().toString();

    const newMessage: Message = {
      id: tempId,
      content: currentMessage,
      sender: 'student',
      timestamp: new Date(),
      isRead: false, // New messages are initially not read
    };

    setMessages(prev => [...prev, newMessage]);
    setMessageInput('');

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const response = await fetch(`/api/chat/send-message?user=${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          message: currentMessage,
          teacherId: selectedTeacher.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }

      await response.json();
      // Optionally, you could update the message ID and status from the server response here

    } catch (error) {
      console.error('Error sending message:', error);
      // Revert optimistic update on failure
      setMessageInput(currentMessage);
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      alert(error instanceof Error ? error.message : 'Failed to send message.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <Loader size="large"/>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (selectedTeacher) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-md flex flex-col h-[calc(100vh-2rem)]">
          <div className="bg-purple-600 text-white p-4 flex items-center flex-shrink-0">
            <button onClick={handleBackClick} className="mr-4 p-2 hover:bg-purple-700 rounded-full">
              ←
            </button>
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-purple-300 flex items-center justify-center font-bold">
                {selectedTeacher.user.name.charAt(0)}
              </div>
              <div className="ml-3">
                <h3 className="font-semibold">{selectedTeacher.user.name}</h3>
                <p className="text-sm text-purple-200">{selectedTeacher.department?.name}</p>
              </div>
            </div>
          </div>

          <div className="flex-grow p-4 bg-gray-50 overflow-y-auto">
            {loadingMessages ? (
              <div className="flex justify-center items-center h-full">
                <Loader size="medium" />
              </div>
            ) : (
              <div className="flex flex-col space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex flex-col ${
                    msg.sender === 'student' ? 'items-end' : 'items-start'
                  }`}>
                    <div className={`${
                      msg.sender === 'student'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-200 text-gray-800'
                    } p-3 rounded-lg max-w-md`}>
                      <p className="text-sm">{msg.content}</p>
                      <div className="flex items-center justify-end gap-2 mt-1">
                        <span className={`text-xs ${msg.sender === 'student' ? 'text-purple-200' : 'text-gray-500'}`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {msg.sender === 'student' && msg.isRead && (
                          <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 border-t bg-white flex-shrink-0">
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
                className="bg-purple-600 text-white px-4 py-2 rounded-r-lg hover:bg-purple-700 transition-colors disabled:bg-purple-300"
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
    <div className="p-8">
      <div className="mb-8 mt-8 sm:mt-0">
        <h2 className="text-2xl font-semibold text-gray-800">Your Teachers</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teachers.length > 0 ? (
          teachers.filter(teacher => teacherCode.includes(teacher.teacherCode)).map((teacher) => (
            <div key={teacher.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium mb-3 text-purple-700">
                {teacher.department?.name}
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
          <div className="col-span-full text-center text-gray-500 py-10">
            <p>No teachers found for your enrolled classes.</p>
          </div>
        )}
      </div>
    </div>
  );
}