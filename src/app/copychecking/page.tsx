"use client"
import React, { useState } from 'react';

interface Question {
  number: number;
  marks: number;
}

interface Student {
  name: string;
  roll: number;
  uploadedFile: string | null;
  marks: number | null;
}

const questions: Question[] = [
  { number: 1, marks: 0 },
  { number: 2, marks: 0 },
  { number: 3, marks: 0 }
];

const students: Student[] = [
  { name: 'John Doe', roll: 101, uploadedFile: null, marks: null },
  { name: 'Jane Smith', roll: 102, uploadedFile: null, marks: null },
  { name: 'Sam Wilson', roll: 103, uploadedFile: null, marks: null }
];

const CopyChecking: React.FC = () => {
  const [answerSheets, setAnswerSheets] = useState<string[]>(['']);
  const [studentData, setStudentData] = useState<Student[]>(students);
  const [questionData, setQuestionData] = useState<Question[]>(questions);

  const handleAddAnswerSheet = () => {
    setAnswerSheets([...answerSheets, '']);
  };

  const handleAnswerChange = (index: number, value: string) => {
    const updatedSheets = [...answerSheets];
    updatedSheets[index] = value;
    setAnswerSheets(updatedSheets);
  };

  const handleStudentFileUpload = (index: number, file: string) => {
    const updatedStudents = [...studentData];
    updatedStudents[index].uploadedFile = file;
    setStudentData(updatedStudents);
  };

  const handleMarksChange = (index: number, marks: number) => {
    const updatedStudents = [...studentData];
    updatedStudents[index].marks = marks;
    setStudentData(updatedStudents);
  };

  const handleQuestionMarksChange = (index: number, marks: number) => {
    const updatedQuestions = [...questionData];
    updatedQuestions[index].marks = marks;
    setQuestionData(updatedQuestions);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Copy Checking</h1>

      {/* Question Upload Block */}
      <div className="p-4 border rounded-lg bg-gray-50">
        <h2 className="text-lg font-semibold mb-2">Upload Question</h2>
        <input type="file" accept=".pdf,.doc,.docx" className="block p-2 border rounded w-full" />
      </div>

      {/* Answer Sheet Upload Block */}
      <div className="p-4 border rounded-lg bg-gray-50">
        <h2 className="text-lg font-semibold mb-2">Upload Answer Sheets</h2>
        {answerSheets.map((_, index) => (
          <div key={index} className="mb-2">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              className="block p-2 border rounded w-full"
              onChange={(e) => handleAnswerChange(index, e.target.value)}
            />
          </div>
        ))}
        <button onClick={handleAddAnswerSheet} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Add Another Answer Sheet
        </button>
      </div>

      {/* List of Questions and Marks */}
      <div className="p-4 border rounded-lg bg-gray-50">
        <h2 className="text-lg font-semibold mb-2">List of Questions</h2>
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Question Number</th>
              <th className="py-2 px-4 border-b">Marks</th>
            </tr>
          </thead>
          <tbody>
            {questionData.map((question, index) => (
              <tr key={index} className="text-center">
                <td className="py-2 px-4 border-b">{question.number}</td>
                <td className="py-2 px-4 border-b">
                  <input
                    type="number"
                    min="0"
                    className="p-1 border rounded w-16 text-center"
                    value={question.marks}
                    onChange={(e) => handleQuestionMarksChange(index, parseInt(e.target.value))}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Students' Answer Sheet Upload */}
      <div className="p-4 border rounded-lg bg-gray-50">
        <h2 className="text-lg font-semibold mb-2">Students' Answer Sheet Upload</h2>
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Roll</th>
              <th className="py-2 px-4 border-b">Upload Answer Sheet</th>
              <th className="py-2 px-4 border-b">Marks Obtained</th>
            </tr>
          </thead>
          <tbody>
            {studentData.map((student, index) => (
              <tr key={index} className="text-center">
                <td className="py-2 px-4 border-b">{student.name}</td>
                <td className="py-2 px-4 border-b">{student.roll}</td>
                <td className="py-2 px-4 border-b">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="p-1 border rounded"
                    onChange={(e) => handleStudentFileUpload(index, e.target.value)}
                  />
                </td>
                <td className="py-2 px-4 border-b">
                  <input
                    type="number"
                    min="0"
                    className="p-1 border rounded w-16 text-center"
                    value={student.marks ?? ''}
                    onChange={(e) => handleMarksChange(index, parseInt(e.target.value))}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CopyChecking;