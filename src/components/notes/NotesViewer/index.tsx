'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import NotesUploadForm from './NotesUploadForm';
import NotesPlayer from './NotesPlayer';
import { PlayerNode } from './PlayerClass';
import { NotesViewerProps, NotesViewerState, PageItem, Player, TrialData } from './types';
import { getImgCategoryFromGemini, generateImageForText, saveVideoData } from './api';
import { storeVideoDataLocally, getLocalVideoData, hasLocalVideoData } from './utils';

const API_KEY = "AIzaSyA4JS-LxAnKP3BY2DDcYCuEKd96troXeyc";

export default function NotesViewer({ pdfUrl, noteId, initialVideoData }: NotesViewerProps) {
    const [state, setState] = useState<NotesViewerState>({
        submit: !!initialVideoData,
        link: pdfUrl || '',
        loaded: !!initialVideoData,
        ready: !!initialVideoData,
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

    const [mydata, setMydata] = useState<Player | null>(null);

    useEffect(() => {
        // If we have noteId and initialVideoData is not provided, try to get from localStorage first
        if (noteId && !initialVideoData && !state.loaded && !state.ready) {
            if (hasLocalVideoData(noteId)) {
                const localData = getLocalVideoData(noteId);
                if (localData) {
                    setState(prev => ({
                        ...prev,
                        trialdata: localData,
                        submit: true,
                        loaded: true,
                    }));
                }
            }
        }
    }, [noteId, initialVideoData, state.loaded, state.ready]);

    // Process trial data into linked list when loaded
    useEffect(() => {
        if (!state.loaded || !state.trialdata.length || state.ready) return;

        const processData = async () => {
            try {
                let startingNode = new PlayerNode(-1, -1, "", "", "", "", "", "", 0, false, "", []);
                let currentNode = startingNode;

                // Process each item in trialdata
                for (const item of state.trialdata) {
                    for (const [key, value] of Object.entries(item)) {
                        for (const [subKey, subValue] of Object.entries(value)) {
                            if (Array.isArray(subValue)) {
                                let mainImage = '';
                                let croppedImage = '';
                                let ocr = '';
                                let typeOfText = '';
                                let generatedImage = '';

                                // Process each part of the subValue array
                                for (let i = 0; i < subValue.length; i++) {
                                    const currentItem = subValue[i];

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
                                            for (const [summary, audioUrl, duration, translation, mappings] of segmentArray) {
                                                // If text type, generate an image for it
                                                if (typeOfText.includes("Text") && !generatedImage) {
                                                    let trialpoints = translation || "";
                                                    try {
                                                        generatedImage = await generateImageForText(trialpoints);
                                                    } catch (e) {
                                                        console.error("Error generating image:", e);
                                                    }
                                                }

                                                // Create a new player node
                                                const imageToUse = typeOfText.includes("Text") ? generatedImage : croppedImage;
                                                const durationNum = duration as number;
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
                    setMydata(firstNode);
                    setState(prev => ({
                        ...prev,
                        dataholder: firstNode,
                        ready: true,
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
        <NotesPlayer player={state.dataholder} onEnded={handleSegmentEnd} />
    ) : (
        <div className="p-4 text-red-500">Error: No data available to play</div>
    );
} 