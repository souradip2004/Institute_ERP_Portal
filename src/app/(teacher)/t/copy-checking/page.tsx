"use client"
import React, { useState } from 'react';
import TeacherHeader from '@/components/TeacherHeader';
import { PencilIcon, PlusCircleIcon } from 'lucide-react';

interface Question {
  section: string;
  number: number;
  totalMarks: number;
}

interface Student {
  id: string;
  rollNumber: string;
  name: string;
  marksObtained: number;
}

const CopyChecking: React.FC = () => {
  const [questionSheetFile, setQuestionSheetFile] = useState<File | null>(null);
  const [answerSheetFiles, setAnswerSheetFiles] = useState<File[]>([]);
  // Questions state - will be used with backend integration
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [questions, setQuestions] = useState<Question[]>([
    { section: 'A', number: 1, totalMarks: 2 },
    { section: 'A', number: 2, totalMarks: 2 },
    { section: 'B', number: 3, totalMarks: 7 },
    { section: 'B', number: 4, totalMarks: 7 },
    { section: 'C', number: 5, totalMarks: 11 },
    { section: 'C', number: 6, totalMarks: 11 },
  ]);
  // Students state - will be populated from backend in the future
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [students, setStudents] = useState<Student[]>([
    { id: '1', rollNumber: 'QW12', name: 'Scarlet Jhonson', marksObtained: 45 },
    { id: '2', rollNumber: 'QW13', name: 'Brooklyn Simmons', marksObtained: 67 },
    { id: '3', rollNumber: 'QK15', name: 'Theresa Webb', marksObtained: 65 },
    { id: '4', rollNumber: 'AD12', name: 'Albert Flores', marksObtained: 35 },
    { id: '5', rollNumber: 'RU12', name: 'Ralph Edwards', marksObtained: 25 },
  ]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleQuestionSheetUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setQuestionSheetFile(e.target.files[0]);
    }
  };

  const handleAnswerSheetUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setAnswerSheetFiles([...answerSheetFiles, file]);
    }
  };

  const handleAddMoreAnswerSheets = () => {
    // This would trigger the file input in a real implementation
    const fileInput = document.getElementById('answerSheetInput');
    if (fileInput) {
      fileInput.click();
    }
  };

  const handleUseAICopyChecking = () => {
    // Handle AI copy checking logic
    // This would integrate with an AI service in the future
    console.log('Using AI for copy checking');
  };

  const handleEditMarks = () => {
    // Handle marks editing
    console.log('Editing marks');
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleFilter = () => {
    // Handle filtering
    console.log('Filtering results');
  };

  const handleSort = () => {
    // Handle sorting
    console.log('Sorting results');
  };

  const handleAddStudentAnswer = (studentId: string) => {
    // Handle adding student answer sheet
    console.log('Adding answer sheet for student ID:', studentId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-4 px-6">
        <TeacherHeader className="mb-8" classId="10th-c" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Upload Question Sheet */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Upload Question Sheet</h2>
            <div className="mb-4">
              <input
                type="file"
                id="questionSheetInput"
                className="hidden"
                accept=".pdf,.ppt,.txt"
                onChange={handleQuestionSheetUpload}
              />
              <label
                htmlFor="questionSheetInput"
                className="flex items-center justify-between px-4 py-2 border rounded-md w-full bg-white cursor-pointer"
              >
                <span className="text-gray-500">{questionSheetFile ? questionSheetFile.name : '(pdf, ppt, txt etc.)'}</span>
                <span className="bg-gray-200 px-3 py-1 rounded-md">Choose File</span>
              </label>
            </div>
            <div className="flex items-center px-4 py-2 border rounded-md bg-white">
              <span className="text-gray-600 flex items-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                No File Chosen
              </span>
            </div>
          </div>

          {/* Upload Answer Sheets */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Upload Answer Sheets</h2>
            <div className="mb-4">
              <input
                type="file"
                id="answerSheetInput"
                className="hidden"
                accept=".pdf,.doc,.docx"
                onChange={handleAnswerSheetUpload}
              />
              <label
                htmlFor="answerSheetInput"
                className="flex items-center justify-between px-4 py-2 border rounded-md w-full bg-white cursor-pointer"
              >
                <span className="text-gray-500">(No File Choosen)</span>
                <span className="bg-gray-200 px-3 py-1 rounded-md">Choose File</span>
              </label>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleAddMoreAnswerSheets}
                className="flex items-center justify-center px-4 py-2 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Add More
              </button>
              <button
                onClick={handleUseAICopyChecking}
                className="flex-1 px-4 py-2 bg-blue-50 text-blue-500 rounded-md hover:bg-blue-100"
              >
                Use AI Copy Checking
              </button>
            </div>
          </div>
        </div>

        {/* List of Questions */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">List Of Questions</h2>
            <button
              onClick={handleEditMarks}
              className="flex items-center text-blue-500 bg-blue-50 px-4 py-1 rounded-md"
            >
              <PencilIcon className="w-4 h-4 mr-1" />
              Edit Marks
            </button>
          </div>
          <div className="bg-white rounded-lg overflow-hidden shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Section
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Question Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Marks
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {questions.map((question, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {question.section}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {question.number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {question.totalMarks}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Students Answer Sheet Upload */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Students Answer Sheet Upload</h2>
            <div className="flex space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search By Class ID"
                  className="pl-10 pr-4 py-2 border rounded-md"
                  value={searchQuery}
                  onChange={handleSearch}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
              </div>
              <div className="relative">
                <button
                  onClick={handleSort}
                  className="flex items-center px-4 py-2 border rounded-md bg-white"
                >
                  <span className="mr-2">Sort By</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
              </div>
              <button
                onClick={handleFilter}
                className="flex items-center px-4 py-2 border rounded-md bg-white"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
                </svg>
                Filter
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg overflow-hidden shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-white border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-blue-500">
                    Roll Number
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-blue-500">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-blue-500">
                    Upload Answers
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-blue-500">
                    Marks Obtained
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-700">
                      {student.rollNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {student.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleAddStudentAnswer(student.id)}
                        className="flex items-center justify-center w-full border border-blue-500 text-blue-500 rounded-md py-2 hover:bg-blue-50"
                      >
                        <span className="mr-1">Add</span>
                        <PlusCircleIcon className="w-4 h-4" />
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center">
                      {student.marksObtained}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CopyChecking;