"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation'; // Original import
import { uploadImageToCloudinary } from "@/utils/uploadImageToCloudinary"; // Original import
import Loader from '@/components/ui/Loader'; // Original import
import axios from "axios"; // Original import
import { ArrowLeft, Plus, Image as ImageIcon,X, Paperclip, FileText, CheckCheck,Send,Bell,ChevronDown,ChevronUp,BookOpen, Link, ArrowRight, Calendar } from 'lucide-react';


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

interface GroupedNotification {
  studentId: string;
  studentName: string;
  notifications: (Notification & { replyExists: boolean })[];
}

interface ClassAttendance {
  id: string;
  name: string;
  sectionName: string;
  percentage: number;
}

interface Assignment {
  id: string;
  title: string;
  class: string;
  subject: string;
  dueDate: string;
  submissions: string;
  status: string;
}

interface Exam {
  id: string;
  title: string;
  class: string;
  subject: string;
  date: string;
  status: string;
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
    ? `bg-blue-400 text-black rounded-tl-[1.25rem] rounded-tr-[1.25rem] rounded-br-[0.25rem] rounded-bl-[1.25rem] self-end`
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
            {/* CORRECTED: The original text color for the link inside a sent message was wrong. */}
            <a href={file.url} download={file.name} className={`underline text-sm ${isSender ? 'text-gray-900' : 'text-gray-900'}`}>
              {file.name}
            </a>
          </div>
        ))}
        <div className="absolute bottom-1 right-2 flex items-center gap-1">
          <span className={`text-xs ${isSender ? 'text-gray-500' : 'text-gray-500'}`}>
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

export default function TeacherDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groupedNotifications, setGroupedNotifications] = useState<GroupedNotification[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [teacherName, setTeacherName] = useState('John Mathew');
  const [teacherAttendance, setTeacherAttendance] = useState(97);
  const [classAttendance, setClassAttendance] = useState<ClassAttendance[]>([]);
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [classSectionId, setClassSectionId] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState<string>('#3B82F6');
  const [institutionType, setInstitutionType] = useState<string | null>("");
  
  // State to handle rich replies for each notification, now supports multiple attachments
  const [replyContents, setReplyContents] = useState<{ [key: string]: MessageContent }>({});
  // State to toggle attachment options on mobile
  const [showAttachments, setShowAttachments] = useState<{ [key: string]: boolean }>({});
  // NEW: State to manage uploading status, tracks count of uploads per notification
  const [uploadingCount, setUploadingCount] = useState<{ [key: string]: number }>({});

  const chatRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const prevNotificationsRef = useRef<GroupedNotification[]>([]);
  
  const imageInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const hexToRgba = (hex: string, alpha: number = 1) => {
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substr(0, 2), 16);
    const g = parseInt(cleanHex.substr(2, 2), 16);
    const b = parseInt(cleanHex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };
useEffect(() => {
  const user=JSON.parse(localStorage.getItem('user') || '{}');
  if (user) {
    setInstitutionType(user.institutionType);
  }
},[])
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (teacherId) {
      intervalId = setInterval(() => {
        fetchNotifications();
      }, 10000);
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [teacherId]);

  useEffect(() => {
    const temp = localStorage.getItem('primaryColor');
    if (temp) {
      setPrimaryColor(temp);
    } else {
      setPrimaryColor('#3B82F6');
    }
  }, []);

  let user: { classSectionId?: string } | null = null;
  let classId: string | undefined = undefined;

  if (typeof window !== "undefined") {
    const userString = localStorage.getItem("user");
    user = userString ? JSON.parse(userString) : null;
    classId = user?.classSectionId;
  }

  useEffect(() => {
    const getUserData = () => {
      if (typeof window !== 'undefined') {
        const userData = localStorage.getItem('user');
        if (userData) {
          try {
            const parsedUserData = JSON.parse(userData);
            if (parsedUserData.name) {
              setTeacherName(parsedUserData.name);
            }
            if (parsedUserData.teacherId) {
              setTeacherId(parsedUserData.teacherId);
            } else {
              setTeacherId(null);
            }
            setClassSectionId(parsedUserData.classSectionId);
          } catch (error) {
            console.error('Error parsing user data from localStorage:', error);
          }
        }
      }
    };
    getUserData();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        if (!teacherId) {
          setLoading(false);
          return;
        }

        const [attendanceResult] = await Promise.allSettled([
          fetchAttendanceData()
        ]);

        if (attendanceResult.status === 'fulfilled') {
          setTeacherAttendance(attendanceResult.value.teacherAttendance);
          setClassAttendance(attendanceResult.value.classAttendance);
        }

        await fetchNotifications();
        await fetchAssignments();
        await fetchExams();
        setLoading(false);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        setLoading(false);
        setError("Failed to load dashboard data. Please try again later.");
      }
    };
    loadData();
  }, [teacherId]);

  useEffect(() => {
    expandedGroups.forEach(studentId => {
      const chatContainer = chatRefs.current[studentId];
      if (chatContainer) {
        const prevGroup = prevNotificationsRef.current.find(g => g.studentId === studentId);
        const currentGroup = groupedNotifications.find(g => g.studentId === studentId);

        if (prevGroup && currentGroup && currentGroup.notifications.length > prevGroup.notifications.length) {
          const newNotifications = currentGroup.notifications.slice(prevGroup.notifications.length);
          const hasNewStudentMessage = newNotifications.some(n => !n.replyExists);

          if (hasNewStudentMessage) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
          }
        }
      }
    });

    prevNotificationsRef.current = groupedNotifications;
  }, [groupedNotifications, expandedGroups]);

  const fetchNotifications = async () => {
    try {
      if (!teacherId) {
        return;
      }

      const response = await fetch(`/api/notifications?teacherId=${teacherId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();

      const grouped = data.reduce((acc: { [key: string]: GroupedNotification }, notification: Notification) => {
        const studentId = notification.studentId || "unknown";
        const studentName = notification.title.split(":")[0]?.trim() || "Unknown Student";

        if (!acc[studentId]) {
          acc[studentId] = {
            studentId,
            studentName,
            notifications: [],
          };
        }
        acc[studentId].notifications.push({
          ...notification,
          replyExists: !!notification.replyText?.trim(),
        });
        return acc;
      }, {});

      setGroupedNotifications(Object.values(grouped));
    } catch (error) {
      console.error('Error in fetchNotifications:', error);
      setGroupedNotifications([]);
    }
  };

  // Initializer for replyContents for a new notification ID
  const initializeReplyContent = (notificationId: string): MessageContent => {
    if (!replyContents[notificationId]) {
      setReplyContents(prev => ({
        ...prev,
        [notificationId]: { text: '', images: [], files: [] }
      }));
    }
    return replyContents[notificationId] || { text: '', images: [], files: [] };
  };

  const handleReplyContentChange = (notificationId: string, field: keyof MessageContent, value: string | string[] | { url: string; name: string }[] | null) => {
    setReplyContents(prev => ({
      ...prev,
      [notificationId]: {
        ...initializeReplyContent(notificationId), // Ensure it's initialized
        [field]: value,
      }
    }));
  };

  const handleReplyFileChange = async(notificationId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setUploadingCount(prev => ({ ...prev, [notificationId]: (prev[notificationId] || 0) + files.length }));
      
      const uploadPromises = Array.from(files).map(async (file) => {
        try {
          const publicUrl = await uploadImageToCloudinary(file);
          return { url: publicUrl, name: file.name };
        } catch (error) {
          console.error("File upload failed:", error);
          alert(`Failed to upload file ${file.name}. Please try again.`);
          return null;
        } finally {
          setUploadingCount(prev => ({ ...prev, [notificationId]: (prev[notificationId] || 1) - 1 }));
        }
      });
      
      const uploadedFiles = (await Promise.all(uploadPromises)).filter(file => file !== null);
      
      setReplyContents(prev => {
        const currentFiles = (prev[notificationId]?.files || []);
        return {
          ...prev,
          [notificationId]: {
            ...initializeReplyContent(notificationId),
            files: [...currentFiles, ...uploadedFiles],
          },
        };
      });

      event.target.value = ''; // Clear input
      setShowAttachments(prev => ({ ...prev, [notificationId]: false }));
    }
  };

  const handleReplyImageChange = async (notificationId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setUploadingCount(prev => ({ ...prev, [notificationId]: (prev[notificationId] || 0) + files.length }));
      
      const uploadPromises = Array.from(files).map(async (file) => {
        try {
          const publicUrl = await uploadImageToCloudinary(file);
          return publicUrl;
        } catch (error) {
          console.error("Image upload failed:", error);
          alert(`Failed to upload image ${file.name}. Please try again.`);
          return null;
        } finally {
          setUploadingCount(prev => ({ ...prev, [notificationId]: (prev[notificationId] || 1) - 1 }));
        }
      });

      const uploadedImages = (await Promise.all(uploadPromises)).filter(img => img !== null);
      
      setReplyContents(prev => {
        const currentImages = (prev[notificationId]?.images || []);
        return {
          ...prev,
          [notificationId]: {
            ...initializeReplyContent(notificationId),
            images: [...currentImages, ...uploadedImages],
          },
        };
      });

      event.target.value = ''; // Clear input
      setShowAttachments(prev => ({ ...prev, [notificationId]: false }));
    }
  };

  const handleRemoveAttachment = (notificationId: string, type: 'image' | 'file', index: number) => {
    setReplyContents(prev => {
      const currentContent = initializeReplyContent(notificationId);
      if (type === 'image') {
        const newImages = [...currentContent.images];
        newImages.splice(index, 1);
        return {
          ...prev,
          [notificationId]: { ...currentContent, images: newImages },
        };
      } else { // type === 'file'
        const newFiles = [...currentContent.files];
        newFiles.splice(index, 1);
        return {
          ...prev,
          [notificationId]: { ...currentContent, files: newFiles },
        };
      }
    });
  };

  const toggleAttachments = (notificationId: string) => {
    setShowAttachments(prev => ({
      ...prev,
      [notificationId]: !prev[notificationId]
    }));
  };

  const handleReplySubmit = async (notificationId: string) => {
    const currentReplyContent = getReplyContentForNotification(notificationId);
    const hasContent = currentReplyContent?.text?.trim() || currentReplyContent?.images.length > 0 || currentReplyContent?.files.length > 0;

    if (!hasContent || (uploadingCount[notificationId] || 0) > 0) return; // Prevent sending while uploading

    try {
      const stringifiedReply = JSON.stringify(currentReplyContent);

      const response = await axios.put(
        '/api/notifications/saveReply',
        {
          notificationId,
          teacherId,
          replyText: stringifiedReply,
        }
      );

      if (response.data && response.data.notifications) {
        const updatedNotifications = response.data.notifications.map((n: Notification) => ({
          ...n,
          replyExists: !!n.replyText?.trim(),
        }));

        const grouped = updatedNotifications.reduce((acc: { [key: string]: GroupedNotification }, notification: Notification) => {
          const studentId = notification.studentId || "unknown";
          const studentName = notification.title.split(":")[0]?.trim() || "Unknown Student";
          if (!acc[studentId]) {
            acc[studentId] = { studentId, studentName, notifications: [] };
          }
          acc[studentId].notifications.push(notification);
          return acc;
        }, {});
        setGroupedNotifications(Object.values(grouped));
        setReplyContents(prev => {
          const newReplyContents = { ...prev };
          delete newReplyContents[notificationId]; // Clear content after sending
          return newReplyContents;
        });
      }
    } catch (err) {
      console.error("Failed to submit reply:", err);
    }
  };

  const markNotificationsAsRead = async (notificationIds: string[]) => {
    try {
      if (teacherId) {
        setGroupedNotifications(prevNotifications =>
          prevNotifications.map(group => ({
            ...group,
            notifications: group.notifications.map(notification =>
              notificationIds.includes(notification.id)
                ? { ...notification, isRead: true }
                : notification
            )
          }))
        );

        const response = await axios.put(
          '/api/notifications',
          {
            notificationIds,
            teacherId
          }
        );

        if (response.data && response.data.notifications) {
          const updatedNotificationsFromServer = response.data.notifications;

          const processedNotifications = updatedNotificationsFromServer.map((n: Notification) => ({
            ...n,
            replyExists: !!n.replyText?.trim(),
          }));

          const grouped = processedNotifications.reduce((acc: { [key: string]: GroupedNotification }, notification: Notification) => {
            const studentId = notification.studentId || "unknown";
            const studentName = notification.title.split(":")[0]?.trim() || "Unknown Student";
            if (!acc[studentId]) {
              acc[studentId] = { studentId, studentName, notifications: [] };
            }
            acc[studentId].notifications.push(notification);
            return acc;
          }, {});

          setGroupedNotifications(Object.values(grouped));
        }

      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const handleMarkAllAsRead = () => {
    const allUnreadIds: string[] = groupedNotifications
      .flatMap(group => group.notifications)
      .filter(notification => !notification.isRead)
      .map(notification => notification.id);

    if (allUnreadIds.length > 0) {
      markNotificationsAsRead(allUnreadIds);
    }
  };

  const fetchAssignments = async () => {
    try {
      if (!teacherId) {
        return;
      }
      const response = await fetch(`/api/teachers/${teacherId}/dashboardDetail`, { credentials: 'include' });
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      const data = await response.json();
      if (data && data.assignments) {
        setAssignments(data.assignments);
      } else {
        setAssignments([]);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setAssignments([]);
    }
  };

  const fetchExams = async () => {
    try {
      if (!teacherId) {
        return;
      }
      const response = await fetch(`/api/teachers/${teacherId}/dashboardDetail`, { credentials: 'include' });
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      const data = await response.json();
      if (data && data.exams) {
        setExams(data.exams);
      } else {
        setExams([]);
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
      setExams([]);
    }
  };

  const fetchAttendanceData = async (): Promise<{ teacherAttendance: number, classAttendance: ClassAttendance[] }> => {
    try {
      const currentTeacherId = teacherId || "teacher123";
      let teacherAttendanceValue = 97;
      try {
        const summaryResponse = await fetch(`/api/teachers/${currentTeacherId}/attendance/summary`, { credentials: 'include' });
        if (summaryResponse.ok) {
          const summaryData = await summaryResponse.json();
          if (summaryData && typeof summaryData.percentage !== 'undefined') {
            teacherAttendanceValue = typeof summaryData.percentage === 'string'
              ? Number(summaryData.percentage.replace('%', ''))
              : Number(summaryData.percentage);
          }
        }
      } catch (error) {
        console.error("Error fetching teacher attendance:", error);
      }

      let classes = [];
      try {
        const classesResponse = await fetch(`/api/teachers/${currentTeacherId}/classes`, { credentials: 'include' });
        if (classesResponse.ok) {
          const classesData = await classesResponse.json();
          classes = Array.isArray(classesData) ? classesData : (classesData?.classes || []);
        }
      } catch (error) {
        console.error("Error fetching teacher's classes:", error);
      }

      if (classes.length === 0) {
        // Fallback for demo/initial setup if no classes from API
        classes = [
          { id: "class1", name: "Mathematics", section: "Section A" },
          { id: "class2", name: "Physics", section: "Section B" },
          { id: "class3", name: "Chemistry", section: "Section C" }
        ];
      }

      const attendancePromises = classes.map(async (classInfo: any) => {
        try {
          const classId = classInfo.id || classInfo.classId;
          if (!classId) return null;
          const attendanceResponse = await fetch(`/api/classes/${classId}/attendance`, { credentials: 'include' });
          if (attendanceResponse.ok) {
            const attendanceData = await attendanceResponse.json();
            let percentageValue = 0;
            if (typeof attendanceData?.percentage !== 'undefined') {
              percentageValue = typeof attendanceData.percentage === 'string'
                ? Number(attendanceData.percentage.replace('%', ''))
                : Number(attendanceData.percentage);
            }
            return {
              id: classId,
              name: classInfo.name || classInfo.className || "Unnamed Class",
              sectionName: classInfo.section || classInfo.sectionName || "No Section",
              percentage: isNaN(percentageValue) ? 0 : percentageValue
            };
          }
        } catch (error) {
          console.error(`Error fetching attendance for class ${classInfo.id}:`, error);
        }
        return null;
      });

      const attendanceResults = await Promise.all(attendancePromises);
      let validAttendance = attendanceResults.filter(item => item !== null) as ClassAttendance[];

      if (validAttendance.length === 0) {
        // Fallback for demo/initial setup if no valid attendance data
        validAttendance = [
          { id: "class1", name: "Mathematics", sectionName: "Section A", percentage: 95 },
          { id: "class2", name: "Physics", sectionName: "Section B", percentage: 88 },
          { id: "class3", name: "Chemistry", sectionName: "Section C", percentage: 92 }
        ];
      }

      return {
        teacherAttendance: teacherAttendanceValue,
        classAttendance: validAttendance
      };
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      return {
        teacherAttendance: 97,
        classAttendance: [
          { id: "class1", name: "Mathematics", sectionName: "Section A", percentage: 95 },
          { id: "class2", name: "Physics", sectionName: "Section B", percentage: 88 },
          { id: "class3", name: "Chemistry", sectionName: "Section C", percentage: 92 }
        ]
      };
    }
  };

  const toggleGroup = (studentId: string) => {
    setExpandedGroups(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'student':
        return '👨‍🎓';
      case 'schedule':
        return '🕒';
      case 'attendance':
        return '✅';
      default:
        return '📝';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader size='large' />
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

  const getReplyContentForNotification = (notificationId: string): MessageContent => {
    // Ensure default structure for images and files if not present
    const content = replyContents[notificationId] || { text: '', images: [], files: [] };
    return {
      text: content.text,
      images: Array.isArray(content.images) ? content.images : [],
      files: Array.isArray(content.files) ? content.files : [],
    };
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm flex justify-between items-center border-t-4" style={{ borderTopColor: primaryColor }}>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: primaryColor }}>Teacher Dashboard</h1>
            <p className="text-gray-500">{teacherName}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4" style={{ borderLeftColor: primaryColor }}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold" style={{ color: primaryColor }}>
              <div className="flex items-center space-x-2">
                <Bell size={24} />
                <span>Notifications</span>
              </div>
            </h2>
            {groupedNotifications.length > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center space-x-1"
                style={{
                  backgroundColor: primaryColor,
                  '--tw-ring-color': primaryColor
                } as React.CSSProperties}
              >
                <CheckCheck size={16} />
                <span>Mark all as Read</span>
              </button>
            )}
          </div>
          <div className="space-y-4">
            {groupedNotifications.length > 0 ? (
              groupedNotifications.map((group) => (
                <div key={group.studentId} className="border-b last:border-0 pb-4">
                  <button
                    onClick={() => toggleGroup(group.studentId)}
                    className="w-full text-left p-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors duration-200 rounded-md"
                  >
                    <div className="flex items-center space-x-4">
                      <span className="text-2xl">👨‍🎓</span>
                      <h3 className="font-medium text-gray-800">{group.studentName}</h3>
                      <span className="text-sm text-gray-500">
                        ({group.notifications.filter(n => !n.isRead).length} unread)
                      </span>
                    </div>
                    <span>
                      {expandedGroups.includes(group.studentId) ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                    </span>
                  </button>
                  {expandedGroups.includes(group.studentId) && (
                    <div
                      ref={(el) => (chatRefs.current[group.studentId] = el)}
                      className="p-4 space-y-4 flex flex-col items-start w-full max-h-96 overflow-y-auto"
                    >
                      {group.notifications.slice().reverse().map((notification) => {
                        let studentMessageContent: MessageContent = { text: notification.message, images: [], files: [] };
                        if (notification.message && notification.message.startsWith('{')) {
                          try {
                            const parsed = JSON.parse(notification.message);
                            studentMessageContent = {
                              text: parsed.text || null,
                              images: Array.isArray(parsed.images) ? parsed.images : (parsed.image ? [parsed.image] : []),
                              files: Array.isArray(parsed.files) ? parsed.files : (parsed.file ? [parsed.file] : []),
                            };
                          } catch (e) {
                            studentMessageContent = { text: notification.message, images: [], files: [] };
                          }
                        }

                        const replyContent = getReplyContentForNotification(notification.id);
                        let teacherReplyParsedContent: MessageContent | null = null;
                        if (notification.replyText && notification.replyText.startsWith('{')) {
                          try {
                            const parsedReply = JSON.parse(notification.replyText);
                            teacherReplyParsedContent = {
                              text: parsedReply.text || null,
                              images: Array.isArray(parsedReply.images) ? parsedReply.images : (parsedReply.image ? [parsedReply.image] : []),
                              files: Array.isArray(parsedReply.files) ? parsedReply.files : (parsedReply.file ? [parsedReply.file] : []),
                            };
                          } catch (e) {
                            teacherReplyParsedContent = { text: notification.replyText, images: [], files: [] };
                          }
                        } else if (notification.replyText) {
                           teacherReplyParsedContent = { text: notification.replyText, images: [], files: [] };
                        }
                        
                        return (
                          <React.Fragment key={notification.id}>
                            <ChatBubble
                              content={studentMessageContent}
                              timestamp={getTimeAgo(notification.createdAt)}
                              isSender={false}
                              primaryColor={primaryColor}
                            />
                            {notification.replyExists && teacherReplyParsedContent ? (
                              <div className="w-full flex justify-end">
                                <ChatBubble
                                  content={teacherReplyParsedContent}
                                  timestamp={getTimeAgo(notification.readAt || notification.createdAt)}
                                  isSender={true}
                                  primaryColor={primaryColor}
                                />
                              </div>
                            ) : (
                              <div className="w-full flex justify-end mt-2">
                                <div className="relative flex flex-col space-y-2 max-w-[95%] sm:max-w-[80%]">
                                  {/* Preview of multiple attached images */}
                                  {replyContent.images.length > 0 && (
                                    <div className="mb-2 p-2 bg-gray-100 rounded-lg grid grid-cols-2 sm:grid-cols-3 gap-2">
                                      {replyContent.images.map((imgSrc, idx) => (
                                        <div key={`reply-img-preview-${notification.id}-${idx}`} className="relative h-20 w-20 overflow-hidden rounded">
                                          <img src={imgSrc} alt={`preview ${idx}`} className="h-full w-full object-cover" />
                                          <button
                                            onClick={() => handleRemoveAttachment(notification.id, 'image', idx)}
                                            className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                                            disabled={(uploadingCount[notification.id] || 0) > 0}
                                          >
                                            <X size={12} />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  
                                  {/* Preview of multiple attached files */}
                                  {replyContent.files.length > 0 && (
                                    <div className="mb-2 p-2 bg-gray-100 rounded-lg space-y-1">
                                      {replyContent.files.map((file, idx) => (
                                        <div key={`reply-file-preview-${notification.id}-${idx}`} className="flex items-center justify-between text-sm text-gray-600">
                                          <div className="flex items-center space-x-2">
                                            <FileText size={16} />
                                            <a href={file.url} download={file.name} className="underline text-purple-600">
                                              {file.name}
                                            </a>
                                          </div>
                                          <button
                                            onClick={() => handleRemoveAttachment(notification.id, 'file', idx)}
                                            className="text-gray-500 hover:text-gray-800"
                                            disabled={(uploadingCount[notification.id] || 0) > 0}
                                          >
                                            <X size={16} />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {(uploadingCount[notification.id] || 0) > 0 && (
                                    <div className="mb-2 p-2 bg-gray-100 rounded-lg flex items-center space-x-2 text-sm text-gray-600">
                                      <Loader size="small" />
                                      <span>Uploading {(uploadingCount[notification.id] || 0)} file(s)...</span>
                                    </div>
                                  )}

                                  <div className="flex items-center space-x-1 sm:space-x-2 w-full">
                                    <input
                                      type="text"
                                      placeholder="Type your reply..."
                                      value={replyContent.text || ''}
                                      onChange={(e) => handleReplyContentChange(notification.id, 'text', e.target.value)}
                                      className="flex-grow p-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-offset-2"
                                      style={{
                                        '--tw-ring-color': primaryColor
                                      } as React.CSSProperties}
                                      disabled={(uploadingCount[notification.id] || 0) > 0}
                                    />
                                    {/* Mobile plus button to toggle attachments */}
                                    <button
                                      type="button"
                                      onClick={() => toggleAttachments(notification.id)}
                                      className="p-1 sm:hidden text-gray-500 hover:text-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-full"
                                      style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                                      disabled={(uploadingCount[notification.id] || 0) > 0}
                                    >
                                      <Plus size={24} />
                                    </button>

                                    {/* Desktop attachment buttons */}
                                    <input
                                      type="file"
                                      accept="image/*"
                                      ref={el => imageInputRefs.current[notification.id] = el}
                                      className="hidden"
                                      onChange={(e) => handleReplyImageChange(notification.id, e)}
                                      multiple // Allow multiple image selection
                                    />
                                    <button
                                      type="button"
                                      onClick={() => imageInputRefs.current[notification.id]?.click()}
                                      className="hidden sm:block p-1 text-gray-500 hover:text-purple-600"
                                      disabled={(uploadingCount[notification.id] || 0) > 0}
                                    >
                                      <ImageIcon size={24} />
                                    </button>
                                    <input
                                      type="file"
                                      accept="*/*"
                                      ref={el => fileInputRefs.current[notification.id] = el}
                                      className="hidden"
                                      onChange={(e) => handleReplyFileChange(notification.id, e)}
                                      multiple // Allow multiple file selection
                                    />
                                    <button
                                      type="button"
                                      onClick={() => fileInputRefs.current[notification.id]?.click()}
                                      className="hidden sm:block p-1 text-gray-500 hover:text-purple-600"
                                      disabled={(uploadingCount[notification.id] || 0) > 0}
                                    >
                                      <Paperclip size={24} />
                                    </button>

                                    <button
                                      onClick={() => handleReplySubmit(notification.id)}
                                      disabled={!(replyContent.text?.trim() || replyContent.images.length > 0 || replyContent.files.length > 0) || (uploadingCount[notification.id] || 0) > 0}
                                      className="px-2 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200"
                                      style={{
                                        backgroundColor: !(replyContent.text?.trim() || replyContent.images.length > 0 || replyContent.files.length > 0) || (uploadingCount[notification.id] || 0) > 0 ? '#9CA3AF' : primaryColor,
                                        boxShadow: !(replyContent.text?.trim() || replyContent.images.length > 0 || replyContent.files.length > 0) || (uploadingCount[notification.id] || 0) > 0 ? 'none' : `0 2px 4px ${hexToRgba(primaryColor, 0.3)}`
                                      }}
                                    >
                                      <Send size={16} />
                                    </button>
                                  </div>
                                  {/* Mobile attachments popover */}
                                  {showAttachments[notification.id] && (
                                    <div className="absolute bottom-full right-0 mb-2 flex space-x-2 p-2 bg-white rounded-lg shadow-lg z-10 sm:hidden">
                                      {/* Buttons for Image and File */}
                                      <button
                                        type="button"
                                        onClick={() => { imageInputRefs.current[notification.id]?.click(); setShowAttachments(prev => ({ ...prev, [notification.id]: false })); }}
                                        className="p-2 text-gray-500 hover:text-purple-600 rounded-full bg-gray-100"
                                        disabled={(uploadingCount[notification.id] || 0) > 0}
                                      >
                                        <ImageIcon size={20} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => { fileInputRefs.current[notification.id]?.click(); setShowAttachments(prev => ({ ...prev, [notification.id]: false })); }}
                                        className="p-2 text-gray-500 hover:text-purple-600 rounded-full bg-gray-100"
                                        disabled={(uploadingCount[notification.id] || 0) > 0}
                                      >
                                        <Paperclip size={20} />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No notifications</p>
            )}
          </div>
        </div>

        {/* Recent Assignments */}
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4" style={{ borderLeftColor: primaryColor }}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold" style={{ color: primaryColor }}>
              <div className="flex items-center space-x-2">
                <BookOpen size={24} />
                <span>Recent {institutionType?.includes("College")?"Assignments":"HomeWorks"}</span>
              </div>
            </h2>
            <Link href={"/t/classes/" as any} className="hover:opacity-80 flex items-center space-x-1" style={{ color: primaryColor }}>
              <span>View All Classes</span>
              <ArrowRight size={16} />
            </Link>
          </div>
          {/* Desktop Table View */}
          <div className="overflow-x-auto hidden md:block">
            <table className="min-w-full">
              <thead>
                <tr className="border-b" style={{ borderBottomColor: primaryColor }}>
                  <th className="text-left py-3 font-semibold" style={{ color: primaryColor }}>Title</th>
                  <th className="text-left py-3 font-semibold" style={{ color: primaryColor }}>Class</th>
                  <th className="text-left py-3 font-semibold" style={{ color: primaryColor }}>Subject</th>
                  <th className="text-left py-3 font-semibold" style={{ color: primaryColor }}>Due Date</th>
                  <th className="text-left py-3 font-semibold" style={{ color: primaryColor }}>Submissions</th>
                  <th className="text-left py-3 font-semibold" style={{ color: primaryColor }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {assignments.length > 0 ? (
                  assignments.map((assignment) => (
                    <tr key={assignment.id} className="border-b hover:bg-gray-50 transition-colors duration-200"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = hexToRgba(primaryColor, 0.1);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '';
                      }}>
                      <td className="py-3">{assignment.title}</td>
                      <td className="py-3">{assignment.class}</td>
                      <td className="py-3">{assignment.subject}</td>
                      <td className="py-3">{assignment.dueDate}</td>
                      <td className="py-3">{assignment.submissions}</td>
                      <td className="py-3">{assignment.status}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-gray-500">
                      No {institutionType?.includes("College")?"Assignments":"HomeWorks"} found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {assignments.length > 0 ? (
              assignments.map((assignment) => (
                <div key={assignment.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-lg" style={{ color: primaryColor }}>{assignment.title}</h4>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${assignment.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {assignment.status}
                    </span>
                  </div>
                  <div className="text-gray-600 space-y-1 text-sm">
                    <p><span className="font-medium">Class:</span> {assignment.class}</p>
                    <p><span className="font-medium">Subject:</span> {assignment.subject}</p>
                    <p><span className="font-medium">Due Date:</span> {assignment.dueDate}</p>
                    <p><span className="font-medium">Submissions:</span> {assignment.submissions}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-gray-500">
                No {institutionType?.includes("College")?"Assignments":"HomeWorks"} found
              </p>
            )}
          </div>
        </div>

        {/* Upcoming Exams */}
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4" style={{ borderLeftColor: primaryColor }}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold" style={{ color: primaryColor }}>
              <div className="flex items-center space-x-2">
                <Calendar size={24} />
                <span>Upcoming Exams</span>
              </div>
            </h2>
            <Link
              href={`/t/classes/${classId}/exams` as any}
              className="hover:opacity-80 flex items-center space-x-1"
              style={{ color: primaryColor }}
            >
              <span>View All Exams</span>
              <ArrowRight size={16} />
            </Link>
          </div>
          {/* Desktop Table View */}
          <div className="overflow-x-auto hidden md:block">
            <table className="min-w-full">
              <thead>
                <tr className="border-b" style={{ borderBottomColor: primaryColor }}>
                  <th className="text-left py-3 font-semibold" style={{ color: primaryColor }}>Title</th>
                  <th className="text-left py-3 font-semibold" style={{ color: primaryColor }}>Class</th>
                  <th className="text-left py-3 font-semibold" style={{ color: primaryColor }}>Subject</th>
                  <th className="text-left py-3 font-semibold" style={{ color: primaryColor }}>Date</th>
                  <th className="text-left py-3 font-semibold" style={{ color: primaryColor }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {exams.length > 0 ? (
                  exams.map((exam) => (
                    <tr key={exam.id} className="border-b hover:bg-gray-50 transition-colors duration-200"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = hexToRgba(primaryColor, 0.1);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '';
                      }}>
                      <td className="py-3">{exam.title}</td>
                      <td className="py-3">{exam.class}</td>
                      <td className="py-3">{exam.subject}</td>
                      <td className="py-3">{exam.date}</td>
                      <td className="py-3">{exam.status}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-gray-500">
                      No exams found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {exams.length > 0 ? (
              exams.map((exam) => (
                <div key={exam.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-lg" style={{ color: primaryColor }}>{exam.title}</h4>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${exam.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                      {exam.status}
                    </span>
                  </div>
                  <div className="text-gray-600 space-y-1 text-sm">
                    <p><span className="font-medium">Class:</span> {exam.class}</p>
                    <p><span className="font-medium">Subject:</span> {exam.subject}</p>
                    <p><span className="font-medium">Date:</span> {exam.date}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-gray-500">
                No exams found
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}