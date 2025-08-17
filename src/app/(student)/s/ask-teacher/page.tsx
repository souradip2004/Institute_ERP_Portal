"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { uploadImageToCloudinary } from "@/utils/uploadImageToCloudinary";
import Loader from '@/components/ui/Loader';
import { ArrowLeft, Plus, Image as ImageIcon,X, Paperclip, FileText, CheckCheck,Send } from 'lucide-react';


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

// UPDATED: MessageContent to hold arrays for multiple images and files
interface MessageContent {
  text: string | null;
  images: string[]; // Array of image URLs
  files: { url: string; name: string }[]; // Array of file objects
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

// Modal component for displaying the expanded image
const ImageModal: React.FC<{ imageUrl: string | null; onClose: () => void }> = ({
  imageUrl,
  onClose,
}) => {
  if (!imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
      onClick={onClose} // Close when clicking outside the image
    >
      <div className="relative p-4 bg-white rounded-lg max-w-3xl max-h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button
          className="absolute top-2 right-2 p-2 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition-colors z-10"
          onClick={onClose}
          aria-label="Close image"
        >
          <X size={24} />
        </button>
        {/* Expanded image */}
        <img
          src={imageUrl}
          alt="Expanded image"
          className="max-w-full max-h-[calc(90vh-3rem)] rounded-lg object-contain"
          style={{ cursor: 'zoom-out' }} // Indicate it can be closed by clicking
        />
      </div>
    </div>
  );
};

const ChatBubble: React.FC<{
  content: MessageContent;
  timestamp: string;
  isSender: boolean;
  isRead?: boolean;
  primaryColor: string;
}> = ({ content, timestamp, isSender, isRead, primaryColor }) => {
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  const bubbleClasses = isSender
    ? `bg-blue-400 text-white rounded-tl-[1.25rem] rounded-tr-[1.25rem] rounded-br-[0.25rem] rounded-bl-[1.25rem] self-end`
    : `bg-gray-200 text-gray-900 rounded-tl-[1.25rem] rounded-tr-[1.25rem] rounded-br-[1.25rem] rounded-bl-[0.25rem] self-start`;

  const handleImageClick = (imageUrl: string) => {
    setExpandedImage(imageUrl);
  };

  const handleCloseImageModal = () => {
    setExpandedImage(null);
  };

  return (
    <>
      <div className={`p-3 relative shadow-sm text-sm max-w-[80%] ${bubbleClasses}`}>
        {content.text && (
          // Increased padding-right to ensure space for timestamp
          <p className="text-sm break-words pr-16">
            {content.text}
          </p>
        )}
        {/* Render multiple images */}
        {content.images && content.images.map((imageSrc, index) => (
          <img
            key={index}
            src={imageSrc}
            alt={`Sent image ${index + 1}`}
            // Increased padding-right for image to ensure space for timestamp
            className="mt-2 rounded-lg max-h-48 object-contain cursor-pointer transition-transform duration-200 hover:scale-[1.02] pr-16"
            onClick={() => handleImageClick(imageSrc)}
          />
        ))}
        {/* Render multiple files */}
        {content.files && content.files.map((file, index) => (
          <div key={index} className="mt-2 flex items-center space-x-2 pr-16">
            <FileText size={20} />
            <a href={file.url} download={file.name} className={`underline text-sm ${isSender ? 'text-white' : 'text-gray-900'}`}> {/* Changed to text-gray-900 */}
              {file.name}
            </a>
          </div>
        ))}
        <div className="absolute bottom-1 right-2 flex items-center gap-1">
          <span className={`text-xs ${isSender ? 'text-white/75' : 'text-gray-500'}`}>
            {timestamp}
          </span>
          {isSender && isRead && (
            <CheckCheck className="w-4 h-4 text-green-400" />
          )}
        </div>
      </div>

      {/* Image expansion modal */}
      <ImageModal imageUrl={expandedImage} onClose={handleCloseImageModal} />
    </>
  );
};

export default function AskTeacherPage() {
  const router = useRouter();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [teacherCode, setTeacherCode] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [messageInput, setMessageInput] = useState(''); // This state is no longer used for input
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [studentId, setStudentId] = useState<string>();
  const [groupedTeachers, setGroupedTeachers] = useState<GroupedTeachers>({});
  const [showDepartment, setShowDepartment] = useState<string | null>(null);
  
  // UPDATED: messageContent now has 'images' and 'files' arrays
  const [messageContent, setMessageContent] = useState<MessageContent>({
    text: '',
    images: [],
    files: [],
  });
  // NEW: State for upload loading status, now tracks count for multiple uploads
  const [uploadingCount, setUploadingCount] = useState(0);
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
        let parsedStudentContent: MessageContent = { text: notification.message, images: [], files: [] };
        
        if (notification.message && notification.message.startsWith('{')) {
          try {
            const temp = JSON.parse(notification.message);
            // Ensure images and files are arrays, fallback to empty array if not present or null
            parsedStudentContent = {
              text: temp.text || null,
              images: Array.isArray(temp.images) ? temp.images : (temp.image ? [temp.image] : []), // Handle single image for backward compatibility
              files: Array.isArray(temp.files) ? temp.files : (temp.file ? [temp.file] : []), // Handle single file for backward compatibility
            };
          } catch (e) {
            parsedStudentContent = { text: notification.message, images: [], files: [] };
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
          let parsedReplyContent: MessageContent = { text: notification.replyText, images: [], files: [] };
          if (notification.replyText.startsWith('{')) {
            try {
              const temp = JSON.parse(notification.replyText);
              // Ensure images and files are arrays, fallback to empty array if not present or null
              parsedReplyContent = {
                text: temp.text || null,
                images: Array.isArray(temp.images) ? temp.images : (temp.image ? [temp.image] : []), // Handle single image for backward compatibility
                files: Array.isArray(temp.files) ? temp.files : (temp.file ? [temp.file] : []), // Handle single file for backward compatibility
              };
            } catch (e) {
              parsedReplyContent = { text: notification.replyText, images: [], files: [] };
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
    const files = event.target.files;
    if (files && files.length > 0) {
      setUploadingCount(prev => prev + files.length); // Increment upload counter
      const uploadPromises = Array.from(files).map(async (file) => {
        try {
          const publicUrl = await uploadImageToCloudinary(file);
          setMessageContent(prev => ({
            ...prev,
            images: [...prev.images, publicUrl], // Add to images array
          }));
        } catch (error) {
          console.error("Image upload failed:", error);
          alert(`Failed to upload image ${file.name}. Please try again.`);
        } finally {
          setUploadingCount(prev => prev - 1); // Decrement upload counter
        }
      });
      await Promise.all(uploadPromises); // Wait for all uploads to complete
      event.target.value = ''; // Clear input
      setShowAttachments(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setUploadingCount(prev => prev + files.length); // Increment upload counter
      const uploadPromises = Array.from(files).map(async (file) => {
        try {
          // Assuming uploadImageToCloudinary can handle general files too, or you have a separate file upload utility
          const publicUrl = await uploadImageToCloudinary(file);
          setMessageContent(prev => ({
            ...prev,
            files: [...prev.files, { url: publicUrl, name: file.name }], // Add to files array
          }));
        } catch (error) {
          console.error("File upload failed:", error);
          alert(`Failed to upload file ${file.name}. Please try again.`);
        } finally {
          setUploadingCount(prev => prev - 1); // Decrement upload counter
        }
      });
      await Promise.all(uploadPromises); // Wait for all uploads to complete
      event.target.value = ''; // Clear input
      setShowAttachments(false);
    }
  };
  
  const handleRemoveAttachment = (type: 'image' | 'file', index: number) => {
    setMessageContent(prev => {
      if (type === 'image') {
        const newImages = [...prev.images];
        newImages.splice(index, 1);
        return { ...prev, images: newImages };
      } else {
        const newFiles = [...prev.files];
        newFiles.splice(index, 1);
        return { ...prev, files: newFiles };
      }
    });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const hasContent = messageContent.text?.trim() || messageContent.images.length > 0 || messageContent.files.length > 0;
    if (!hasContent || !selectedTeacher || !studentId || uploadingCount > 0) return; // Prevent sending while uploading

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
    setMessageContent({ text: '', images: [], files: [] }); // Reset message content
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
                    primaryColor="#4F46E5" // Pass primary color here
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <div className="p-4 border-t bg-white flex-shrink-0">
            {/* Display multiple attached images */}
            {messageContent.images.length > 0 && (
              <div className="mb-2 p-2 bg-gray-100 rounded-lg grid grid-cols-2 sm:grid-cols-3 gap-2">
                {messageContent.images.map((imgSrc, index) => (
                  <div key={`img-preview-${index}`} className="relative h-20 w-20 overflow-hidden rounded">
                    <img src={imgSrc} alt={`preview ${index}`} className="h-full w-full object-cover" />
                    <button
                      onClick={() => handleRemoveAttachment('image', index)}
                      className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                      disabled={uploadingCount > 0}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Display multiple attached files */}
            {messageContent.files.length > 0 && (
              <div className="mb-2 p-2 bg-gray-100 rounded-lg space-y-1">
                {messageContent.files.map((file, index) => (
                  <div key={`file-preview-${index}`} className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <FileText size={16} />
                      <a href={file.url} download={file.name} className="underline text-purple-600">
                        {file.name}
                      </a>
                    </div>
                    <button
                      onClick={() => handleRemoveAttachment('file', index)}
                      className="text-gray-500 hover:text-gray-800"
                      disabled={uploadingCount > 0}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {uploadingCount > 0 && (
              <div className="mb-2 p-2 bg-gray-100 rounded-lg flex items-center space-x-2 text-sm text-gray-600">
                <Loader size="small" />
                <span>Uploading {uploadingCount} file(s)...</span>
              </div>
            )}
            
            <form onSubmit={handleSendMessage} className="relative flex items-center space-x-2">
              <input
                type="text"
                placeholder="Type your doubt"
                className="flex-1 p-2 border rounded-full focus:outline-none focus:ring-1 focus:ring-purple-500"
                value={messageContent.text || ''}
                onChange={(e) => setMessageContent({ ...messageContent, text: e.target.value })}
                disabled={uploadingCount > 0}
              />

              <input
                type="file"
                accept="image/*"
                ref={imageInputRef}
                className="hidden"
                onChange={handleImageChange}
                multiple // Allow multiple image selection
              />
              <input
                type="file"
                accept="*/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
                multiple // Allow multiple file selection
              />
              
              <button
                type="button"
                onClick={() => setShowAttachments(prev => !prev)}
                className="p-2 sm:hidden text-gray-500 hover:text-purple-600"
                disabled={uploadingCount > 0}
              >
                <Plus size={24} />
              </button>

              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="hidden sm:block p-2 text-gray-500 hover:text-purple-600"
                disabled={uploadingCount > 0}
              >
                <ImageIcon size={24} />
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="hidden sm:block p-2 text-gray-500 hover:text-purple-600"
                disabled={uploadingCount > 0}
              >
                <Paperclip size={24} />
              </button>

              <button
                type="submit"
                className="bg-purple-600 text-white px-1 py-1 rounded-full hover:bg-purple-700 transition-colors disabled:bg-purple-300"
                disabled={!(messageContent.text?.trim() || messageContent.images.length > 0 || messageContent.files.length > 0) || uploadingCount > 0}
              >
                  <Send size={20} />
              </button>

              {showAttachments && (
                <div className="absolute bottom-full right-0 mb-2 flex space-x-2 p-2 bg-white rounded-lg shadow-lg z-10 sm:hidden">
                  <button
                    type="button"
                    onClick={() => { imageInputRef.current?.click(); setShowAttachments(false); }}
                    className="p-2 text-gray-500 hover:text-purple-600 rounded-full bg-gray-100"
                    disabled={uploadingCount > 0}
                  >
                    <ImageIcon size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={() => { fileInputRef.current?.click(); setShowAttachments(false); }}
                    className="p-2 text-gray-500 hover:text-purple-600 rounded-full bg-gray-100"
                    disabled={uploadingCount > 0}
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
