'use client';
import { useEffect, useState } from 'react';
import { PDFUploadComponent } from '@/components/pythonCopyChecking/PDFUploadComponent.tsx';
import { QuestionConfigForm } from '@/components/pythonCopyChecking/QuestionConfigForm';
import jsPDF from 'jspdf';
import axios from 'axios';
import * as XLSX from "xlsx";
import { FaUpload, FaFilePdf, FaTimes, FaDownload, FaCogs, FaCheckCircle, FaSpinner } from 'react-icons/fa';
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

export default function TeacherPage({ params }: { params: { id: string } }) {
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [pythonResponse, setPythonResponse] = useState<any>(null);
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [classIds, setClassIds] = useState<any[] | null>([]);
  const [classId, setClassId] = useState<string | null>(null);
  const [isConfigSaved, setIsConfigSaved] = useState(false);
  const [studentIds, setStudentIds] = useState<any[] | null>([]);
  const [saveConfiguration, setSaveConfiguration] = useState(false);
  const [configData, setConfigData] = useState({
    config1: {},
    config2: {},
    config3: {}
  });
  const [studentFiles, setStudentFiles] = useState<{ [studentId: string]: File[] }>({});
  const [isUploadingStudentFiles, setIsUploadingStudentFiles] = useState<{ [studentId: string]: boolean }>({});

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

  useEffect(() => {
    if (classId) {
      const fetchStudentData = async () => {
        try {
          const response = await fetch(`/api/classes/${classId}/students`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          });
          const data = await response.json();
          if (data && data.length > 0) {
            setStudentIds(data);
          }
        } catch (error) {
          console.error("Error fetching student data:", error);
        }
      };
      fetchStudentData();
    }
  }, [classId]);

  const handleFileUpload = async (file: File) => {
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
        setUploadedFileUrl(data.ansSheetS3URL);
        await parsePDFWithPython(data.ansSheetS3URL);
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

  const parsePDFWithPython = async (pdfUrl: string) => {
    try {
      setIsParsing(true);
      setTimeout(async () => {
        const getPythonResponse = await fetch('https://anskey-segregate-from-pdfs-33f7051-v4.app.beam.cloud', {
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
        setIsParsing(false);
        setSaveConfiguration(true);
      }, 2000);
    } catch (error) {
      console.error('Error parsing PDF with Python:', error);
      alert(error.message);
      setIsParsing(false);
    }
  };

  const saveConfigurationAndAnswerKey = async (configData: any) => {
    try {
      const saveResponse = await fetch(`/api/teachers/${teacherId}/answerSheet/saveConfiguration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pythonParsedResponse: pythonResponse,
          examId: 'exam-123', // Hardcoded
          ...configData
        }),
      });
      const data = await saveResponse.json();
      if (data.success) {
        alert('Answer key and configuration saved successfully!');
      } else {
        alert('Failed to save configuration.');
      }
    } catch (error) {
      console.error('Error saving configuration:', error);
      alert('An error occurred while saving the configuration.');
    }
  };

  const handleStudentFileUpload = async (file: File, studentId: string) => {
    let fileToUpload = file;
    if (file.type.startsWith('image/')) {
      fileToUpload = await imagesToPdf([file]);
    }
    const formData = new FormData();
    formData.append('file', fileToUpload);
    formData.append('examId', 'exam-123'); // Hardcoded

    const response = await fetch(`/api/students/${studentId}/answerSheet/uploadAnswerSheet`, {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    if (data.success) {
      setStudentIds((prevStudentIds) => {
        if (!prevStudentIds) return prevStudentIds;
        return prevStudentIds.map((student) => {
          if (student.id === studentId) {
            return { ...student, marks: data?.totalMarks };
          }
          return student;
        });
      });
    } else {
      throw new Error("File upload failed for student.");
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

      if (isAllImages(files)) {
        const pdfFile = await imagesToPdf(files);
        await handleStudentFileUpload(pdfFile, studentId);
      } else {
        for (const file of files) {
          await handleStudentFileUpload(file, studentId);
        }
      }
      setStudentFiles((prev) => ({ ...prev, [studentId]: [] }));
      alert(`Files for student ${studentId} uploaded successfully!`);
    } catch (error) {
      alert(`Error uploading files for student ${studentId}. `);
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

    // Set all students with files to a loading state
    const initialLoadingState = allStudentIdsWithFiles.reduce((acc, studentId) => {
      acc[studentId] = true;
      return acc;
    }, {});
    setIsUploadingStudentFiles(initialLoadingState);

    try {
      for (const studentId of allStudentIdsWithFiles) {
        await handleUploadStudentFiles(studentId);
      }
      alert('All selected student files uploaded successfully!');
    } catch (error) {
      alert('An error occurred during the batch upload. Please check the individual student statuses.');
    }
  };

  const handleConfigSubmit = (configData: any) => {
    setConfigData(configData);
    saveConfigurationAndAnswerKey(configData);
    setSaveConfiguration(false);
    setIsConfigSaved(true);
  };

  const handleDownloadExcel = async () => {
    if (studentIds && studentIds.length > 0) {
      const worksheet = XLSX.utils.json_to_sheet(
        studentIds.map((student) => ({
          Name: student.name,
          "Roll No": student.rollNo,
          Email: student.user.email,
          Status: student.status,
          "Marks Obtained": student?.marks ?? "Not Checked",
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
          <h1 className="text-3xl font-extrabold text-gray-900 mb-4 sm:mb-0">AI Copy Checking</h1>
          {/*}
          <div className="flex space-x-2">
            <button
              onClick={() => { window.location.href = '/t/manualMarksEntry' }}
              className='bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold px-6 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center'
            >
              <TbManualGearbox className="mr-2" /> Manual Marks Entry
            </button>
          </div>
          */}
        </header>

        <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
          {/* Section 1: Upload Answer Key */}
          <Card title="Upload Solution Key" className="h-fit">
            <PDFUploadComponent onFileUpload={handleFileUpload} isUploading={isUploading} />
            {uploadedFileUrl && !isParsing && (
              <div className="mt-4 flex items-center text-green-700 bg-green-100 p-3 rounded-md animate-fadeIn">
                <FaCheckCircle className="mr-2" />
                Answer key uploaded successfully!
              </div>
            )}
            {isParsing && (
              <div className="mt-4 flex items-center text-blue-700 bg-blue-100 p-3 rounded-md animate-pulse">
                <FaSpinner className="animate-spin mr-2" />
                Parsing PDF...
              </div>
            )}
          </Card>

          {/* Section 2: Configure Questions */}
          {pythonResponse && saveConfiguration && (
            <Card title="Configure Questions" className="h-fit">
              <QuestionConfigForm parsedData={pythonResponse} onSubmit={handleConfigSubmit} />
            </Card>
          )}

          {/* Section 3: Student Submission Management */}
          {isConfigSaved && (
            <Card title="Student Submissions" className="lg:col-span-2">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-4">
                  <label htmlFor="class-select" className="text-lg font-medium text-gray-700">Select Class:</label>
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
                {studentIds?.length > 0 && (
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
                )}
              </div>

              {studentIds?.length > 0 ? (
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
                            {student?.marks !== undefined && student.marks !== null ? (
                              <span>{student.marks}</span>
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
              ) : (
                <p className="text-center text-gray-500 py-6">Please select a class to view student data.</p>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

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
