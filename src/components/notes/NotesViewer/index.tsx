'use client';

import React, { useEffect, useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { Maximize, Minimize } from 'lucide-react';
import NotesUploadForm from './NotesUploadForm';
import { PlayerNode } from './PlayerClass';
import { NotesViewerProps, NotesViewerState, PageItem, TrialData } from './types';
import { getImgCategoryFromGemini, generateImageForText, saveVideoData, getVideoData } from './api';
import { storeVideoDataLocally, getLocalVideoData, hasLocalVideoData, formatTime, markParagraphsHTML } from './utils';

const API_KEY = "AIzaSyA4JS-LxAnKP3BY2DDcYCuEKd96troXeyc";

export default function NotesViewer({ pdfUrl, noteId, initialVideoData }: NotesViewerProps) {
    const [state, setState] = useState<NotesViewerState>({
        submit: !!initialVideoData,
        link: pdfUrl || '',
        loaded: !!initialVideoData,
        ready: false,
        selectedFile: null,
        mainImage: '',
        keypoint: '',
        audioPath: '',
        sideImage: '',
        towrite: '',
        marker: [],
        values: 0,
        isplaying: false,
        currenttime: 0,
        ocr: '',
        lang: 'english',
        dataholder: null,
        trialdata: initialVideoData || [],
        max: 0,
        toDisplay: false,
        showControls: false,
    });

    const audioRef = useRef<HTMLAudioElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

    useEffect(() => {
        // If we have noteId and initialVideoData is not provided, try to get from localStorage first
        if (noteId && !initialVideoData && !state.loaded && !state.ready) {
            const fetchVideoData = async () => {
                // Try to get from localStorage first
                if (hasLocalVideoData(noteId)) {
                    const localData = getLocalVideoData(noteId);
                    if (localData && Array.isArray(localData)) {
                        console.log('Using video data from localStorage');
                        const typedData = localData as unknown as PageItem[];
                        setState(prev => ({
                            ...prev,
                            trialdata: typedData,
                            submit: true,
                            loaded: true,
                        }));
                        return;
                    }
                }
                
                // If not in localStorage or invalid, try to fetch from server
                try {
                    console.log('Trying to fetch video data from server...');
                    const serverData = await getVideoData(noteId);
                    if (serverData && Array.isArray(serverData)) {
                        console.log('Using video data from server');
                        const typedData = serverData as unknown as PageItem[];
                        setState(prev => ({
                            ...prev,
                            trialdata: typedData,
                            submit: true,
                            loaded: true,
                        }));
                        
                        // Also update localStorage for future use
                        storeVideoDataLocally(noteId, typedData);
                    } else {
                        console.error('No valid video data found in localStorage or server');
                    }
                } catch (error) {
                    console.error('Error fetching video data:', error);
                }
            };
            
            fetchVideoData();
        }
    }, [noteId, initialVideoData, state.loaded, state.ready]);

    // Process trial data into linked list when loaded
    useEffect(() => {
        if (!state.loaded || !state.trialdata.length || state.ready) return;

        const processData = async () => {
            try {
                console.log('Processing trial data:', state.trialdata);
                
                const startingNode = new PlayerNode(-1, -1, "", "", "", "", "", "", 0, false, "", []);
                let currentNode = startingNode;
                let processedAnyData = false;
                let maxEndingValue = 0;

                // Process each item in trialdata
                for (const item of state.trialdata) {
                    // Process each page
                    for (const [, pageValue] of Object.entries(item)) {
                        // Process each text section
                        for (const [, textValue] of Object.entries(pageValue)) {
                            if (Array.isArray(textValue)) {
                                let mainImage = '';
                                let croppedImage = '';
                                let ocr = '';
                                let typeOfText = '';
                                let generatedImage = '';

                                // Process each part of the textValue array
                                for (let i = 0; i < textValue.length; i++) {
                                    const currentItem = textValue[i];

                                    if (i === 0) {
                                        // Main image
                                        mainImage = currentItem as string;
                                    } else if (i === 1) {
                                        // Cropped image
                                        croppedImage = currentItem as string;
                                        typeOfText = await getImgCategoryFromGemini(croppedImage, API_KEY);
                                    } else if (i === 2) {
                                        // OCR text
                                        ocr = currentItem as string;
                                    } else if (i === 3) {
                                        // Segments with translations
                                        const segments = currentItem as Record<string, any[]>;

                                        // For each heading and segment array
                                        for (const [heading, segmentArray] of Object.entries(segments)) {
                                            setState(prev => ({ ...prev, keypoint: heading }));

                                            // For each segment in the segment array
                                            for (const segment of segmentArray) {
                                                if (!Array.isArray(segment) || segment.length < 5) {
                                                    console.warn('Invalid segment format:', segment);
                                                    continue;
                                                }

                                                const [summary, audioUrl, duration, translation, mappings] = segment;

                                                // If text type, generate an image for it
                                                if (typeOfText.includes("Text") && !generatedImage) {
                                                    const trialpoints = translation || "";
                                                    try {
                                                        generatedImage = await generateImageForText(trialpoints);
                                                    } catch (e) {
                                                        console.error("Error generating image:", e);
                                                    }
                                                }

                                                // Ensure we have valid data for the node
                                                const imageToUse = typeOfText.includes("Text") ? generatedImage : croppedImage;
                                                const durationNum = Number(duration) || 0;
                                                
                                                if (!audioUrl) {
                                                    console.warn('Missing audio URL for segment:', summary);
                                                    continue;
                                                }
                                                
                                                // Create a new player node
                                                const newNode = new PlayerNode(
                                                    currentNode.endingvalue + 1,
                                                    Math.ceil(currentNode.endingvalue + 1 + durationNum),
                                                    imageToUse,
                                                    audioUrl as string,
                                                    heading,
                                                    summary as string,
                                                    translation as string,
                                                    mainImage,
                                                    durationNum,
                                                    !typeOfText.includes("Text"),
                                                    ocr,
                                                    mappings as string[]
                                                );

                                                // Link the nodes
                                                currentNode.setNext(newNode);
                                                newNode.setPrev(currentNode);
                                                currentNode = newNode;
                                                maxEndingValue = Math.max(maxEndingValue, newNode.endingvalue);
                                                processedAnyData = true;

                                                // Update state markers
                                                setState(prev => ({
                                                    ...prev,
                                                    marker: mappings as string[],
                                                    towrite: summary as string,
                                                }));
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                // Skip the dummy head node
                if (startingNode.next) {
                    // Cast the Player type to PlayerNode since we need PlayerNode methods
                    const firstNode = startingNode.next as unknown as PlayerNode;
                    // Set the previous node to null
                    firstNode.setPrev(null);

                    // Set the processed data
                    setState(prev => ({
                        ...prev,
                        dataholder: firstNode,
                        ready: true,
                        max: maxEndingValue
                    }));

                    // If we have a noteId, save the data
                    if (noteId) {
                        // Save to localStorage
                        storeVideoDataLocally(noteId, state.trialdata);

                        // Save to database in the background
                        try {
                            await saveVideoData(noteId, state.trialdata);
                            toast.success("Video data saved successfully");
                        } catch (error) {
                            console.error("Error saving video data:", error);
                            toast.error("Failed to save video data to server");
                        }
                    }
                } else if (!processedAnyData) {
                    // No nodes were created - the data might be valid but in wrong format
                    console.error("Failed to process any nodes from the data:", state.trialdata);
                    toast.error("Failed to process video data. The data format might be incorrect.");
                }
            } catch (error) {
                console.error("Error processing trial data:", error);
                toast.error("Failed to process PDF data");
            }
        };

        processData();
    }, [state.loaded, state.trialdata, state.ready, noteId]);

    // Handle form submission from the upload form
    const handleFormSubmit = (pdfUrl: string, trialData: TrialData) => {
        setState(prev => ({
            ...prev,
            link: pdfUrl,
            trialdata: trialData,
            submit: true,
            loaded: true,
        }));
    };

    // Handle when audio segment ends
    const handleSegmentEnd = () => {
        if (state.dataholder?.next) {
            // Move to the next segment
            const nextNode = state.dataholder.next;
            setState(prev => {
                const newMax = Math.max(prev.max, nextNode.endingvalue);
                return {
                    ...prev,
                    dataholder: nextNode,
                    max: newMax,
                };
            });
        } else {
            toast.success("End of presentation reached");
        }
    };

    const handlePlayPause = () => {
        if (audioRef.current) {
            if (audioRef.current.paused) {
                audioRef.current.play()
                    .then(() => setState(prev => ({ ...prev, isplaying: true })))
                    .catch(err => console.error("Error playing audio:", err));
            } else {
                audioRef.current.pause();
                setState(prev => ({ ...prev, isplaying: false }));
            }
        }
    };

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = Number(e.target.value);
        setState(prev => ({ ...prev, values: newValue }));

        if (state.dataholder) {
            if (newValue < state.dataholder.startingvalue || newValue > state.dataholder.endingvalue) {
                // User moved slider outside current segment
                // Find the right node for this time
                let current = state.dataholder;
                while (current.prev && current.startingvalue > newValue) {
                    current = current.prev;
                }
                while (current.next && current.endingvalue < newValue) {
                    current = current.next;
                }
                
                setState(prev => ({ ...prev, dataholder: current }));
                
                if (audioRef.current) {
                    audioRef.current.currentTime = newValue - current.startingvalue;
                    audioRef.current.play()
                        .then(() => setState(prev => ({ ...prev, isplaying: true })))
                        .catch(err => console.error("Error playing audio:", err));
                }
            } else {
                // User moved slider within current segment
                if (audioRef.current) {
                    audioRef.current.currentTime = newValue - state.dataholder.startingvalue;
                    if (audioRef.current.paused) {
                        audioRef.current.play()
                            .then(() => setState(prev => ({ ...prev, isplaying: true })))
                            .catch(err => console.error("Error playing audio:", err));
                    }
                }
            }
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current && state.dataholder) {
            const current = audioRef.current.currentTime + state.dataholder.startingvalue;
            setState(prev => ({
                ...prev,
                currenttime: current,
                values: current
            }));
        }
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen()
                .then(() => setIsFullscreen(true))
                .catch(err => console.error("Error attempting to enable fullscreen:", err));
        } else {
            document.exitFullscreen()
                .then(() => setIsFullscreen(false))
                .catch(err => console.error("Error attempting to exit fullscreen:", err));
        }
    };

    // Render the component based on state
    if (!state.submit) {
        return <NotesUploadForm onSubmit={handleFormSubmit} initialPdfUrl={pdfUrl} />;
    }

    if (!state.loaded || !state.ready) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
                    <p className="text-xl text-gray-700">Preparing your notes...</p>
                </div>
            </div>
        );
    }

    return state.dataholder ? (
        <div 
            className="container mx-auto border-[10px] border-white rounded-xl p-4 bg-[#f9f9f9] shadow-[0_0_0_2px_#ccc,_inset_0_0_20px_#d9d9d9]"
            ref={containerRef}
        >
            <button
                onClick={toggleFullscreen}
                className="p-3 bg-indigo-600 absolute right-6 top-6 text-white rounded-full shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
                {isFullscreen ? (
                    <Minimize className="h-5 w-5" />
                ) : (
                    <Maximize className="h-5 w-5" />
                )}
            </button>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Left Panel - Content */}
                <div
                    className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100"
                    style={{
                        backgroundImage: "url('https://www.transparenttextures.com/patterns/whitey.png')",
                        backgroundBlendMode: "overlay",
                    }}
                >
                    {state.dataholder.type ? (
                        <div className="p-4">
                            <div className="rounded-lg overflow-hidden shadow-inner">
                                <img
                                    src={state.dataholder.mainImage}
                                    alt="Main Content"
                                    className="w-full h-auto object-cover"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="p-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                <svg
                                    className="h-5 w-5 mr-2 text-indigo-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                                Extracted Text
                            </h2>
                            <div
                                className="prose max-w-none text-gray-700 bg-gray-50 p-4 rounded-lg shadow-inner border border-gray-200"
                                dangerouslySetInnerHTML={{
                                    __html: state.dataholder.ocr.split(". ").map(part =>
                                        markParagraphsHTML(part, state.dataholder?.mappings || [])
                                    ).join(". ")
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* Right Panel - Notes & Audio */}
                <div
                    className="bg-white rounded-xl shadow-lg relative"
                    style={{
                        backgroundImage: "url('https://www.transparenttextures.com/patterns/notebook.png')",
                        backgroundBlendMode: "overlay",
                    }}
                    onMouseEnter={() => setState(prev => ({ ...prev, showControls: true }))}
                    onMouseLeave={() => setState(prev => ({ ...prev, showControls: false }))}
                >
                    <div className="p-6">
                        {/* Image */}
                        <div className="mb-6">
                            <div className="rounded-lg overflow-hidden shadow-md border border-gray-200">
                                <img
                                    src={state.dataholder.image}
                                    alt="Visual Representation"
                                    className="w-full h-auto object-cover"
                                />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="mb-4">
                            <h2 className="text-2xl font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2">
                                {state.dataholder.heading}
                            </h2>
                            <div className="text-gray-700 leading-relaxed">
                                {state.dataholder.content}
                            </div>
                        </div>

                        <div
                            className={`fixed inset-x-0 bottom-0 w-full bg-gradient-to-t from-gray-900/80 to-transparent p-4 transition-opacity duration-300 ${state.showControls ? "opacity-100" : "opacity-0"
                                }`}
                        >
                            <div className="flex items-center mb-2">
                                <button
                                    onClick={handlePlayPause}
                                    className="p-3 bg-white rounded-full shadow-md text-indigo-600 hover:bg-indigo-50 focus:outline-none mr-3"
                                >
                                    {!state.isplaying ? (
                                        <svg
                                            className="h-6 w-6"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    ) : (
                                        <svg
                                            className="h-6 w-6"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    )}
                                </button>
                                <div className="flex-1">
                                    <input
                                        type="range"
                                        min="0"
                                        max={state.max}
                                        value={state.values}
                                        onChange={handleSliderChange}
                                        className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-300"
                                    />
                                    <div className="flex justify-between text-xs text-white mt-1">
                                        <span>{formatTime(state.currenttime)}</span>
                                        <span>{formatTime(state.dataholder.endingvalue)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Hidden audio element */}
                        <audio
                            src={state.dataholder.audio}
                            autoPlay
                            onTimeUpdate={handleTimeUpdate}
                            onEnded={handleSegmentEnd}
                            controls={false}
                            ref={audioRef}
                            className="hidden"
                        />
                    </div>
                </div>
            </div>
        </div>
    ) : (
        <div className="p-8 text-center bg-white rounded-lg shadow-md">
            <div className="text-red-500 text-xl font-semibold mb-4">
                Error: No data available to play
            </div>
            <p className="text-gray-700 mb-2">
                We couldn&apos;t process your notes data. This may happen if:
            </p>
            <ul className="list-disc text-left max-w-md mx-auto mt-2 mb-6 space-y-1">
                <li>The data format is incorrect or corrupted</li>
                <li>The server couldn&apos;t process your notes properly</li>
                <li>There was an issue with the audio or image generation</li>
            </ul>
            <div className="flex justify-center space-x-4">
                <button 
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    Refresh Page
                </button>
                <button 
                    onClick={() => setState(prev => ({ ...prev, submit: false }))}
                    className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    Re-upload Notes
                </button>
            </div>
        </div>
    );
} 