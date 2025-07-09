// components/exam/AnswerScriptGrader.tsx

"use client";

import { useState, useEffect } from 'react';
import { Loader2, AlertCircle, CheckCircle, FileText, MessageSquare } from 'lucide-react';

// --- TYPE DEFINITIONS (Unchanged) ---
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
}
interface ExamSubmission {
    id: string;
    studentId: string;
    submissionTime: string;
    status: 'PENDING' | 'GRADED' | 'REVIEWED';
    feedback: string | null;
    answerScripts: AnswerScript[];
}

// --- COMPONENT PROPS (Unchanged) ---
interface AnswerScriptGraderProps {
    id: string; // exam submission id
    studentId: string;
}

// --- THE COMPONENT (with Feedback/Remarks feature) ---
const AnswerScriptGrader = ({ id, studentId }: AnswerScriptGraderProps) => {
    const [submission, setSubmission] = useState<ExamSubmission | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- STATE FOR GRADING ---
    const [awardedMarks, setAwardedMarks] = useState<{ [key: string]: number }>({});
    const [feedbackRemarks, setFeedbackRemarks] = useState<{ [key: string]: string }>({});
    const [overallFeedback, setOverallFeedback] = useState<string>('');

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
                    initialMarks[script.id] = 0;
                    initialRemarks[script.id] = '';
                });
                setAwardedMarks(initialMarks);
                setFeedbackRemarks(initialRemarks);

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
            setAwardedMarks(prev => ({ ...prev, [answerScriptId]: 0 }));
        } else if (!isNaN(marks) && marks >= 0 && marks <= maxMarks) {
            setAwardedMarks(prev => ({ ...prev, [answerScriptId]: marks }));
        }
    };

    const handleFeedbackChange = (answerScriptId: string, value: string) => {
        setFeedbackRemarks(prev => ({ ...prev, [answerScriptId]: value }));
    };

    const calculateTotalObtainedMarks = () => {
        return Object.values(awardedMarks).reduce((total, current) => total + current, 0);
    };

    const calculateTotalMaxMarks = () => {
        return submission?.answerScripts.reduce((total, script) => total + script.question.marks, 0) || 0;
    }

    const handleSubmitGrades = async() => {
        if (!submission) return;

        const totalObtainedMarks = calculateTotalObtainedMarks();

        // Create a detailed breakdown of the grading
     //   const gradingDetails = submission.answerScripts.reduce((acc, script) => {
          //  acc[script.id] = {
           //     marks: awardedMarks[script.id] || 0,
            //    feedback: feedbackRemarks[script.id] || ''
           // };
           // return acc;
   //     }, {} as { [key: string]: { marks: number; feedback: string } });
   const gradingDetails = submission.answerScripts.map(script => {
    return {
        id: script.id,
        obtainedMarks: awardedMarks[script.id] || 0 // Use 0 if no marks are awarded
    };
});
const teacherId=JSON.parse(localStorage.getItem('user') || '{}').teacherId; // Assuming teacher ID is stored in localStorage
        // The final payload to be sent to your API
        const gradingPayload = {
            submissionId: submission.id,
            teacherId,
            answerScripts:gradingDetails,
            feedback: overallFeedback,
        };

        console.log("Submitting Payload:", JSON.stringify(gradingPayload, null, 2));
        // In a real app, you would POST this to your grading API endpoint.
        const res=await fetch("/api/exam/answer-script/submit-marks", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(gradingPayload),
        });
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(`Failed to submit grades. Status: ${res.status}, Message: ${errorData.message}`);
        }
        const result = await res.json();
        console.log("Submission Result:", result);
        alert(`Grades submitted successfully! Total Marks: ${totalObtainedMarks}`);
        
    };

    // --- LOADING / ERROR / NO DATA STATES ---
    if (isLoading) return <div className="flex flex-col items-center justify-center p-8 text-gray-500"><Loader2 className="h-12 w-12 animate-spin mb-4 text-blue-500" /><p className="text-lg">Loading Answer Script...</p></div>;
    if (error) return <div className="flex flex-col items-center justify-center p-8 bg-red-50 text-red-700 border border-red-200 rounded-lg"><AlertCircle className="h-12 w-12 mb-4" /><p className="text-lg font-semibold">An Error Occurred</p><p>{error}</p></div>;
    if (!submission) return <div className="flex flex-col items-center justify-center p-8 text-gray-500"><FileText className="h-12 w-12 mb-4" /><p className="text-lg">No submission data found.</p></div>;

    return (
        <div className="bg-white text-gray-800 p-6 md:p-8 rounded-xl shadow-lg border border-gray-200 font-sans">
            <header className="mb-8 border-b border-gray-200 pb-6">
                <h1 className="text-3xl font-bold text-blue-600">Answer Script Grading</h1>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-600">
                    <p><span className="font-semibold text-gray-500">Student ID:</span> {submission.studentId}</p>
                    <p><span className="font-semibold text-gray-500">Submission Time:</span> {new Date(submission.submissionTime).toLocaleString()}</p>
                    <p><span className="font-semibold text-gray-500">Status:</span>
                        <span className={`ml-2 px-2 py-1 text-xs font-bold rounded-full ${submission.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                            }`}>
                            {submission.status}
                        </span>
                    </p>
                </div>
            </header>

            <div className="overflow-x-auto">
                {/* Increased min-width to accommodate the new column */}
                <table className="w-full min-w-[1100px] text-left">
                    <thead className="bg-gray-100 text-sm text-gray-500 uppercase tracking-wider">
                        <tr>
                            <th className="p-4 rounded-tl-lg">Q#</th>
                            <th className="p-4 w-1/4">Question & Student's Answer</th>
                            <th className="p-4">Type</th>
                            <th className="p-4">Correct Answer</th>
                            <th className="p-4">Difficulty</th>
                            {/* New Remarks Column Header */}
                            <th className="p-4 w-1/4">Remarks / Feedback</th>
                            <th className="p-4 text-right rounded-tr-lg">Marks</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {submission.answerScripts.map((script, index) => (
                            <tr key={script.id} className="hover:bg-gray-50 transition-colors duration-200">
                                <td className="p-4 font-bold text-lg text-blue-600 align-top">{index + 1}</td>
                                <td className="p-4 align-top">
                                    <p className="font-semibold text-gray-900">{script.question.questionText}</p>
                                    <p className="mt-2 text-sm text-blue-800 bg-blue-50 p-3 rounded-md border border-blue-200">
                                        <span className="font-bold">Student's Ans: </span>{script.studentAnswer}
                                    </p>
                                </td>
                                <td className="p-4 align-top text-gray-600">{script.question.questionType.replace('_', ' ')}</td>
                                <td className="p-4 align-top text-green-700 font-mono">{script.question.correctAnswer.join(', ')}</td>
                                <td className="p-4 align-top"><span className="px-2 py-1 text-xs font-semibold bg-gray-200 text-gray-700 rounded-md">{script.question.difficultyLevel}</span></td>

                                {/* New Remarks Column Cell */}
                                <td className="p-4 align-top">
                                    <textarea
                                        id={`feedback_${script.id}`}
                                        rows={3}
                                        className="w-full p-2 text-sm bg-white border border-gray-300 rounded-md text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                        placeholder="Add remarks for this answer..."
                                        value={feedbackRemarks[script.id] ?? ''}
                                        onChange={(e) => handleFeedbackChange(script.id, e.target.value)}
                                    />
                                </td>

                                <td className="p-4 text-right align-top">
                                    <div className="flex items-center justify-end space-x-2">
                                        <input
                                            type="number"
                                            value={awardedMarks[script.id] ?? 0}
                                            onChange={(e) => handleMarksChange(e.target.id, e.target.value, script.question.marks)}
                                            id={script.id}
                                            className="w-16 p-2 text-center bg-white border border-gray-300 rounded-md text-gray-900 font-bold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                            max={script.question.marks}
                                            min={0}
                                        />
                                        <span className="text-gray-400 text-lg">/</span>
                                        <span className="w-8 text-left font-bold text-lg text-blue-600">{script.question.marks}</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* New Overall Feedback Section */}
            <div className="mt-8">
                <label htmlFor="overallFeedback" className="flex items-center text-lg font-semibold text-gray-700 mb-2">
                    <MessageSquare className="h-5 w-5 mr-2 text-gray-500" />
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
                    onClick={handleSubmitGrades}
                    className="mt-4 md:mt-0 flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-500"
                >
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Submit Grades
                </button>
            </footer>
        </div>
    );
};

export default AnswerScriptGrader;