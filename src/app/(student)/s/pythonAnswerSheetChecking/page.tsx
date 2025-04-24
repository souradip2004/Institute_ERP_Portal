'use client';

import { useState } from 'react';
import { PDFUploadComponent } from '@/components/pythonCopyChecking/PDFUploadComponent.tsx';

export default function StudentPage({ params }: { params: { id: string } }) {
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [totalMarks, setTotalMarks] = useState<number | null>(null);

  const handleFileUpload = async (file: File) => {
    try {
      setIsUploading(true);
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
        setTotalMarks(data?.totalMarks);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Student Answer Sheet Submission</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Upload Your Answer Sheet</h2>
        <PDFUploadComponent 
          onFileUpload={handleFileUpload} 
          isUploading={isUploading} 
        />
        {uploadedFileUrl && (
          <div className="mt-4 p-3 bg-green-100 text-green-700 rounded">
            Answer sheet uploaded successfully!
          </div>
        )}
      </div>
      
      {totalMarks !== null && (
        <div className="p-6 bg-blue-50 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Your Results</h2>
          <p className="text-3xl font-bold text-blue-700">{totalMarks} marks</p>
        </div>
      )}
    </div>
  );
}