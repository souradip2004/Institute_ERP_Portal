'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Maximize, Minimize } from 'lucide-react';
import { Player } from './types';
import { formatTime, markParagraphsHTML } from './utils';

interface NotesPlayerProps {
    player: Player;
    onEnded: () => void;
}

export default function NotesPlayer({ player, onEnded }: NotesPlayerProps) {
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [sliderValue, setSliderValue] = useState<number>(0);
    const [maxTime, setMaxTime] = useState<number>(player.endingvalue);
    const [showControls, setShowControls] = useState<boolean>(false);
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

    const audioRef = useRef<HTMLAudioElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Update max time when player changes
        setMaxTime(Math.max(maxTime, player.endingvalue));

        // Auto-play when player changes
        if (audioRef.current) {
            audioRef.current.play()
                .then(() => setIsPlaying(true))
                .catch(err => console.error("Error playing audio:", err));
        }
    }, [player, maxTime]);

    const handlePlayPause = () => {
        if (audioRef.current) {
            if (audioRef.current.paused) {
                audioRef.current.play()
                    .then(() => setIsPlaying(true))
                    .catch(err => console.error("Error playing audio:", err));
            } else {
                audioRef.current.pause();
                setIsPlaying(false);
            }
        }
    };

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = Number(e.target.value);
        setSliderValue(newValue);

        if (audioRef.current) {
            if (newValue < player.startingvalue || newValue > player.endingvalue) {
                // User moved slider outside current segment
                onEnded();
            } else {
                // User moved slider within current segment
                audioRef.current.currentTime = newValue - player.startingvalue;
                if (audioRef.current.paused) {
                    audioRef.current.play()
                        .then(() => setIsPlaying(true))
                        .catch(err => console.error("Error playing audio:", err));
                }
            }
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            const current = audioRef.current.currentTime + player.startingvalue;
            setCurrentTime(current);
            setSliderValue(current);
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

    return (
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
                    {player.type ? (
                        <div className="p-4">
                            <div className="rounded-lg overflow-hidden shadow-inner">
                                <img
                                    src={player.mainImage}
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
                                    __html: player.ocr.split(". ").map(part =>
                                        markParagraphsHTML(part, player.mappings)
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
                    onMouseEnter={() => setShowControls(true)}
                    onMouseLeave={() => setShowControls(false)}
                >
                    <div className="p-6">
                        {/* Image */}
                        <div className="mb-6">
                            <div className="rounded-lg overflow-hidden shadow-md border border-gray-200">
                                <img
                                    src={player.image}
                                    alt="Visual Representation"
                                    className="w-full h-auto object-cover"
                                />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="mb-4">
                            <h2 className="text-2xl font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2">
                                {player.heading}
                            </h2>
                            <div className="text-gray-700 leading-relaxed">
                                {player.content}
                            </div>
                        </div>

                        <div
                            className={`fixed inset-x-0 bottom-0 w-full bg-gradient-to-t from-gray-900/80 to-transparent p-4 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"
                                }`}
                        >
                            <div className="flex items-center mb-2">
                                <button
                                    onClick={handlePlayPause}
                                    className="p-3 bg-white rounded-full shadow-md text-indigo-600 hover:bg-indigo-50 focus:outline-none mr-3"
                                >
                                    {!isPlaying ? (
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
                                        max={maxTime}
                                        value={sliderValue}
                                        onChange={handleSliderChange}
                                        className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-300"
                                    />
                                    <div className="flex justify-between text-xs text-white mt-1">
                                        <span>{formatTime(currentTime)}</span>
                                        <span>{formatTime(player.endingvalue)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Hidden audio element */}
                        <audio
                            src={player.audio}
                            autoPlay
                            onTimeUpdate={handleTimeUpdate}
                            onEnded={onEnded}
                            controls={false}
                            ref={audioRef}
                            className="hidden"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
} 