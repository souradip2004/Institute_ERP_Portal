"use client";

import React, {useState, useEffect} from 'react';
import {useSearchParams} from "next/navigation";
import {Loader2, AlertCircle, FileText, CheckCircle, MessageSquare, KeyRound, Eye, BookOpenCheck} from 'lucide-react';

// --- INTERFACES ---
// These define the shape of the data we expect from the API.
interface Question {
  questionText: string;
  questionType: 'LONG_ANSWER' | 'MCQ' | 'SHORT_ANSWER';
  correctAnswer: string[];
  marks: number;
}

interface AnswerScript {
  id: string;
  studentAnswer: string;
  question: Question;
  obtainedMarks: number | null;
  remarks: string | null;
}

interface ExamSubmission {
  id: string;
  submissionTime: string;
  status: 'PENDING' | 'GRADED';
  feedback: string | null;
  answerScripts: AnswerScript[];
}

// --- STUDENT VIEW COMPONENT ---
function Page() {
  // Hooks to get URL parameters
  const searchParams = useSearchParams();
  const submissionId = searchParams?.get('submissionId') as string;
  const studentId = searchParams?.get('studentId') as string;

  // State to manage the submission data, loading, and errors
  const [submission, setSubmission] = useState<ExamSubmission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Effect hook to fetch data when the component mounts or IDs change
  useEffect(() => {
    if (!submissionId || !studentId) {
      setIsLoading(false);
      setError("Exam ID or Student ID is missing from the URL.");
      return;
    }

    const fetchSubmissionData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/exam/answer-script?id=${submissionId}&studentId=${studentId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to fetch submission. Status: ${response.status}`);
        }
        const data = await response.json();

        if (!data.examSubmission || data.examSubmission.status !== 'GRADED') {
          throw new Error("This submission is either not available or has not been graded yet.");
        }

        setSubmission(data.examSubmission);

      } catch (err: any) {
        setError(err.message || 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmissionData();
  }, [submissionId, studentId]);

  // Helper functions to calculate total marks
  const calculateTotalObtainedMarks = () => {
    return submission?.answerScripts.reduce((total, script) => total + (script.obtainedMarks || 0), 0) || 0;
  };

  const calculateTotalMaxMarks = () => {
    return submission?.answerScripts.reduce((total, script) => total + script.question.marks, 0) || 0;
  };

  // --- RENDER STATES ---

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-gray-500">
        <Loader2 className="h-12 w-12 animate-spin mb-4 text-indigo-600"/>
        <p className="text-lg font-medium">Loading Your Submission...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen p-8 bg-red-50 text-red-700 border border-red-200 rounded-lg max-w-2xl mx-auto">
        <AlertCircle className="h-12 w-12 mb-4"/>
        <p className="text-lg font-semibold">Could Not Load Submission</p>
        <p>{error}</p>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-gray-500">
        <FileText className="h-12 w-12 mb-4"/>
        <p className="text-lg">No submission data found.</p>
      </div>
    );
  }

  // --- MAIN UI ---

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto p-4 md:p-8">
        <div className="bg-white text-gray-800 p-6 md:p-8 rounded-xl shadow-lg border border-gray-200 font-sans">
          <header className="mb-8 border-b border-gray-200 pb-6">
            <h1 className="text-3xl font-bold text-indigo-600 flex items-center">
              <BookOpenCheck className="mr-3 h-8 w-8"/>
              Graded Answer Script
            </h1>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600 text-sm">
              <p>
                <span
                  className="font-semibold text-gray-500">Submission Time:</span> {new Date(submission.submissionTime).toLocaleString()}
              </p>
              <p>
                <span className="font-semibold text-gray-500">Status:</span>
                <span className="ml-2 px-3 py-1 text-xs font-bold rounded-full bg-green-100 text-green-800">
                                {submission.status}
                            </span>
              </p>
            </div>
          </header>

          <div className="space-y-8">
            {submission.answerScripts.map((script, index) => (
              <div key={script.id} className="border border-gray-200 rounded-lg p-6 shadow-sm bg-white">
                <div className="flex justify-between items-start mb-4 pb-2 border-b border-gray-100">
                  <h3 className="font-bold text-xl text-gray-900">Question {index + 1}</h3>
                  <div className="text-right">
                    <span className="font-bold text-lg text-indigo-600">{script.obtainedMarks ?? 0}</span>
                    <span className="text-gray-400 text-lg"> / {script.question.marks}</span>
                    <p className="text-xs text-gray-500">Marks</p>
                  </div>
                </div>

                <p className="mb-4 text-gray-800 font-medium text-base">{script.question.questionText}</p>

                <div className="mb-5 space-y-1">
                  <label className="font-semibold text-gray-800">Your Answer:</label>
                  <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-900 p-4 rounded-r-lg">
                    {script.studentAnswer || <span className="text-gray-500 italic">No answer provided.</span>}
                  </div>
                </div>

                <div className="mb-5 space-y-1">
                  <label className="font-semibold text-gray-800 flex items-center">
                    <KeyRound className="w-4 h-4 mr-2 text-gray-500"/> Correct Answer:
                  </label>
                  <div
                    className="bg-gray-100 border-l-4 border-gray-400 text-gray-800 p-4 rounded-r-lg font-mono text-sm">
                    {script.question.correctAnswer.join(', ')}
                  </div>
                </div>

                {script.remarks && (
                  <div className="pt-4 border-t border-gray-100 space-y-1">
                    <label className="font-semibold text-gray-800">Teacher's Remarks:</label>
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-900 p-4 rounded-r-lg">
                      {script.remarks}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {submission.feedback && (
            <div className="mt-8">
              <label className="flex items-center text-xl font-semibold text-gray-700 mb-2">
                <MessageSquare className="h-5 w-5 mr-2 text-gray-500"/> Overall Feedback
              </label>
              <div className="w-full p-4 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-900">
                {submission.feedback}
              </div>
            </div>
          )}


          <footer className="mt-8 pt-6 border-t border-gray-200 flex flex-col items-center justify-center text-center">
            <p className="text-lg text-gray-600">Final Score</p>
            <div className="text-5xl font-bold">
              <span className="text-indigo-600">{calculateTotalObtainedMarks()}</span>
              <span className="text-gray-400 mx-2">/</span>
              <span className="text-gray-700">{calculateTotalMaxMarks()}</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default Page;