"use client";
import React, {useState, useEffect, useCallback, useRef} from 'react';
import Link from 'next/link';
import Loader from '@/components/ui/Loader';
import {useRouter} from 'next/navigation';
import {S3Utils} from "@/utils/s3Utils";
import {uploadImageToCloudinary} from "@/utils/uploadImageToCloudinary"; // Import the router

// --- INTERFACES (Added passingMarks) ---
interface Question {
  id: string;
  questionText: string;
  marks: number;
  options?: string[];
  diagramImgURL: string[];
}

interface ExamType {
  name: string;
}

interface Course {
  name: string;
  subject: string;
}

interface ClassSection {
  id: string;
  course?: Course;
}

interface Exam {
  id: string;
  title: string;
  examDate: string;
  startTime: string;
  endTime: string;
  durationMinutes?: number;
  status: string;
  score?: string | number;
  questions?: Question[];
  examType?: ExamType;
  classSection?: ClassSection;
  answerScripts?: any[];
  feedback?: string;
  totalMarks: number;
  submissionId: string;
  passingMarks?: number;
  duration?: string;
  subject?: string;
  createdAt?: string;
  obtainedMarks?: number;
  classSectionId?: string;
}

export default function ExamsPage() {
  const router = useRouter(); // Initialize the router
  const [activeExams, setActiveExams] = useState<Exam[]>([]);
  const [pastExams, setPastExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentData, setStudentData] = useState<any>(null);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [showExamModal, setShowExamModal] = useState(false);
  const [examInProgress, setExamInProgress] = useState(false);
  const [classSection, setClassSections] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  // const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [examCompleted, setExamCompleted] = useState(false);
  const [submittingExam, setSubmittingExam] = useState(false);


  const [activeFilter, setActiveFilter] = useState('All');
  const [showCloseConfirmModal, setShowCloseConfirmModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [currentImageUploads, setCurrentImageUploads] = useState<Array<{ url: string; fileName: string }>>([]);
  const [currentDiagramUploads, setCurrentDiagramUploads] = useState<Array<{ url: string; fileName: string }>>([]);

// Modify the 'answers' state to hold an object with the answer text and image URLs
  const [answers, setAnswers] = useState<{
    [key: string]: {
      studentAnswer: string;
      answerImgURL: Array<{ url: string; fileName: string }>;
      diagramImgURL: Array<{ url: string; fileName: string }>; // <-- Add this line
    }
  }>({});

  const diagramFileInputRef = useRef<HTMLInputElement>(null);
  const latestAnswersRef = useRef(answers);

  useEffect(() => {
    if (!selectedExam?.questions) return;

    const currentQuestionId = selectedExam.questions[currentQuestionIndex]?.id;
    if (!currentQuestionId) return;

    const existingAnswer = answers[currentQuestionId];

    // Populate the UI with the saved answer for the current question
    setCurrentAnswer(existingAnswer?.studentAnswer || '');
    setCurrentImageUploads(existingAnswer?.answerImgURL || []);
  }, [currentQuestionIndex, selectedExam, answers]);

  useEffect(() => {
    console.log("Selected exam: ", selectedExam);
  }, [selectedExam]);

  // --- NEW: Function to handle navigation to the submission view ---
  const fetchSubmission = (submissionId: string) => {
    router.push(`/s/exams/view-submission?submissionId=${submissionId}&studentId=${studentData?.studentId}`);
  };

  const getExamStatus = (exam: Exam) => {
    const examStatus = exam.status;
    if (examStatus === 'PENDING' || examStatus === 'GRADED' || examStatus === 'REVIEWED') {
      return examStatus;
    }

    const now = new Date();
    const startTime = new Date(exam.startTime);
    const endTime = new Date(exam.endTime);

    if (startTime > now) {
      return 'Upcoming';
    } else if (startTime <= now && endTime > now) {
      return 'Ongoing';
    } else if (endTime <= now) {
      return 'Exam Ended';
    }
    return exam.status;
  };
  useEffect(() => {
    console.log("Active exams ", activeExams)
  }, [activeExams]);

  const fetchExams = async (studentId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/exams?studentId=${studentId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch exams');
      }
      const data = await response.json();
      if (!data || data.length === 0) {
        setActiveExams([]);
        setLoading(false);
        return;
      }
      const mappedExams = data.map((exam: any) => {
        const subject =
          exam.subject ||
          (exam.examType && exam.examType.name) ||
          (exam.classSection && exam.classSection.course && exam.classSection.course.name) || 'Unknown Subject';
        const startTime = new Date(exam.startTime);
        const endTime = new Date(exam.endTime);
        const startDateTime = new Date(exam.examDate);
        startDateTime.setUTCHours(
          startTime.getUTCHours(),
          startTime.getUTCMinutes(),
          startTime.getUTCSeconds(),
          startTime.getUTCMilliseconds()
        );
        const endDateTime = new Date(exam.examDate);
        endDateTime.setUTCHours(
          endTime.getUTCHours(),
          endTime.getUTCMinutes(),
          endTime.getUTCSeconds(),
          endTime.getUTCMilliseconds()
        );
        return {
          ...exam,
          subject: subject,
          duration: exam.durationMinutes,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString()
        };
      });
      const active = mappedExams.filter((exam: any) =>
        ['IN_PROGRESS', 'PUBLISHED'].includes(exam.status)
      );
      const pastResponse = await fetch(`/api/exam-submissions/student/${studentId}`, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
        },
      });
      let pastSubmissions: Array<any> = [];
      let allExams: Array<Exam> | null = null;
      if (pastResponse.ok) {
        pastSubmissions = await pastResponse.json();
        allExams = active.map((exam: Exam) => {
          const pastSubmission = pastSubmissions.find(item => item.exam.id === exam.id);
          if (exam.id === pastSubmission?.exam?.id) {
            exam.status = pastSubmission.status;
          }
          return exam;
        })
        const submittedExams: Array<Exam> = pastSubmissions.map((item: any) => {
          const exam = active.find((exam: Exam) => exam.id === item.examId);
          if (exam) {
            return {
              ...exam,
              submissionId: item.id,
              status: item.status,
              obtainedMarks: item.obtainedMarks,
              // Make sure passingMarks from the original exam object is included
              passingMarks: exam.passingMarks
            }
          }
          return null;
        }).filter(item => item !== null);
        setPastExams(submittedExams);

        console.log("Submitted Exams: ", submittedExams);
      } else {
        console.warn('Failed to fetch past exam submissions.');
        setPastExams([]);
      }
      if (allExams && allExams.length > 0) {
        setActiveExams(allExams);
      } else {
        setActiveExams(active);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching exams:', err);
      setPastExams([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDataStr = localStorage.getItem('user');
        if (!userDataStr) {
          setError("User data not found. Please log in again.");
          setLoading(false);
          return;
        }

        const userData = JSON.parse(userDataStr);
        const classDetails = await fetch(`/api/students/${userData.studentId}`, {
          method: "GET",
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!classDetails.ok) {
          alert("no classes found")
          return;
        }

        const classes = await classDetails.json();
        const classEnrollments = classes?.classEnrollments
        const classd: string[] = [];
        for (let i = 0; i < classEnrollments.length; i++) {
          classd.push(classEnrollments[i].classSectionId)
        }

        setClassSections(classd)
        setStudentData(userData);

        console.log("Fetching exams ");
        await fetchExams(userData.studentId || userData.id);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to load user data. Please refresh the page.");
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (examInProgress) {
        event.preventDefault();
        event.returnValue = 'Are you sure you want to leave? Your exam progress will be lost and will not be submitted.';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [examInProgress]);

  // This is the handler function for the input's onChange event
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // 1. Call the new function
      const publicUrl = await uploadImageToCloudinary(file);

      // 2. Use the returned URL and the original file name to update state
      setCurrentImageUploads(prev => [...prev, { url: publicUrl, fileName: file.name }]);

      console.log('Upload successful:', publicUrl);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = (fileName: string) => {
    setCurrentImageUploads(prev => prev.filter(image => image.fileName !== fileName));
  };

  const startExam = async (exam: Exam) => {
    const now = new Date();
    const examStart = new Date(exam.startTime);
    if (!exam.endTime) {
      setError('Exam has an invalid end time and cannot be started.');
      return;
    }
    const examEnd = new Date(exam.endTime);
    if (now < examStart) {
      setError('Exam has not started yet.');
      return;
    }
    if (now > examEnd) {
      setError('Exam has already ended.');
      return;
    }

    const nowMs = now.getTime();
    const startTimeMs = examStart.getTime();
    const endTimeMs = examEnd.getTime();
    const elapsedSinceStartMs = nowMs - startTimeMs;
    const maxBufferMs = 10 * 60 * 1000;
    const bufferToAddMs = Math.min(elapsedSinceStartMs, maxBufferMs);
    const remainingTimeUntilEndMs = endTimeMs - nowMs;
    const finalTimeLeftInSeconds = Math.max(0, Math.floor((remainingTimeUntilEndMs + bufferToAddMs) / 1000));
    try {
      const response = await fetch(`/api/exams/sadasdsad/${exam.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch exam details');
      }

      const examWithQuestions = await response.json();
      setSelectedExam({
        ...exam,
        questions: examWithQuestions.questions || [],
        examType: examWithQuestions.examType
      });
      setExamInProgress(true);
      setShowExamModal(true);
      setTimeLeft(finalTimeLeftInSeconds);
    } catch (error) {
      console.error('Error starting exam:', error);
      setError('Failed to start exam. Please try again.');
    }
  };

  const handleDiagramUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const publicUrl = await uploadImageToCloudinary(file);
      // Update the new diagram state
      setCurrentDiagramUploads(prev => [...prev, { url: publicUrl, fileName: file.name }]);
    } catch (error) {
      console.error('Diagram upload failed:', error);
    } finally {
      setIsUploading(false);
      if (diagramFileInputRef.current) {
        diagramFileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveDiagram = (fileName: string) => {
    setCurrentDiagramUploads(prev => prev.filter(image => image.fileName !== fileName));
  };


  const submitExam = useCallback(async (finalAnswers: { [key: string]: {
      studentAnswer: string; answerImgURL: Array<{ url: string; fileName: string }> } }) => {
    if (!selectedExam || !studentData) return;
    setSubmittingExam(true);

    // Transform the answers object into the required array format
    const answerScripts = Object.entries(finalAnswers).map(([questionId, answerData]) => ({
      questionId: questionId,
      studentAnswer: answerData.studentAnswer,
      answerImgURL: answerData.answerImgURL.map(img => img.url),
      diagramImgURL: (answerData.diagramImgURL || []).map(img => img.url),
      status: 'PENDING'
    }));
    try {
      const response = await fetch('/api/exams/submit', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          examId: selectedExam.id,
          status: "PENDING",
          studentId: studentData?.studentId,
          answers: answerScripts
        })
      });

      if (!response.ok) throw new Error('Failed to submit exam');

      // ... (rest of the success logic is fine)
      const result = await response.json();
      const updatedActiveExams = activeExams.filter(e => e.id !== selectedExam.id);
      setPastExams([selectedExam, ...pastExams].sort((a: Exam, b: Exam) => {
        const timeB = new Date(b.examDate).getTime();
        const timeA = new Date(a.examDate).getTime();
        if (isNaN(timeA)) return 1;
        if (isNaN(timeB)) return -1;
        return timeB - timeA;
      }));

      setActiveExams(updatedActiveExams);
      setExamCompleted(true);
      setCurrentQuestionIndex(0);
      setCurrentAnswer('');
      setError(null);

    } catch (error) {
      setError('Failed to submit exam. Please try again.');
      console.error('Error submitting exam:', error);
    } finally {
      setSubmittingExam(false);
    }
  }, [selectedExam, studentData, activeExams, pastExams]);


  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (examInProgress && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            submitExam(latestAnswersRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [examInProgress, timeLeft, submitExam]);

  const submitAnswer = () => {
    if (!selectedExam || !selectedExam.questions) return;

    const currentQuestion = selectedExam.questions[currentQuestionIndex];

    // Create a new master 'answers' object with the latest updates for the current question
    const newAnswers = {
      ...answers,
      [currentQuestion.id]: {
        studentAnswer: currentAnswer.trim(),
        answerImgURL: currentImageUploads,
        diagramImgURL: currentDiagramUploads // <-- Add this line
      }
    };

    setAnswers(newAnswers); // Save progress

    if (currentQuestionIndex < selectedExam.questions.length - 1) {
      // Move to the next question
      setCurrentQuestionIndex(prev => prev + 1);
      // The new useEffect will handle populating the state for the next question
    } else {
      // This is the last question, so trigger the final submission
      submitExam(newAnswers);
    }
  };

  const handlePrevious = () => {
    if (!selectedExam?.questions) return;

    const currentQuestion = selectedExam.questions[currentQuestionIndex];
    // Save current state before moving back
    const newAnswers = {
      ...answers,
      [currentQuestion.id]: {
        studentAnswer: currentAnswer.trim(),
        answerImgURL: currentImageUploads
      }
    };
    setAnswers(newAnswers);

    // Navigate to the previous question
    setCurrentQuestionIndex(prev => Math.max(0, prev - 1));
  };

// --- MODIFIED: closeExam function ---
  const closeExam = () => {
    setShowExamModal(false);
    setExamInProgress(false);
    setAnswers({});
    setCurrentAnswer('');
    setCurrentImageUploads([]); // Reset the new image state
    setCurrentQuestionIndex(0);
    setExamCompleted(false);
    setCurrentDiagramUploads([]); // <-- Add this line
    setCurrentQuestionIndex(0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <Loader size="large"/>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-8">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const filteredActiveExams = activeExams
  .filter(exam => exam.classSectionId && classSection.includes(exam.classSectionId))
  .filter(exam => {
    if (activeFilter === 'All') {
      return true;
    }
    const status = getExamStatus(exam);
    if (activeFilter === 'Upcoming') {
      return status === 'Upcoming';
    }
    if (activeFilter === 'Ongoing') {
      return status === 'Ongoing';
    }
    if (activeFilter === 'Submitted') {
      return ['PENDING', 'GRADED', 'REVIEWED'].includes(status);
    }
    return true;
  });

  return (
    <div className="p-4 sm:p-6 min-w-0 w-full">
      <div className="mb-8">
        <div className="flex items-center flex-wrap gap-2">
          <h2 className="text-2xl font-semibold">My Exams</h2>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      <section className="mb-6">
        <div className="flex justify-between items-center flex-wrap gap-y-4 mb-4">
          <h3 className="text-xl font-semibold">Active Exams</h3>

          <div className="flex items-center border border-gray-200 rounded-lg p-1 bg-gray-50 text-sm">
            {['All', 'Upcoming', 'Ongoing', 'Submitted'].map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1 rounded-md transition-colors font-medium ${
                  activeFilter === filter
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredActiveExams.map(exam => {
            const currentStatus = getExamStatus(exam);
            return (
              <div key={exam.id} className="bg-white rounded-lg shadow border border-gray-100 flex flex-col">
                <div className="bg-indigo-50 p-4 border-b border-indigo-100">
                  <h4 className="font-semibold text-indigo-800 text-base md:text-lg break-words">
                    <span className="block w-full min-w-0">{exam.title}</span>
                  </h4>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600 text-sm">Duration:</span>
                      <span className="text-gray-800 font-medium break-words">{exam.duration || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-gray-600 text-sm">Starts:</span>
                      <span className="text-gray-800 font-medium text-right break-words">
                        {new Date(exam.startTime).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => startExam(exam)}
                    disabled={currentStatus !== 'Ongoing'}
                    className={`w-full text-white py-2 rounded-md transition-colors mt-2 ${
                      (currentStatus === 'PENDING' || currentStatus === 'REVIEWED' || currentStatus === 'GRADED') ? 'bg-gray-500 hover:bg-gray-600 opacity-50 cursor-not-allowed' :
                        currentStatus === 'Ongoing' ? 'bg-green-500 hover:bg-green-600' :
                          currentStatus === 'Exam Ended' ? 'bg-gray-500 hover:bg-gray-600 opacity-50 cursor-not-allowed' :
                            currentStatus === 'Upcoming' ? 'bg-indigo-600 hover:bg-indigo-700 opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {(currentStatus === 'PENDING' || currentStatus === 'REVIEWED' || currentStatus === 'GRADED') && 'Already submitted'}
                    {currentStatus === 'Ongoing' && "Attend Exam"}
                    {currentStatus === 'Upcoming' && "Exam not started yet"}
                    {currentStatus === 'Exam Ended' && "Exam has ended"}
                    {exam.status === 'COMPLETED' && "Exam already attended"}
                  </button>
                </div>
              </div>
            )
          })}

          {filteredActiveExams.length === 0 && (
            <div className="col-span-full bg-white p-8 rounded-lg shadow-sm text-center">
              <div className="text-gray-400 text-5xl mb-4">📝</div>
              <h4
                className="text-xl font-medium text-gray-700 mb-2">No {activeFilter !== 'All' && activeFilter} Exams</h4>
              <p className="text-gray-500">No {activeFilter !== 'All' ? activeFilter.toLowerCase() : 'active'} exams
                found at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* --- PAST EXAMS SECTION (MODIFIED) --- */}
      <section>
        <h3 className="text-xl font-semibold mb-4">Past Exams</h3>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase">Exam Title</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase">Date Taken</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase">Score</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase">Status</th>
                {/* --- NEW: Table Headers --- */}
                <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase">Result</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase">Actions</th>
              </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
              {pastExams.map((exam: Exam, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">{exam.title}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {new Date(exam.examDate).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-indigo-700 font-semibold">
                    {exam.obtainedMarks ? exam.obtainedMarks : "- "}/{exam.totalMarks}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${
                        exam.status === 'GRADED'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {exam.status}
                      </span>
                  </td>
                  {/* --- NEW: Result Column --- */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    {exam.status === 'GRADED' && typeof exam.obtainedMarks === 'number' && typeof exam.passingMarks === 'number' ? (
                      <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${
                        exam.obtainedMarks >= exam.passingMarks
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                            {exam.obtainedMarks >= exam.passingMarks ? 'Pass' : 'Fail'}
                        </span>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  {/* --- NEW: Actions Column --- */}
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                    {exam.status === 'GRADED' ? (
                      <button
                        onClick={() => fetchSubmission(exam.submissionId)}
                        className="text-indigo-600 hover:text-indigo-900 transition-colors font-semibold"
                      >
                        View Submission
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
              {pastExams.length === 0 && (
                <tr>
                  {/* --- MODIFIED: Updated colspan --- */}
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                    No past exams found
                  </td>
                </tr>
              )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {showExamModal && selectedExam && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            {!examCompleted ? (
              <>
                <div
                  className="bg-indigo-600 text-white p-4 rounded-t-lg flex justify-between items-center sticky top-0 z-10">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setShowCloseConfirmModal(true)}
                      className="text-indigo-200 hover:text-white transition-colors p-1 rounded-full hover:bg-white/20"
                      aria-label="Close exam"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24"
                           stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                    <h2 className="text-xl font-semibold">{selectedExam.title}</h2>
                  </div>
                  <div className="text-lg font-mono bg-white/10 px-3 py-1 rounded-md">
                    {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                  </div>
                </div>

                {(() => {
                  const currentQuestion = selectedExam.questions[currentQuestionIndex];
                  const questionType = currentQuestion.options && currentQuestion.options.some(opt => opt.trim() !== '') ? 'MCQ' : 'LONG_ANSWER';

                  return (
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                        <div className="text-sm text-gray-600">
                          Question {currentQuestionIndex + 1} of {selectedExam.questions.length}
                        </div>
                        <div className="bg-indigo-100 px-3 py-1 rounded-full text-xs text-indigo-800 font-medium">
                          {currentQuestion.marks} Points
                        </div>
                      </div>

                      <p className="text-gray-800 font-medium mb-6 text-lg">
                        {currentQuestion.questionText}
                      </p>

                      {questionType === 'MCQ' ? (
                        <div className="space-y-3">
                          {currentQuestion.options.map((option, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentAnswer(option)}
                              className={`w-full text-left p-4 border rounded-lg transition-colors text-gray-700 ${
                                currentAnswer === option
                                  ? 'bg-indigo-600 text-white border-indigo-600 ring-2 ring-offset-1 ring-indigo-500'
                                  : 'bg-white hover:bg-indigo-50 border-gray-300'
                              }`}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Left Column: Text Area */}
                          <div>
                      <textarea
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-base"
                        rows={24} // Increased rows to better fit the layout
                        value={currentAnswer}
                        onChange={(e) => setCurrentAnswer(e.target.value)}
                        placeholder="Write your answer here..."
                      />
                          </div>

                          {/* Right Column: All Uploaders */}
                          <div className="flex flex-col gap-6">
                            {/* --- BEGIN: DIAGRAM UPLOADER (CONDITIONAL) --- */}
                            {currentQuestion.diagramImgURL && currentQuestion.diagramImgURL.length > 0 && (
                              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 h-full">
                                <h3 className="font-semibold text-gray-700 mb-3">Upload Diagram</h3>
                                <input
                                  type="file"
                                  accept="image/*"
                                  ref={diagramFileInputRef}
                                  onChange={handleDiagramUpload}
                                  className="hidden"
                                  disabled={isUploading}
                                />
                                <button
                                  onClick={() => diagramFileInputRef.current?.click()}
                                  disabled={isUploading}
                                  className="w-full flex items-center justify-center gap-2 text-sm bg-white border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50"
                                >
                                  {isUploading ? (
                                    <>
                                      <Loader size="small"/>
                                      <span>Uploading...</span>
                                    </>
                                  ) : (
                                    <>
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
                                           viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round"
                                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                                      </svg>
                                      <span>Upload Diagram</span>
                                    </>
                                  )}
                                </button>

                                <div className="mt-4">
                                  {currentDiagramUploads.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                      {currentDiagramUploads.map((image, index) => (
                                        <div key={index} className="relative group">
                                          <div className="w-full h-24 bg-gray-100 rounded-lg overflow-hidden border-2 border-transparent group-hover:border-indigo-500 transition-all duration-200">
                                            <img src={image.url} alt={image.fileName} className="w-full h-full object-cover" />
                                          </div>
                                          <p className="mt-1 text-xs text-center text-gray-700 truncate" title={image.fileName}>{image.fileName}</p>
                                          <button
                                            onClick={() => handleRemoveDiagram(image.fileName)}
                                            className="absolute top-1 right-1 h-6 w-6 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                            aria-label="Remove diagram"
                                          >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-center py-2">
                                      <p className="text-xs text-gray-500">No diagram uploaded.</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 h-full">
                              <h3 className="font-semibold text-gray-700 mb-3">Attach Images</h3>
                              <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                                className="hidden"
                                disabled={isUploading}
                              />
                              <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                className="w-full flex items-center justify-center gap-2 text-sm bg-white border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50"
                              >
                                {isUploading ? (
                                  <>
                                    <Loader size="small"/>
                                    <span>Uploading...</span>
                                  </>
                                ) : (
                                  <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
                                         viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round"
                                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                                    </svg>
                                    <span>Upload Image</span>
                                  </>
                                )}
                              </button>

                              <div className="mt-4">
                                {currentImageUploads.length > 0 ? (
                                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {currentImageUploads.map((image, index) => (
                                      <div key={index} className="relative group">
                                        <div className="w-full h-24 bg-gray-100 rounded-lg overflow-hidden border-2 border-transparent group-hover:border-indigo-500 transition-all duration-200">
                                          <img src={image.url} alt={image.fileName} className="w-full h-full object-cover"/>
                                        </div>
                                        <p className="mt-1 text-xs text-center text-gray-700 truncate" title={image.fileName}>
                                          {image.fileName}
                                        </p>
                                        <button
                                          onClick={() => handleRemoveImage(image.fileName)}
                                          className="absolute top-1 right-1 h-6 w-6 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                          aria-label="Remove image"
                                        >
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                          </svg>
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-center py-2">
                                    <p className="text-xs text-gray-500">No images uploaded.</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between mt-6 pt-6 border-t flex-wrap gap-2">
                        <button
                          onClick={handlePrevious}
                          disabled={currentQuestionIndex === 0}
                          className="px-5 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors font-medium"
                        >
                          Previous
                        </button>
                        <button
                          onClick={submitAnswer}
                          disabled={submittingExam}
                          className="px-5 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors font-medium disabled:bg-indigo-400"
                        >
                          {submittingExam && <><Loader size="small"/> <span
														className={"pl-2"}>Submitting...</span></>}
                          {!submittingExam && (currentQuestionIndex === selectedExam.questions.length - 1 ? 'Submit Exam' : 'Save & Next')}
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </>
            ) : (
              <div className="text-center p-10">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24"
                       stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Exam Completed!</h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Congratulations on completing your exam. Your answers have been submitted successfully.
                </p>
                <button
                  onClick={closeExam}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Return to Exams
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showCloseConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                   stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">End Exam?</h3>
            <p className="text-sm text-gray-500 mb-6">
              All progress will be lost and your answers will not be submitted. Are you sure you want to exit?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowCloseConfirmModal(false)}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  closeExam();
                  setShowCloseConfirmModal(false);
                }}
                className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium transition-colors"
              >
                End Exam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}