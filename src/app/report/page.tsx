"use client"
import React from 'react';

interface Student {
  name: string;
  roll: number;
  goodTopic: string;
  badTopic: string;
  remarks: string;
}

const students: Student[] = [
  { name: 'John Doe', roll: 101, goodTopic: 'Math', badTopic: 'Science', remarks: 'Needs to focus more on Science.' },
  { name: 'Jane Smith', roll: 102, goodTopic: 'English', badTopic: 'Math', remarks: 'Excellent in literature but needs practice in Math.' },
  { name: 'Sam Wilson', roll: 103, goodTopic: 'History', badTopic: 'Geography', remarks: 'Strong analytical skills in History.' }
];

const StudentPerformanceReport: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Student Performance Report</h1>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Name</th>
            <th className="py-2 px-4 border-b">Roll</th>
            <th className="py-2 px-4 border-b">Good Topic</th>
            <th className="py-2 px-4 border-b">Bad Topic</th>
            <th className="py-2 px-4 border-b">Remarks</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, index) => (
            <tr key={index} className="text-center">
              <td className="py-2 px-4 border-b">{student.name}</td>
              <td className="py-2 px-4 border-b">{student.roll}</td>
              <td className="py-2 px-4 border-b">{student.goodTopic}</td>
              <td className="py-2 px-4 border-b">{student.badTopic}</td>
              <td className="py-2 px-4 border-b">{student.remarks}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentPerformanceReport;