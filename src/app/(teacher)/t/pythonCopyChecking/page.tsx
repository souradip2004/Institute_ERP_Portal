'use client';
import { useState } from 'react';
import { PDFUploadComponent } from '@/components/pythonCopyChecking/PDFUploadComponent.tsx';
import { QuestionConfigForm } from '@/components/pythonCopyChecking/QuestionConfigForm';
import hardcodedResponse from '@/lib/pythonCopyCheckingResponseHardCoded.json';

export default function TeacherPage({ params }: { params: { id: string } }) {
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [pythonResponse, setPythonResponse] = useState<any>(null);
  const [configData, setConfigData] = useState({
    config1: {},
    config2: {},
    config3: {}
  });

  console.log('uploadedURL: ', uploadedFileUrl);
  console.log('configData: ',configData);
  const handleFileUpload = async (file: File) => {
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`/api/teachers/667678/answerSheet/uploadAnswerSheet`, {
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
      const saveResponse = await fetch(`/api/teachers/78787/answerSheet/saveConfiguration`, {
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

  const handleConfigSubmit = (configData: any) => {
    setConfigData(configData);
    saveConfigurationAndAnswerKey(configData);
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
        {uploadedFileUrl && (
          <div className="mt-4 p-3 bg-green-100 text-green-700 rounded">
            Answer sheet uploaded successfully! {isParsing && 'Parsing PDF...'}
          </div>
        )}
      </div>
      
      {pythonResponse && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Configure Questions</h2>
          <QuestionConfigForm 
            parsedData={pythonResponse} 
            onSubmit={handleConfigSubmit} 
          />
        </div>
      )}
    </div>
  );
}