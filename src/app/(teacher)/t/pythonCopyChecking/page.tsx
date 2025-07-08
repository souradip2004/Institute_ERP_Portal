'use client';
import { useEffect, useState, useRef } from 'react';
import { PDFUploadComponent } from '@/components/pythonCopyChecking/PDFUploadComponent.tsx';
import { QuestionConfigForm } from '@/components/pythonCopyChecking/QuestionConfigForm';
import hardcodedResponse from '@/lib/pythonCopyCheckingResponseHardCoded.json';
import { METHODS } from 'node:http';
import { set } from 'date-fns';
import jsPDF from 'jspdf';

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
  const [submittedFileUrl, setSubmittedFileUrl] = useState<string | null>(null);
  const [saveConfiguration, setSaveConfiguration] = useState(false);
  const [configData, setConfigData] = useState({
    config1: {},
    config2: {},
    config3: {}
  });
  // Add state to track selected files for each student
  const [studentFiles, setStudentFiles] = useState<{ [studentId: string]: File[] }>({});

  useEffect(() => {
    // Get teacher ID and classId from localStorage if available
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const parsedUserData = JSON.parse(userData);
          setTeacherId(parsedUserData.teacherId || null);
          const fetchedClassId = async () => {
            const response = await fetch(`/api/teachers/${parsedUserData.teacherId}/section`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              }
            });
            const data = await response.json();
            if (data && data.length > 0) {
              setClassIds(data);
              console.log('Class IDs:', data);
            }

          }
          fetchedClassId();
        } catch (error) {
          console.error('Error parsing user data from localStorage:', error);
        }
      }
    }
  }, []);

  useEffect(() => {

    console.log('File uploaded successfully:', uploadedFileUrl);
    const handlestudentfetch = async () => {
      const response = await fetch(`/api/classes/${classId}/students`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data && data.length > 0) {
        console.log('Student IDs:', data);
        setStudentIds(data);
      }
    }
    handlestudentfetch();
  }
    , [classId]);


  console.log('uploadedURL: ', uploadedFileUrl);
  console.log('configData: ', configData);
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
        console.log("file details")
        console.log(data)
        // Now call the Python server to parse the PDF
        await parsePDFWithPython(data.ansSheetS3URL);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsUploading(false);
    }
  };

  // todo remove this fn and btn
  const handleOnClick = async () => {
    console.log('btn click');
    await parsePDFWithPython("https://example.com/path/to/your/pdf.pdf");
  }

  const parsePDFWithPython = async (pdfUrl: string) => {
    try {
      setIsParsing(true);

      // This would be your actual Python server endpoint
      // For now, we'll simulate with a timeout and hardcoded data
      setTimeout(async () => {
        const getPythonResponse = await fetch('https://anskey-segregate-from-pdfs-33f7051-v3.app.beam.cloud', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ALXP7mhHyKz1MQATKH7CIQXK9VQBpvoNNuxPvLONWyPCfgemj18cz2T74r4drBpvOkf-3orOQT_6r-63mHPZAA=='
          },
          body: JSON.stringify({
            'file_url_list': ["https://aiclassroomin.s3.eu-north-1.amazonaws.com/" + pdfUrl]
          })
        })
        if (!getPythonResponse.ok) {
          alert("An unwanted error occured please try again")
        }
        const result = await getPythonResponse.json();
        console.log(result)
        setPythonResponse(result);
        setIsParsing(false);
        setSaveConfiguration(true)
      }, 2000);

      // Actual implementation would be something like:
      // const parseResponse = await fetch('your-python-server-url', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ pdfUrl }),
      // });
      // const parseData = await parseResponse.json();
      // setPythonResponse(parseData);
    } catch (error) {
      console.error('Error parsing PDF with Python:', error);
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
          examId: 'exam-123', // Hardcoded for now
          config1: configData.config1,
          config2: configData.config2,
          config3: configData.config3
        }),
      });

      const data = await saveResponse.json();
      if (data.success) {
        alert('Answer key and configuration saved successfully!');
      }
    } catch (error) {
      console.error('Error saving configuration:', error);
    }
  };
  const handleStudentFileUpload = async (file: File, studentId: string) => {
    try {
      let fileToUpload = file;
      // If the file is an image, convert to PDF
      if (file.type.startsWith('image/')) {
        fileToUpload = await imagesToPdf([file]);
      }
      const formData = new FormData();
      formData.append('file', fileToUpload);
      formData.append('examId', 'exam-123'); // Hardcoded for now

      const response = await fetch(`/api/students/4343/answerSheet/uploadAnswerSheet`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        console.log('data: ', data);
        setUploadedFileUrl(data?.studentAnswerSheetURL);
        setStudentIds((prevStudentIds) => {
          if (!prevStudentIds) return prevStudentIds;
          return prevStudentIds.map((student) => {
            if (student.id === studentId) {
              return { ...student, marks: data?.totalMarks };
            }
            return student;
          });
        });
      }
    }
    catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsUploading(false);
    }
  }

  // New: handle file selection for each student (multiple files)
  const handleStudentFileSelect = (files: FileList | null, studentId: string) => {
    if (!files) return;
    setStudentFiles((prev) => ({
      ...prev,
      [studentId]: [...(prev[studentId] || []), ...Array.from(files)],
    }));
  };

  // New: remove a file from a student's file list
  const handleRemoveStudentFile = (studentId: string, fileIdx: number) => {
    setStudentFiles((prev) => {
      const updated = [...(prev[studentId] || [])];
      updated.splice(fileIdx, 1);
      return { ...prev, [studentId]: updated };
    });
  };

  // New: upload all files for a student
  const handleUploadStudentFiles = async (studentId: string) => {
    const files = studentFiles[studentId];
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      // If all files are images, convert all to a single PDF
      if (isAllImages(files)) {
        const pdfFile = await imagesToPdf(files);
        await handleStudentFileUpload(pdfFile, studentId);
      } else {
        for (const file of files) {
          await handleStudentFileUpload(file, studentId);
        }
      }
      // Clear files after upload
      setStudentFiles((prev) => ({ ...prev, [studentId]: [] }));
      alert('Files uploaded successfully!');
    } catch (error) {
      alert('Error uploading files.');
    } finally {
      setIsUploading(false);
    }
  };
  const handleConfigSubmit = (configData: any) => {
    setConfigData(configData);
    saveConfigurationAndAnswerKey(configData);
    setSaveConfiguration(false);
  };

  // Helper to check if all files are images
  const isAllImages = (files: File[]) => files.length > 0 && files.every((file) => file.type.startsWith('image/'));

  // Helper to convert images to PDF using jsPDF
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
      // Detect image type from file
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
    <div className="container mx-auto p-4">
      <div className='flex flex-row justify-between'>
        <h1 className="text-2xl font-bold mt-4 sm:mt-0 mb-6">Teacher Answer Sheet Upload</h1>
        <button onClick={() => { window.location.href = '/t/manualMarksEntry' }} className='bg-gradient-to-r from-[#9A94FF] to-[#AA00FF] text-white font-semibold px-4 py-2 rounded-md'>Manual Marks Entry</button>
      </div>


      {/* <button onClick={handleOnClick} className='border-blue-200 m-5 p-5 border text-5xl bg-amber-500'>parsedData</button> */}

      <div className="mb-8">

        <h2 className="text-xl font-semibold mb-4">Upload Answer Sheet PDF</h2>

        <PDFUploadComponent
          onFileUpload={handleFileUpload}
          isUploading={isUploading}
        />
        {pythonResponse && saveConfiguration && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Configure Questions</h2>
            <QuestionConfigForm
              parsedData={pythonResponse}
              onSubmit={handleConfigSubmit}
            />
          </div>
        )}
        {uploadedFileUrl && (
          <div className="mt-4 p-3 bg-green-100 text-green-700 rounded">
            Answer sheet uploaded successfully! {isParsing && 'Parsing PDF...'}
          </div>

        )}
        { }
        <div className="flex flex-row w-auto items-center mt-8">
          <h2 className="text-xl font-semibold mb-4">Select Class</h2>
          <select
            className="border-1 border-gray-400 rounded-md p-1 ml-2 mb-4"
            onChange={(e) => { setClassId(e.target.value); setIsConfigSaved(!isConfigSaved); }}
          >
            <option value="" disabled selected>Select a class</option>
            {classIds && classIds.map((classId: any) => (
              <option key={classId.section.id} value={classId.section.id}>
                {classId.section.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      {isConfigSaved && (
        <div className="mt-4 p-4 bg-green-100 text-green-700 rounded">

          {studentIds && studentIds.length > 0 ? (
            <div>

              <h3 className="font-bold mb-4 text-lg">Student Details</h3>
              <button
                onClick={async () => {
                  if (studentIds && studentIds.length > 0) {
                    const XLSX = await import("xlsx");
                    const worksheet = XLSX.utils.json_to_sheet(
                      studentIds.map((student) => ({
                        Name: student.name,
                        "Roll No": student.rollNo,
                        Email: student.user.email,
                        Status: student.status,
                        "Marks Obtained": student?.marks || "Null",
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
                }}
                className="border-2 border-blue-500 text-blue-800 font-semibold px-2 py-1 rounded-md mb-4 hover:bg-blue-100 transition-colors"
              >
                Download Excel Sheet
              </button>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] table-auto bg-white shadow-md rounded">
                  <thead className="bg-green-200">
                    <tr>
                      <th className="p-2 border">Name</th>
                      <th className="p-2 border">Roll No</th>
                      <th className="p-2 border">Email</th>
                      <th className="p-2 border">Status</th>
                      <th className="p-2 border">Marks Obtained</th>
                      <th className="p-2 border">Upload File</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentIds.map((student: any) => (
                      <tr key={student.id} className="text-center">
                        <td className="p-2 border">{student.name}</td>
                        <td className="p-2 border">{student.rollNo}</td>
                        <td className="p-2 border">{student.user.email}</td>
                        <td className="p-2 border">{student.status}</td>
                        <td className="p-2 border">{student?.marks ? student.marks : "Null"}</td>
                        <td className="p-2 border">
                          {/* Multiple file input */}
                          <input
                            type="file"
                            className="border p-1 mb-2"
                            multiple
                            onChange={(e) => handleStudentFileSelect(e.target.files, student.id)}
                          />
                          {/* Scrollable grid of selected files */}
                          {studentFiles[student.id] && studentFiles[student.id].length > 0 && (
                            <div className="max-h-24 overflow-y-auto grid grid-cols-1 gap-1 mb-2 border rounded p-1 bg-gray-50">
                              {studentFiles[student.id].map((file, idx) => (
                                <div key={idx} className="flex items-center justify-between text-xs bg-white px-2 py-1 rounded shadow">
                                  <span className="truncate max-w-[120px]">{file.name}</span>
                                  <button
                                    className="ml-2 text-red-500 hover:text-red-700 font-bold"
                                    onClick={() => handleRemoveStudentFile(student.id, idx)}
                                    title="Remove file"
                                  >
                                    ✖
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                          {/* Upload button */}
                          <button
                            className="mt-1 px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                            disabled={isUploading || !(studentFiles[student.id] && studentFiles[student.id].length > 0)}
                            onClick={() => handleUploadStudentFiles(student.id)}
                          >
                            Upload
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p>Fetching Student data, Please wait</p>
          )}
        </div>
      )}
    </div>
  );
}