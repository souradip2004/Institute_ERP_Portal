// components/exam/AnswerScriptGrader.tsx
"use client";
import {useState, useEffect} from 'react';
import {Loader2, AlertCircle, CheckCircle, FileText, MessageSquare, KeyRound} from 'lucide-react';
import {Exam} from "@/types/exam";

interface Question {
  questionText: string;
  questionType: 'LONG_ANSWER' | 'MCQ' | 'SHORT_ANSWER';
  correctAnswer: string[];
  marks: number;
  difficultyLevel: string;
}

interface AnswerScript {
  id: string;
  studentAnswer: string;
  question: Question;
  obtainedMarks: number | null; // Added obtained marks to pre-fill
  feedback: string | null;      // Added feedback to pre-fill
}

interface ExamSubmission {
  id: string;
  studentId: string;
  submissionTime: string;
  status: 'PENDING' | 'GRADED' | 'REVIEWED';
  feedback: string | null;
  answerScripts: AnswerScript[];
}

interface AnswerScriptGraderProps {
  id: string; // exam submission id
  studentId: string;
  setSubmittedExam: any;
  setViewPaperOpen: any;
}

// --- THE COMPONENT (with Feedback/Remarks feature) ---
const AnswerScriptGrader = ({id, studentId, setSubmittedExam, setViewPaperOpen}: AnswerScriptGraderProps) => {
  const [submission, setSubmission] = useState<ExamSubmission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- STATE FOR GRADING ---
  const [awardedMarks, setAwardedMarks] = useState<{ [key: string]: number }>({});
  const [feedbackRemarks, setFeedbackRemarks] = useState<{ [key: string]: string }>({});
  const [overallFeedback, setOverallFeedback] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!id || !studentId) {
      setIsLoading(false);
      setError("Exam Submission ID or Student ID is missing.");
      return;
    }

    const fetchAnswerScript = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/exam/answer-script?id=${id}&studentId=${studentId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch answer script. Status: ${response.status}`);
        }
        const data = await response.json();

        if (!data.examSubmission) {
          throw new Error("Invalid data structure received from API.");
        }

        setSubmission(data.examSubmission);

        // Initialize state for marks and feedback for each question
        const initialMarks: { [key: string]: number } = {};
        const initialRemarks: { [key: string]: string } = {};
        data.examSubmission.answerScripts.forEach((script: AnswerScript) => {
          // Pre-fill with existing marks/feedback if available, otherwise default
          initialMarks[script.id] = script.obtainedMarks ?? 0;
          initialRemarks[script.id] = script.feedback ?? '';
        });
        setAwardedMarks(initialMarks);
        setFeedbackRemarks(initialRemarks);
        setOverallFeedback(data.examSubmission.feedback ?? '');

      } catch (err: any) {
        setError(err.message || 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnswerScript();
  }, [id, studentId]);

  const handleMarksChange = (answerScriptId: string, value: string, maxMarks: number) => {
    const marks = parseInt(value, 10);
    if (value === '') {
      setAwardedMarks(prev => ({...prev, [answerScriptId]: 0}));
    } else if (!isNaN(marks) && marks >= 0 && marks <= maxMarks) {
      setAwardedMarks(prev => ({...prev, [answerScriptId]: marks}));
    }
  };

  const handleFeedbackChange = (answerScriptId: string, value: string) => {
    setFeedbackRemarks(prev => ({...prev, [answerScriptId]: value}));
  };

  const calculateTotalObtainedMarks = () => {
    return Object.values(awardedMarks).reduce((total, current) => total + current, 0);
  };

  const calculateTotalMaxMarks = () => {
    return submission?.answerScripts.reduce((total, script) => total + script.question.marks, 0) || 0;
  }

  const handleSubmitGrades = async () => {
    if (!submission) return;
    setIsSubmitting(true);
    const gradingDetails = submission.answerScripts.map(script => {
      return {
        id: script.id,
        obtainedMarks: awardedMarks[script.id] || 0,
        feedback: feedbackRemarks[script.id] || '', // Include individual feedback
      };
    });

    const teacherId = JSON.parse(localStorage.getItem('user') || '{}').teacherId;
    const gradingPayload = {
      submissionId: submission.id,
      teacherId,
      answerScripts: gradingDetails,
      feedback: overallFeedback,
    };

    console.log("Submitting Payload:", JSON.stringify(gradingPayload, null, 2));
    try {
      const res = await fetch("/api/exam/answer-script/submit-marks", {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(gradingPayload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Failed to submit grades. Status: ${res.status}, Message: ${errorData.message}`);
      }
      const result = await res.json();
      console.log("Submission Result:", result);

      setSubmittedExam((prev: Exam) => ({
        ...prev,
        examSubmissions: prev.examSubmissions.map(item =>
          item.id === result.id ? {...item, obtainedMarks: result.obtainedMarks, status: result.status} : item
        ),
      }));
      setIsSubmitting(false);
      setViewPaperOpen(false);
    } catch (error) {
      console.error(error);
      // setError("Failed to submit grades. Check the console for details.")
      alert("Failed to submit grades. Check the console for details.");
    }
  };

  if (isLoading) return <div className="flex flex-col items-center justify-center p-8 text-gray-500">
    <Loader2
      className="h-12 w-12 animate-spin mb-4 text-blue-500"/><p className="text-lg">Loading Answer Script...</p></div>;
  if (error) return <div
    className="flex flex-col items-center justify-center p-8 bg-red-50 text-red-700 border border-red-200 rounded-lg">
    <AlertCircle className="h-12 w-12 mb-4"/><p className="text-lg font-semibold">An Error Occurred</p><p>{error}</p>
  </div>;
  if (!submission) return <div className="flex flex-col items-center justify-center p-8 text-gray-500"><FileText
    className="h-12 w-12 mb-4"/><p className="text-lg">No submission data found.</p></div>;

  return (
    <div className="bg-white text-gray-800 p-6 md:p-8 rounded-xl shadow-lg border border-gray-200 font-sans mt-4">
      <header className="mb-8 border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-bold text-blue-600">Answer Script Grading</h1>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-600">
          <p><span
            className="font-semibold text-gray-500">Submission Time:</span> {new Date(submission.submissionTime).toLocaleString()}
          </p>
          <p><span className="font-semibold text-gray-500">Status:</span>
            <span
              className={`ml-2 px-2 py-1 text-xs font-bold rounded-full ${submission.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
              {submission.status}
            </span>
          </p>
        </div>
      </header>

      <div className="space-y-8">
        {submission.answerScripts.map((script, index) => (
          <div key={script.id} className="border border-gray-200 rounded-lg p-6 shadow-sm">
            {/* Question Header */}
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
              <h3 className="font-bold text-lg text-gray-900">Question : {index + 1}</h3>
              <span className="text-xs font-semibold bg-gray-200 text-gray-700 rounded-md px-2 py-1 capitalize">
                {script.question.questionType.replace('_', ' ').toLowerCase()}
              </span>
            </div>

            <p className="mb-4 text-gray-800 font-medium">{script.question.questionText}</p>

            {/* Student's Answer */}
            <div className="mb-5">
              <label className="font-semibold text-gray-800">Student's Answer:</label>
              <div className="mt-2 bg-green-50 border-l-4 border-green-400 text-green-900 p-4 rounded-r-lg">
                {script.studentAnswer}
              </div>
            </div>

            <div className="mb-5">
              <label className="font-semibold text-gray-800 flex items-center">
                <KeyRound className="w-4 h-4 mr-2 text-yellow-600"/>
                Correct Answer:
              </label>
              <div
                className="mt-2 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-900 p-4 rounded-r-lg font-mono text-sm">
                {script.question.correctAnswer.join(', ')}
              </div>
            </div>

            {/* Remarks and Marks Section */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-4 pt-4 border-t border-gray-100">
              {/* Remarks */}
              <div className="md:col-span-8">
                <label htmlFor={`feedback_${script.id}`} className="font-semibold text-gray-800 mb-2 block">
                  Remarks:
                </label>
                <textarea
                  id={`feedback_${script.id}`}
                  rows={2}
                  className="w-full p-2 text-sm bg-white border border-gray-300 rounded-md text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="Add remarks for this answer..."
                  value={feedbackRemarks[script.id] || ''}
                  onChange={(e) => handleFeedbackChange(script.id, e.target.value)}
                />
              </div>

              {/* Marks */}
              <div className="md:col-span-4 self-end">
                <label className="font-semibold text-gray-800 mb-2 block text-left md:text-right">
                  Marks:
                </label>
                <div className="flex items-center justify-start md:justify-end space-x-2">
                  <input
                    type="number"
                    value={awardedMarks[script.id] ?? 0}
                    onChange={(e) => handleMarksChange(script.id, e.target.value, script.question.marks)}
                    className="w-20 p-2 text-center bg-white border border-gray-300 rounded-md text-gray-900 font-bold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    max={script.question.marks}
                    min={0}
                  />
                  <span className="text-gray-400 text-xl">/</span>
                  <span className="w-8 text-left font-bold text-xl text-blue-600">{script.question.marks}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Overall Feedback Section */}
      <div className="mt-8">
        <label htmlFor="overallFeedback" className="flex items-center text-lg font-semibold text-gray-700 mb-2">
          <MessageSquare className="h-5 w-5 mr-2 text-gray-500"/>
          Overall Feedback
        </label>
        <textarea
          id="overallFeedback"
          rows={4}
          className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          placeholder="Provide a summary of the student's performance on the entire exam..."
          value={overallFeedback}
          onChange={(e) => setOverallFeedback(e.target.value)}
        />
      </div>

      <footer className="mt-8 pt-6 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between">
        <div className="text-2xl font-bold">
          <span className="text-gray-500">Total Score: </span>
          <span className="text-blue-600">{calculateTotalObtainedMarks()} / {calculateTotalMaxMarks()}</span>
        </div>
        <button
          disabled={isSubmitting}
          onClick={handleSubmitGrades}
          className={`mt-4 md:mt-0 flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-500
          ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}
          `}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin"/>
              Submitting Grades
            </>
            ) : (
            <>
            <CheckCircle className="h-5 w-5 mr-2"/>
              Submit Grades
            </>
          )}
        </button>
      </footer>
    </div>
  );
};

export default AnswerScriptGrader;