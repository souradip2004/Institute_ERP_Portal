"use client"
import React, { useState, useRef, useEffect, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { TbArrowBackUp } from "react-icons/tb";
import { set } from 'date-fns';
import type { ChangeEvent } from 'react';
import { Loader, Book, UploadCloud, X as CloseIcon, FileText, MicOff, Eye } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";

// SVG Icons as functional components for cleanliness
const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const MicIcon = ({ recognizing }: { recognizing: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg"
        className={`h-5 w-5 ${recognizing ? 'text-red-500 animate-pulse' : ''}`}
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
);

const BackIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

const translator = (word1: string, word2: string) => word1;

export default function withSearchParams() {
    return (
        <Suspense>
            <CreateSmartResources />
        </Suspense>
    )
}

function CreateSmartResources() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Scroll to top on mount to fix scroll position issue
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const [topic, setTopic] = useState('');
    const [purpose, setPurpose] = useState('');
    const [language, setLanguage] = useState('');
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState('');
    const [pdfUrl, setPdfUrl] = useState(''); // This will store the selected PDF URL for proceeding
    const [uploading, setUploading] = useState(false);
    const [userId, setUserId] = useState<any>(() => {
        if (typeof window !== 'undefined') {
            const data = localStorage.getItem('user');
            return data ? JSON.parse(data)?.teacherId : null;
        }
        return null;
    });
    const [noOfResources, setNoOfResources] = useState(0);
    const [showResources, setShowResources] = useState(true);
    const [resourceFetchDone, setResourceFetchDone] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [recognizing, setRecognizing] = useState(false);
    const recognizerRef = useRef<any>(null);
    const [fetchedPdfs, setFetchedPdfs] = useState<any[]>([]); // Stores all 10 fetched PDFs
    const [displayPdfCount, setDisplayPdfCount] = useState(0); // Number of PDFs currently displayed (4, 8, 10)
    const [loadingPdfs, setLoadingPdfs] = useState(false); // Loading state for fetching PDFs from backend
    const [showPdfOptions, setShowPdfOptions] = useState(false); // Controls visibility of the PDF suggestion section
    // --- New State for PDF Preview ---
    const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null); // Stores the URL of the PDF to preview

    // Speech recognition configuration
    const SPEECH_KEY = '6zQzqxHdwbLPgH305XlO9WwdUCwAi7vKCmO3Iey4ns86u0cKi6gQJQQJ99BFACYeBjFXJ3w3AAAYACOGNXmu';
    const SPEECH_REGION = 'eastus';

    const blobpdf = async (pdfs: string) => {
        const proxyUrlBase = 'https://api.aiclassroom.in/proxy-pdf?url='; // Base URL for the proxy
        const proxyResponse = await axios.get(`${proxyUrlBase}${encodeURIComponent(pdfs)}`, {
            responseType: 'blob' // Crucial to handle PDF binary
        });
        const blob = new Blob([proxyResponse.data], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(blob);
        return blobUrl;
    };

    useEffect(() => {
        const loadNoOfResources = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_1_SERVER_URL}/planner/getAllSchedulesFromUser/${userId}`);
                setNoOfResources(response.data?.data?.length);
                if (response.data?.data?.length > 0) {
                    setShowResources(true);
                } else {
                    setShowResources(false);
                }
                setResourceFetchDone(true);
            } catch (error) {
                console.error("Error in AIResourceFinder useEffect (loadNoOfResources):", error);
                setResourceFetchDone(true);
            }
        };
        if (userId) loadNoOfResources();

        return () => {
            // Cleanup speech recognition on unmount
            if (recognizerRef.current) {
                recognizerRef.current.stopContinuousRecognitionAsync();
                recognizerRef.current.close();
                recognizerRef.current = null;
            }
        };
    }, [userId]);

    // Function to fetch PDFs for topic, extracted for reusability
    const fetchPdfsForTopic = useCallback(async () => {
        if (topic.trim().length > 0 && !uploadedFile && !recognizing) {
            setLoadingPdfs(true);
            setFetchedPdfs([]); // Clear previous PDFs
            setDisplayPdfCount(0); // Reset display count
            setPdfUrl(''); // Clear any previously selected PDF URL
            setShowPdfOptions(true); // Show the section where PDFs will appear
            setPreviewPdfUrl(null); // Clear any open preview

            try {
                const encodedTopic = encodeURIComponent(topic + " syllabus");
                const response = await axios.get(`https://api.aiclassroom.in/api/v1/videoData/generateaPdfLink/${encodedTopic}`);
                let pdfs = response.data?.pdfLinks || [];
                setFetchedPdfs(pdfs);
                // Initialize with 4 PDFs, or fewer if less than 4 are returned
                setDisplayPdfCount(Math.min(pdfs.length, 4));
            } catch (error) {
                console.error("Error fetching PDFs for topic:", error);
                setFetchedPdfs([]);
                setDisplayPdfCount(0);
                setShowPdfOptions(false); // Hide if an error occurs
            } finally {
                setLoadingPdfs(false);
            }
        } else {
            setFetchedPdfs([]);
            setDisplayPdfCount(0);
            setShowPdfOptions(false);
            setPdfUrl('');
            setPreviewPdfUrl(null); // Clear preview when topic is cleared or other input type is selected
        }
    }, [topic, uploadedFile, recognizing]);

    // Effect to fetch PDFs when topic changes and is valid (debounced)
    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            fetchPdfsForTopic();
        }, 500); // Debounce API calls

        return () => clearTimeout(debounceTimer);
    }, [topic, uploadedFile, recognizing, fetchPdfsForTopic]); // Add fetchPdfsForTopic to dependencies

    const stopRecognition = useCallback(() => {
        if (recognizerRef.current) {
            try {
                recognizerRef.current.stopContinuousRecognitionAsync(
                    () => {
                        setRecognizing(false);
                        if (recognizerRef.current) {
                            recognizerRef.current.close();
                            recognizerRef.current = null;
                        }
                    },
                    (err) => {
                        console.error("Error stopping recognition:", err);
                        setRecognizing(false);
                        if (recognizerRef.current) {
                            recognizerRef.current.close();
                            recognizerRef.current = null;
                        }
                    }
                );
            } catch (error) {
                console.error("Error in stopRecognition:", error);
                setRecognizing(false);
                if (recognizerRef.current) {
                    recognizerRef.current.close();
                    recognizerRef.current = null;
                }
            }
        } else {
            setRecognizing(false);
        }
    }, []);

    const startRecognition = useCallback(() => {
        if (recognizing) {
            stopRecognition();
            return;
        }

        if (recognizerRef.current) {
            recognizerRef.current.close();
        }

        if (!SPEECH_KEY || !SPEECH_REGION) {
            alert('Speech recognition not configured. Please set Azure Speech Key and Region in .env.');
            return;
        }

        try {
            // Clear states when starting recognition
            setRecognizing(true);
            setTranscript('');
            setTopic(''); // Clear topic when starting recognition
            setUploadedFile(null); // Clear uploaded file if starting voice recognition
            setFileName('');
            setPdfUrl(''); // Clear any selected PDF
            setFetchedPdfs([]); // Clear fetched PDFs
            setDisplayPdfCount(0);
            setShowPdfOptions(false);
            setPreviewPdfUrl(null); // Clear any open preview

            // Initialize Azure Speech SDK
            const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(SPEECH_KEY, SPEECH_REGION);
            speechConfig.speechRecognitionLanguage = "en-IN";

            const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
            const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);

            recognizer.recognizing = (_, e) => {
                setTranscript(e.result.text);
            };

            recognizer.recognized = (_, e) => {
                if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
                    const finalText = e.result.text.trim();
                    if (finalText) {
                        setTranscript(finalText);
                        setTopic(finalText);
                    }
                }
            };

            recognizer.canceled = (_, e) => {
                console.error("Recognition canceled:", e.errorDetails);
                setRecognizing(false);
                if (recognizerRef.current) {
                    recognizerRef.current.close();
                    recognizerRef.current = null;
                }
            };

            recognizer.sessionStopped = () => {
                setRecognizing(false);
                if (recognizerRef.current) {
                    recognizerRef.current.close();
                    recognizerRef.current = null;
                }
            };

            recognizer.startContinuousRecognitionAsync(
                () => {
                    console.log("Speech recognition started successfully");
                },
                (err) => {
                    console.error("Failed to start speech recognition:", err);
                    setRecognizing(false);
                }
            );

            recognizerRef.current = recognizer;
        } catch (error) {
            console.error("Error initializing speech recognition:", error);
            setRecognizing(false);
            alert(translator("Failed to initialize speech recognition. Please check your microphone permissions.", "भाषण पहचान प्रारंभ करने में विफल। कृपया अपनी माइक्रोफ़ोन अनुमतियाँ जाँचें।"));
        }
    }, [recognizing, stopRecognition, SPEECH_KEY, SPEECH_REGION]);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) {
            setUploadedFile(null);
            setFileName('');
            setPdfUrl('');
            return;
        }

        if (file.type !== 'application/pdf') {
            alert(translator("Only PDF files are allowed.", "केवल PDF फ़ाइलें ही अनुमत हैं।"));
            setUploadedFile(null);
            setFileName('');
            setPdfUrl('');
            return;
        }

        setTopic(''); // Clear topic when a PDF is dropped
        setPurpose('');
        setLanguage('');
        setUploadedFile(file);
        setFileName(file.name);
        setUploading(true);
        setPdfUrl(''); // Clear previously selected PDF URL
        setFetchedPdfs([]); // Clear fetched PDFs
        setDisplayPdfCount(0);
        setShowPdfOptions(false);
        setPreviewPdfUrl(null); // Clear any open preview

        const formData = new FormData();
        formData.append('pdf', file);

        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_AICLASSROOM}/pdfUpload/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setPdfUrl(response.data.fileUrl); // Set pdfUrl from upload response
        } catch (error) {
            console.error('Upload failed:', error);
            setUploadedFile(null);
            setPdfUrl("");
            setFileName('');
            alert(translator("Failed to upload PDF", "पीडीएफ अपलोड करने में विफल।"));
        }
        setUploading(false);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
        },
        multiple: false,
        disabled: uploading || recognizing || topic.trim().length > 0, // Disable if topic is typed
    });

    const handleTopicChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newTopic = e.target.value;
        setTopic(newTopic);

        if (newTopic.trim().length > 0) {
            // If topic is typed, clear any uploaded file, and related PDF states
            setUploadedFile(null);
            setFileName('');
            // No need to clear pdfUrl here, as it will be set by suggested PDFs (or remain empty if not selected)
        } else {
            // If topic becomes empty, clear fetched PDFs
            setFetchedPdfs([]);
            setDisplayPdfCount(0);
            setShowPdfOptions(false);
            setPdfUrl(''); // Clear selected PDF URL as well
        }
        setPreviewPdfUrl(null); // Close any open preview when topic changes
    };

    const handleRemoveTopic = () => {
        setTopic('');
        setFetchedPdfs([]); // Clear fetched PDFs
        setDisplayPdfCount(0);
        setShowPdfOptions(false);
        setPdfUrl(''); // Clear selected PDF URL
        setPreviewPdfUrl(null); // Close any open preview
    };

    const handleRemovePdf = () => {
        setUploadedFile(null);
        setFileName('');
        setPdfUrl(''); // Clear the uploaded PDF URL
        setPreviewPdfUrl(null); // Close any open preview
    };

    const handleUseSuggestedPdf = async (selectedPdfLink: string) => {
        setPdfUrl(selectedPdfLink); // Set the URL from the suggested PDF
        // Optionally, you might want to hide the suggestions after selection
        // setShowPdfOptions(false);
        setPreviewPdfUrl(null); // Close any open preview
    };

    const handleShowMorePdfs = () => {
        setDisplayPdfCount(prevCount => Math.min(prevCount + 4, fetchedPdfs.length));
    };

    const handleSkipPdfSuggestions = () => {
        setPdfUrl(''); // Ensure no PDF is selected
        setFetchedPdfs([]); // Clear suggestions
        setDisplayPdfCount(0);
        setShowPdfOptions(false);
        setPreviewPdfUrl(null); // Close any open preview
        // User proceeds with just the topic
    };

    // --- New PDF Preview Functions ---
    const openPdfPreview = async (url: string) => {
        setPreviewPdfUrl("https://api.aiclassroom.in/proxy-pdf?url=" + url);
    };

    const closePdfPreview = () => {
        setPreviewPdfUrl(null);
    };

    // Handler for explicit search (e.g., from search icon or Enter key)
    const handleSearch = () => {
        if (topic.trim().length > 0 && !uploadedFile && !recognizing) {
            fetchPdfsForTopic(); // Directly call the fetch function
        }
    };

    const handleProceed = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Proceeding with:", { topic, purpose, language, pdfUrl });

        const dataForBreakdown = {
            "wbStrId": null,
            "shouldDoPostReq": true,
        };
        localStorage.setItem("dataForBreakdown", JSON.stringify(dataForBreakdown));

        const dataToSend = {
            "userId": userId,
            "planner": {
                "promptTopic": topic + (purpose ? " " + purpose : ""),
                "language": language,
                "manualEntryText": purpose,
                "pdfLink": pdfUrl, // This will be the uploaded PDF or the selected suggested PDF
                "planPurpose": "Academic",
            }
        };

        localStorage.removeItem('videoSectionChatMessages');
        localStorage.setItem("dataToSend", JSON.stringify(dataToSend));
        router.push("/t/smart-resources/set-schedule");
    };

    const handleBack = () => {
        let redirectTo = searchParams?.get('redirect');
        if (redirectTo === 'home') {
            router.push('/');
        } else {
            router.push('/smart-resources');
        }
    };

    // Determine if topic input should be disabled
    const isTopicInputDisabled = recognizing || uploadedFile !== null;

    // Determine if dropzone should be disabled
    const isDropzoneDisabled = uploading || recognizing || topic.trim().length > 0 || (fetchedPdfs.length > 0 && displayPdfCount > 0);

    // Determine if the main proceed button should be disabled
    const isProceedDisabled = uploading || recognizing || (topic.trim() === '' && uploadedFile === null && pdfUrl === '');

    return (
        <div className="bg-gray-100 min-h-screen flex items-center justify-center font-sans p-4 relative">
            {/* Mic Recognition Backdrop and Modal Box */}
            {recognizing && (
                <>
                    {/* Backdrop with a bit more subtle dimming */}
                    <div
                        className="fixed inset-0 z-40 animate-fade-in"
                        style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)' }}
                    ></div>
                    {/* Mic Recognition Modal Box */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg shadow-xl p-6 flex flex-col items-center max-w-sm w-full animate-slide-in-up relative border border-gray-300">
                            <button
                                onClick={stopRecognition}
                                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl font-bold"
                                aria-label={translator("Close microphone input", "माइक्रोफ़ोन इनपुट बंद करें")}
                            >
                                &times;
                            </button>
                            <div className="relative flex items-center justify-center p-4 rounded-full bg-blue-600 animate-expand-mic-inner">
                                <MicIcon recognizing={true} />
                            </div>
                            <p className="mt-4 text-xl font-semibold text-gray-800">
                                {transcript ? translator("Recognized:", "पहचाना गया:") : translator("Listening...", "सुन रहा हूँ")}
                            </p>
                            <div className="mt-4 w-full p-3 border border-gray-300 rounded-md text-center text-lg font-medium shadow-sm bg-gray-50 min-h-[50px] flex items-center justify-center">
                                {transcript ? (
                                    <span className="text-gray-800">{transcript}</span>
                                ) : (
                                    <span className="text-gray-500">{translator("Say something...", "कुछ बोलिए...")}</span>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {!resourceFetchDone && (
                <div className='fixed inset-0 z-50 bg-white flex items-center justify-center px-4 py-6 animate-fade-in'>
                    Loading
                </div>
            )}

          
        
            {/* --- PDF Preview Modal --- */}
            {previewPdfUrl && (
                <div className="fixed inset-0 z-[60] bg-black bg-opacity-75 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-lg shadow-2xl flex flex-col w-full h-full max-w-5xl max-h-[90vh] relative animate-scale-in">
                        <div className="flex justify-between items-center p-3 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-800">
                                {translator("PDF Preview", "पीडीएफ पूर्वावलोकन")}
                            </h2>
                            <button
                                onClick={closePdfPreview}
                                className="text-gray-500 hover:text-gray-700 text-3xl font-bold leading-none"
                                aria-label={translator("Close preview", "पूर्वावलोकन बंद करें")}
                            >
                                &times;
                            </button>
                        </div>
                        <div className="flex-grow overflow-hidden">
                            <iframe
                                src={`https://docs.google.com/gview?embedded=true&url=${previewPdfUrl}&amp;embedded=true`}
                                className="w-full h-full border-0"
                                title="PDF Preview"
                            ></iframe>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden z-40">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-700 p-6 flex justify-between items-start text-white relative">
                    {/* Back button for the main form */}
                   
                    <div className="ml-10"> {/* Added margin to prevent overlap with back button */}
                        <h1 className="text-2xl font-bold">
                            {translator("AI Resource Finder", "AI रिसोर्स फाइंडर")}
                        </h1>
                        <p className="text-sm text-purple-200 mt-1">
                            {translator("Get your Resources all at one place", "अपने सभी संसाधन एक ही स्थान पर प्राप्त करें")}
                        </p>
                    </div>
                    <button
                        aria-label={translator("Close", "बंद करें")}
                        className="text-3xl leading-none text-purple-200 hover:text-white transition-colors"
                        onClick={() => { window.history.back(); }}
                    >
                        &times;
                    </button>
                </div>

                <form className="p-8 space-y-6" onSubmit={handleProceed}>
                    <div>
                        <label htmlFor="topic-input" className="block text-sm font-medium text-purple-800 mb-2">
                            {translator("Describe Your Topic Here", "यहां अपना विषय बताएं")}
                        </label>
                        <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-purple-500 transition-all">
                            <input
                                type="text"
                                id="topic-input"
                                className="w-full px-4 py-2.5 border-none outline-none bg-transparent"
                                value={topic}
                                placeholder={translator("Eg: CBSE Class 12 Python Programming", "उदा: सीबीएसई कक्षा 12 पाइथन प्रोग्रामिंग")}
                                onChange={handleTopicChange}
                                onKeyDown={(e) => { // Added onKeyDown for Enter key
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleSearch();
                                    }
                                }}
                                disabled={isTopicInputDisabled}
                            />
                            <div className="flex items-center space-x-3 pr-4 text-gray-500">
                                <button
                                    type="button"
                                    aria-label={translator("Search", "खोजें")}
                                    className="hover:text-purple-600"
                                    onClick={handleSearch} // Added onClick for search icon
                                    disabled={isTopicInputDisabled}
                                >
                                    <SearchIcon />
                                </button>
                                <button
                                    type="button"
                                    aria-label={translator("Use microphone", "माइक्रोफ़ोन का उपयोग करें")}
                                    className={`hover:text-purple-600 ${recognizing ? 'text-red-500 animate-pulse' : ''}`}
                                    onClick={startRecognition}
                                    disabled={uploadedFile !== null}
                                >
                                    <MicIcon recognizing={recognizing} />
                                </button>
                                {topic.trim().length > 0 && (
                                    <button
                                        type="button"
                                        aria-label={translator("Remove topic", "विषय हटाएँ")}
                                        className="text-red-500 hover:text-red-700"
                                        onClick={handleRemoveTopic}
                                    >
                                        <CloseIcon size={20} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* PDF Suggestions Section */}
                    {showPdfOptions && (
                        <div className="border border-purple-300 rounded-lg p-4 bg-purple-50">
                            <div className='flex flex-col sm:flex-row sm:justify-between sm:align-middle  sm:items-center gap-3 mb-2'>
                                <h3 className="text-lg font-semibold text-purple-800 text-center sm:text-left">
                                    {translator("Proceed with Syllabus PDF", "आपके विषय के लिए सुझाई गई PDF:")}
                                </h3>
                                <div className="flex flex-col sm:flex-row items-center gap-3">
                                    <div className="flex items-center w-full sm:w-auto">
                                        <div className="h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent flex-1 sm:w-8"></div>
                                        <span className="mx-3 text-sm font-medium text-purple-600 bg-white px-2 py-1 rounded-full border border-purple-200 shadow-sm whitespace-nowrap">
                                            {translator("OR", "या")}
                                        </span>
                                        <div className="h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent flex-1 sm:w-8"></div>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleSkipPdfSuggestions}
                                    className="bg-gradient-to-r from-pink-600 to-blue-800 text-white px-4 py-2 rounded-lg text-sm hover:opacity-90 transition-all w-full sm:w-auto shadow-md whitespace-nowrap"
                                >
                                    {translator("Use Topic Only", "AI के साथ शेड्यूल बनाएं ⭐")}
                                </button>
                            </div>

                            {loadingPdfs ? (
                                <p className="text-center text-gray-600 flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {translator("Fetching PDFs...", "PDFs प्राप्त कर रहे हैं...")}
                                </p>
                            ) : fetchedPdfs.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {fetchedPdfs.slice(0, displayPdfCount).map((pdf: any, index: number) => (
                                            <div key={index} className={`bg-white p-3 rounded-md shadow border relative group ${pdfUrl === pdf.link ? 'border-purple-600 ring-2 ring-purple-300' : 'border-gray-200'}`}>
                                                <h4 className="font-medium text-gray-800 text-sm mb-1 line-clamp-2">{pdf.title}</h4>
                                                <p className="text-gray-600 text-xs line-clamp-3">{pdf.snippet}</p>
                                                <div className="mt-2 flex gap-2">
                                                    {/* Select Button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleUseSuggestedPdf(pdf.link)}
                                                        className={`flex-grow px-3 py-1 text-xs rounded transition-colors ${pdfUrl === pdf.link
                                                            ? 'bg-purple-600 text-white hover:bg-purple-700'
                                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                            }`}
                                                    >
                                                        {pdfUrl === pdf.link ? translator("Selected", "चुना गया") : translator("Select", "चुनें")}
                                                    </button>
                                                    {/* Preview Button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => openPdfPreview(pdf.link)}
                                                        className="flex items-center justify-center p-1 border border-gray-300 rounded text-gray-600 hover:bg-gray-100 transition-colors"
                                                        aria-label={translator("Preview PDF", "पीडीएफ का पूर्वावलोकन करें")}
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => window.open(pdf.link, '_blank')}
                                                        className="flex items-center justify-center p-1 border border-gray-300 rounded text-gray-600 hover:bg-gray-100 transition-colors"
                                                        aria-label={translator("View PDF", "पीडीएफ देखें")}
                                                    >
                                                        <FileText size={16} />
                                                    </button>
                                                    {/* View PDF in New Tab Button */}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 flex flex-col sm:flex-row justify-center gap-3">
                                        {displayPdfCount < fetchedPdfs.length && (
                                            <button
                                                type="button"
                                                onClick={handleShowMorePdfs}
                                                className="bg-purple-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-600 transition-colors w-full sm:w-auto"
                                            >
                                                {translator("Show More PDFs", "और PDF दिखाएं")} ({fetchedPdfs.length - displayPdfCount} {translator("remaining", "शेष")})
                                            </button>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <p className="text-center text-gray-600">
                                    {translator("No PDFs found for this topic.", "इस विषय के लिए कोई PDF नहीं मिली।")}
                                </p>
                            )}
                        </div>
                    )}

                    <div className="flex items-center text-center">
                        <div className="flex-grow border-t border-gray-200"></div>
                        <span className="flex-shrink mx-4 text-xs font-semibold text-gray-400">
                            {translator("OR - UPLOAD SYLLABUS PDF", "या - सिलेबस पीडीएफ अपलोड करें")}
                        </span>
                        <div className="flex-grow border-t border-gray-200"></div>
                    </div>

                    <div
                        {...getRootProps()}
                        className={`mt-4 p-6 border-2 border-dashed rounded-lg text-center cursor-pointer transition-all duration-200 relative ${isDragActive && !isDropzoneDisabled ? 'border-purple-500 bg-purple-50' : 'border-gray-300 bg-gray-50'} ${isDropzoneDisabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                        <input {...getInputProps()} />
                        <UploadCloud className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                        {uploading ? (
                            <p className="text-gray-600">{translator("Uploading...", "अपलोड हो रहा है...")}</p>
                        ) : isDragActive && !isDropzoneDisabled ? (
                            <p className="text-purple-600 font-medium">{translator("Drop the PDF file here ...", "पीडीएफ फाइल यहां छोड़ें ...")}</p>
                        ) : (
                            <p className="text-gray-600">{translator("Drop a PDF file here, or click to select file", "यहां एक पीडीएफ फाइल छोड़ें, या फाइल चुनने के लिए क्लिक करें")}</p>
                        )}
                        {fileName && (
                            <p className="mt-2 text-sm text-gray-500 flex items-center justify-center gap-2">
                                <FileText size={16} className="text-gray-400" />
                                {translator("Selected file:", "चुनी गई फ़ाइल:")} <span className="font-medium text-gray-700">{fileName}</span>
                                {pdfUrl && ( // This pdfUrl is from uploaded file
                                    <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline text-sm ml-1">
                                        {translator("View PDF", "पीडीएफ देखें")}
                                    </a>
                                )}
                                <button
                                    type="button"
                                    aria-label={translator("Remove PDF", "पीडीएफ हटाएँ")}
                                    className="text-red-500 hover:text-red-700 ml-2"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemovePdf();
                                    }}
                                >
                                    <CloseIcon size={20} />
                                </button>
                                {/* Preview uploaded PDF button */}
                                {pdfUrl && (
                                    <button
                                        type="button"
                                        onClick={() => openPdfPreview(pdfUrl)}
                                        className="flex items-center justify-center p-1 border border-gray-300 rounded text-gray-600 hover:bg-gray-100 transition-colors"
                                        aria-label={translator("Preview uploaded PDF", "अपलोड की गई पीडीएफ का पूर्वावलोकन करें")}
                                    >
                                        <Eye size={16} />
                                    </button>
                                )}
                            </p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="purpose-input" className="block text-sm font-medium text-purple-800 mb-2">
                            {translator("Describe Your Purpose", "अपना उद्देश्य बताएं")}
                        </label>
                        <textarea
                            id="purpose-input"
                            rows={3}
                            placeholder={translator("I want to Study for CBSE Board Exams in Details", "मैं सीबीएसई बोर्ड परीक्षा के लिए विस्तार से अध्ययन करना चाहता हूँ")}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                            value={purpose}
                            onChange={e => setPurpose(e.target.value)}
                            disabled={recognizing}
                        ></textarea>
                    </div>

                    <div>
                        <label htmlFor="language-select" className="block text-sm font-medium text-purple-800 mb-2">
                            {translator("Choose Language", "भाषा चुनें")}
                        </label>
                        <div className="relative">
                            <select
                                id="language-select"
                                className="w-full p-3 border border-gray-300 rounded-lg appearance-none bg-white cursor-pointer focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                                value={language}
                                onChange={e => setLanguage(e.target.value)}
                                disabled={recognizing}
                            >
                                <option value="">{translator("Select Language", "भाषा चुनें")}</option>
                                <option value="en">{translator("English", "अंग्रेज़ी")}</option>
                                <option value="hi">{translator("Hindi", "हिंदी")}</option>
                                <option value="he">{translator("Hinglish", "हिंग्लिश")}</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className='flex flex-row gap-4 mt-6'>
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-bold py-3 px-4 rounded-lg text-lg hover:opacity-90 transition-opacity transform hover:scale-[1.01]"
                            disabled={isProceedDisabled}
                        >
                            {uploading ? translator("Uploading...", "अपलोड हो रहा है...") : translator("Proceed", "आगे बढ़ें")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}