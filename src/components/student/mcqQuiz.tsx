import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

// Translator function
type Translator = (word1: string, word2: string) => string;
const translator: Translator = (word1, word2) =>
    typeof window !== 'undefined' && localStorage.getItem("lang") && localStorage.getItem("lang")!.toLowerCase().includes("english")
        ? word1
        : localStorage.getItem("lang")
            ? word2
            : word1;

interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    qNo: number;
}

interface QuizData {
    topic: string;
    totalQuestions: number;
    totalMarks: number;
    duration: number;
    questions: QuizQuestion[];
}

const MCQQuiz: React.FC = () => {
    // State management
    const [error, setError] = useState<string>('');
    const [isMobile, setIsMobile] = useState<boolean>(false);
    const [quizData, setQuizData] = useState<QuizData | null>(null);
    const [currentQuestion, setCurrentQuestion] = useState<number>(1);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
    const [markedForReview, setMarkedForReview] = useState<Set<number>>(new Set());
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
    const [wbStrId, setWbStrId] = useState<string | null>(null);
    const [topicId, setTopicId] = useState<string | null>(null);
    const [isConfigLoaded, setIsConfigLoaded] = useState<boolean>(false);
    const [user, setUser] = useState<any>(() => {
        if (typeof window !== 'undefined') {
            const data = localStorage.getItem('user-data');
            return data ? JSON.parse(data) : null;
        }
        return null;
    });
    const [isSmallWidth, setisSmallWidth] = useState<boolean>(false);

    const router = useRouter();
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Add state for preference modal
    const [showPreferenceModal, setShowPreferenceModal] = useState<boolean>(true);
    const [selectedQuestionsCount, setSelectedQuestionsCount] = useState<number>(10);
    const [selectedDuration, setSelectedDuration] = useState<string>('');
    const [topicName, setTopicName] = useState<string>('');
    const [selectedHours, setSelectedHours] = useState<number>(0);
    const [selectedMinutes, setSelectedMinutes] = useState<number>(30);
    const [selectedSeconds, setSelectedSeconds] = useState<number>(0);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    // Responsive detection
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < window.innerHeight);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => {
            window.removeEventListener('resize', checkMobile);
        };
    }, []);

    // Handle page reload for landscape mode
    const handleDoneReload = () => {
        window.location.reload();
    };

    useEffect(() => {
        const a = localStorage.getItem("wbStrId2");
        const b = localStorage.getItem("topicId");
        setWbStrId(a);
        setTopicId(b);
        setIsConfigLoaded(true);
    }, []);

    // Initialize quiz data and load from localStorage
    useEffect(() => {
        setShowPreferenceModal(true);
        const savedTopicName = localStorage.getItem('mcq_quiz_topic');
        if (savedTopicName) {
            setTopicName(savedTopicName);
        }
        const savedStartTime = localStorage.getItem('mcq_quiz_start_time');
        if (savedStartTime) {
            const savedAnswers = localStorage.getItem('mcq_quiz_answers');
            const savedMarkedForReview = localStorage.getItem('mcq_quiz_marked_for_review');
            const savedCurrentQuestion = localStorage.getItem('mcq_quiz_current_question');
            if (savedAnswers) {
                try {
                    setSelectedAnswers(JSON.parse(savedAnswers));
                } catch (error) {
                    console.error('Error parsing saved answers:', error);
                }
            }
            if (savedMarkedForReview) {
                try {
                    setMarkedForReview(new Set(JSON.parse(savedMarkedForReview)));
                } catch (error) {
                    console.error('Error parsing marked for review:', error);
                }
            }
            if (savedCurrentQuestion) {
                setCurrentQuestion(parseInt(savedCurrentQuestion, 10));
            }
            setLoading(false);
        } else {
            setLoading(false);
        }
    }, []);

    // Timer countdown - starts after loading is complete AND preference modal is closed
    useEffect(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        if (loading || timeLeft <= 0 || showPreferenceModal) return;
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    setShowSubmitModal(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [loading, showPreferenceModal]);

    // Save state to localStorage whenever it changes (only when quiz is active)
    useEffect(() => {
        if (!showPreferenceModal && quizData) {
            localStorage.setItem('mcq_quiz_answers', JSON.stringify(selectedAnswers));
        }
    }, [selectedAnswers, showPreferenceModal, quizData]);
    useEffect(() => {
        if (!showPreferenceModal && quizData) {
            localStorage.setItem('mcq_quiz_marked_for_review', JSON.stringify([...markedForReview]));
        }
    }, [markedForReview, showPreferenceModal, quizData]);
    useEffect(() => {
        if (!showPreferenceModal && quizData) {
            localStorage.setItem('mcq_quiz_current_question', currentQuestion.toString());
        }
    }, [currentQuestion, showPreferenceModal, quizData]);

    // Cleanup timer on component unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, []);

    // Format time display
    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')} : ${minutes.toString().padStart(2, '0')} : ${secs.toString().padStart(2, '0')}`;
    };

    // Handle answer selection
    const handleAnswerSelect = (questionQNo: number, optionIndex: number) => {
        setSelectedAnswers(prev => ({
            ...prev,
            [questionQNo]: optionIndex
        }));
    };

    // Handle mark for review
    const handleMarkForReview = () => {
        if (!quizData) return;
        const currentQuestionData = quizData.questions.find(q => q.qNo === currentQuestion);
        if (!currentQuestionData) return;
        const questionQNo = currentQuestionData.qNo;
        setMarkedForReview(prev => {
            const newSet = new Set(prev);
            if (newSet.has(questionQNo)) {
                newSet.delete(questionQNo);
            } else {
                newSet.add(questionQNo);
            }
            return newSet;
        });
    };

    // Navigation functions
    const handleSkip = () => {
        if (!quizData) return;
        if (currentQuestion < quizData.totalQuestions) {
            setCurrentQuestion(prev => prev + 1);
        }
    };
    const handleProceed = () => {
        if (!quizData) return;
        if (currentQuestion < quizData.totalQuestions) {
            setCurrentQuestion(prev => prev + 1);
        }
    };
    const handleQuestionNavigation = (questionNumber: number) => {
        if (!quizData) return;
        setCurrentQuestion(questionNumber);
    };

    // Get question status for styling
    const getQuestionStatus = (questionNumber: number) => {
        if (!quizData) return '';
        const questionData = quizData.questions.find(q => q.qNo === questionNumber);
        if (!questionData) return '';
        const questionQNo = questionData.qNo;
        const isAnswered = selectedAnswers.hasOwnProperty(questionQNo);
        const isMarked = markedForReview.has(questionQNo);
        const isCurrent = questionNumber === currentQuestion;
        if (isCurrent) return 'current';
        if (isMarked) return 'marked';
        if (isAnswered) return 'answered';
        return 'unanswered';
    };

    // Calculate attempted questions count
    const getAttemptedCount = () => {
        return Object.keys(selectedAnswers).length;
    };

    // Handle quiz submission
    const handleSubmitQuiz = () => {
        setShowSubmitModal(true);
    };

    const confirmSubmit = async () => {
        if (!quizData) return;
        setIsSubmitting(true);
        const submissionData = {
            answers: selectedAnswers,
            markedForReview: [...markedForReview],
            timeSpent: quizData.duration - timeLeft,
            submittedAt: new Date().toISOString()
        };
        try {
            const submissionBody = {
                wbStrId: wbStrId,
                topicId: topicId,
                answers: selectedAnswers
            };
            const response = await axios.patch(`${process.env.NEXT_PUBLIC_BACKEND_1_SERVER_URL}/videoData/getScore/`, submissionBody);
            if (response.data.success) {
                localStorage.setItem('mcqReportData', JSON.stringify(response.data.data));
                router.push('/quiz-report');
            } else {
                alert(`Quiz submission failed: ${response.data.message || 'Unknown error'}`);
                setIsSubmitting(false);
                throw new Error('API indicated failure');
            }
            localStorage.removeItem('mcq_quiz_answers');
            localStorage.removeItem('mcq_quiz_marked_for_review');
            localStorage.removeItem('mcq_quiz_current_question');
            localStorage.removeItem('mcq_quiz_start_time');
        } catch (error: any) {
            if (error.message !== 'API indicated failure') {
                alert('Failed to submit quiz. Please try again.');
            }
            setIsSubmitting(false);
        }
    };

    // Handle Increment/Decrement for Questions Count
    const handleIncrementQuestions = () => {
        setSelectedQuestionsCount(prev => Math.min(30, prev + 1));
    };
    const handleDecrementQuestions = () => {
        setSelectedQuestionsCount(prev => Math.max(5, prev - 1));
    };

    // API call function
    const fetchQuizQuestions = async (topic: string, count: number, duration: number) => {
        try {
            const response = await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_1_SERVER_URL}/videoData/getQuizData/`, {
                wbStrId: wbStrId,
                topicId: topicId,
                noOfQuestions: count
            });
            if (response.data && response.data.success && response.data.data) {
                const formattedQuestions = (response.data.data.questions ?? []).map((q: any) => ({
                    id: q._id,
                    question: q.question,
                    options: q.options,
                    correctAnswer: q.correctOption,
                    qNo: q.qNo
                }));
                return {
                    topic: topic,
                    totalQuestions: response.data.data.questions.length,
                    totalMarks: response.data.data.questions.length,
                    duration: duration,
                    questions: formattedQuestions
                };
            } else {
                throw new Error(response.data?.message || 'Failed to fetch quiz data or received incorrect data format');
            }
        } catch (error) {
            throw error;
        }
    };

    // Handle Start Quiz button click
    const handleStartQuiz = async () => {
        const totalDurationInSeconds = (selectedHours * 3600) + (selectedMinutes * 60) + selectedSeconds;
        localStorage.setItem("mcq_quiz_duration_for_result", totalDurationInSeconds.toString());
        if (!topicName || selectedQuestionsCount <= 0 || totalDurationInSeconds <= 0) {
            alert("Please select quiz preferences (topic, number of questions, and duration).");
            return;
        }
        setLoading(true);
        setShowPreferenceModal(false);
        localStorage.removeItem('mcq_quiz_answers');
        localStorage.removeItem('mcq_quiz_marked_for_review');
        localStorage.removeItem('mcq_quiz_current_question');
        localStorage.removeItem('mcq_quiz_start_time');
        let attempt = 0;
        let fetchedQuizData = null;
        while (attempt < 2) {
            try {
                attempt += 1;
                const response = await fetchQuizQuestions(topicName, selectedQuestionsCount, totalDurationInSeconds);
                if (!response || !Array.isArray(response.questions) || typeof response.duration !== 'number') {
                    throw new Error("Invalid quiz data format.");
                }
                fetchedQuizData = response;
                break;
            } catch (error: any) {
                let errorMessage = "Failed to load quiz data";
                if (attempt >= 2) {
                    if (error.response && error.response.data && error.response.data.message) {
                        errorMessage = error.response.data.message;
                    }
                    setError(errorMessage);
                    setQuizData(null);
                    setTimeLeft(0);
                    setLoading(false);
                    setShowPreferenceModal(true);
                    return;
                }
            }
        }
        if (fetchedQuizData) {
            setQuizData(fetchedQuizData);
            setTimeLeft(fetchedQuizData.duration);
            localStorage.setItem('mcq_quiz_start_time', Date.now().toString());
            setCurrentQuestion(1);
            setSelectedAnswers({});
            setMarkedForReview(new Set());
        }
        setLoading(false);
    };



    if (loading) {
        return (
            <div className="min-h-screen bg-[#F9FDFF] flex items-center justify-center">
                <div className='flex flex-col items-center gap-4'>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3A1078]"></div>
                    <p className="text-xl text-[#3A1078] font-medium font-poppins">
                        {translator("Please wait while your quiz is being generated.", "कृपया प्रतीक्षा करें जबकि आपका क्विज़ तैयार किया जा रहा है।")}
                    </p>
                    <p className="text-xl text-[#ce4646] font-medium font-poppins">
                        {translator("Do not refresh or press back button. Redirecting from this page will erase your quiz progress.", "रीफ्रेश न करें या बैक बटन न दबाएँ। इस पृष्ठ से पुनर्निर्देशित करने से आपकी क्विज़ प्रगति मिट जाएगी।")}
                    </p>
                </div>
            </div>
        );
    }

    // Mobile landscape orientation check - show this for mobile portrait mode regardless of other states
    // if (isMobile && !loading) {
    //     return (
    //         <div className="min-h-screen bg-[#F9FDFF] flex items-center justify-center p-6">
    //             <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-lg text-center">
    //                 <div className="mb-6">
    //                     <div className="text-6xl mb-4 flex text-center justify-center">
    //                         <img src="/rotate_phone.gif" alt="rotate phone" />
    //                     </div>
    //                     <h2 className="text-2xl font-bold text-[#3A1078] mb-4 font-poppins">
    //                         Rotate Your Device
    //                     </h2>
    //                     <p className="text-lg text-gray-700 mb-6 font-poppins">
    //                         To continue to give exam please rotate your device or make it landscape mode
    //                     </p>
    //                 </div>
    //                 {/* <button
    //                     onClick={handleDoneReload}
    //                     className="w-full py-3 bg-gradient-to-r from-[#9825FF] to-[#2F36FF] text-white rounded-lg font-bold text-lg font-poppins hover:from-[#5A2083] hover:to-[#9034EF] transition-colors shadow-md"
    //                 >
    //                     Done
    //                 </button> */}
    //             </div>
    //         </div>
    //     );
    // }

    // Render preference modal if visible
    if (showPreferenceModal) {
        return (
            <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-4 sm:p-8 w-full max-w-[95vw] sm:w-[550px] mx-2 sm:mx-4 shadow-lg">
                    <div >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl sm:text-2xl font-bold text-[#3A1078] font-poppins">{translator("Select Your Preference", "अपनी पसंद चुनें")}</h3>
                            {/* Add a close button if needed */}
                            <button onClick={() => {
                                // setShowPreferenceModal(false);
                                router.push('/structured-breakdown');
                            }} className="text-gray-500 hover:text-gray-700 text-2xl font-bold">&times;</button>
                        </div>
                    </div>
                    <div className="space-y-4 sm:space-y-6">
                        <div>
                            <label className="block text-base sm:text-lg font-medium text-gray-700 mb-2 font-poppins">{translator("Topic Name", "विषय का नाम")}</label>
                            <input
                                type="text"
                                value={topicName}
                                readOnly // Topic name is not editable
                                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 font-jost text-base sm:text-lg"
                                placeholder={translator("Topic Name (Fixed Fetched from Backend)", "विषय का नाम (बैकएंड से प्राप्त)")}
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                            <div>
                                <label className="block text-base sm:text-lg font-medium text-gray-700 mb-2 font-poppins">{translator("Select No of Questions", "प्रश्नों की संख्या चुनें")}</label>
                                <div className="w-full sm:w-48 flex items-center justify-between border border-gray-300 rounded-lg">
                                    <button
                                        onClick={handleDecrementQuestions}
                                        className="w-1/3 px-4 sm:px-6 py-2 border-r border-gray-300 text-gray-700 rounded-l-lg hover:bg-gray-200 font-bold text-xl"
                                    >
                                        -
                                    </button>
                                    <input
                                        type="text"
                                        value={selectedQuestionsCount}
                                        readOnly
                                        className="w-1/3 text-center border-gray-300 py-2 text-base sm:text-lg font-jost"
                                    />
                                    <button
                                        onClick={handleIncrementQuestions}
                                        className="w-1/3 px-4 sm:px-6 py-2 border-l border-gray-300 text-gray-700 rounded-r-lg hover:bg-gray-200 font-bold text-xl"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-base sm:text-lg font-medium text-gray-700 mb-2 font-poppins">{translator("Choose Time", "समय चुनें")}</label>
                                <div className="flex items-center gap-2 mr-2">
                                    <div className="flex items-center space-x-2">
                                        {/* Minutes Input */}
                                        <div className="flex items-center space-x-1">
                                            <input
                                                type="number"
                                                value={selectedMinutes}
                                                onChange={(e) => setSelectedMinutes(parseInt(e.target.value) || 0)}
                                                className="w-12 sm:w-16 px-2 py-2 border border-gray-300 rounded-lg text-center text-base sm:text-lg font-jost"
                                                placeholder="MM"
                                                min="0"
                                                max="59"
                                            />
                                            <span className="text-base sm:text-lg font-normal">{translator("m", "मि")}</span>
                                        </div>
                                        {/* Seconds Input */}
                                        <div className="flex items-center space-x-1">
                                            <input
                                                type="number"
                                                value={selectedSeconds}
                                                onChange={(e) => setSelectedSeconds(parseInt(e.target.value) || 0)}
                                                className="w-12 sm:w-16 px-2 py-2 border border-gray-300 rounded-lg text-center text-base sm:text-lg font-jost"
                                                placeholder="SS"
                                                min="0"
                                                max="59"
                                            />
                                            <span className="text-base sm:text-lg font-normal">{translator("s", "से")}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleStartQuiz}
                            disabled={!isConfigLoaded || !topicName || selectedQuestionsCount <= 0 || ((selectedHours * 3600) + (selectedMinutes * 60) + (selectedSeconds)) <= 0}
                            className={`w-full py-3 sm:py-4 bg-gradient-to-r from-[#9825FF] to-[#2F36FF] text-white rounded-lg font-bold text-base sm:text-lg font-poppins transition-colors shadow-md
                                ${!isConfigLoaded || !topicName || selectedQuestionsCount <= 0 || ((selectedHours * 3600) + (selectedMinutes * 60) + (selectedSeconds)) <= 0 ? 'opacity-50 cursor-not-allowed' : 'hover:from-[#5A2083] hover:to-[#9034EF]'}`}
                        >
                            {translator("Start Quiz", "क्विज़ शुरू करें")}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Don't render main quiz interface if quizData is not available
    if (!quizData) {
        return (
            <div className="min-h-screen bg-[#F9FDFF] flex items-center justify-center">
                <div className='flex flex-col items-center gap-4'>
                    <p className="text-xl text-[#3A1078] font-medium font-poppins">
                        {translator("No quiz data available. Please try again.", "कोई क्विज़ डेटा उपलब्ध नहीं है। कृपया पुनः प्रयास करें।")}
                    </p>
                </div>
            </div>
        );
    }

    const currentQuestionData = quizData.questions[currentQuestion - 1];

    return (
        <div className="min-h-screen bg-[#F9FDFF] p-2 sm:p-6 overflow-x-hidden">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-4 sm:mb-8 px-2">
                    <h1 className="text-lg sm:text-2xl font-medium text-[#3A1078] mt-2 sm:mt-6 mb-2 sm:mb-4 font-poppins">
                        {translator("Topic:", "विषय:")} {quizData.topic}
                    </h1>
                    <p className="text-xs sm:text-base text-[#3A1078] font-medium font-poppins">
                        {translator("Choose the correct option, and submit your quiz after reviewing all questions.", "सही विकल्प चुनें, और सभी प्रश्नों की समीक्षा के बाद अपना क्विज़ सबमिट करें।")}
                    </p>
                    <p className="text-xs text-[#c44b4b] font-medium font-poppins">
                        {translator("⚠ Note: Refreshing this page will erase your quiz progress.", "⚠ नोट: इस पृष्ठ को रीफ्रेश करने से आपकी क्विज़ प्रगति मिट जाएगी।")}
                    </p>
                </div>

                {/* Main Quiz Interface */}
                <div className="flex flex-col lg:flex-row gap-2 sm:gap-8 mt-2 sm:mt-8">
                    {/* Left Section - Question Display */}
                    <div className="flex-1 w-full mb-4 lg:mb-0">
                        <div className='block sm:hidden'>
                            <div className="flex flex-col text-center gap-2">
                                <div className='text-base sm:text-xl font-bold text-[#3A1078] mb-2 font-jost'>{translator("Name :", "नाम :")} {user?.firstName}</div>
                            </div>
                            {/* Timer */}
                            <div className="flex justify-center gap-2 text-center mb-2">
                                <h3 className="text-xs sm:text-xl font-bold text-black mb-1 font-jost flex items-center justify-center">{translator("Time Left", "समय बचा है")}</h3>
                                <div className={`text-lg sm:text-4xl font-extrabold font-jost ${timeLeft <= 60 ? 'text-red-600' : timeLeft <= 120 ? 'text-yellow-600' : 'text-[#08A064]'}`}>
                                    {formatTime(timeLeft)}
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl sm:rounded-[38px] shadow-lg overflow-hidden">
                            {/* Question Header */}
                            <div className="bg-[#4C60A5] text-white px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
                                <h2 className="text-xl sm:text-3xl font-medium font-poppins">{translator("Question", "प्रश्न")} {currentQuestion}</h2>
                                <span className="text-base sm:text-lg font-medium font-poppins">{currentQuestion}/{quizData.totalQuestions}</span>
                            </div>

                            {/* Question Content */}
                            <div className="px-4 sm:px-8 pt-6 sm:pt-8">
                                <h3 className="text-lg sm:text-2xl font-medium text-black mb-2 sm:mb-8 font-advent-pro">
                                    {currentQuestionData.question}
                                </h3>

                                {/* Options */}
                                <div className="space-y-1 sm:space-y-4">
                                    {currentQuestionData.options.map((option, index) => {
                                        const isSelected = selectedAnswers[currentQuestionData.qNo] === index;
                                        return (
                                            <button
                                                key={index}
                                                onClick={() => handleAnswerSelect(currentQuestionData.qNo, index)}
                                                className={`flex items-center gap-4 w-full text-left py-2 px-2 rounded-lg transition-colors ${isSelected ? 'bg-blue-50' : ''}`}
                                                type="button"
                                            >
                                                <div className="relative">
                                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-black' : 'border-gray-400'}`}> {/* border-2 for consistency */}
                                                        {isSelected && (
                                                            <div className="w-3.5 h-3.5 bg-[#4182F9] rounded-full"></div>
                                                        )}
                                                    </div>
                                                </div>
                                                <span className="text-base sm:text-xl font-medium text-black font-advent-pro hover:text-[#4182F9]">{option}</span>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Navigation Buttons */}
                                <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-4 mt-8 sm:mt-16">
                                    <button
                                        onClick={handleSkip}
                                        className="px-6 sm:px-8 py-2 sm:py-3 bg-[#342499] text-white rounded-lg font-bold text-sm sm:text-base font-poppins hover:bg-[#2A1A7A] transition-colors"
                                    >
                                        {translator("Skip", "छोड़ें")}
                                    </button>
                                    <div className='flex gap-2 justify-between sm:gap-4'>
                                        <button
                                            onClick={handleMarkForReview}
                                            className={`px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-bold text-sm sm:text-base font-poppins transition-colors ${markedForReview.has(currentQuestionData.qNo)
                                                ? 'bg-[#D4A017] text-white hover:bg-[#B8900F]'
                                                : 'bg-[#AE7A01] text-white hover:bg-[#8B6001]'
                                                }`}
                                        >
                                            {markedForReview.has(currentQuestionData.qNo) ? translator('Unmark Review', 'समीक्षा हटाएँ') : translator('Mark For Review', 'समीक्षा के लिए चिह्नित करें')}
                                        </button>
                                        <button
                                            onClick={handleProceed}
                                            disabled={currentQuestion >= quizData.totalQuestions}
                                            className="px-6 sm:px-8 py-2 sm:py-3 bg-[#217C58] text-white rounded-lg font-bold text-sm sm:text-base font-poppins hover:bg-[#1A6347] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {translator("Proceed", "आगे बढ़ें")}
                                        </button>
                                    </div>
                                </div>


                            </div>
                            {/* Bottom Info */}
                            <div className='bg-[#4C60A5] w-full pb-2 sm:pb-4'>
                                <div className="flex flex-col sm:flex-row justify-between mt-4 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
                                    <span className="text-base sm:text-xl font-normal text-white bg-[#4C60A5] px-2 sm:px-4 py-1 sm:py-2 rounded font-jost">
                                        {translator("Total Number Of Questions:", "कुल प्रश्न:")} {quizData.totalQuestions}
                                    </span>
                                    <span className="text-base sm:text-xl font-normal text-white bg-[#4C60A5] px-2 sm:px-4 py-1 sm:py-2 rounded font-jost">
                                        {translator("Total Marks:", "कुल अंक:")} {quizData.totalMarks}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Section - Timer and Navigation */}
                    <div className="w-full lg:w-90">
                        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 space-y-4 sm:space-y-6 border-2 border-gray-200">
                            <div className='hidden sm:block'>
                                <div className="flex flex-col text-center gap-2">
                                    <div className='text-base sm:text-xl font-bold text-[#3A1078] mb-2 font-jost'>{translator("Name :", "नाम :")} {user?.firstName}</div>
                                </div>
                                {/* Timer */}
                                <div className="text-center mb-2">
                                    <h3 className="text-xs sm:text-xl font-bold text-black mb-1 font-jost">{translator("Time Left", "समय बचा है")}</h3>
                                    <div className={`text-lg sm:text-4xl font-extrabold font-jost ${timeLeft <= 60 ? 'text-red-600' : timeLeft <= 120 ? 'text-yellow-600' : 'text-[#08A064]'}`}>
                                        {formatTime(timeLeft)}
                                    </div>
                                </div>
                            </div>

                            {/* Attempted Count */}
                            <div className="text-center">
                                <p className="text-base sm:text-xl font-semibold text-black font-poppins">
                                    {translator("Attempted:", "प्रयास किए गए:")} {getAttemptedCount()}/{quizData.totalQuestions}
                                </p>
                            </div>

                            {/* Question Navigation Grid */}
                            <div className="h-16 sm:h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
                                <div className="space-y-2 sm:space-y-3 pr-1 sm:pr-2">
                                    {Array.from({ length: Math.ceil(quizData.totalQuestions / 6) }, (_, rowIndex) => (
                                        <div key={rowIndex} className="flex justify-center gap-1 sm:gap-2">
                                            {Array.from({ length: 6 }, (_, colIndex) => {
                                                const questionNumber = rowIndex * 6 + colIndex + 1;
                                                if (questionNumber > quizData.totalQuestions) return null;

                                                const status = getQuestionStatus(questionNumber);
                                                const getButtonStyle = () => {
                                                    switch (status) {
                                                        case 'current':
                                                            return 'bg-[#4D8BD7] text-white'; //  for current
                                                        case 'answered':
                                                            return 'bg-[#217C58] text-white'; // Green for answered
                                                        case 'marked':
                                                            return 'bg-[#AE7A01] text-white'; // Orange for marked
                                                        default:
                                                            return 'bg-[#5C5C5D] text-white'; // Gray for unanswered
                                                    }
                                                };

                                                return (
                                                    <button
                                                        key={questionNumber}
                                                        onClick={() => handleQuestionNavigation(questionNumber)}
                                                        className={`w-7 h-7 sm:w-12 sm:h-12 rounded-lg font-normal text-xs sm:text-xl font-prompt ${getButtonStyle()} hover:opacity-80 transition-opacity shadow-md`}
                                                    >
                                                        {questionNumber}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                onClick={handleSubmitQuiz}
                                className="w-full py-2 sm:py-4 bg-[#005FD0] text-white rounded-lg font-medium text-sm sm:text-lg font-afacad hover:bg-[#004BB0] transition-colors shadow-md"
                            >
                                {translator("Confirm and Submit", "पुष्टि करें और सबमिट करें")}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Submit Confirmation Modal */}
                {showSubmitModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-4 sm:p-8 max-w-md w-full mx-2 sm:mx-4">
                            <h3 className="text-lg sm:text-xl font-bold text-[#3A1078] mb-2 sm:mb-4">{translator("Confirm Submission", "सबमिशन की पुष्टि करें")}</h3>
                            <p className="text-gray-600 mb-4 sm:mb-6">
                                {translator("Are you sure you want to submit your quiz? You have answered", "क्या आप वाकई अपना क्विज़ सबमिट करना चाहते हैं? आपने उत्तर दिए हैं")} {getAttemptedCount()} {translator("out of", "में से")} {quizData.totalQuestions} {translator("questions.", "प्रश्न।")}
                            </p>
                            <div className="flex gap-2 sm:gap-4">
                                <button
                                    onClick={() => setShowSubmitModal(false)}
                                    className="flex-1 px-2 sm:px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                                >
                                    {translator("Cancel", "रद्द करें")}
                                </button>
                                <button
                                    onClick={confirmSubmit}
                                    className="flex-1 px-2 sm:px-4 py-2 bg-[#005FD0] text-white rounded-lg hover:bg-[#004BB0] transition-colors"
                                >
                                    {translator("Submit Quiz", "क्विज़ सबमिट करें")}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Submitting Overlay */}
                {isSubmitting && (
                    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black bg-opacity-70">
                        <div className="bg-white rounded-lg p-8 shadow-lg flex flex-col items-center">
                            <span className="text-lg sm:text-2xl font-bold text-[#3A1078] mb-4 text-center">{translator("AI is processing your request. This may take a moment — we appreciate your patience.", "AI आपके अनुरोध पर कार्य कर रहा है। इसमें कुछ क्षण लग सकते हैं — आपकी धैर्यता के लिए धन्यवाद।")}</span>
                            < div className="mt-6 animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid" ></div>
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
};

export default MCQQuiz;