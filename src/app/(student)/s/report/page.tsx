'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

export default function ReportCard() {
  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-xl rounded-xl border border-gray-200 mt-10">
      <h1 className="text-2xl font-semibold text-center mb-6">AI Classroom | Student Report Card</h1>

      <div className="grid grid-cols-2 gap-4 text-sm mb-8">
        <div><strong>Roll:</strong> {JSON.parse(localStorage.getItem('user')).name}</div>
       
        <div><strong>Overall Percentage:</strong> <span className="text-green-600 font-medium">87.4%</span></div>
      </div>

      <div className="bg-gradient-to-r from-indigo-200 to-purple-200 px-4 py-2 rounded-t-md font-semibold">
        Class-wise Performance
      </div>
      <table className="w-full text-sm border-t border-l border-gray-200">
        <thead>
          <tr className="bg-gray-50">
            <th className="border-r border-b px-4 py-2">Subject</th>
            <th className="border-r border-b px-4 py-2">Total Marks</th>
            <th className="border-r border-b px-4 py-2">Obtained</th>
            <th className="border-r border-b px-4 py-2">Grade</th>
            <th className="border-b px-4 py-2">Remarks</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['Mathematics', 100, 95, 'A+', 'Excellent!'],
            ['Physics', 100, 89, 'A', 'Very good'],
            ['Chemistry', 100, 85, 'B+', 'Good effort'],
            ['English', 100, 78, 'B', 'Can improve'],
            ['Computer Science', 100, 92, 'A+', 'Outstanding'],
            ['Physical Education', 50, 48, 'A+', 'Excellent'],
          ].map(([subject, total, obtained, grade, remark], i) => (
            <tr key={i}>
              <td className="border-r border-b px-4 py-2">{subject}</td>
              <td className="border-r border-b px-4 py-2">{total}</td>
              <td className="border-r border-b px-4 py-2">{obtained}</td>
              <td className="border-r border-b px-4 py-2">{grade}</td>
              <td className="border-b px-4 py-2">{remark}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="grid grid-cols-2 gap-6 mt-10">
        <div>
          <h3 className="font-semibold mb-2">Subject-wise Comparison</h3>
          <div className="h-40 bg-gray-100 rounded flex items-center justify-center text-gray-500">
            [Bar Chart Placeholder]
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Performance Trend</h3>
          <div className="h-40 bg-gray-100 rounded flex items-center justify-center text-gray-500">
            [Line Chart Placeholder]
          </div>
        </div>
      </div>

      <div className="mt-10 bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
        <h3 className="font-semibold text-purple-700 mb-2">Personalized Feedback from AI Mentor</h3>
        <p className="mb-2">
          <strong>Strengths:</strong> Your performance in Mathematics and Computer Science is exceptional, showing strong analytical and problem-solving skills. You've demonstrated consistent improvement throughout the term.
        </p>
        <p className="mb-2">
          <strong>Areas to Improve:</strong> English scores show room for improvement, particularly in essay writing. Focus on expanding vocabulary and structuring arguments more effectively.
        </p>
        <p>
          <strong>Recommendations:</strong>
          <ul className="list-disc list-inside">
            <li>Use our AI Writing Assistant for English practice</li>
            <li>Join the weekly problem-solving club for Math enrichment</li>
            <li>Allocate 30 minutes daily for vocabulary building</li>
          </ul>
        </p>
      </div>

      <div className="text-right mt-8">
        <Button className="bg-gray-800 text-white">Download PDF</Button>
      </div>

      <div className="text-xs text-center mt-6 text-gray-500">
        Manager XYZ School | AI-Powered Performance Analysis
      </div>
    </div>
  );
}