"use client";

import React, {useState, useEffect, Suspense} from 'react';
import {useRouter, useSearchParams} from "next/navigation";
import {
  Loader2,
  AlertCircle,
  FileText,
  CheckCircle,
  MessageSquare,
  KeyRound,
  BookOpenCheck,
  XCircle,
  X,
  Eye
} from 'lucide-react';
import {RxCross2} from "react-icons/rx";

// --- INTERFACES (MODIFIED) ---
interface Question {
  questionText: string;
  questionType: 'LONG_ANSWER' | 'MCQ' | 'SHORT_ANSWER';
  correctAnswer: string[];
  options: string[],
  marks: number;
  diagramImgURL: string[]; // Added field
}

interface AnswerScript {
  id: string;
  studentAnswer: string;
  question: Question;
  obtainedMarks: number | null;
  remarks: string | null;
  answerImgURL: string[];
  diagramImgURL: string[]; // Added field
}

interface ExamSubmission {
  id: string;
  submissionTime: string;
  status: 'PENDING' | 'GRADED';
  feedback: string | null;
  answerScripts: AnswerScript[];
}

const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-screen p-8 text-gray-500">
    <Loader2 className="h-12 w-12 animate-spin mb-4 text-indigo-600"/>
    <p className="text-lg font-medium">Loading Submission Details...</p>
  </div>
);

// --- IMAGE PREVIEW MODAL ---
const ImagePreviewModal = ({imageUrl, onClose}: { imageUrl: string, onClose: () => void }) => {
  // Close modal on 'Escape' key press
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4 transition-opacity"
      onClick={onClose} // Close on backdrop click
    >
      <div
        className="relative bg-white p-4 rounded-lg shadow-xl max-w-4xl max-h-[90vh]"
        onClick={(e) => e.stopPropagation()} // Prevent closing on modal content click
      >
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 bg-white rounded-full p-2 text-gray-800 hover:bg-red-500 hover:text-white transition-colors z-10 shadow-lg"
          aria-label="Close image preview"
        >
          <X className="w-6 h-6"/>
        </button>
        <img src={imageUrl} alt="Submitted Answer Preview" className="max-w-full max-h-[85vh] rounded-md"/>
      </div>
    </div>
  );
};


// --- STUDENT VIEW COMPONENT ---
function Page() {
  const searchParams = useSearchParams();
  const submissionId = searchParams?.get('submissionId') as string;
  const studentId = searchParams?.get('studentId') as string;

  const [submission, setSubmission] = useState<ExamSubmission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const router = useRouter();

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
        console.log("Exam submission: ", data.examSubmission);
        setSubmission(data.examSubmission);

      } catch (err: any) {
        setError(err.message || 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmissionData();
  }, [submissionId, studentId]);

  const calculateTotalObtainedMarks = () => {
    return Number((submission?.answerScripts.reduce((total, script) => total + (script.obtainedMarks || 0), 0) || 0).toFixed(2));
  };

  const calculateTotalMaxMarks = () => {
    return Number((submission?.answerScripts.reduce((total, script) => total + script.question.marks, 0) || 0).toFixed(2));
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  // This function is called when the mouse pointer leaves the RxCross2 icon
  const handleMouseLeave = () => {
    setIsHovered(false);
  };

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

  return (
    <>
      {previewImageUrl && <ImagePreviewModal imageUrl={previewImageUrl} onClose={() => setPreviewImageUrl(null)}/>}
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto p-4 md:p-8">
          <div className="bg-white text-gray-800 p-6 md:p-8 rounded-xl shadow-lg border border-gray-200 font-sans">
            <header className="mb-8 border-b border-gray-200 pb-6">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-indigo-600 flex items-center">
                  <BookOpenCheck className="mr-3 h-8 w-8"/>
                  Graded Answer Script
                </h1>
                <div className={""} onClick={() => router.back()}>
                  <RxCross2
                    size={28}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    color={isHovered ? 'red' : 'black'}
                    style={{ cursor: 'pointer' }}
                  />
                </div>

              </div>
              <div className="mt-4 flex justify-between gap-4 text-gray-600 text-sm">
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
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-xl text-gray-900">Question {index + 1}</h3>
                      <span className="text-xs font-semibold bg-gray-200 text-gray-700 rounded-md px-2 py-1 capitalize">
                        {script.question.questionType.replace('_', ' ').toLowerCase()}
                      </span>
                    </div>
                    <div className="text-right">
                      <span
                        className="font-bold text-lg text-indigo-600">{Number(script.obtainedMarks?.toFixed(2)) ?? 0}</span>
                      <span className="text-gray-400 text-lg"> / {script.question.marks}</span>
                      <p className="text-xs text-gray-500">Marks</p>
                    </div>
                  </div>

                  <p className="mb-4 text-gray-800 font-medium text-base">{script.question.questionText}</p>

                  {/* === NEW: Display Question Diagram(s) === */}
                  {script.question.diagramImgURL && script.question.diagramImgURL.length > 0 && (
                    <div className="mb-5">
                      <label className="font-semibold text-gray-800 flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-gray-500"/>Question Diagram(s):
                      </label>
                      <div className="mt-2 flex flex-wrap gap-3">
                        {script.question.diagramImgURL.map((url, imgIndex) => (
                          <div key={imgIndex} className="relative group cursor-pointer"
                               onClick={() => setPreviewImageUrl(url)}>
                            <img
                              src={url}
                              alt={`Question diagram ${imgIndex + 1}`}
                              className="w-24 h-24 object-cover rounded-md border-2 border-gray-200 transition-transform transform group-hover:scale-105 group-hover:shadow-md"
                            />
                            <div
                              className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                              <Eye className="w-7 h-7 text-white"/>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {script.question.questionType === 'MCQ' && (
                    <div className="mb-5 space-y-1">
                      <label className="font-semibold text-gray-800">Options:</label>
                      <div className="space-y-2 mt-2">
                        {script.question.options.map((option, optionIndex) => {
                          if (!option) return null;
                          const isStudentAnswer = script.studentAnswer === option;
                          const isCorrectAnswer = script.question.correctAnswer.includes(option);
                          let optionStyle = 'bg-gray-100 border-gray-300 text-gray-800';
                          let icon = null;

                          if (isCorrectAnswer) {
                            optionStyle = 'bg-green-100 border-green-400 text-green-900 ring-1 ring-green-300';
                            icon = <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0"/>;
                          } else if (isStudentAnswer) {
                            optionStyle = 'bg-red-100 border-red-400 text-red-900';
                            icon = <XCircle className="h-5 w-5 text-red-600 flex-shrink-0"/>;
                          }

                          return (
                            <div key={optionIndex}
                                 className={`flex items-center justify-between p-3 border-l-4 rounded-md ${optionStyle}`}>
                              <span className="flex-grow mr-2">{option}</span>
                              {icon}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {script.question.questionType !== 'MCQ' && (
                    <div className="mb-5 space-y-4">
                      <div>
                        <label className="font-semibold text-gray-800">Your Answer:</label>
                        <div className="mt-1 bg-blue-50 border-l-4 border-blue-400 text-blue-900 p-4 rounded-r-lg">
                          {script.studentAnswer ||
														<span className="text-gray-500 italic">No text answer provided.</span>}
                        </div>
                      </div>

                      {script.question.questionType === 'LONG_ANSWER' && script.answerImgURL && script.answerImgURL.length > 0 && (
                        <div>
                          <label className="font-semibold text-gray-800 flex items-center">
                            <FileText className="w-4 h-4 mr-2 text-gray-500"/>Your Submitted Images:
                          </label>
                          <div className="mt-2 flex flex-wrap gap-3">
                            {script.answerImgURL.map((url, imgIndex) => (
                              <div key={imgIndex} className="relative group cursor-pointer"
                                   onClick={() => setPreviewImageUrl(url)}>
                                <img
                                  src={url}
                                  alt={`Your submitted image ${imgIndex + 1}`}
                                  className="w-24 h-24 object-cover rounded-md border-2 border-gray-200 transition-transform transform group-hover:scale-105 group-hover:shadow-md"
                                />
                                <div
                                  className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                                  <Eye className="w-7 h-7 text-white"/>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* === NEW: Display Student's Diagram Submission === */}
                      {script.question.diagramImgURL && script.question.diagramImgURL.length > 0 && (
                        <div>
                          <label className="font-semibold text-gray-800 flex items-center">
                            <FileText className="w-4 h-4 mr-2 text-gray-500"/>Your Diagram Submission:
                          </label>
                          {script.diagramImgURL && script.diagramImgURL.length > 0 ? (
                            <div className="mt-2 flex flex-wrap gap-3">
                              {script.diagramImgURL.map((url, imgIndex) => (
                                <div key={imgIndex} className="relative group cursor-pointer"
                                     onClick={() => setPreviewImageUrl(url)}>
                                  <img
                                    src={url}
                                    alt={`Your submitted diagram ${imgIndex + 1}`}
                                    className="w-24 h-24 object-cover rounded-md border-2 border-gray-200 transition-transform transform group-hover:scale-105 group-hover:shadow-md"
                                  />
                                  <div
                                    className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                                    <Eye className="w-7 h-7 text-white"/>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div
                              className="mt-1 bg-gray-50 border-l-4 border-gray-300 text-gray-500 p-4 rounded-r-lg italic">
                              You did not submit a diagram.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

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

            <footer
              className="mt-8 pt-6 border-t border-gray-200 flex flex-col items-center justify-center text-center">
              <p className="text-lg text-gray-600">Final Score</p>
              <div className="text-3xl font-bold">
                <span className="text-indigo-600">{calculateTotalObtainedMarks()}</span>
                <span className="text-gray-400 mx-2">/</span>
                <span className="text-gray-700">{calculateTotalMaxMarks()}</span>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </>
  );
}

export default function SubmissionPageWrapper() {
  return (
    // Wrap the component that uses useSearchParams with Suspense
    <Suspense fallback={<PageLoader/>}>
      <Page/>
    </Suspense>
  );
}