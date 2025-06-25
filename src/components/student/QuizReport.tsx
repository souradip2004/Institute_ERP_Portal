import React, { useState, useEffect } from 'react';
import { FiCheckCircle, FiChevronDown, FiShare2, FiRefreshCw } from 'react-icons/fi';
import { TbArrowBackUp } from "react-icons/tb";
import { useRouter } from 'next/navigation';

// Type definitions
interface QuizQuestion {
  qNo: number;
  question: string;
  correctOption: string;
  markedOption?: string;
}

interface QuizReportData {
  topicName?: string;
  questions?: QuizQuestion[];
  noOfAttempts?: number;
}

interface AiFeedback {
  feedbackText: string;
}

const translator = (word1: string, word2: string) =>
  typeof window !== 'undefined' && localStorage.getItem("lang") && localStorage.getItem("lang")!.toLowerCase().includes("english")
    ? word1
    : localStorage.getItem("lang")
      ? word2
      : word1;

const QuizReport: React.FC = () => {
  const [durationInSeconds, setDurationInSeconds] = useState<number>(0);
  // Local storage
  const reportData: QuizReportData = typeof window !== 'undefined' && localStorage.getItem('mcqReportData')
    ? JSON.parse(localStorage.getItem('mcqReportData')!)
    : {};
  const router = useRouter();

  // Extract data from reportData
  const {
    topicName = 'Linked Lists: Singly, Double and Circular',
    questions: quizQuestions = [],
    noOfAttempts = 0
  } = reportData || {};

  // State for AI feedback
  const [aiFeedback, setAiFeedback] = useState<AiFeedback>({
    feedbackText: ''
  });
  const [loadingFeedback, setLoadingFeedback] = useState<boolean>(true);
  const [username, setusername] = useState<string>("Name");

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDurationInSeconds(parseInt(localStorage.getItem('mcq_quiz_duration_for_result') || '1800'));
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const Userdata = JSON.parse(localStorage.getItem('user-data') || '{}');
      setusername(Userdata?.firstName || 'Name');
    }
  }, []);

  // Map questions data
  const questions = quizQuestions.map(q => ({
    qNo: q.qNo,
    question: q.question,
    correctAnswer: q.correctOption,
    yourAnswer: q.markedOption || 'Not Attempted',
    score: q.markedOption === q.correctOption ? 1 : 0
  }));

  const totalQuestions = quizQuestions.length;
  const correctAnswers = questions.filter(q => q.score === 1).length;
  const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_1_SERVER_URL}/videoData/getQuizFeedback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            quizTopic: topicName,
            quizAccuracy: `${accuracy}%`
          })
        });

        const data = await response.json();

        if (data.success) {
          // Parse the feedback text
          const feedbackText = data.data;

          setAiFeedback({
            feedbackText
          });
        }
      } catch (error) {
        setAiFeedback({
          feedbackText: "You've shown good understanding in some areas of this topic. There are some areas where you can focus to improve your understanding. Review the questions you got wrong and understand the correct solutions. Practice more problems on this topic to reinforce your understanding. Seek clarification on concepts you find challenging."
        });
      } finally {
        setLoadingFeedback(false);
      }
    };

    fetchFeedback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicName, accuracy]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours > 0 ? `${hours}h ` : ''}${minutes}m`;
  };

  // Determine status and color based on accuracy
  const status =
    accuracy >= 90 ? translator('Grade A+', 'ग्रेड ए+') :
      accuracy >= 80 ? translator('Grade A', 'ग्रेड ए') :
        accuracy >= 70 ? translator('Grade B+', 'ग्रेड बी+') :
          accuracy >= 60 ? translator('Grade B', 'ग्रेड बी') :
            accuracy >= 50 ? translator('Grade C', 'ग्रेड सी') :
              accuracy >= 40 ? translator('Grade D', 'ग्रेड डी') :
                translator('Failed', 'असफल');
  // Determine status color
  const statusColor =
    status === translator('Grade A+', 'ग्रेड ए+') ? 'text-green-600' :
      status === translator('Grade A', 'ग्रेड ए') ? 'text-green-500' :
        status === translator('Grade B+', 'ग्रेड बी+') ? 'text-blue-500' :
          status === translator('Grade B', 'ग्रेड बी') ? 'text-blue-400' :
            status === translator('Grade C', 'ग्रेड सी') ? 'text-yellow-500' :
              status === translator('Grade D', 'ग्रेड डी') ? 'text-orange-500' :
                'text-red-600'; // Failed

  const bestScore = `${correctAnswers}/${totalQuestions}`;

  const handleShareScore = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleRetakeQuiz = () => {
    router.push('/s/smart-resources/mcqQuiz');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg">
        {/* Header */}
        <div
          className="text-white p-4 rounded-t-lg flex justify-between items-center"
          style={{ background: 'linear-gradient(90deg, #A6C8FF 0%, #CABDFF 100%)' }}
        >
          <h1 className=" flex gap-2 text-2xl font-semibold">
            <button className='text-white hover:text-gray-500'
              onClick={() => router.push('/all-exam')}><TbArrowBackUp />
            </button>
            {translator("Quiz Report", "क्विज रिपोर्ट")}
          </h1>
          <img
            src="/aifull.svg"
            alt="AI Full"
            className="h-9 w-auto"
          />
        </div>

        <div className="p-6 md:p-8 space-y-8">
          {/* Topic Name, Student Info & Stats */}
          <div className="bg-white p-6 rounded-lg shadow-md text-black">
            <h2 className="text-2xl font-bold text-blue-800 mb-1">
              {topicName}
            </h2>

            <div className="flex flex-col md:flex-row justify-between items-start mt-3">
              {/* Left Side: Student Name, Date, Duration */}
              <div className="mb-4 md:mb-0">
                <h3 className="text-xl font-semibold text-gray-700">{username}</h3>
                <p className="text-sm text-gray-500 mt-8">
                  {translator("Date", "दिनांक")}: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
                <p className="text-sm text-gray-500">
                  {translator("Duration", "अवधि")}: {formatDuration(durationInSeconds)}
                </p>
              </div>

              {/* Right Side: Stats */}
              <div className="grid grid-cols-2 gap-3 w-full md:w-auto md:min-w-[280px] md:max-w-xs text-left">
                <div className="bg-gray-50 p-3 rounded-lg shadow-sm">
                  <p className="text-xs text-gray-500">{translator("Total Questions", "कुल प्रश्न")}</p>
                  <p className="text-lg font-bold text-gray-800">{totalQuestions}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg shadow-sm">
                  <p className="text-xs text-gray-500">{translator("Correct Answers", "सही उत्तर")}</p>
                  <p className="text-lg font-bold text-green-600">{correctAnswers}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg shadow-sm">
                  <p className="text-xs text-gray-500">{translator("Accuracy", "सटीकता")}</p>
                  <p className="text-lg font-bold text-gray-800">{accuracy}%</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg shadow-sm">
                  <p className="text-xs text-gray-500">{translator("Status", "स्थिति")}</p>
                  <div className="flex items-center">
                    <p className={`font-semibold text-lg ${statusColor}`}>{status}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Question Breakdown */}
          <div className="bg-white p-6 rounded-lg shadow-md text-black">
            <div className="border-b border-gray-200 pb-4 flex flex-col sm:flex-row justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-3 sm:mb-0">{translator("Question Breakdown", "प्रश्न विश्लेषण")}</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-700 border border-gray-300/80">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100 border-b border-gray-300/80">
                  <tr>
                    <th scope="col" className="px-4 py-3">{translator("Q.No", "प्र.सं.")}</th>
                    <th scope="col" className="px-6 py-3">{translator("Question", "प्रश्न")}</th>
                    <th scope="col" className="px-6 py-3">{translator("Correct Answer", "सही उत्तर")}</th>
                    <th scope="col" className="px-6 py-3">{translator("Your Answer", "आपका उत्तर")}</th>
                    <th scope="col" className="px-4 py-3 text-center">{translator("Score", "स्कोर")}</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((q) => (
                    <tr key={q.qNo} className="bg-white border-b border-gray-300/80 hover:bg-gray-50">
                      <td className="px-4 py-4 font-medium text-gray-900">{q.qNo}</td>
                      <td className="px-6 py-4">{q.question}</td>
                      <td className="px-6 py-4 font-medium">{q.correctAnswer}</td>
                      <td className={`px-6 py-4 font-medium ${q.yourAnswer === q.correctAnswer ? '' : ''}`}>
                        {q.yourAnswer === 'Not Attempted' ? translator('Not Attempted', 'प्रयास नहीं किया') : q.yourAnswer}
                      </td>
                      <td className={`px-4 py-4 text-center font-bold ${q.score === 1 ? 'text-green-600' : 'text-red-600'}`}>
                        {q.score}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Personalized Feedback */}
          <div className="bg-white p-6 rounded-lg shadow-md text-black">
            <div className="flex items-center mb-4">
              <div className="bg-white p-2 rounded-full mr-3">
                <img
                  src="/Margin.svg"
                  alt="AI Mentor Icon"
                  className="h-10 w-10 text-purple-700"
                />
              </div>
              <h4 className="text-xl font-semibold">{translator("Personalized Feedback from AI Mentor", "AI मेंटर से व्यक्तिगत प्रतिक्रिया")}</h4>
            </div>

            {loadingFeedback ? (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            ) : (
              <>
                <p className="text-sm mb-3">
                  <span className="font-semibold">{translator("Feedback", "फीडबैक")}:</span> {aiFeedback.feedbackText.replace('Feedback:\n', translator('', 'प्रतिक्रिया:\n'))}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg flex flex-col sm:flex-row justify-between items-center">
          <div className="text-sm text-gray-600 mb-4 sm:mb-0">
            {translator("Attempts", "प्रयास")}: <span className="font-semibold">{noOfAttempts}</span> |
            {translator("Best Score", "सर्वश्रेष्ठ स्कोर")}: <span className="font-semibold text-gray-600">{bestScore}</span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              className="text-sm text-black-600 hover:text-black-800 font-medium py-2 px-4 rounded-md border border-gray-300 hover:bg-blue-50 flex items-center"
              onClick={handleRetakeQuiz}
            >
              <FiRefreshCw className="mr-2 h-4 w-4" /> {translator("Retake Quiz", "क्विज़ फिर से लें")}
            </button>
            <button
              className="text-sm text-[#7C3AED] bg-white hover:bg-purple-400 border border-[#7C3AED] font-medium py-2 px-4 rounded-md flex items-center"
              onClick={handleShareScore}
            >
              <FiShare2 className="mr-2 h-4 w-4" /> {translator("Share Score", "स्कोर साझा करें")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizReport;