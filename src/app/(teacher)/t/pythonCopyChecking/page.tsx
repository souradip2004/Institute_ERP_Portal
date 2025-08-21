'use client';
import { useEffect, useState, useCallback } from 'react';
// Assuming these are external components or defined elsewhere if not provided
// If these are actually in separate files, keep them as imports.
// For the purpose of providing a complete runnable code, I'm defining them here.
import { QuestionConfigForm } from '@/components/pythonCopyChecking/QuestionConfigForm';

// Mock PDFUploadComponent for demonstration
type PDFUploadComponentProps = {
  onFileUpload: (file: File) => void;
  isUploading: boolean;
  isParsing: boolean;
};

const PDFUploadComponent = ({ onFileUpload, isUploading, isParsing }: PDFUploadComponentProps) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
      e.target.value = ''; // Clear the input so same file can be selected again
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg text-center bg-gray-50">
      <FaUpload className="text-indigo-500 text-4xl mb-3" />
      <label htmlFor="pdf-upload" className="cursor-pointer bg-indigo-500 text-white font-semibold px-5 py-2 rounded-full shadow-md hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
        <span className="flex items-center">
          {isUploading || isParsing ? (
            <FaSpinner className="animate-spin mr-2" />
          ) : (
            <FaFilePdf className="mr-2" />
          )}
          {isUploading ? 'Uploading...' : isParsing ? 'Parsing...' : 'Upload Answer Key PDF'}
        </span>
        <input
          id="pdf-upload"
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading || isParsing}
        />
      </label>
      <p className="mt-3 text-sm text-gray-500">Only PDF files are supported.</p>
    </div>
  );
};

// Mock QuestionConfigForm for demonstration
// const QuestionConfigForm = ({ parsedData, onSubmit, initialConfig, disabled }) => {
//   // Use state for each config property for controlled inputs
//   const [config1, setConfig1] = useState(initialConfig?.config1 || {});
//   const [config2, setConfig2] = useState(initialConfig?.config2 || {});
//   const [config3, setConfig3] = useState(initialConfig?.config3 || {});

//   // Effect to update internal state when initialConfig prop changes (e.g., when loading a session)
//   useEffect(() => {
//     setConfig1(initialConfig?.config1 || {});
//     setConfig2(initialConfig?.config2 || {});
//     setConfig3(initialConfig?.config3 || {});
//   }, [initialConfig]);

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     onSubmit({ config1, config2, config3 });
//   };

//   return (
//  <Card title="Configure Questions" className="h-fit">
//               <QuestionConfigForm parsedData={parsedData} onSubmit={handleConfigSubmit} />
//             </Card>
//   );
// };


import jsPDF from 'jspdf';
import axios from 'axios';
import * as XLSX from "xlsx";
import { FaUpload, FaFilePdf, FaTimes, FaDownload, FaCogs, FaCheckCircle, FaSpinner, FaPlus } from 'react-icons/fa';
import { TbManualGearbox } from "react-icons/tb";

// A reusable card component for better structure
const Card = ({ title, children, className = '' }) => (
  <div className={`bg-white shadow-lg rounded-xl p-6 ${className}`}>
    <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
    {children}
  </div>
);

// Component for a clean file list item
const FileListItem = ({ file, onRemove }) => (
  <div className="flex items-center justify-between p-2 bg-gray-100 rounded-lg text-sm text-gray-700">
    <span className="flex items-center truncate">
      <FaFilePdf className="text-red-500 mr-2" />
      <span className="truncate">{file.name}</span>
    </span>
    <button onClick={onRemove} className="text-red-500 hover:text-red-700 transition-colors">
      <FaTimes />
    </button>
  </div>
);

// --- Local Storage Helper Functions ---
// These functions are used to manage session data in localStorage.
// They store data structured as:
// {
//   teacherId_class_sessions: {
//     classId1: {
//       sessionId1: { ...sessionData1 },
//       sessionId2: { ...sessionData2 }
//     },
//     classId2: { ... }
//   }
// }

const getSessionsFromLocalStorage = (teacherId, classId) => {
  if (!teacherId || !classId) return {};
  try {
    const allTeacherSessions = JSON.parse(localStorage.getItem(`teacher_${teacherId}_sessions`) || '{}');
    return allTeacherSessions[classId] || {};
  } catch (e) {
    console.error("Error parsing sessions from localStorage", e);
    return {};
  }
};

const saveSessionsToLocalStorage = (teacherId, classId, sessionsForClass) => {
  if (!teacherId || !classId) return;
  try {
    const allTeacherSessions = JSON.parse(localStorage.getItem(`teacher_${teacherId}_sessions`) || '{}');
    localStorage.setItem(`teacher_${teacherId}_sessions`, JSON.stringify({
      ...allTeacherSessions,
      [classId]: sessionsForClass
    }));
  } catch (e) {
    console.error("Error saving sessions to localStorage", e);
  }
};
// --- End Local Storage Helper Functions ---


export default function TeacherPage({ params }: { params: { id: string } }) {
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [pythonResponse, setPythonResponse] = useState<any>(null);
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [classIds, setClassIds] = useState<any[] | null>([]);
  const [classId, setClassId] = useState<string | null>(null);
  const [isConfigSaved, setIsConfigSaved] = useState(false);
  const [studentIds, setStudentIds] = useState<any[] | null>([]); // Holds actual student data
  const [studentMarksInSession, setStudentMarksInSession] = useState<{ [studentId: string]: number | string } | null>(null); // For marks specific to the session
  const [saveConfiguration, setSaveConfiguration] = useState(false); // Flag to show config form
  const [configData, setConfigData] = useState<any>({}); // Actual config data

  const [studentFiles, setStudentFiles] = useState<{ [studentId: string]: File[] }>({});
  const [isUploadingStudentFiles, setIsUploadingStudentFiles] = useState<{ [studentId: string]: boolean }>({});

  // New state for session management
  const [sessions, setSessions] = useState<{ [sessionId: string]: any }>({}); // Sessions for the currently selected class
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [currentSessionData, setCurrentSessionData] = useState<any | null>(null);

  // Effect to load teacher ID and class IDs on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const parsedUserData = JSON.parse(userData);
          setTeacherId(parsedUserData.teacherId || null);
          const fetchClassIds = async () => {
            const response = await fetch(`/api/teachers/${parsedUserData.teacherId}/section`, {
              method: 'GET',
              headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();
            if (data && data.length > 0) {
              setClassIds(data);
            }
          };
          fetchClassIds();
        } catch (error) {
          console.error('Error parsing user data from localStorage:', error);
        }
      }
    }
  }, []);

  // Effect to load sessions and student data when classId changes
  useEffect(() => {
    if (classId && teacherId) {
      // Reset all session-related states when a new class is chosen
      setUploadedFileUrl(null);
      setPythonResponse(null);
      setIsConfigSaved(false);
      setSaveConfiguration(false);
      setConfigData({});
      setStudentFiles({});
      setIsUploadingStudentFiles({});
      setCurrentSessionId(null);
      setCurrentSessionData(null);
      setStudentMarksInSession(null); // Clear student marks from previous session

      // Load sessions specific to this class
      const loadedSessions = getSessionsFromLocalStorage(teacherId, classId);
      setSessions(loadedSessions);

      // Fetch student data for the newly selected class
      const fetchStudentData = async () => {
        try {
          const response = await fetch(`/api/classes/${classId}/students`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          });
          const data = await response.json();
          if (data && data.length > 0) {
            setStudentIds(data); // This holds the base student list
          } else {
            setStudentIds([]);
          }
        } catch (error) {
          console.error("Error fetching student data:", error);
          setStudentIds([]);
        }
      };
      fetchStudentData();
    } else if (!classId) {
      // If no class is selected, clear student data
      setStudentIds(null);
      setSessions({});
      setCurrentSessionId(null);
      setCurrentSessionData(null);
      setStudentMarksInSession(null);
    }
  }, [classId, teacherId]);

  // Effect to update studentIds with marks from currentSessionData
  useEffect(() => {
    if (currentSessionData?.studentMarks && studentIds) {
      const updatedStudentIds = studentIds.map(student => ({
        ...student,
        marks: currentSessionData.studentMarks[student.id] ?? "Not Checked"
      }));
      setStudentIds(updatedStudentIds);
    } else if (studentIds) {
       // If no currentSessionData.studentMarks, ensure marks are "Not Checked"
       const resetStudentIds = studentIds.map(student => ({
         ...student,
         marks: "Not Checked"
       }));
       setStudentIds(resetStudentIds);
    }
  }, [currentSessionData, studentIds?.length]); // Rerun when session data changes or initial students load

  // Effect to save current session data to localStorage whenever it changes
  useEffect(() => {
    if (teacherId && classId && currentSessionId && currentSessionData) {
      const updatedSessions = {
        ...sessions,
        [currentSessionId]: currentSessionData
      };
      setSessions(updatedSessions); // Update local state for session list display
      saveSessionsToLocalStorage(teacherId, classId, updatedSessions);
    }
  }, [currentSessionData, teacherId, classId, currentSessionId]); // Only save when currentSessionData or related IDs change

  // Function to create a new session
  const handleCreateNewSession = useCallback(() => {
    if (!classId) {
      alert("Please select a class first to create a new session.");
      return;
    }
    const newSessionId = `session-${Date.now()}`;
    const newSessionData = {
      id: newSessionId,
      name: `Session ${Object.keys(sessions).length + 1} (${new Date().toLocaleDateString()})`,
      uploadedFileUrl: null,
      pythonResponse: null,
      configData: {},
      isConfigSaved: false,
      studentMarks: {}, // Initialize with empty marks
      timestamp: Date.now(),
    };

    setCurrentSessionId(newSessionId);
    setCurrentSessionData(newSessionData);

    // Reset UI states for a fresh session
    setUploadedFileUrl(null);
    setPythonResponse(null);
    setIsConfigSaved(false);
    setSaveConfiguration(false);
    setConfigData({});
    setStudentFiles({});
    setIsUploadingStudentFiles({});
    setStudentMarksInSession({}); // Clear marks for the new session
    alert(`New session "${newSessionData.name}" created.`);
  }, [classId, sessions]);

  // Function to load an existing session
  const handleLoadSession = useCallback((sessionId: string) => {
    if (!sessions[sessionId]) {
      alert("Selected session not found.");
      return;
    }
    const sessionToLoad = sessions[sessionId];
    setCurrentSessionId(sessionId);
    setCurrentSessionData(sessionToLoad);

    // Populate relevant states from the loaded session data
    setUploadedFileUrl(sessionToLoad.uploadedFileUrl);
    setPythonResponse(sessionToLoad.pythonResponse);
    setConfigData(sessionToLoad.configData || {});
    setIsConfigSaved(sessionToLoad.isConfigSaved || false);
    setSaveConfiguration(sessionToLoad.pythonResponse && !sessionToLoad.isConfigSaved); // Show config form if response exists but not saved
    setStudentFiles({}); // Clear any pending student files from previous interactions
    setIsUploadingStudentFiles({});
    setStudentMarksInSession(sessionToLoad.studentMarks || {}); // Set marks for the loaded session
    alert(`Session "${sessionToLoad.name}" loaded.`);
  }, [sessions]);


  // Handles initial PDF upload (Answer Key)
  const handleFileUpload = async (file: File) => {
    if (!currentSessionId) {
      alert("Please create a new session or load an existing one before uploading the answer key.");
      return;
    }
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch(`/api/teachers/${teacherId}/answerSheet/uploadAnswerSheet`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        const s3Url = data.ansSheetS3URL;
        setUploadedFileUrl(s3Url);
        // Update current session data
        setCurrentSessionData(prev => ({
          ...prev,
          uploadedFileUrl: s3Url,
          pythonResponse: null, // Clear previous python response on new upload
          configData: {}, // Clear config on new upload
          isConfigSaved: false,
        }));
        setIsParsing(true)
        await parsePDFWithPython(s3Url);
      } else {
        alert('File upload failed.');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('An error occurred during file upload.');
    } finally {
      setIsUploading(false);
    }
  };

  // Calls Python API to parse the PDF
  const parsePDFWithPython = async (pdfUrl: string) => {
    try {
      setIsParsing(true);
      setTimeout(async () => {
        const getPythonResponse = await fetch('https://anskey-segregate-from-pdfs-33f7051-v12.app.beam.cloud', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ALXP7mhHyKz1MQATKH7CIQXK9VQBpvoNNuxPvLONWyPCfgemj18cz2T74r4drBpvOkf-3orOQT_6r-63mHPZAA=='
          },
          body: JSON.stringify({
            'file_url_list': [`https://classroomaiin.s3.eu-north-1.amazonaws.com/${pdfUrl}`]
          })
        });

        if (!getPythonResponse.ok) {
          throw new Error("An unwanted error occurred, please try again.");
        }
        const result = await getPythonResponse.json();
        setPythonResponse(result);
        setSaveConfiguration(true); // Show config form after parsing
        // Update current session data
        setCurrentSessionData(prev => ({
          ...prev,
          pythonResponse: result,
        }));
      }, 2000); // Simulate API call
    } catch (error: any) {
      console.error('Error parsing PDF with Python:', error);
      alert(error.message);
    } finally {
      setIsParsing(false);
    }
  };

  // Saves the question configurations and answer key
  const saveConfigurationAndAnswerKey = async (configData: any) => {
    if (!currentSessionId) {
      alert("No active session. Please create or load a session first.");
      return;
    }
    try {
      const saveResponse = await fetch(`/api/teachers/${teacherId}/answerSheet/saveConfiguration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pythonParsedResponse: pythonResponse,
          examId: currentSessionId, // Use session ID as examId
          ...configData
        }),
      });
      const data = await saveResponse.json();
      if (data.success) {
        alert('Answer key and configuration saved successfully!');
        setIsConfigSaved(true);
        setSaveConfiguration(false); // Hide the config form
        setConfigData(configData); // Store actual config data

        // Update current session data
        setCurrentSessionData(prev => ({
          ...prev,
          configData: configData,
          isConfigSaved: true,
        }));
      } else {
        alert('Failed to save configuration.');
      }
    } catch (error) {
      console.error('Error saving configuration:', error);
      alert('An error occurred while saving the configuration.');
    }
  };

  // Handles student answer sheet upload
  const handleStudentFileUpload = async (file: File, studentId: string) => {
    if (!currentSessionId) {
      alert("No active session. Please create or load a session before uploading student answer sheets.");
      return;
    }
    let fileToUpload = file;
    if (file.type.startsWith('image/')) {
      fileToUpload = await imagesToPdf([file]);
    }
    const formData = new FormData();
    formData.append('file', fileToUpload);
    formData.append('examId', currentSessionId); // Use current session ID as examId

    try {
      // Deduct coins before upload
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        const instituteId = userData?.institutionId;
        const instResponse = await axios.get(`/api/institutions/${instituteId}/getadmin`);
        const adminId = instResponse?.data?.id;
        if (adminId) {
          const coinRes = await axios.get(`/api/coins/${adminId}`);
          let coinsToDeduct = 4;
          if (coinRes.data.coins < coinsToDeduct) {
            alert('Institute does not have enough Coins! Please Contact Institute Admin.');
            return;
          }
          await axios.post(`/api/coins/${adminId}?coins=${coinsToDeduct}`, null, {
            headers: { "Content-Type": "application/json" }
          });
        }
      }

      const response = await fetch(`/api/students/${studentId}/answerSheet/uploadAnswerSheet`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        const totalMarks = data?.totalMarks ?? "Not Checked";

        // Update student marks in the current session data
        setCurrentSessionData(prev => ({
          ...prev,
          studentMarks: {
            ...(prev?.studentMarks || {}),
            [studentId]: totalMarks
          }
        }));

        //alert(`Files for student ${studentId} uploaded and checked! Marks: ${totalMarks}`);
      } else {
        throw new Error("File upload failed for student.");
      }
    } catch (error) {
      alert(`Error uploading files for student ${studentId}. `);
      console.error(error);
    }
  };

  const handleStudentFileSelect = (files: FileList | null, studentId: string) => {
    if (!files) return;
    setStudentFiles((prev) => ({
      ...prev,
      [studentId]: [...(prev[studentId] || []), ...Array.from(files)],
    }));
  };

  const handleRemoveStudentFile = (studentId: string, fileIdx: number) => {
    setStudentFiles((prev) => {
      const updated = [...(prev[studentId] || [])];
      updated.splice(fileIdx, 1);
      return { ...prev, [studentId]: updated };
    });
  };

  const handleUploadStudentFiles = async (studentId: string) => {
    const files = studentFiles[studentId];
    if (!files || files.length === 0) return;

    setIsUploadingStudentFiles(prev => ({ ...prev, [studentId]: true }));

    try {
      if (isAllImages(files)) {
        const pdfFile = await imagesToPdf(files);
        await handleStudentFileUpload(pdfFile, studentId);
      } else {
        for (const file of files) {
          await handleStudentFileUpload(file, studentId);
        }
      }
      setStudentFiles((prev) => ({ ...prev, [studentId]: [] })); // Clear files after upload
    } catch (error) {
      console.error(error);
    } finally {
      setIsUploadingStudentFiles(prev => ({ ...prev, [studentId]: false }));
    }
  };

  const handleUploadAllStudentFiles = async () => {
    const allStudentIdsWithFiles = Object.keys(studentFiles).filter(key => studentFiles[key].length > 0);

    if (allStudentIdsWithFiles.length === 0) {
      alert('No files selected for any student to upload.');
      return;
    }

    const initialLoadingState = allStudentIdsWithFiles.reduce((acc, studentId) => {
      acc[studentId] = true;
      return acc;
    }, {});
    setIsUploadingStudentFiles(initialLoadingState);

    try {
      for (const studentId of allStudentIdsWithFiles) {
        await handleUploadStudentFiles(studentId);
      }
      alert('All selected student files uploaded and checked successfully!');
    } catch (error) {
      alert('An error occurred during the batch upload. Please check the individual student statuses.');
      console.error(error);
    } finally {
      // Set all loading states to false after all uploads are attempted
      const finalLoadingState = allStudentIdsWithFiles.reduce((acc, studentId) => {
        acc[studentId] = false;
        return acc;
      }, {});
      setIsUploadingStudentFiles(finalLoadingState);
    }
  };

  const handleConfigSubmit = (configData: any) => {
    setConfigData(configData);
    saveConfigurationAndAnswerKey(configData);
  };

  const handleDownloadExcel = async () => {
    if (studentIds && studentIds.length > 0) {
      const worksheet = XLSX.utils.json_to_sheet(
        studentIds.map((student) => ({
          Name: student.name,
          "Roll No": student.rollNo,
          Email: student.user.email,
          Status: student.status,
          // Use the marks from the current session's studentMarks if available, otherwise "Not Checked"
          "Marks Obtained": currentSessionData?.studentMarks?.[student.id] ?? "Not Checked",
        }))
      );
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "student_data.xlsx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert("No student data available to download.");
    }
  };

  const isAllImages = (files: File[]) => files.length > 0 && files.every((file) => file.type.startsWith('image/'));

  const imagesToPdf = async (imageFiles: File[]): Promise<File> => {
    const pdf = new jsPDF();
    for (let i = 0; i < imageFiles.length; i++) {
      const imgData = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(imageFiles[i]);
      });
      const img = new window.Image();
      img.src = imgData;
      await new Promise((res) => { img.onload = res; });
      const width = pdf.internal.pageSize.getWidth();
      const height = (img.height * width) / img.width;
      if (i > 0) pdf.addPage();
      const fileType = imageFiles[i].type;
      let format = 'JPEG';
      if (fileType === 'image/png') format = 'PNG';
      else if (fileType === 'image/webp') format = 'WEBP';
      pdf.addImage(imgData, format, 0, 0, width, height);
    }
    const pdfBlob = pdf.output('blob');
    return new File([pdfBlob], 'images.pdf', { type: 'application/pdf' });
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-8 font-sans">
      <div className="container mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-4 sm:mb-0 text-center">AI Copy Checking</h1>
        </header>

        {/* Section 1: Select Class - Always Visible */}
        <Card title="Select Class" className="mb-8">
          <div className="flex items-center space-x-4">
            <label htmlFor="class-select" className="text-lg font-medium text-gray-700">Choose a Class:</label>
            <select
              id="class-select"
              className="border border-gray-300 rounded-md p-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
              onChange={(e) => setClassId(e.target.value)}
              value={classId || ''}
            >
              <option value="" disabled>Choose a class</option>
              {classIds && classIds.map((cls: any) => (
                <option key={cls.section.id} value={cls.section.id}>
                  {cls.section.name}
                </option>
              ))}
            </select>
          </div>
        </Card>

        {/* Section 2: Session Management - Visible after class selection */}
        {classId && (
          <Card title="Manage Sessions" className="mb-8">
            <div className="flex flex-col sm:flex-row gap-4 items-center mb-4">
              <button
                onClick={handleCreateNewSession}
                className='bg-gradient-to-r from-green-500 to-teal-600 text-white font-semibold px-6 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center'
              >
                <FaPlus className="mr-2" /> Create New Session
              </button>
            </div>
            {Object.keys(sessions).length > 0 && (
              <>
                <h3 className="text-lg font-medium text-gray-700 mb-3">Previous Sessions:</h3>
                <div className="flex flex-wrap gap-3">
                  {Object.values(sessions)
                    .sort((a: any, b: any) => b.timestamp - a.timestamp) // Sort by most recent
                    .map((session: any) => (
                      <button
                        key={session.id}
                        onClick={() => handleLoadSession(session.id)}
                        className={`px-4 py-2 rounded-full shadow-md transition-colors text-sm font-medium
                          ${currentSessionId === session.id
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                      >
                        {session.name}
                      </button>
                    ))}
                </div>
              </>
            )}

            {currentSessionId && (
              <p className="mt-4 text-sm text-gray-600">
                Current Active Session: <span className="font-semibold">{currentSessionData?.name}</span>
              </p>
            )}
            {!currentSessionId && Object.keys(sessions).length > 0 && (
                <p className="mt-4 text-sm text-gray-600">
                    Select a previous session or create a new one to continue.
                </p>
            )}
             {!currentSessionId && Object.keys(sessions).length === 0 && (
                <p className="mt-4 text-sm text-gray-600">
                    No sessions found for this class. Create a new session to get started!
                </p>
            )}
          </Card>
        )}

        {/* Conditional rendering for the next steps, based on an active session */}
        {classId && currentSessionId && (
          <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
            {/* Section 3: Upload Answer Key */}
            <Card title="Upload Solution Key" className="h-fit">
              {/* Pass isParsing to disable upload during parsing */}
              <PDFUploadComponent onFileUpload={handleFileUpload} isUploading={isUploading} isParsing={isParsing} />
              {uploadedFileUrl && !isParsing && (
                <div className="mt-4 flex items-center text-green-700 bg-green-100 p-3 rounded-md animate-fadeIn">
                  <FaCheckCircle className="mr-2" />
                  Parsing the PDF..
                </div>
              )}
              {isParsing && (
                <div className="mt-4 flex items-center text-blue-700 bg-blue-100 p-3 rounded-md animate-pulse">
                  <FaSpinner className="animate-spin mr-2" />
                  Parsing PDF...
                </div>
              )}
            </Card>

            {/* Section 4: Configure Questions - Appears if pythonResponse exists and config isn't saved */}
            {pythonResponse && saveConfiguration && (
              <Card title="Configure Questions" className="h-fit">
                {/* Pass initialConfig to pre-fill the form and disable during parsing */}
                <QuestionConfigForm parsedData={pythonResponse} onSubmit={handleConfigSubmit} initialConfig={configData} disabled={isParsing} />
              </Card>
            )}

            {/* Section 5: Student Submission Management - Appears after config is saved */}
            {isConfigSaved && studentIds && studentIds.length > 0 && (
              <Card title="Student Submissions" className="lg:col-span-2">
                <div className="flex flex-col sm:flex-row justify-end items-center mb-6 space-y-4 sm:space-y-0">
                  <div className="flex space-x-2">
                    <button
                      onClick={handleUploadAllStudentFiles}
                      className="bg-purple-600 text-white font-semibold px-6 py-2 rounded-full shadow-md hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center"
                      disabled={Object.values(isUploadingStudentFiles).some(Boolean) || Object.keys(studentFiles).every(key => studentFiles[key].length === 0)}
                    >
                      <FaUpload className="mr-2" /> Upload All
                    </button>
                    <button
                      onClick={handleDownloadExcel}
                      className="bg-green-600 text-white font-semibold px-6 py-2 rounded-full shadow-md hover:bg-green-700 transition-colors flex items-center"
                    >
                      <FaDownload className="mr-2" /> Download Excel
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse table-auto">
                    <thead>
                      <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                        <th className="py-3 px-6 text-left">Name</th>
                        <th className="py-3 px-6 text-left">Roll No</th>
                        <th className="py-3 px-6 text-left hidden sm:table-cell">Email</th>
                        <th className="py-3 px-6 text-left">Marks</th>
                        <th className="py-3 px-6 text-center">Upload Answer Sheet</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-600 text-sm font-light">
                      {studentIds.map((student: any) => (
                        <tr key={student.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-6">{student.name}</td>
                          <td className="py-3 px-6">{student.rollNo}</td>
                          <td className="py-3 px-6 hidden sm:table-cell">{student.user.email}</td>
                          <td className="py-3 px-6 font-semibold">
                            {currentSessionData?.studentMarks?.[student.id] !== undefined && currentSessionData.studentMarks[student.id] !== null ? (
                              <span>{currentSessionData.studentMarks[student.id]}</span>
                            ) : (
                              <span className="text-red-500">Not Checked</span>
                            )}
                          </td>
                          <td className="py-3 px-6 text-center">
                            <div className="flex flex-col items-center space-y-2">
                              <label className="cursor-pointer bg-blue-500 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-blue-600 transition-colors">
                                <span className="flex items-center">
                                  <FaFilePdf className="mr-2" /> Choose Files
                                </span>
                                <input
                                  type="file"
                                  className="hidden"
                                  multiple
                                  onChange={(e) => handleStudentFileSelect(e.target.files, student.id)}
                                  disabled={isUploadingStudentFiles[student.id]}
                                />
                              </label>
                              {studentFiles[student.id] && studentFiles[student.id].length > 0 && (
                                <div className="w-full max-h-32 overflow-y-auto space-y-1 p-2 border border-dashed border-gray-300 rounded-md">
                                  {studentFiles[student.id].map((file, idx) => (
                                    <FileListItem key={idx} file={file} onRemove={() => handleRemoveStudentFile(student.id, idx)} />
                                  ))}
                                </div>
                              )}
                              <button
                                className="w-full mt-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-md px-4 py-2 text-sm font-semibold hover:from-blue-600 hover:to-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isUploadingStudentFiles[student.id] || !(studentFiles[student.id] && studentFiles[student.id].length > 0)}
                                onClick={() => handleUploadStudentFiles(student.id)}
                              >
                                {isUploadingStudentFiles[student.id] ? (
                                  <FaSpinner className="animate-spin mx-auto" />
                                ) : (
                                  'Upload'
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {isConfigSaved && (!studentIds || studentIds.length === 0) && (
              <Card title="Student Submissions" className="lg:col-span-2">
                <p className="text-center text-gray-500 py-6">No student data available for this class.</p>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


