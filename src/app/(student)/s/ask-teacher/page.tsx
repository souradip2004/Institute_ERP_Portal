"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { uploadImageToCloudinary } from "@/utils/uploadImageToCloudinary";
import Loader from '@/components/ui/Loader';
import { ArrowLeft, Plus, Image as ImageIcon, Paperclip, FileText, CheckCheck,Send } from 'lucide-react';


// CORRECTED: Updated Notification interface to reflect the single string message field
interface Notification {
  id: string;
  title: string;
  message: string; // The message now contains the stringified JSON
  notificationType: string;
  isRead: boolean;
  readAt: string | null;
  actionUrl: string;
  channel: string;
  templateId: string | null;
  replyText: string | null;
  broadcastMessage: boolean;
  createdAt: string;
  teacherId: string;
  studentId: string | null;
  teacher: {
    id: string;
    user: {
      name: string;
      email: string;
    };
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

// UPDATED: MessageContent now has 'file' instead of 'voiceNote'
interface MessageContent {
  text: string | null;
  image: string | null;
  file: { url: string; name: string } | null;
}

// Updated Message interface to hold the parsed content object
interface Message {
  id: string;
  content: MessageContent;
  sender: 'student' | 'teacher';
  timestamp: Date;
  isRead?: boolean;
}

interface GroupedTeachers {
  [departmentName: string]: Teacher[];
}

// UPDATED: ChatBubble component to render file attachments and use Lucide icons
const ChatBubble: React.FC<{
  content: MessageContent;
  timestamp: string;
  isSender: boolean;
  isRead?: boolean;
}> = ({ content, timestamp, isSender, isRead }) => {
  const bubbleStyles = isSender
    ? 'bg-purple-600 text-white rounded-lg max-w-md self-end'
    : 'bg-gray-200 text-gray-800 rounded-lg max-w-md self-start';

  return (
    <div className={`p-3 ${bubbleStyles}`}>
      {content.text && <p className="text-sm">{content.text}</p>}
      {content.image && (
        <img src={content.image} alt="Sent image" className="mt-2 rounded-lg max-h-48 object-contain" />
      )}
      {content.file && (
        <div className="mt-2 flex items-center space-x-2">
          <FileText size={20} />
          <a href={content.file.url} download={content.file.name} className={`underline text-sm ${isSender ? 'text-white' : 'text-gray-800'}`}>
            {content.file.name}
          </a>
        </div>
      )}
      <div className="flex items-center justify-end gap-2 mt-1">
        <span className={`text-xs ${isSender ? 'text-purple-200' : 'text-gray-500'}`}>
          {timestamp}
        </span>
        {isSender && isRead && (
          <CheckCheck className="w-4 h-4 text-green-400" />
        )}
      </div>
    </div>
  );
};

export default function AskTeacherPage() {
  const router = useRouter();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [teacherCode, setTeacherCode] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [studentId, setStudentId] = useState<string>();
  const [groupedTeachers, setGroupedTeachers] = useState<GroupedTeachers>({});
  const [showDepartment, setShowDepartment] = useState<string | null>(null);
  
  // UPDATED: messageContent now has 'file' instead of 'voiceNote'
  const [messageContent, setMessageContent] = useState<MessageContent>({
    text: '',
    image: null,
    file: null,
  });
  // NEW: State for upload loading status
  const [uploading, setUploading] = useState(false);
  // NEW: State to toggle mobile attachment options
  const [showAttachments, setShowAttachments] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<Message[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchUserDataAndTeachers = async () => {
      try {
        const user = localStorage.getItem("user");
        if (!user) {
          router.push('/login');
          return;
        }
        const userData = JSON.parse(user);
        setStudentId(userData.studentId);
        
        const classDetailsResponse = await fetch(`/api/students/${userData.studentId}`, {
          method: "GET",
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!classDetailsResponse.ok) {
          setError("Failed to fetch student classes.");
          setLoading(false);
          return;
        }
        const classes = await classDetailsResponse.json();
        const classEnrollments = classes?.classEnrollments;
        const studentTeacherCodes: string[] = [];

        for (const enrollment of classEnrollments) {
          const teacherResponse = await fetch(`/api/class-sections/${enrollment.classSectionId}`, {
              method: "GET",
              headers: {
                'Content-Type': 'application/json',
              }
            }
          );
          if (teacherResponse.ok) {
            const teachersData = await teacherResponse.json();
            if (teachersData?.teacher?.teacherCode) {
              studentTeacherCodes.push(teachersData.teacher.teacherCode);
            }
          }
        }
        setTeacherCode(studentTeacherCodes);
        
        const teachersResponse = await fetch('/api/teachers', {
          credentials: 'include'
        });
        
        if (!teachersResponse.ok) {
          const errorData = await teachersResponse.json();
          if (teachersResponse.status === 401) {
            router.push('/login');
            return;
          }
          throw new Error(errorData.error || 'Failed to fetch teachers');
        }

        const allTeachers: Teacher[] = await teachersResponse.json();

        const filteredTeachers = allTeachers.filter(teacher => 
          studentTeacherCodes.includes(teacher.teacherCode)
        );

        setTeachers(filteredTeachers);

        const departmentsWithTeachers: GroupedTeachers = {};
        filteredTeachers.forEach((teacher: Teacher) => {
          const departmentName = teacher.department?.name || 'Unassigned';
          if (!departmentsWithTeachers[departmentName]) {
            departmentsWithTeachers[departmentName] = [];
          }
          departmentsWithTeachers[departmentName].push(teacher);
        });
        setGroupedTeachers(departmentsWithTeachers);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data or teachers:", error);
        setError("Failed to load data. Please refresh the page.");
        setLoading(false);
      }
    };

    fetchUserDataAndTeachers();
  }, [router]);

  // Function to fetch chat history
  const fetchMessages = async (teacherId: string, studentId: string, initialLoad = false) => {
    try {
      const response = await fetch(`/api/notifications?teacherId=${teacherId}&studentId=${studentId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch chat history');
      }

      const notifications: Notification[] = await response.json();

      const chatMessages = notifications.flatMap(notification => {
        let parsedStudentContent: MessageContent = { text: notification.message, image: null, file: null };
        
        if (notification.message && notification.message.startsWith('{')) {
          try {
            const temp = JSON.parse(notification.message);
            parsedStudentContent = {
              text: temp.text || null,
              image: temp.image || null,
              file: temp.file || null,
            };
          } catch (e) {
            parsedStudentContent = { text: notification.message, image: null, file: null };
          }
        }
        
        const studentMessage: Message = {
          id: notification.id,
          content: parsedStudentContent,
          sender: 'student',
          timestamp: new Date(notification.createdAt),
          isRead: notification.isRead,
        };

        const conversation: Message[] = [studentMessage];

        if (notification.replyText) {
          let parsedReplyContent: MessageContent = { text: notification.replyText, image: null, file: null };
          if (notification.replyText.startsWith('{')) {
            try {
              const temp = JSON.parse(notification.replyText);
              parsedReplyContent = {
                text: temp.text || null,
                image: temp.image || null,
                file: temp.file || null,
              };
            } catch (e) {
              parsedReplyContent = { text: notification.replyText, image: null, file: null };
            }
          }

          const teacherMessage: Message = {
            id: `${notification.id}-reply`,
            content: parsedReplyContent,
            sender: 'teacher',
            timestamp: new Date(notification.readAt || notification.createdAt),
          };
          conversation.push(teacherMessage);
        }
        return conversation;
      }).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

      setMessages(prevMessages => {
        if (initialLoad) {
          setTimeout(scrollToBottom, 0);
        } else {
          const oldMessagesCount = messagesRef.current.length;
          const newMessagesCount = chatMessages.length;
          
          if (newMessagesCount > oldMessagesCount) {
            const newestMessage = chatMessages[newMessagesCount - 1];
            if (newestMessage.sender === 'teacher') {
              setTimeout(scrollToBottom, 0);
            }
          }
        }
        messagesRef.current = chatMessages;
        return chatMessages;
      });

    } catch (err) {
      console.error("Error fetching messages:", err);
      setError("Failed to load chat history. Please try again.");
    } finally {
      if(initialLoad) setLoadingMessages(false);
    }
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (selectedTeacher && studentId) {
      setLoadingMessages(true);
      messagesRef.current = [];
      fetchMessages(selectedTeacher.id, studentId, true);

      intervalId = setInterval(() => {
        fetchMessages(selectedTeacher.id, studentId);
      }, 10000);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [selectedTeacher, studentId]);

  const handleDepartmentClick = (departmentName: string) => {
    setShowDepartment(departmentName === showDepartment ? null : departmentName);
  };

  const handleTeacherClick = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
  };

  const handleBackClick = () => {
    setSelectedTeacher(null);
    setMessages([]);
  };

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploading(true);
      try {
        const publicUrl = await uploadImageToCloudinary(file);
        setMessageContent({ ...messageContent, image: publicUrl });
      } catch (error) {
        console.error("Image upload failed:", error);
        alert("Failed to upload image. Please try again.");
        setMessageContent({ ...messageContent, image: null });
      } finally {
        setUploading(false);
        event.target.value = '';
        setShowAttachments(false);
      }
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
     const file = event.target.files?.[0];
  if (file) {
    setUploading(true);
    try {
      const publicUrl = await uploadImageToCloudinary(file);
      setMessageContent({ ...messageContent, file: { url: publicUrl, name: file.name } });
    } catch (error) {
      console.error("File upload failed:", error);
      alert("Failed to upload file. Please try again.");
      setMessageContent({ ...messageContent, file: null });
    } finally {
      setUploading(false);
      event.target.value = '';
      setShowAttachments(false);
    }
  }
  };
  
  const handleRemoveAttachment = () => {
    setMessageContent(prev => ({ ...prev, image: null, file: null }));
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const hasContent = messageContent.text || messageContent.image || messageContent.file;
    if (!hasContent || !selectedTeacher || !studentId) return;

    const tempId = Date.now().toString();

    const stringifiedMessage = JSON.stringify(messageContent);
    
    const newMessage: Message = {
      id: tempId,
      content: messageContent,
      sender: 'student',
      timestamp: new Date(),
      isRead: false,
    };

    setMessages(prev => [...prev, newMessage]);
    setMessageContent({ text: '', image: null, file: null });
    scrollToBottom();

    try {
      const response = await fetch(`/api/notifications/send-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          message: stringifiedMessage,
          teacherId: selectedTeacher.id,
          studentId: studentId,
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }

      fetchMessages(selectedTeacher.id, studentId);
    } catch (error) {
      console.error('Error sending message:', error);
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

  const lastMessage = messages[messages.length - 1];
  const teacherHasReadLastMessage = lastMessage?.sender === 'student' && lastMessage.isRead;
  
  if (selectedTeacher) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-md flex flex-col h-[calc(100vh-2rem)]">
          <div className="bg-purple-600 text-white p-4 flex items-center flex-shrink-0">
            <button onClick={handleBackClick} className="mr-4 p-2 hover:bg-purple-700 rounded-full">
              <ArrowLeft size={24} />
            </button>
            <div className="flex items-center flex-grow">
              <div className="h-10 w-10 rounded-full bg-purple-300 flex items-center justify-center font-bold">
                {selectedTeacher.user.name.charAt(0)}
              </div>
              <div className="ml-3">
                <h3 className="font-semibold">{selectedTeacher.user.name}</h3>
                <p className="text-sm text-purple-200">
                  {teacherHasReadLastMessage ? 'Last seen recently' : selectedTeacher.department?.name}
                </p>
              </div>
            </div>
          </div>

          <div className="flex-grow p-4 bg-gray-50 overflow-y-auto" >
            {loadingMessages ? (
              <div className="flex justify-center items-center h-full">
                <Loader size="medium" />
              </div>
            ) : (
              <div className="flex flex-col space-y-4">
                {messages.map((msg) => (
                  <ChatBubble
                    key={msg.id}
                    content={msg.content}
                    timestamp={new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    isSender={msg.sender === 'student'}
                    isRead={msg.isRead}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <div className="p-4 border-t bg-white flex-shrink-0">
            {(messageContent.image || messageContent.file || uploading) && (
              <div className="mb-2 p-2 bg-gray-100 rounded-lg flex items-center justify-between">
                {uploading ? (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Loader size="small" />
                    <span>Uploading...</span>
                  </div>
                ) : (
                  <>
                    {messageContent.image && (
                      <div className="flex items-center">
                        <span className="mr-2 text-sm text-gray-600">Image attached</span>
                        <img src={messageContent.image} alt="preview" className="h-10 w-10 object-cover rounded" />
                      </div>
                    )}
                    {messageContent.file && (
                      <div className="flex items-center">
                        <span className="mr-2 text-sm text-gray-600">File attached:</span>
                        <a href={messageContent.file.url} download={messageContent.file.name} className="text-sm text-purple-600 underline">
                          {messageContent.file.name}
                        </a>
                      </div>
                    )}
                  </>
                )}
                <button 
                  onClick={handleRemoveAttachment}
                  className="text-gray-500 hover:text-gray-800"
                  disabled={uploading}
                >
                  &times;
                </button>
              </div>
            )}
            
            <form onSubmit={handleSendMessage} className="relative flex items-center space-x-2">
              <input
                type="text"
                placeholder="Type your doubt"
                className="flex-1 p-2 border rounded-full focus:outline-none focus:ring-1 focus:ring-purple-500"
                value={messageContent.text || ''}
                onChange={(e) => setMessageContent({ ...messageContent, text: e.target.value })}
                disabled={uploading}
              />

              <input
                type="file"
                accept="image/*"
                ref={imageInputRef}
                className="hidden"
                onChange={handleImageChange}
              />
              <input
                type="file"
                accept="*/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
              />
              
              <button
                type="button"
                onClick={() => setShowAttachments(prev => !prev)}
                className="p-2 sm:hidden text-gray-500 hover:text-purple-600"
                disabled={uploading}
              >
                <Plus size={24} />
              </button>

              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="hidden sm:block p-2 text-gray-500 hover:text-purple-600"
                disabled={uploading}
              >
                <ImageIcon size={24} />
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="hidden sm:block p-2 text-gray-500 hover:text-purple-600"
                disabled={uploading}
              >
                <Paperclip size={24} />
              </button>

              <button
                type="submit"
                className="bg-purple-600 text-white px-1 py-1 rounded-full hover:bg-purple-700 transition-colors disabled:bg-purple-300"
                disabled={!(messageContent.text || messageContent.image || messageContent.file) || uploading}
              >
                  <Send size={20} />
              </button>

              {showAttachments && (
                <div className="absolute bottom-full right-0 mb-2 flex space-x-2 p-2 bg-white rounded-lg shadow-lg z-10 sm:hidden">
                  <button
                    type="button"
                    onClick={() => { imageInputRef.current?.click(); setShowAttachments(false); }}
                    className="p-2 text-gray-500 hover:text-purple-600 rounded-full bg-gray-100"
                    disabled={uploading}
                  >
                    <ImageIcon size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={() => { fileInputRef.current?.click(); setShowAttachments(false); }}
                    className="p-2 text-gray-500 hover:text-purple-600 rounded-full bg-gray-100"
                    disabled={uploading}
                  >
                    <Paperclip size={20} />
                  </button>
                </div>
              )}
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
      <div className="grid grid-cols-1 gap-8">
        {Object.keys(groupedTeachers).length > 0 ? (
          Object.keys(groupedTeachers).map((departmentName) => (
            <div key={departmentName} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div 
                className="flex items-center justify-between cursor-pointer" 
                onClick={() => handleDepartmentClick(departmentName)}
              >
                <h3 className="text-lg font-medium text-purple-700">{departmentName}</h3>
                <span className="text-gray-500">{showDepartment === departmentName ? '▲' : '▼'}</span>
              </div>
              {showDepartment === departmentName && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedTeachers[departmentName].map((teacher) => (
                    <div
                      key={teacher.id}
                      className="flex items-center p-2 hover:bg-gray-100 rounded-md cursor-pointer"
                      onClick={() => handleTeacherClick(teacher)}
                    >
                      <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold mr-3">
                        {teacher.user.name.charAt(0)}
                      </div>
                      <span className="text-gray-700">{teacher.user.name}</span>
                    </div>
                  ))}
                </div>
              )}
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