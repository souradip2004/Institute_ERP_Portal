"use client";
import React, {useState, useEffect, useCallback, useRef} from 'react';
import Link from 'next/link';
import Loader from '@/components/ui/Loader';

// --- INTERFACES (No changes) ---
interface Question {
  id: string;
  questionText: string;
  marks: number;
  options?: string[];
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
  totalMarks: number;
  duration?: string;
  subject?: string;
  createdAt?: string;
  obtainedMarks?: number;
  classSectionId?: string;
}

export default function ExamsPage() {
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
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [examCompleted, setExamCompleted] = useState(false);
  const [submittingExam, setSubmittingExam] = useState(false);
  const latestAnswersRef = useRef(answers);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    console.log("Answers: ", answers);
  }, [answers]);
  // --- EXISTING FUNCTIONS (No changes) ---
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
    // Default fallback, should ideally not be reached if statuses are correct
    return exam.status;
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
        const classdetails = await fetch(`/api/students/${userData.studentId}`, {
          method: "GET",
          headers: {
            'Content-Type': 'application/json',
          },
        })
        if (!classdetails.ok) {
          alert("no classes found")
          return;
        }

        const classes = await classdetails.json();
        const classenrollments = classes?.classEnrollments
        const classd: string[] = [];
        for (let i = 0; i < classenrollments.length; i++) {
          classd.push(classenrollments[i].classSectionId)
        }

        setClassSections(classd)
        setStudentData(userData);
        await fetchExams(userData.studentId || userData.id);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to load user data. Please refresh the page.");
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

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
          (exam.classSection && exam.classSection.course && exam.classSection.course.name) ||
          'Unknown Subject';
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
              status: item.status,
              obtainedMarks: item.obtainedMarks
            }
          }
          return null;
        }).filter(item => item !== null);
        setPastExams(submittedExams);
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


  const submitExam = useCallback(async (finalAnswers: { [key: string]: string }) => {
    if (!selectedExam || !studentData) return;
    setSubmittingExam(true);

    try {
      console.log("Answers being submitted: ", finalAnswers); // This will now be correct
      const response = await fetch('/api/exams/submit', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          examId: selectedExam.id,
          status: "PENDING",
          studentId: studentData?.studentId,
          answers: finalAnswers // Use the argument here
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit exam');
      }

      // --- The rest of your function remains the same ---
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
  }, [selectedExam, studentData, activeExams, pastExams]); // removed 'answers' from dependency array

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (examInProgress && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            // Use the ref here to get the guaranteed latest answers
            submitExam(latestAnswersRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
    // Dependencies are now simpler
  }, [examInProgress, timeLeft, submitExam]);

  const submitAnswer = () => {
    if (!selectedExam || !selectedExam.questions) return;

    const currentQuestion = selectedExam.questions[currentQuestionIndex];

    const newAnswers = {
      ...answers,
      [currentQuestion.id]: currentAnswer.trim()
    };

    setAnswers(newAnswers);

    if (currentQuestionIndex < selectedExam.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setCurrentAnswer(newAnswers[selectedExam.questions[currentQuestionIndex + 1].id] || ''); // Pre-fill next answer if it exists
    } else {
      submitExam(newAnswers);
    }
  };

  const closeExam = () => {
    setShowExamModal(false);
    setExamInProgress(false);
    setAnswers({});
  };

  // --- LOADING AND ERROR STATES (No changes) ---
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

  // --- NEW: LOGIC TO PRE-FILTER EXAMS BASED ON THE ACTIVE TAB ---
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
    return true; // Fallback to show all if filter is unknown
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

      {/* --- ACTIVE EXAMS SECTION (MODIFIED) --- */}
      <section className="mb-6">
        <div className="flex justify-between items-center flex-wrap gap-y-4 mb-4">
          <h3 className="text-xl font-semibold">Active Exams</h3>

          {/* --- NEW: FILTER TABS UI --- */}
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
          {/* --- MODIFIED: Use the pre-filtered list --- */}
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

          {/* --- MODIFIED: Dynamic "No Exams" message --- */}
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

      {/* --- PAST EXAMS SECTION (No changes) --- */}
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
                </tr>
              ))}
              {pastExams.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-gray-500">
                    No past exams found
                  </td>
                </tr>
              )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* --- MODAL (No changes) --- */}
      {showExamModal && selectedExam && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            {!examCompleted ? (
              <>
                <div className="bg-indigo-600 text-white p-4 rounded-t-lg">
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <h2 className="text-xl font-semibold">{selectedExam.title}</h2>
                    <div className="text-lg font-mono">
                      {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                    </div>
                  </div>
                </div>

                {(() => {
                  const currentQuestion = selectedExam.questions[currentQuestionIndex];
                  const isMcq = currentQuestion.options && currentQuestion.options.some(opt => opt.trim() !== '');
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
                      {isMcq ? (
                        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 mb-4">
                          <p className="text-gray-800 font-medium mb-6">
                            {currentQuestion.questionText}
                          </p>
                          <div className="space-y-3">
                            {currentQuestion.options.map((option, index) => (
                              <button
                                key={index}
                                onClick={() => setCurrentAnswer(option)}
                                className={`w-full text-left p-3 border rounded-md transition-colors text-gray-700 ${
                                  currentAnswer === option
                                    ? 'bg-indigo-600 text-white border-indigo-600 ring-2 ring-offset-1 ring-indigo-500'
                                    : 'bg-white hover:bg-indigo-50 border-gray-300'
                                }`}
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 mb-4">
                          <p className="text-gray-800 font-medium mb-6">
                            {currentQuestion.questionText}
                          </p>
                          <textarea
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                            rows={6}
                            value={currentAnswer}
                            onChange={(e) => setCurrentAnswer(e.target.value)}
                            placeholder="Write your answer here..."
                          />
                        </div>
                      )}
                      <div className="flex justify-between mt-6 flex-wrap gap-2">
                        <button
                          onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                          disabled={currentQuestionIndex === 0}
                          className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                        >
                          Previous
                        </button>
                        <button
                          onClick={submitAnswer}
                          disabled={submittingExam}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                        >
                          {submittingExam && <><Loader size="small"/> <span className={"pl-1"}>Submitting...</span></>}
                          {!submittingExam && currentQuestionIndex === selectedExam.questions.length - 1 ? 'Submit Exam' : 'Next Question'}
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </>
            ) : (
              <div className="text-center p-10">
                <div
                  className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
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
    </div>
  )
}