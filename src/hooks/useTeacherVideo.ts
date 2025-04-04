import { useState } from "react";
import { API_URLS } from "../lib/constants";

interface TeacherVideoResponse {
    url?: string;
}

export const useTeacherVideo = () => {
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Fallback video URL - make sure this is a valid, accessible video
    const FALLBACK_VIDEO_URL = "https://app.beam.cloud/output/id/17c882a6-b96c-4ba7-8619-67f66e4fff3d";

    // Function to validate URL
    const isValidVideoUrl = (url: string): boolean => {
        // Basic URL validation
        try {
            new URL(url);
            // Check if it has a video extension (optional)
            const validExtensions = ['.mp4', '.webm', '.ogg', '.mov'];
            return validExtensions.some(ext => url.toLowerCase().endsWith(ext)) || url.includes('beam.cloud/output');
        } catch (e) {
            return false;
        }
    };

    const generateTeacherVideo = async (audioPath: string, chunkNum: number, UID: string) => {
        setIsLoading(true);
        setError(null);
        
        try {
            // Validate audioPath before sending
            if (!audioPath) {
                throw new Error("Audio path is required");
            }

            const response = await fetch(API_URLS.TEACHER_VIDEO_API, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer vpF1tVtHk4EzLfk2dDI-sIdhRcprdOdTirRj9z70V0_MHFy8CPX6pFPLMuV0tkqs_esUL-5Zabj6s2Fj9OPRqg=="
                },
                body: JSON.stringify({
                    source_audio_path: audioPath,
                    destination_video_directory: "content",
                    chunk_num: String(chunkNum), // Ensure chunkNum is sent as a string
                    UID,
                }),
                // Add timeout to prevent indefinite hanging
                signal: AbortSignal.timeout(30000), // 30 second timeout
            });

            if (!response.ok) {
                throw new Error(`API returned status: ${response.status}`);
            }

            const result = await response.json() as TeacherVideoResponse;
            
            // Proper validation of returned URL
            if (result.url && isValidVideoUrl(result.url)) {
                setVideoUrl(result.url);
                console.log("Video URL set:", result.url);
            } else {
                console.warn("Invalid URL returned from API:", result.url);
                // Use fallback only if it's valid
                if (isValidVideoUrl(FALLBACK_VIDEO_URL)) {
                    setVideoUrl(FALLBACK_VIDEO_URL);
                    setError("Using fallback video - API did not return a valid URL");
                } else {
                    throw new Error("No valid video URL available");
                }
            }
        } catch (err) {
            console.error("Teacher video generation error:", err);
            setError(`Failed to generate teacher video: ${err instanceof Error ? err.message : 'Unknown error'}`);
            
            // Only use fallback if it's valid
            if (isValidVideoUrl(FALLBACK_VIDEO_URL)) {
                setVideoUrl(FALLBACK_VIDEO_URL);
                console.log("Using fallback video URL");
            } else {
                setVideoUrl(null);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Method to manually set a video URL (useful for testing)
    const setCustomVideoUrl = (url: string) => {
        if (isValidVideoUrl(url)) {
            setVideoUrl(url);
            setError(null);
        } else {
            setError("Invalid video URL format");
            setVideoUrl(null);
        }
    };

    // Method to reset the hook state
    const reset = () => {
        setVideoUrl(null);
        setError(null);
        setIsLoading(false);
    };

    return { 
        videoUrl, 
        error, 
        isLoading, 
        generateTeacherVideo,
        setCustomVideoUrl,
        reset
    };
};
