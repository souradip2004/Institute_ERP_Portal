'use client';

import { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import notify from '@/utils/toast';

interface AssignmentUploadProps {
  classSectionId: string;
}

const AssignmentUpload = ({ classSectionId }: AssignmentUploadProps) => {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [totalMarks, setTotalMarks] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  // Add client-side only render flag to avoid hydration issues
  const [isMounted, setIsMounted] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // Set mounted flag after component mounts to enable client-side only features
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const uploadFileToS3 = async (file: File) => {
    try {
      setUploadProgress(0);
      const formData = new FormData();
      formData.append('pdf', file);

      // Create a custom XMLHttpRequest to track upload progress
      return new Promise<{
        url: string;
        fileName: string;
        fileType: string;
        fileSize: number;
        key: string;
      }>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percentComplete);
          }
        });

        xhr.onreadystatechange = function () {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              const response = JSON.parse(xhr.responseText);
              if (response.success) {
                resolve({
                  url: response.url,
                  fileName: response.fileName,
                  fileType: response.fileType,
                  fileSize: response.fileSize,
                  key: response.key
                });
              } else {
                reject(new Error(response.message || 'Upload failed'));
              }
            } else {
              reject(new Error(`Upload failed with status: ${xhr.status}`));
            }
          }
        };

        xhr.open('POST', '/api/upload/pdf', true);
        xhr.send(formData);
      });
    } catch (error) {
      console.error("Error uploading file to S3:", error);
      throw error;
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title || !totalMarks || !dueDate) {
      notify.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    const loadingId = notify.loading('Creating assignment...');

    try {
      let fileUrl = null;
      let fileUploadResult = null;

      // If a file is provided, upload it to S3 via the PDF upload API
      if (file) {
        try {
          fileUploadResult = await uploadFileToS3(file);
          fileUrl = fileUploadResult.url;
        } catch (error) {
          console.error('Error uploading file:', error);
          notify.dismiss(loadingId);
          notify.error('Error uploading file. Please try again.');
          setIsSubmitting(false);
          return;
        }
      }

      // Using JSON format for better control over nested data structures
      const assignmentData = {
        title,
        maxPoints: totalMarks,
        dueDate,
        classSectionId,
        submissionType: 'INDIVIDUAL',
        attachments: fileUrl ? [{
          fileUrl,
          fileName: fileUploadResult?.fileName,
          fileType: fileUploadResult?.fileType,
          fileSize: fileUploadResult?.fileSize
        }] : []
      };

      console.log('Submitting assignment data:', JSON.stringify(assignmentData));

      const response = await fetch('/api/assignments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(assignmentData)
      });

      notify.dismiss(loadingId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Server response:', errorData);
        throw new Error(errorData.error || 'Failed to create assignment');
      }

      // Reset form
      setTitle('');
      setTotalMarks('');
      setDueDate('');
      setFile(null);
      setUploadProgress(0);

      notify.success('Assignment created successfully!');

      // Refresh data
      router.refresh();
    } catch (error) {
      console.error('Error creating assignment:', error);
      notify.dismiss(loadingId);
      notify.error('Failed to create assignment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const scheduleUpload = () => {
    setShowScheduleDialog(true);
  };

  const confirmSchedule = () => {
    notify.success(`Assignment scheduled for ${scheduledDate} at ${scheduledTime}`);
    setShowScheduleDialog(false);
    setScheduledDate('');
    setScheduledTime('');
  };

  return (
    <div className="bg-white p-6 rounded-md shadow-sm">
      <h2 className="text-xl font-semibold mb-6">Upload New Assignment</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label htmlFor="totalMarks" className="block text-sm font-medium text-gray-700 mb-1">
              Total Marks:
            </label>
            <input
              type="number"
              id="totalMarks"
              value={totalMarks}
              onChange={(e) => setTotalMarks(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="40"
            />
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Add Title:
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter the title for assignment"
            />
          </div>

          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
              Due Date:
            </label>
            <div className="flex">
              <input
                type="date"
                id="dueDate"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {isMounted && (
                <input
                  type="time"
                  className="ml-2 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  defaultValue="12:00"
                />
              )}
            </div>
          </div>

          <div
            className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:border-purple-500 transition-colors"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => document.getElementById('fileInput')?.click()}
          >
            <input
              type="file"
              id="fileInput"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm text-gray-600 mb-1">
                {file ? file.name : 'Drag and Drop Your File Here'}
              </p>
              <p className="text-xs text-gray-500 mb-2">or</p>
              <p className="text-sm font-medium text-purple-600">Choose From Computer</p>
            </div>
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-purple-600 h-2.5 rounded-full" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{uploadProgress}% uploaded</p>
              </div>
            )}
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
            <button
              type="button"
              onClick={scheduleUpload}
              className="border border-purple-600 text-purple-600 px-6 py-2 rounded-md hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500 flex-grow-0 flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Schedule Upload</span>
            </button>
          </div>
        </div>
      </form>

      {/* Schedule Dialog */}
      {isMounted && showScheduleDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Schedule Assignment Upload</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>
            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => setShowScheduleDialog(false)}
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-50"
              >
                <span>Cancel</span>
              </button>
              <button
                onClick={confirmSchedule}
                className="flex-1 bg-purple-600 text-white rounded-md px-3 py-2 hover:bg-purple-700"
              >
                <span>Schedule</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentUpload;