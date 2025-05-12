'use client';
import { useEffect, useState } from 'react';
import { PDFUploadComponent } from '@/components/pythonCopyChecking/PDFUploadComponent.tsx';
import { QuestionConfigForm } from '@/components/pythonCopyChecking/QuestionConfigForm';
import hardcodedResponse from '@/lib/pythonCopyCheckingResponseHardCoded.json';
import { METHODS } from 'node:http';
import { set } from 'date-fns';

export default function TeacherPage({ params }: { params: { id: string } }) {
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [pythonResponse, setPythonResponse] = useState<any>(null);
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [classIds, setClassIds] = useState<string[] | null>([]);
  const [classId, setClassId] = useState<string | null>(null);
  const [isConfigSaved, setIsConfigSaved] = useState(false);
  const [studentIds, setStudentIds] = useState<string[] | null>([]);
  const [submittedFileUrl, setSubmittedFileUrl] = useState<string | null>(null);
  const [saveConfiguration, setSaveConfiguration] = useState(false);
  const [configData, setConfigData] = useState({
    config1: {},
    config2: {},
    config3: {}
  });
  useEffect(()=>{
    // Get teacher ID and classId from localStorage if available
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const parsedUserData = JSON.parse(userData);
          setTeacherId(parsedUserData.teacherId || null);
          const fetchedClassId = async()=>{
            const response = await fetch(`/api/teachers/${parsedUserData.teacherId}/section`,{
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
  },[]);
  
  useEffect(() => {
    
      console.log('File uploaded successfully:', uploadedFileUrl);
      const handlestudentfetch = async () => {
        const response=await fetch(`/api/classes/${classId}/students`, {
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
  console.log('configData: ',configData);
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
      setTimeout(() => {
        setPythonResponse(hardcodedResponse);
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
      const formData = new FormData();
          formData.append('file', file);
          formData.append('examId', 'exam-123'); // Hardcoded for now
          
          const response = await fetch(`/api/students/4343/answerSheet/uploadAnswerSheet`, {
            method: 'POST',
            body: formData,
          });
          
          const data = await response.json();
          if (data.success) {
            console.log('data: ',data);
            setUploadedFileUrl(data?.studentAnswerSheetURL);
            setStudentIds((prevStudentIds) => {
              return prevStudentIds.map((student) => {
                if (student.id === studentId) {
                  return { ...student, marks: data?.totalMarks };
                }
                return student;
              }
              );
            });
          alert(data.totalMarks)          }}
          catch (error) {
            console.error('Error uploading file:', error);
          } finally {
            setIsUploading(false);
          }
        }

  const handleConfigSubmit = (configData: any) => {
    setConfigData(configData);
    saveConfigurationAndAnswerKey(configData);
    setSaveConfiguration(false);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Teacher Answer Sheet Upload</h1>
      {/* <button onClick={handleOnClick} className='border-blue-200 m-5 p-5 border text-5xl bg-amber-500'>parsedData</button> */}
      
      <div className="mb-8">
       
        <h2 className="text-xl font-semibold mb-4">Upload Answer Sheet PDF</h2>
     
        <PDFUploadComponent
          onFileUpload={handleFileUpload}
          isUploading={isUploading}
        />
         {pythonResponse  && saveConfiguration && (
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
        {}
         <h2 className="text-xl font-semibold mb-4">Select Class</h2>
        <select 
          className="border-2 border-black p-2 mb-4"
          onChange={(e) => {setClassId(e.target.value);setIsConfigSaved(!isConfigSaved);}}
        >
          <option value="" disabled selected>Select a class</option>
          {classIds && classIds.map((classId) => (
            <option key={classId.section.id} value={classId.section.id}>
              {classId.section.name}
            </option>
          ))}
        </select>

      </div>
      {isConfigSaved && (
  <div className="mt-4 p-4 bg-green-100 text-green-700 rounded">
    
    {studentIds && studentIds.length > 0 ? (
      <div>
        
        <h3 className="font-bold mb-4 text-lg">Student Details</h3>
           <button
          onClick={async () => {
            if (studentIds && studentIds.length > 0) {
              const csvContent = [
                ["Name", "Roll No", "Email", "Status", "Marks Obtained"],
                ...studentIds.map((student) => [
                  student.name,
                  student.rollNo,
                  student.user.email,
                  student.status,
                  student?.marks || "Null",
                ]),
              ]
                .map((row) => row.join(","))
                .join("\n");

              const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.setAttribute("href", url);
              link.setAttribute("download", "student_data.csv");
              link.style.visibility = "hidden";
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            } else {
              alert("No student data available to download.");
            }
          }}
          className="border-blue-500 bg-blue-200 text-blue-800 px-4 py-2 rounded"
        >
          Download Excel Sheet
        </button>
        <table className="w-full table-auto bg-white shadow-md rounded">
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
            {studentIds.map((student) => (
              <tr key={student.id} className="text-center">
                <td className="p-2 border">{student.name}</td>
                <td className="p-2 border">{student.rollNo}</td>
                <td className="p-2 border">{student.user.email}</td>
                <td className="p-2 border">{student.status}</td>
                <td className="p-2 border">{student?.marks?student.marks:"Null"}</td>
                <td className="p-2 border">
                  <input
                    type="file"
                    className="border p-1"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleStudentFileUpload(e.target.files[0], student.id);
                      }
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <p>Fetching Student data, Please wait</p>
    )}
  </div>
)}     
    </div>
  );
}