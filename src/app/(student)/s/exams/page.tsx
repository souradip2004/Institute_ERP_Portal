"use client";
import React, {useState, useEffect} from 'react';
import Link from 'next/link';
import Loader from '@/components/ui/Loader';

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
  duration?: string;
  subject?: string;
  createdAt?: string; // Added for past exams
  obtainedMarks?: string | number; // Added for past exams
  classSectionId?: string; // Added to filter active exams
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
  const [classSection, setClassSections] = useState<string[]>([]); // Explicitly type as string array
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [examCompleted, setExamCompleted] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [debugMode, setDebugMode] = useState(false);


  const getExamStatus = (exam: Exam) => {
    const now = new Date();
    const startTime = new Date(exam.startTime);
    const endTime = new Date(exam.endTime);

    if (startTime > now) {
      return 'Upcoming';
    } else if (startTime <= now && endTime > now) {
      return 'Ongoing';
    } else {
      return 'Exam Ended';
    }
  };


  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get user data from localStorage
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
        const classd: string[] = []; // Explicitly type as string array
        for (let i = 0; i < classenrollments.length; i++) {
          classd.push(classenrollments[i].classSectionId)
        }
        setClassSections(classd)
        console.log(classd)
        setStudentData(userData);
        // Fetch exams
        await fetchExams(userData.studentId || userData.id);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to load user data. Please refresh the page.");
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const fetchExams = async (studentId: string) => { // Removed classSectionId from here, as it's handled by classSection state
    try {
      setLoading(true);

      // Fetch from the backend API, assuming the API handles filtering based on studentId and potentially classSection
      const response = await fetch(`/api/exams?studentId=${studentId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch exams');
      }

      const data = await response.json();
      // console.log('Raw exam data received:', data);

      // Check if data is empty
      if (!data || data.length === 0) {
        console.log('No exam data returned from API');
        setActiveExams([]);
        setLoading(false);
        return;
      }

      // Map API data to our Exam interface, handling different structures
      const mappedExams = data.map((exam: any) => {
        // console.log("Exam ", exam);
        // Get subject from different possible locations
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

        const mappedExam = {
          ...exam,
          subject: subject,
          duration: exam.durationMinutes,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString()
        }
        return mappedExam;
      });

      console.log('Mapped exams:', mappedExams);

      // Filter exams by status to get active and past exams - accept more possible status values
      const active = mappedExams.filter((exam: any) =>
        ['IN_PROGRESS', 'PUBLISHED'].includes(exam.status)
      );

      // Fetch past exams from submissions

      const pastResponse = await fetch(`/api/exam-submissions/student/${studentId}`, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (pastResponse.ok) {
        const pastSubmissions = await pastResponse.json();
        console.log('Past exam submissions received:', pastSubmissions);
        setPastExams(pastSubmissions);
      } else {
        console.warn('Failed to fetch past exam submissions.');
        setPastExams([]);
      }

      // console.log('Active exams after filtering:', active);
      console.log('Past exams (from submissions):', pastExams);
      setActiveExams(active);
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
    const examEnd = exam.endTime ? new Date(exam.endTime) : null;
    console.log("Current time: ", now);
    console.log("Exam start time: ", examStart);
    console.log("Exam end time: ", examEnd);

    if (now < examStart) {
      setError('Exam has not started yet.');
      return;
    }

    if (examEnd && now > examEnd) {
      setError('Exam has already ended.');
      return;
    }

    try {
      // Fetch exam details with questions
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
      console.log("Exam with questions: ", examWithQuestions);
      // Update the exam with questions and exam type
      setSelectedExam({
        ...exam,
        questions: examWithQuestions.questions || [],
        examType: examWithQuestions.examType
      });
      setExamInProgress(true);
      setShowExamModal(true);
      setTimeLeft(exam.durationMinutes ? exam.durationMinutes * 60 : 3600);
    } catch (error) {
      console.error('Error starting exam:', error);
      setError('Failed to start exam. Please try again.');
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (examInProgress && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            submitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [examInProgress, timeLeft]);

  const submitAnswer = () => {
    if (!selectedExam || !selectedExam.questions) return;

    const currentQuestion = selectedExam.questions[currentQuestionIndex];
    console.log('Submitting answer:', {
      questionId: currentQuestion.id,
      answer: currentAnswer,
      currentIndex: currentQuestionIndex,
      totalQuestions: selectedExam.questions.length
    });

    // Save the answer
    setAnswers(prev => {
      const newAnswers = {
        ...prev,
        [currentQuestion.id]: currentAnswer.trim()
      };
      console.log('Updated answers:', newAnswers);
      return newAnswers;
    });

    // Move to next question or submit exam
    if (currentQuestionIndex < selectedExam.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setCurrentAnswer('');
    } else {
      console.log('All questions answered, submitting exam...');
      submitExam();
    }
  };

  const submitExam = async () => {
    if (!selectedExam) return;

    try {
      // Generate a random score between 60 and 95
      const score = Math.floor(Math.random() * (95 - 60 + 1)) + 60;

      const response = await fetch('/api/exams/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          examId: selectedExam.id,
          submissionTime: new Date(),
          obtainedMarks: score,
          status: "PENDING",
          feedback: "GOOD",
          studentId: studentData?.studentId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit exam');
      }

      const result = await response.json();

      // Update the exam status locally
      const updatedActiveExams = activeExams.filter(e => e.id !== selectedExam.id);
      const completedExam = {
        ...selectedExam,
        score: score
      };
      setPastExams([completedExam, ...pastExams]);
      setActiveExams(updatedActiveExams);

      setFinalScore(score);
      setExamCompleted(true);
      setCurrentQuestionIndex(0);
      setCurrentAnswer('');
      // setShowExamModal(false);

      // Show success message
      setError(null);
    } catch (error) {
      setError('Failed to submit exam. Please try again.');
      console.error('Error submitting exam:', error);
      // Even if submission fails, show the score in UI
      const score = Math.floor(Math.random() * (95 - 60 + 1)) + 60;
      /* const completedExam = {
         ...selectedExam!,
         status: 'COMPLETED',
         score: score
       };*/
      // setPastExams([completedExam, ...pastExams]);
      // setActiveExams(activeExams.filter(e => e.id !== selectedExam!.id));
      // setFinalScore(score);

      // setShowExamModal(false);
    }
  };

  const closeExam = () => {
    setShowExamModal(false);
    setExamInProgress(false);
    setAnswers({});
  };


  const toggleDebugMode = () => {
    setDebugMode(!debugMode);
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
      <div className="p-4 sm:p-8"> {/* Adjusted padding for mobile */}
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 min-w-0 w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center flex-wrap gap-2">
          <h2 className="text-2xl font-semibold">My Exams</h2>
          {debugMode && (
            <button
              onClick={() => setDebugMode(false)}
              className="ml-auto text-sm text-indigo-600 hover:text-indigo-800"
            >
              Hide Debug
            </button>
          )}
          {!debugMode && process.env.NODE_ENV === 'development' && (
            <button
              onClick={() => setDebugMode(true)}
              className="ml-auto text-sm text-gray-500 hover:text-gray-700"
            >
              Debug
            </button>
          )}
        </div>
      </div>

      {/* Error Box */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      {/* Active Exams */}
      <section className="mb-6">
        <h3 className="text-xl font-semibold mb-4">Active Exams</h3>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {activeExams
          .filter(exam => exam.classSectionId && classSection.includes(exam.classSectionId))
          .map(exam => {
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
                    className={`w-full text-white py-2 rounded-md transition-colors mt-2
                    ${/* --- Style for ONGOING status --- */ ''}
                    ${currentStatus === 'Ongoing' && 'bg-green-500 hover:bg-green-600'}

                    ${/* --- Style for EXAM ENDED status --- */ ''}
                    ${currentStatus === 'Exam Ended' && 'bg-gray-500 hover:bg-gray-600 opacity-50 cursor-not-allowed'}
    
                    ${/* --- Style for UPCOMING status --- */ ''}
                    ${currentStatus === 'Upcoming' && 'bg-indigo-600 hover:bg-indigo-700 opacity-50 cursor-not-allowed'}`
                    }>
                    {currentStatus === 'Ongoing' && "Attend Exam"}
                    {currentStatus === 'Upcoming' && "Exam not started yet"}
                    {currentStatus === 'Exam Ended' && "Exam has ended"}
                    {exam.status === 'COMPLETED' && "Exam already attended"}
                  </button>
                </div>
              </div>
            )
          })}
          {activeExams.filter(exam => exam.classSectionId && classSection.includes(exam.classSectionId)).length === 0 && (
            <div className="col-span-full bg-white p-8 rounded-lg shadow-sm text-center">
              <div className="text-gray-400 text-5xl mb-4">📝</div>
              <h4 className="text-xl font-medium text-gray-700 mb-2">No Active Exams</h4>
              <p className="text-gray-500">No upcoming or ongoing exams found at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* Past Exams */}
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
              {pastExams.map((item: any )=> (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">{item.exam.title}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {new Date(item.exam.examDate).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-indigo-700 font-semibold">
                    {item.obtainedMarks}/{item.exam.totalMarks}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${
                      // item.status === 'COMPLETED' || 
                      item.status === 'GRADED'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {item.status}
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

      {/* Modal */}
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
                  // Get the current question to avoid repetitive indexing
                  const currentQuestion = selectedExam.questions[currentQuestionIndex];
                  // Determine if the question is an MCQ by checking if any option has content
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

                      {/* Conditionally render MCQ or Long Answer UI */}
                      {isMcq ? (
                        // --- MCQ UI ---
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
                        // --- Long Answer UI (Original) ---
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
                          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                        >
                          {currentQuestionIndex === selectedExam.questions.length - 1 ? 'Submit Exam' : 'Next Question'}
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
                <div className="text-5xl font-bold text-indigo-600 mb-6">{finalScore}/100</div>
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