'use client';

import React, { useEffect, useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { Maximize, Minimize, Play, Pause, Volume2, VolumeX, SkipForward, RefreshCw } from 'lucide-react';
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
        trialdata: initialVideoData || {},
        max: 0,
        toDisplay: false,
        showControls: false,
        showExtractedText: true,
    });

    const audioRef = useRef<HTMLAudioElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
    const [isMuted, setIsMuted] = useState<boolean>(false);
    const [volume, setVolume] = useState<number>(1);
    const [isVolumeControlVisible, setIsVolumeControlVisible] = useState<boolean>(false);

    useEffect(() => {
        if (noteId && !initialVideoData && !state.loaded && !state.ready) {
            const fetchVideoData = async () => {
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

    useEffect(() => {
        if (!state.loaded || !state.trialdata.length || state.ready) return;

        const processData = async () => {
            try {
                console.log('Processing trial data:', state.trialdata);
                
                const startingNode = new PlayerNode(-1, -1, "", "", "", "", "", "", 0, false, "", []);
                let currentNode = startingNode;
                let processedAnyData = false;
                let maxEndingValue = 0;

                for (const item of state.trialdata) {
                    for (const [, pageValue] of Object.entries(item)) {
                        for (const [, textValue] of Object.entries(pageValue)) {
                            if (Array.isArray(textValue)) {
                                let mainImage = '';
                                let croppedImage = '';
                                let ocr = '';
                                let typeOfText = '';
                                let generatedImage = '';

                                for (let i = 0; i < textValue.length; i++) {
                                    const currentItem = textValue[i];

                                    if (i === 0) {
                                        mainImage = currentItem as string;
                                    } else if (i === 1) {
                                        croppedImage = currentItem as string;
                                        typeOfText = await getImgCategoryFromGemini(croppedImage, API_KEY);
                                    } else if (i === 2) {
                                        ocr = currentItem as string;
                                    } else if (i === 3) {
                                        const segments = currentItem as Record<string, any[]>;

                                        for (const [heading, segmentArray] of Object.entries(segments)) {
                                            setState(prev => ({ ...prev, keypoint: heading }));

                                            for (const segment of segmentArray) {
                                                if (!Array.isArray(segment) || segment.length < 5) {
                                                    console.warn('Invalid segment format:', segment);
                                                    continue;
                                                }

                                                const [summary, audioUrl, duration, translation, mappings] = segment;

                                                if (typeOfText.includes("Text") && !generatedImage) {
                                                    const trialpoints = translation || "";
                                                    try {
                                                        generatedImage = await generateImageForText(trialpoints);
                                                    } catch (e) {
                                                        console.error("Error generating image:", e);
                                                    }
                                                }

                                                const imageToUse = typeOfText.includes("Text") ? generatedImage : croppedImage;
                                                const durationNum = Number(duration) || 0;
                                                
                                                if (!audioUrl) {
                                                    console.warn('Missing audio URL for segment:', summary);
                                                    continue;
                                                }
                                                
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

                                                currentNode.setNext(newNode);
                                                newNode.setPrev(currentNode);
                                                currentNode = newNode;
                                                maxEndingValue = Math.max(maxEndingValue, newNode.endingvalue);
                                                processedAnyData = true;

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

                if (startingNode.next) {
                    const firstNode = startingNode.next as unknown as PlayerNode;
                    firstNode.setPrev(null);

                    setState(prev => ({
                        ...prev,
                        dataholder: firstNode,
                        ready: true,
                        max: maxEndingValue
                    }));

                    if (noteId) {
                        storeVideoDataLocally(noteId, state.trialdata);
                        try {
                            await saveVideoData(noteId, state.trialdata);
                            toast.success("Video data saved successfully");
                        } catch (error) {
                            console.error("Error saving video data:", error);
                            toast.error("Failed to save video data to server");
                        }
                    }
                } else if (!processedAnyData) {
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

    const handleFormSubmit = (pdfUrl: string, trialData: TrialData) => {
        setState(prev => ({
            ...prev,
            link: pdfUrl,
            trialdata: trialData,
            submit: true,
            loaded: true,
        }));
    };

    const handleSegmentEnd = () => {
        if (state.dataholder?.next) {
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

    const toggleMute = () => {
        if (audioRef.current) {
            const newMuteState = !isMuted;
            audioRef.current.muted = newMuteState;
            setIsMuted(newMuteState);
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (audioRef.current) {
            audioRef.current.volume = newVolume;
            setIsMuted(newVolume === 0);
        }
    };

    const handleNextSegment = () => {
        if (state.dataholder?.next) {
            handleSegmentEnd();
        }
    };

    const handleRestart = () => {
        if (state.dataholder) {
            if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play()
                    .then(() => setState(prev => ({ ...prev, isplaying: true })))
                    .catch(err => console.error("Error playing audio:", err));
            }
        }
    };

    if (!state.submit) {
        return <NotesUploadForm onSubmit={handleFormSubmit} initialPdfUrl={pdfUrl} />;
    }

    if (!state.loaded || !state.ready) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-6"></div>
                    <h3 className="text-2xl font-semibold text-gray-800 mb-2">Preparing Your Notes</h3>
                    <p className="text-gray-600">We're transforming your document into an interactive learning experience.</p>
                </div>
            </div>
        );
    }

    return state.dataholder ? (
        <div 
            className="w-full h-full bg-[#0f172a] flex flex-col"
            ref={containerRef}
        >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-800 to-purple-800 px-4 py-3 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="16" 
                            height="16" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            className="text-white"
                        >
                            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                            <polyline points="14 2 14 8 20 8"/>
                            <path d="M8.5 13.5l2.5 2.5 5-5"/>
                        </svg>
                    </div>
                    <h1 className="text-base font-medium text-white truncate max-w-[220px] sm:max-w-md">
                        {state.dataholder.heading || 'Interactive Notes Player'}
                    </h1>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                {/* Image/Visual Display and Controls */}
                <div className="flex-1 flex flex-col bg-[#1e293b] min-h-0">
                    <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
                        {state.dataholder.type ? (
                            <div className="relative w-full h-full flex justify-center items-center">
                                <img
                                    src={state.dataholder.mainImage}
                                    alt="Main Content"
                                    className="max-w-full max-h-full object-contain rounded-md shadow-lg"
                                />
                            </div>
                        ) : (
                            <div className="relative w-full h-full flex justify-center items-center">
                                <img
                                    src={state.dataholder.image}
                                    alt="Visual Representation"
                                    className="max-w-full max-h-full object-contain rounded-md shadow-lg"
                                />
                            </div>
                        )}
                    </div>
                    
                    {/* Player Controls */}
                    <div className="w-full bg-[#0f172a] text-white px-4 py-4 border-t border-slate-700 shrink-0">
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-3 flex-wrap">
                                <button
                                    onClick={handlePlayPause}
                                    className="w-10 h-10 flex items-center justify-center bg-indigo-600 rounded-full text-white hover:bg-indigo-500 focus:outline-none transition-colors"
                                    aria-label={state.isplaying ? "Pause" : "Play"}
                                >
                                    {!state.isplaying ? (
                                        <Play className="h-5 w-5" />
                                    ) : (
                                        <Pause className="h-5 w-5" />
                                    )}
                                </button>
                                
                                <div className="flex space-x-1">
                                    <button
                                        onClick={handleNextSegment}
                                        className="w-8 h-8 flex items-center justify-center bg-slate-700 rounded-full text-white hover:bg-slate-600 focus:outline-none transition-colors"
                                        aria-label="Next segment"
                                    >
                                        <SkipForward className="h-4 w-4" />
                                    </button>
                                    
                                    <button
                                        onClick={handleRestart}
                                        className="w-8 h-8 flex items-center justify-center bg-slate-700 rounded-full text-white hover:bg-slate-600 focus:outline-none transition-colors"
                                        aria-label="Restart segment"
                                    >
                                        <RefreshCw className="h-4 w-4" />
                                    </button>
                                    
                                    <button
                                        onClick={toggleFullscreen}
                                        className="w-8 h-8 flex items-center justify-center bg-slate-700 rounded-full text-white hover:bg-slate-600 focus:outline-none transition-colors"
                                        aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                                    >
                                        {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                                    </button>
                                </div>
                                
                                <div className="flex items-center text-xs text-slate-300 min-w-[100px] ml-2">
                                    <span className="tabular-nums">{formatTime(state.currenttime)}</span>
                                    <span className="mx-1 text-slate-500">/</span>
                                    <span className="tabular-nums">{formatTime(state.dataholder.endingvalue)}</span>
                                </div>
                                
                                <div className="flex-1"></div>
                                
                                <div className="relative">
                                    <button
                                        onClick={toggleMute}
                                        onMouseEnter={() => setIsVolumeControlVisible(true)}
                                        className="w-8 h-8 flex items-center justify-center text-white hover:bg-slate-700 rounded-full transition-colors"
                                        aria-label={isMuted ? "Unmute" : "Mute"}
                                    >
                                        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                                    </button>
                                    
                                    <div 
                                        className={`absolute bottom-full right-0 bg-slate-800 p-2 rounded-lg shadow-lg mb-2 transition-opacity duration-200 z-10 ${
                                            isVolumeControlVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
                                        }`}
                                        onMouseEnter={() => setIsVolumeControlVisible(true)}
                                        onMouseLeave={() => setIsVolumeControlVisible(false)}
                                    >
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.01"
                                            value={volume}
                                            onChange={handleVolumeChange}
                                            className="w-24 accent-indigo-500"
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="relative h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                <input
                                    type="range"
                                    min="0"
                                    max={state.max}
                                    value={state.values}
                                    onChange={handleSliderChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className="absolute top-0 left-0 h-full bg-indigo-500 rounded-full" 
                                     style={{ width: `${(state.values / state.max) * 100}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Transcript Area */}
                <div className="w-full lg:w-[400px] bg-[#0f172a] border-t lg:border-t-0 lg:border-l border-slate-700 flex flex-col shrink-0">
                    <div className="bg-[#1e293b] border-b border-slate-700 p-1 flex shrink-0">
                        <button 
                            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                                !state.showExtractedText ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-700/50'
                            }`}
                            onClick={() => setState(prev => ({ ...prev, showExtractedText: false }))}
                        >
                            Transcript
                        </button>
                        <button 
                            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                                state.showExtractedText ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-700/50'
                            }`}
                            onClick={() => setState(prev => ({ ...prev, showExtractedText: true }))}
                        >
                            Original Text
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                        {state.showExtractedText && !state.dataholder.type ? (
                            <div className="text-slate-300">
                                <h3 className="text-sm font-semibold text-white mb-3 flex items-center">
                                    <svg
                                        className="h-4 w-4 mr-1 text-indigo-400"
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
                                    Original Text
                                </h3>
                                <div
                                    className="prose prose-sm max-w-none text-slate-300 overflow-y-auto text-sm"
                                    dangerouslySetInnerHTML={{
                                        __html: state.dataholder.ocr.split(". ").map(part =>
                                            markParagraphsHTML(part, state.dataholder?.mappings || [])
                                        ).join(". ")
                                    }}
                                />
                            </div>
                        ) : (
                            <div>
                                <h2 className="text-lg font-semibold text-white mb-3 border-b border-slate-700 pb-2">
                                    {state.dataholder.heading}
                                </h2>
                                <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                                    {state.dataholder.content}
                                </div>
                                {state.dataholder.summary && (
                                    <div className="mt-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                                        <h4 className="text-xs font-medium text-slate-300 mb-1">Summary</h4>
                                        <p className="text-slate-400 text-xs">{state.dataholder.summary}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <audio
                src={state.dataholder.audio}
                autoPlay
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleSegmentEnd}
                controls={false}
                ref={audioRef}
                className="hidden"
            />

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(30, 41, 59, 0.5);
                }
                
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(51, 65, 85, 0.7);
                    border-radius: 20px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(71, 85, 105, 0.9);
                }

                @media (max-width: 640px) {
                    .min-w-[100px] {
                        min-width: 80px;
                    }
                    .text-base {
                        font-size: 0.875rem;
                    }
                    .max-w-[220px] {
                        max-width: 150px;
                    }
                }
            `}</style>
        </div>
    ) : (
        <div className="p-8 text-center bg-[#0f172a] text-white rounded-lg shadow-xl max-w-2xl mx-auto mt-10">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
            </div>
            <h2 className="text-xl font-bold mb-4">No Data Available</h2>
            <p className="text-slate-300 mb-4">
                We couldn't process your notes data. This may happen if:
            </p>
            <ul className="list-disc text-left max-w-md mx-auto mt-2 mb-6 space-y-2 text-slate-400">
                <li>The data format is incorrect or corrupted</li>
                <li>The server couldn't process your notes properly</li>
                <li>There was an issue with the audio or image generation</li>
            </ul>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mt-6">
                <button 
                    onClick={() => window.location.reload()}
                    className="px-5 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors w-full sm:w-auto"
                >
                    Refresh Page
                </button>
                <button 
                    onClick={() => setState(prev => ({ ...prev, submit: false }))}
                    className="px-5 py-2 border border-indigo-600 text-indigo-400 rounded-md hover:bg-indigo-900/20 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors w-full sm:w-auto"
                >
                    Re-upload Notes
                </button>
            </div>
        </div>
    );
}