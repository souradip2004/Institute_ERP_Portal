'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  ArrowRight
} from "lucide-react"

// Add module declaration for html2pdf.js to fix TS error
// @ts-ignore
declare module 'html2pdf.js';

export default function ReportCard() {
  const [results, setresults] = useState([])
  const [bargraphs, setbargraphs] = useState(null)
  const [feedback, setfeedback] = useState("Generating Feeback")
  useEffect(() => {
    if (localStorage.getItem("user")) {
      const user = JSON.parse(localStorage.getItem("user"));
      const findresults = async () => {
        const result = await fetch(`/api/exam-submissions/student/${user.studentId}`, {
          method: "GET",
          headers: {
            'Content-Type': 'application/json',
          },
        })
        if (result.ok) {
          const result1 = await result.json();
          const gradeFromMarks = (marks) => {
            if (marks >= 90) return 'A+';
            if (marks >= 80) return 'A';
            if (marks >= 70) return 'B';
            if (marks >= 60) return 'C';
            if (marks >= 50) return 'D';
            return 'F';
          };


          const transformed = result1.map(entry => {
            const title = entry.exam.title;
            const total = entry.exam.totalMarks;
            const obtained = entry.obtainedMarks;
            const grade = gradeFromMarks(obtained);
            const feedback = entry.feedback;
            return [title, total, obtained, grade, feedback];
          });
          setresults(transformed)
          let score_ratio: { [key: string]: Array<Number> } = {};
          let attendance_data: { [key: string]: Number } = {};
          for (let i = 0; i < transformed.length; i++) {
            if (score_ratio[transformed[i][0]]) {
              let p = score_ratio[transformed[i][0]];
              p.push(Number(transformed[i][2]) / Number(transformed[i][1]))
            } else {
              attendance_data[transformed[i][0]] = 98
              score_ratio[transformed[i][0]] = [Number(transformed[i][2]) / Number(transformed[i][1])]
            }
          }
          const resultgraph = await fetch("/api/generate", {
            method: "POST",
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              roll_no: JSON.parse(localStorage.getItem("user") || '{}').name || 'N/A',
              score_ratio: JSON.stringify(score_ratio),
              attendance_data
            })
          })
          if (resultgraph.ok) {
            const resultgfinal = await resultgraph.json();
            setfeedback(resultgfinal.feedback)
            console.log(JSON.parse(resultgfinal.result_complete))
            setbargraphs(JSON.parse(resultgfinal.result_complete).overall_graph)
          } else {
            alert("Error in creating Reports")
          }
        }

      }
      findresults()
    }

  }, []);


  // Separate function for PDF download
  const handleDownloadPDF = async () => {
    // Dynamically import html2pdf.js
    // @ts-ignore
    const html2pdf = (await import('html2pdf.js')).default || (await import('html2pdf.js'));
    const element = document.querySelector('.max-w-5xl');
    if (element && html2pdf) {
      // Use html2pdf with recommended options for better rendering
      html2pdf()
        .set({
          margin: [10, 10, 10, 10],
          filename: 'report-card.pdf',
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        })
        .from(element)
        .save();
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-xl rounded-xl border border-gray-200 mt-10">
      <h1 className="text-2xl font-semibold text-center mb-6">AI Classroom | Student Report Card</h1>

      <div className="grid grid-cols-2 gap-4 text-sm mb-8">
        <div>
          <strong>Roll:</strong>{' '}
          {typeof window !== 'undefined' && localStorage.getItem('user')
            ? JSON.parse(localStorage.getItem('user') || '{}').name
            : 'N/A'}
        </div>

        <div><strong>Overall Percentage:</strong> <span className="text-green-600 font-medium">87.4%</span>
        </div>
      </div>

      <div className="bg-gradient-to-r from-indigo-200 to-purple-200 px-4 py-2 rounded-t-md font-semibold">
        Class-wise Performance
      </div>
      <div className="bg-white shadow-sm rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm ">
          <thead>
            <tr className="bg-gray-50">
              <th className="border-r border-b px-4 py-2">Topic</th>
              <th className="border-r border-b px-4 py-2">Total Marks</th>
              <th className="border-r border-b px-4 py-2">Obtained</th>
              <th className="border-r border-b px-4 py-2">Grade</th>
              <th className="border-b px-4 py-2">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {results?.map(([subject, total, obtained, grade, remark], i) => (
              <tr key={i}>
                <td className="border-r border-b px-4 py-2">{subject}</td>
                <td className="border-r border-b px-4 py-2">{total}</td>
                <td className="border-r border-b px-4 py-2">{obtained / 100 * total}</td>
                <td className="border-r border-b px-4 py-2">{grade}</td>
                <td className="border-b px-4 py-2">{remark}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="gap-6 mt-10">
        <div>
          <h3 className="font-semibold mb-2">Subject-wise Comparison</h3>
          {bargraphs ? <img src={bargraphs} /> :
            <div className="h-40 bg-gray-100 rounded flex items-center justify-center text-gray-500">
              [Bar Chart Placeholder]
            </div>}
        </div>

      </div>

      <div className="mt-10 bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
        <h3 className="font-semibold text-purple-700 mb-2">Personalized Feedback from AI Mentor</h3>
        <p className="mb-2">
          {feedback.split(".").map((x, index) => {
            if (index != feedback.split('.').length - 1)
              return (
                <p className="mb-2 flex items-center gap-2">
                  <span className="flex-shrink-0">
                    <ArrowRight size={20} />
                  </span>
                  <span>{x}</span>
                </p>
              )
          })}
        </p>
      </div>

      <div className="text-right mt-8">
        <Button onClick={() => handleDownloadPDF()} className="bg-gray-800 text-white">Download PDF</Button>
      </div>

      <div className="text-xs text-center mt-6 text-gray-500">
        Manager XYZ School | AI-Powered Performance Analysis
      </div>
    </div>
  );
}