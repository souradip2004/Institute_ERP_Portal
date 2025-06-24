import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { IoMdClose } from 'react-icons/io';
import { IoSend } from 'react-icons/io5';
import { MdDownloadForOffline } from 'react-icons/md';
import { RiChatDeleteFill } from 'react-icons/ri';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import { delay } from 'framer-motion';

interface LessonData {
    day: string;
    date: string;
    courseTitle: string;
    lessonTitle: string;
    videoUrl: string;
}

interface NotesData {
    keyConcepts: string[];
    summary: string;
}

interface ChatMessage {
    id: number;
    type: 'user' | 'assistant';
    content: string;
}

const VideoSection = () => {
    const [userId, setUserId] = useState<any>(() => {
        if (typeof window !== 'undefined') {
            const data = localStorage.getItem('user');
            return data ? JSON.parse(data).studentId : null;
        }
        return null;
    });
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'transcript' | 'resources'>('transcript');
    const [isMarkedDone, setIsMarkedDone] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isTranscriptLoading, setIsTranscriptLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isMessageLoading, setIsMessageLoading] = useState(false);
    const [wbStrId, setWbStrId] = useState<string | null>(null);
    const [topicId, setTopicId] = useState<string | null>(null);
    const [videoDuration, setVideoDuration] = useState<string>('medium');
    const [videoList, setVideoList] = useState<any[]>([]);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const [alertMessage1, setAlertMessage1] = useState('Insufficient Balance! ');
    const [alertMessage2, setAlertMessage2] = useState('Cannot Perform This Action Now.');
    const [lessonData, setLessonData] = useState<LessonData>({
        day: 'Day 1',
        date: '5/6/2023',
        courseTitle: 'Introduction to Quantum Mechanics',
        lessonTitle: 'Lesson 3: Wave-Particle Duality',
        videoUrl: '#',
    });
    const [notesData, setNotesData] = useState<NotesData>({
        keyConcepts: [],
        summary: '',
    });
    const [transcript, setTranscript] = useState('');
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('videoSectionChatMessages');
            return saved ? JSON.parse(saved) : [
                {
                    id: 1,
                    type: 'assistant',
                    content:
                        "Hello! I'm your learning assistant! I can help you with questions, answer your questions, or provide examples. Just ask me!",
                },
            ];
        }
        return [];
    });
    const [newMessage, setNewMessage] = useState('');
    const [showInsufficientBalanceAlert, setShowInsufficientBalanceAlert] = useState(false);

    const getDataFromLocalStorage = (wbStrId: string | null, topicId: string | null, videoDuration: string | null) => {
        setWbStrId(wbStrId);
        setTopicId(topicId);
        setVideoDuration(videoDuration || 'medium');
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            console.log('wbStrId from local storage :', localStorage.getItem('wbStrId'));
            console.log('topicId from local storage :', localStorage.getItem('topicId'));
            getDataFromLocalStorage(
                localStorage.getItem('wbStrId'),
                localStorage.getItem('topicId'),
                localStorage.getItem('videoDuration')
            );
        }
    }, []);

    useEffect(() => {
        console.log('chat---', chatMessages);
    }, [chatMessages]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('videoSectionChatMessages', JSON.stringify(chatMessages));
            console.log('chatMessages from local storage :', localStorage.getItem('videoSectionChatMessages'));
        }
    }, [chatMessages]);

    const downloadChatAsPDF = () => {
        const doc = new jsPDF({ unit: 'pt' });
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 32;
        const topDocMargin = 32;
        let yPosition = 60;
        const contentMaxWidth = pageWidth - 2 * margin;
        const now = new Date();
        const downloadDateTime =
            now.toLocaleDateString('en-GB') +
            ' ' +
            now.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            });
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text(`${lessonData.lessonTitle}`, margin, 25);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        const logoWidth = 112;
        const logoHeight = 30;
        const logoX = pageWidth - margin - logoWidth;
        // doc.addImage(logoBase64, 'PNG', logoX, topDocMargin - 20, logoWidth, logoHeight);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(` ${downloadDateTime}`, margin, 45);
        yPosition = 60;
        const chatFontSize = 10;
        const originalChatLineHeight = chatFontSize * 3;
        const splitTextIntoLines = (text: string, maxWidthForSplit: number) => {
            return doc.splitTextToSize(text, maxWidthForSplit);
        };
        const messagesToDisplay = chatMessages.filter((message, index) => {
            return index !== 0 && message.content && message.content.trim() !== '';
        });
        const boxPadding = 8;
        const textLineHeightInBox = chatFontSize * 2;
        for (let i = 0; i < messagesToDisplay.length; i++) {
            let message = messagesToDisplay[i];
            let nextMessage = i + 1 < messagesToDisplay.length ? messagesToDisplay[i + 1] : null;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(chatFontSize);
            if (message.type === 'user' && nextMessage && nextMessage.type === 'assistant') {
                const prefixUser = 'Me : ';
                const userContent = prefixUser + message.content;
                const userLines = splitTextIntoLines(userContent, contentMaxWidth - 2 * boxPadding);
                const prefixAI = 'AI : ';
                const aiContent = prefixAI + nextMessage.content;
                const aiLines = splitTextIntoLines(aiContent, contentMaxWidth - 2 * boxPadding);
                const userTextHeight = userLines.length * textLineHeightInBox;
                const aiTextHeight = aiLines.length * textLineHeightInBox;
                let spaceBetweenUserAndAIInBox = 0;
                if (userLines.length > 0 && aiLines.length > 0) {
                    spaceBetweenUserAndAIInBox = textLineHeightInBox * 0.6;
                }
                const contentHeightInBox = userTextHeight + spaceBetweenUserAndAIInBox + aiTextHeight;
                const boxHeight = contentHeightInBox + 3 * boxPadding;
                if (yPosition + boxHeight > doc.internal.pageSize.getHeight() - topDocMargin) {
                    doc.addPage();
                    yPosition = topDocMargin;
                }
                doc.setDrawColor(200, 200, 200);
                doc.setFillColor(248, 248, 248);
                doc.rect(margin, yPosition, contentMaxWidth, boxHeight, 'FD');
                let yTextInBox = yPosition + boxPadding + chatFontSize;
                userLines.forEach((line) => {
                    doc.text(line, margin + boxPadding, yTextInBox);
                    yTextInBox += textLineHeightInBox;
                });
                if (userLines.length > 0 && aiLines.length > 0) {
                    yTextInBox += spaceBetweenUserAndAIInBox;
                }
                aiLines.forEach((line) => {
                    doc.text(line, margin + boxPadding, yTextInBox);
                    yTextInBox += textLineHeightInBox;
                });
                yPosition += boxHeight + textLineHeightInBox * 0.75;
                i++;
            } else {
                const prefix = message.type === 'user' ? 'Me : ' : 'AI : ';
                const fullTextMessage = prefix + message.content;
                const textLines = splitTextIntoLines(fullTextMessage, contentMaxWidth);
                const originalBlockEstimatedHeight = textLines.length * originalChatLineHeight;
                const originalGapAfterAiMessage = message.type === 'assistant' && i + 1 < messagesToDisplay.length ? originalChatLineHeight : 0;
                const originalTotalSpaceNeededForBlock = originalBlockEstimatedHeight + originalGapAfterAiMessage;
                if (
                    textLines.length > 0 &&
                    yPosition + originalTotalSpaceNeededForBlock > doc.internal.pageSize.getHeight() - topDocMargin &&
                    yPosition !== topDocMargin
                ) {
                    doc.addPage();
                    yPosition = topDocMargin;
                }
                textLines.forEach((line) => {
                    if (
                        yPosition + originalChatLineHeight > doc.internal.pageSize.getHeight() - topDocMargin &&
                        yPosition !== topDocMargin
                    ) {
                        doc.addPage();
                        yPosition = topDocMargin;
                    }
                    doc.text(line, margin, yPosition);
                    yPosition += originalChatLineHeight;
                });
                if (message.type === 'assistant' && i + 1 < messagesToDisplay.length) {
                    yPosition += originalChatLineHeight;
                }
            }
        }
        doc.save(`chat_export_${now.toISOString().split('T')[0]}.pdf`);
    };

    const fetchSummary = async () => {
        if (!lessonData.videoUrl) return;
        setIsTranscriptLoading(true);
        console.log('Fetching summary for...', lessonData.videoUrl);
        await delay(2000);
        const url = `${process.env.NEXT_PUBLIC_BACKEND_1_SERVER_URL}/notesAndImages/getTranscript/`;
        try {
            const response = await axios.put(url, {
                videoURL: lessonData.videoUrl,
            });
            console.log('responce---', response);
            console.log('Fetching transcription for video:', lessonData.videoUrl);
            setTranscript(response.data.data.Transcription_Data || 'No transcript available.');
            console.log('Transcription response:', response.data);
        } catch (error: any) {
            console.error('Error fetching transcript:', error);
            setTranscript('Unable to load transcript. Please try again later.');
        } finally {
            setIsTranscriptLoading(false);
        }
    };

    useEffect(() => {
        const fetchYoutubeData = async () => {
            setIsLoading(true);
            setError(null);
            if (!wbStrId || !topicId || !videoDuration) {
                setIsLoading(false);
                return;
            }

            const url = `${process.env.NEXT_PUBLIC_BACKEND_1_SERVER_URL}/videoData/generateVideoLink/${wbStrId}/${topicId}/medium`;
            console.log('Fetching Youtube Data from:', url);
            try {
                const response = await axios.get(url);
                console.log('Youtube Data:', response.data);
                if (response.data?.data?.videoList?.length > 0) {
                    const videos = response.data.data.videoList;
                    setVideoList(videos);
                    const firstVideo = videos[0];
                    setCurrentVideoIndex(0);
                    setLessonData((prev) => ({
                        ...prev,
                        videoUrl: firstVideo.videoURL,
                        courseTitle: response.data.data.topicName,
                        lessonTitle: response.data.data.topicName,
                        date: response.data.data.date,
                    }));
                    setNotesData((prev) => ({
                        ...prev,
                        summary: firstVideo.description,
                    }));
                } else {
                    setError('No videos available for this lesson.');
                }
            } catch (error: any) {
                console.error('Error fetching data:', error);
                const errorMessage =
                    error.response?.data?.message ||
                    error.message ||
                    'Failed to fetch video data. Please try again later.';
                setError(errorMessage);
            } finally {
                setIsLoading(false);
            }
        };
        fetchYoutubeData();
    }, [wbStrId, topicId, videoDuration]);

    useEffect(() => {
        const updateTranscript = async () => {
            if (!lessonData.videoUrl) return;
            await fetchSummary();
        };
        updateTranscript();
    }, [lessonData.videoUrl]);

    const handleVideoSwitch = async (index: number) => {
        if (index >= 0 && index < videoList.length && index !== currentVideoIndex) {
            const selectedVideo = videoList[index];
            setCurrentVideoIndex(index);
            setLessonData((prev) => ({
                ...prev,
                videoUrl: selectedVideo.videoURL,
                courseTitle: selectedVideo.title,
                lessonTitle: selectedVideo.title,
            }));
            setNotesData((prev) => ({
                ...prev,
                summary: selectedVideo.description,
            }));
            setTranscript('');
        }
    };

    const handleSendMessage = async () => {
        /*try {
            const url = `${process.env.NEXT_PUBLIC_BACKEND_1_SERVER_URL}/coins/${userId}`;
            const response = await axios.get(url);
            console.log('response coin get---', response);
            const freeCoins = response.data.data.freeCoins;
            const premiumCoins = response.data.data.premiumCoins;
            const planType = response.data.data.planType;
            console.log('planType , freeCoins, premiumCoins ---', planType, freeCoins, premiumCoins);
            if (planType === 'freemium') {
                const currentDate = new Date().toISOString().split('T')[0];
                const storedChatData = localStorage.getItem('doubtChatData');
                let chatData = { date: currentDate, count: 0 };
                if (storedChatData) {
                    try {
                        chatData = JSON.parse(storedChatData);
                    } catch (error) {
                        console.error('Error parsing stored chat data:', error);
                        chatData = { date: currentDate, count: 0 };
                    }
                }
                if (chatData.date !== currentDate) {
                    chatData = { date: currentDate, count: 0 };
                }
                if (chatData.count >= 25) {
                    console.log('Daily chat limit exceeded for freemium user');
                    setAlertMessage1('Daily Chat Limit Exceeded!');
                    setAlertMessage2('Cannot Perform This Action Now.');
                    setShowInsufficientBalanceAlert(true);
                    return;
                }
                chatData.count += 1;
                localStorage.setItem('doubtChatData', JSON.stringify(chatData));
                localStorage.setItem('doubtChatcounter', chatData.count.toString());
                try {
                    await axios.patch(`${process.env.NEXT_PUBLIC_BACKEND_1_SERVER_URL}/coins/decrementFreeCoins`, {
                        userId: userId,
                        noOfCoins: 0.08,
                    });
                } catch (error) {
                    setAlertMessage1('Insufficient Balance!');
                    setAlertMessage2('Cannot Perform This Action Now.');
                    setShowInsufficientBalanceAlert(true);
                    return;
                }
            } else {
                try {
                    await axios.patch(`${process.env.NEXT_PUBLIC_BACKEND_1_SERVER_URL}/coins/decrementFreeCoins`, {
                        userId: userId,
                        noOfCoins: 0.08,
                    });
                } catch (error) {
                    try {
                        await axios.patch(`${process.env.NEXT_PUBLIC_BACKEND_1_SERVER_URL}/coins/decrementPremiumCoins`, {
                            userId: userId,
                            noOfCoins: 0.08,
                        });
                    } catch (error) {
                        setAlertMessage1('Insufficient Balance!');
                        setAlertMessage2('Cannot Perform This Action Now.');
                        setShowInsufficientBalanceAlert(true);
                        return;
                    }
                }
            }
        } catch (error) {
            console.log('4');
            console.log(error);
        }*/

        if (newMessage.trim()) {
            const newUserMessage: ChatMessage = {
                id: chatMessages.length + 1,
                type: 'user',
                content: newMessage,
            };
            const updatedMessages = [...chatMessages, newUserMessage];
            setChatMessages(updatedMessages);
            setNewMessage('');
            setIsMessageLoading(true);
            try {
                const messagesForApi = [
                    {
                        role: 'system',
                        content: `You are a kind and supportive academic counselor for students.\n\nYour role:\n- Listen with empathy and validate emotions.\n- Give clear, caring, and helpful responses.\n- Use a friendly and conversational tone, not robotic or formal.\n- Comfort stressed students and guide confused ones.\n- If unsure what they mean, ask a kind follow-up.\n- Always reply in not more than 50 words.\n- Only when asked "Who are you?", reply: "I'm an AI assistant developed by RnPsoft Private Limited to help students academically and emotionally."\n- Never mention OpenAI, ChatGPT, or any other AI provider.\n\nCurrent lesson: ${lessonData?.courseTitle || 'N/A'} - ${lessonData?.lessonTitle || 'N/A'}\nKey concepts: ${notesData?.keyConcepts?.join(', ') || 'Not specified'}`,
                    },
                    ...updatedMessages.map((msg) => ({
                        role: msg.type === 'user' ? 'user' : 'assistant',
                        content: msg.content,
                    })),
                ];
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
                    },
                    body: JSON.stringify({
                        model: 'gpt-3.5-turbo',
                        messages: messagesForApi,
                        temperature: 0.7,
                    }),
                });
                const data = await response.json();
                if (data.choices && data.choices[0].message) {
                    const assistantMessage: ChatMessage = {
                        id: updatedMessages.length + 1,
                        type: 'assistant',
                        content: data.choices[0].message.content,
                    };
                    setChatMessages([...updatedMessages, assistantMessage]);
                }
            } catch (error: any) {
                console.error('Error:', error);
                if (
                    error.response?.status === 402 ||
                    error.message?.includes('insufficient') ||
                    error.message?.includes('quota')
                ) {
                    setShowInsufficientBalanceAlert(true);
                } else {
                    const errorMessage: ChatMessage = {
                        id: updatedMessages.length + 1,
                        type: 'assistant',
                        content: "Sorry, I'm having trouble responding right now. Please try again later.",
                    };
                    setChatMessages([...updatedMessages, errorMessage]);
                }
            } finally {
                setIsMessageLoading(false);
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    const handleCloseInsufficientBalanceAlert = () => {
        setShowInsufficientBalanceAlert(false);
    };

    const handleBuyPlan = () => {
        console.log('Redirecting to buy plan...');
        router.push('/pricing');
        setShowInsufficientBalanceAlert(false);
    };

    const handleMarkAsDone = async () => {
        const newStatus = !isMarkedDone;
        setIsMarkedDone(newStatus);
        try {
            await fetch('/api/lesson/status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ isMarkedDone: newStatus }),
            });
        } catch (err) {
            console.error('Error updating lesson status:', err);
        }
    };

    const deleteChat = () => {
        setChatMessages([]);
        setIsMessageLoading(true);
        setTimeout(() => {
            setChatMessages([
                {
                    id: 1,
                    type: 'assistant',
                    content:
                        "Hello! I'm your learning assistant! I can help you with questions, answer your questions, or provide examples. Just ask me!",
                },
            ]);
            setIsMessageLoading(false);
        }, 1000);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                <div className="text-xl text-gray-600">Loading lesson data...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex flex-col items-center justify-center text-center">
                            <div className="text-red-500 text-5xl mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Content</h3>
                            <p className="text-gray-600 mb-6">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const translator = (word1: string, word2: string) => {
        if (typeof window !== 'undefined') {
            const lang = localStorage.getItem('lang');
            if (lang && lang.toLowerCase().includes('english')) return word1;
            if (lang) return word2;
        }
        return word1;
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/*header*/}
            <div className="max-w-7xl mx-auto mb-4">
                <div className="p-4 border-b- border-gray-200">
                    <div className="flex justify-center">
                        <div className="ml-3 w-full flex justify-between items-center">
                            <div className="flex flex-col mb-4">
                                <h1 className="text-2xl font-bold text-gray-900">{lessonData.courseTitle}</h1>
                                <span className="text-gray-600 mt-1">{lessonData.date?.substring(0, 10)}</span>
                            </div>
                            <div className="flex items-center justify-center">
                                <button className="p-2 hover:bg-gray-100 rounded-lg"
                                    onClick={() => { router.push("/structured-breakdown") }}
                                >
                                    <button className="p-2 hover:bg-gray-100 rounded-lg"
                                        onClick={() => { router.push("/structured-breakdown") }}
                                    >
                                        <IoMdClose />
                                    </button>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2">
                        {/* Header Card */}
                        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
                            <div className="p-4">
                                {/* Course Title */}
                                <h2 className="text-xl font-semibold text-gray-900 mb-2">{lessonData.courseTitle}</h2>

                                {/* Lesson Title with Mark as Done Toggle */}
                                <div className="flex justify-between items-center mb-4">
                                    {/* <h3 className="text-lg text-gray-700">{lessonData.lessonTitle}</h3> */}

                                    {/* <div className="flex items-center gap-2">
                    <button
                      onClick={handleMarkAsDone}
                      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ease-in-out"
                      style={{ backgroundColor: isMarkedDone ? '#3b82f6' : '#d1d5db' }}
                      aria-pressed={isMarkedDone}
                      aria-labelledby="mark-as-done-label"
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-300 ease-in-out ${isMarkedDone ? 'translate-x-5' : 'translate-x-1'
                          }`}
                    </button>
                    <span id="mark-as-done-label" className="text-sm font-medium text-gray-700">{!isMarkedDone ? translator("Mark as Done", "डॉन करें") : translator("Mark as Not Done", "डॉन नहीं करें")}</span>
                  </div> */}

                                </div>
                            </div>

                            {/* Video Container */}
                            <div className="bg-black rounded-lg mx-4 mb-4 overflow-hidden">
                                <div className="relative" style={{ paddingTop: "56.25%" }}>
                                    <iframe
                                        className="absolute top-0 left-0 w-full h-full"
                                        src={`https://www.youtube.com/embed/${lessonData.videoUrl?.split('v=')[1]?.split('&')[0] || ''}`}
                                        title={lessonData.lessonTitle}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            </div>

                            {/* Download Notes Button */}
                            {/* <div className="flex justify-end px-4 mb-4">
                <button className="flex items-center gap-2 text-blue-600 hover:text-blue-950"
                  onClick={() => {
                    localStorage.setItem("ytLinkforNotes", lessonData.videoUrl);
                    router.push("/resource-notes");
                    console.log('taking you to resource notes');
                  }}
                >
                  <IoMdDownload />
                  <span className="font-medium">{translator("Download Notes", "नोट्स डाउनलोड करें")}</span>
                </button>
              </div> */}

                            {/* Tabs and Content */}
                            <div className="border-t border-gray-200">
                                {/* Tab Navigation */}
                                <div className="flex border-b border-gray-200">
                                    <button
                                        onClick={() => setActiveTab('transcript')}
                                        className={`px-6 py-3 text-sm font-medium ${activeTab === 'transcript'
                                            ? 'bg-gradient-to-r from-[#6BA0FF] to-[#755BFF] text-white rounded-t-lg'
                                            : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        {translator("Transcript", "पाठानेत्रावरील टेक्स्ट")}
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('resources')}
                                        className={`px-6 py-3 text-sm font-medium ${activeTab === 'resources'
                                            ? 'bg-gradient-to-r from-[#6BA0FF] to-[#755BFF] text-white rounded-t-lg'
                                            : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        {translator("More Videos", "और वीडियो")}
                                    </button>
                                </div>

                                {/* Tab Content */}
                                <div className="p-6">
                                    {activeTab === 'transcript' && (
                                        <div>
                                            <h4 className="text-lg font-semibold text-gray-900 mb-4">{translator("Video Transcription", "वीडियो ट्रांसक्रिप्शन")}</h4>
                                            <div className="max-h-[300px] overflow-y-auto">
                                                {isTranscriptLoading ? (
                                                    <div className="flex items-center justify-center py-8">
                                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                                        <span className="ml-3 text-gray-600">Loading transcript...</span>
                                                    </div>
                                                ) : (
                                                    <div className="text-gray-700">
                                                        {transcript || 'No transcript available.'}
                                                    </div>
                                                )}
                                            </div>
                                            {/*}
                      <h4 className="text-lg font-semibold text-gray-900 mt-6 mb-4">{translator("Summary", "सारांश")}</h4>
                      <p className="text-gray-700">
                        {notesData.summary}
                      </p>
                      */}
                                        </div>
                                    )}

                                    {activeTab === 'resources' && (
                                        <div>
                                            <h4 className="text-lg font-semibold text-gray-900 mb-4">{translator("Available Videos", "उपलब्ध वीडियो")}</h4>
                                            <ul className="space-y-3">
                                                {videoList.map((video, index) => (
                                                    <li key={index}>
                                                        <button
                                                            type="button"
                                                            className={`w-full text-left p-4 rounded-lg border transition-all font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex flex-col gap-1
                                ${index === currentVideoIndex
                                                                    ? 'bg-gradient-to-r from-[#6BA0FF] to-[#755BFF] text-white border-transparent shadow-md'
                                                                    : 'bg-white text-gray-900 border-gray-200 hover:bg-blue-50 hover:border-blue-400'}
                              `}
                                                            onClick={() => handleVideoSwitch(index)}
                                                        >
                                                            <span className="text-base font-semibold">{video.title}</span>
                                                            <span className="text-sm text-gray-600 line-clamp-2">{video.description}</span>
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar - Ask Your Doubts */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-md overflow-hidden h-[calc(100vh-8rem)] flex flex-col sticky top-6">
                            {/* Chat Header */}
                            <div className="flex justify-between items-center bg-gradient-to-r from-[#6BA0FF] to-[#755BFF] p-4 flex-shrink-0">
                                <button onClick={deleteChat} title="Delete Chat">
                                    <RiChatDeleteFill className="text-white h-8 w-8 cursor-pointer hover:opacity-80" />
                                </button>
                                <h3 className="text-lg font-semibold text-white">{translator("Ask Your Doubts", "अपने सवाल पूछें")}</h3>
                                <button onClick={downloadChatAsPDF} title="Download Chat">
                                    <MdDownloadForOffline className="text-white h-8 w-8 cursor-pointer hover:opacity-80" />
                                </button>
                            </div>

                            {/* Chat Messages */}
                            <div className="p-4 flex-grow overflow-y-auto">
                                <div className="space-y-4">
                                    {chatMessages.map((message) => (
                                        <div
                                            key={message.id}
                                            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-xs p-3 rounded-lg ${message.type === 'user'
                                                    ? 'bg-[#E0E7FF] text-gray-900'
                                                    : 'bg-gray-100 text-gray-900'
                                                    }`}
                                            >
                                                <p className="text-sm">{message.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {isMessageLoading && (
                                        <div className="flex justify-start">
                                            {/* Simple text loading indicator for chat */}
                                            <div className="max-w-xs p-3 rounded-lg bg-gray-100 text-gray-900">
                                                <p className="text-sm italic">AI is thinking...</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Chat Input */}
                            <div className="p-4 border-t border-gray-200 flex-shrink-0">
                                <div className="flex items-center gap-2">
                                    {/* <button
                    onClick={handleMicClick}
                    className={`p-3 rounded-full transition-colors ${listening ? 'bg-red-500 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                    title={listening ? "Stop Listening" : "Start Listening"}
                  >
                    <FaMicrophone className="h-5 w-5" />
                  </button> */}
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder={translator("Type your message...", "अपना संदेश लिखें...")}
                                        className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow"
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        className="p-3 bg-gradient-to-r from-[#6BA0FF] to-[#755BFF] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                                        disabled={!newMessage.trim()}
                                    >
                                        <IoSend className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoSection;