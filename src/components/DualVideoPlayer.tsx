"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Loader } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import TitleBar from './video/TitleBar';
import VideoControls from './video/VideoControls';
import ImageTransition from './video/ImageTransition';

interface DualVideoPlayerProps {
  images: string[];
  teacherVideoUrl: string | null;
  audioDuration: number;
  title?: string;
  onError?: (error: string) => void;
  transitionTypes?: ('fade' | 'displacement' | 'noise')[];
}

const DualVideoPlayer: React.FC<DualVideoPlayerProps> = ({
  images,
  teacherVideoUrl,
  audioDuration,
  title = "Educational Video",
  onError,
  transitionTypes = ['fade', 'displacement', 'noise']
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [prevImageIndex, setPrevImageIndex] = useState<number | null>(null);
  const [currentTransitionType, setCurrentTransitionType] = useState<'fade' | 'displacement' | 'noise'>('fade');
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showTeacher, setShowTeacher] = useState(true);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const teacherVideoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Calculate time per image
  const imageTimeInterval = audioDuration > 0 ? audioDuration / Math.max(1, images.length) : 1;
  
  // Handle image change - store previous image index for transition and cycle transition types
  useEffect(() => {
    if (currentImageIndex !== prevImageIndex) {
      setPrevImageIndex(currentImageIndex);
      
      // Cycle through transition types
      const currentTransitionIndex = transitionTypes.indexOf(currentTransitionType);
      const nextTransitionIndex = (currentTransitionIndex + 1) % transitionTypes.length;
      setCurrentTransitionType(transitionTypes[nextTransitionIndex]);
    }
  }, [currentImageIndex]);

  // Handle video load 
  const handleVideoLoadedData = () => {
    setVideoLoaded(true);
    setVideoError(null);
    if (teacherVideoRef.current) {
      setDuration(teacherVideoRef.current.duration);
    }
    toast({
      title: "Success",
      description: "Video loaded successfully",
      variant: "default"
    });
  };

  // Handle video load error
  const handleVideoError = () => {
    const errorMsg = "Error loading video. Check the video URL source.";
    setVideoError(errorMsg);
    setVideoLoaded(false);
    setIsPlaying(false);
    if (onError) onError(errorMsg);
    toast({
      title: "Error",
      description: errorMsg,
      variant: "destructive"
    });
    console.error("Video error occurred with URL:", teacherVideoUrl);
  };
  
  // Format time as MM:SS
  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Handle play/pause
  const togglePlay = () => {
    if (!teacherVideoRef.current) return;
    
    if (!videoLoaded) {
      toast({
        title: "Error",
        description: "Video is not yet loaded",
        variant: "destructive"
      });
      return;
    }
    
    if (isPlaying) {
      teacherVideoRef.current.pause();
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      setIsPlaying(false);
    } else {
      // Try to play and catch any errors
      const playPromise = teacherVideoRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise.then(() => {
          setIsPlaying(true);
          startProgressUpdate();
        }).catch(err => {
          console.error("Video play error:", err);
          toast({
            title: "Error",
            description: "Failed to play video. Browser may block autoplay.",
            variant: "destructive"
          });
          setIsPlaying(false);
          if (onError) onError("Failed to play video");
        });
      }
    }
  };
  
  // Handle seeking
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!teacherVideoRef.current || !videoLoaded) return;
    
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickPosition = e.clientX - rect.left;
    const percentClicked = (clickPosition / rect.width) * 100;
    const newProgress = Math.max(0, Math.min(100, percentClicked));
    
    const seekTime = (newProgress / 100) * duration;
    teacherVideoRef.current.currentTime = seekTime;
    setProgress(newProgress);
    setCurrentTime(seekTime);
    
    // Update current image based on seek position
    const newImageIndex = Math.min(
      Math.floor(seekTime / imageTimeInterval),
      images.length - 1
    );
    
    if (newImageIndex !== currentImageIndex && newImageIndex >= 0) {
      setPrevImageIndex(currentImageIndex);
      setCurrentImageIndex(newImageIndex);
    }
  };
  
  // Skip to end
  const handleSkip = () => {
    if (!teacherVideoRef.current || !videoLoaded) return;
    
    teacherVideoRef.current.currentTime = duration;
    setProgress(100);
    setCurrentTime(duration);
    setPrevImageIndex(currentImageIndex);
    setCurrentImageIndex(images.length - 1);
    
    toast({
      description: "Skipped to end",
      variant: "default"
    });
  };
  
  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        toast({
          title: "Error",
          description: `Error attempting to enable fullscreen: ${err.message}`,
          variant: "destructive"
        });
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(err => {
        toast({
          title: "Error",
          description: `Error attempting to exit fullscreen: ${err.message}`,
          variant: "destructive"
        });
      });
    }
  };
  
  // Update progress bar and current image
  const startProgressUpdate = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    
    progressIntervalRef.current = setInterval(() => {
      if (teacherVideoRef.current) {
        const currentTime = teacherVideoRef.current.currentTime;
        const videoDuration = teacherVideoRef.current.duration || audioDuration;
        
        if (videoDuration > 0) {
          // Update progress percentage
          const progressPercentage = (currentTime / videoDuration) * 100;
          setProgress(progressPercentage);
          setCurrentTime(currentTime);
          
          // Update current image based on time
          const newImageIndex = Math.min(
            Math.floor(currentTime / imageTimeInterval),
            images.length - 1
          );
          
          if (newImageIndex !== currentImageIndex && newImageIndex >= 0) {
            setPrevImageIndex(currentImageIndex);
            setCurrentImageIndex(newImageIndex);
          }
        }
      }
    }, 50);
  };
  
  // Handle video ended
  const handleVideoEnded = () => {
    setIsPlaying(false);
    setProgress(100);
    toast({
      title: "Success",
      description: "Video playback completed",
      variant: "default"
    });
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };
  
  // Handle buffering
  const handleWaiting = () => {
    setIsBuffering(true);
  };
  
  const handleCanPlay = () => {
    setIsBuffering(false);
  };
  
  // Toggle teacher video visibility
  const toggleTeacherVisibility = () => {
    setShowTeacher(!showTeacher);
    toast({
      description: showTeacher ? "Teacher video hidden" : "Teacher video visible",
      variant: "default"
    });
  };
  
  // Controls visibility
  const handleMouseMove = () => {
    setShowControls(true);
    
    if (containerRef.current) {
      containerRef.current.style.cursor = 'default';
    }
    
    // Hide controls after 3 seconds of inactivity
    if (isPlaying) {
      setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
          if (containerRef.current) {
            containerRef.current.style.cursor = 'none';
          }
        }
      }, 3000);
    }
  };
  
  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);
  
  // Reset state when video source changes
  useEffect(() => {
    setCurrentImageIndex(0);
    setPrevImageIndex(null);
    setProgress(0);
    setIsPlaying(false);
    setVideoLoaded(false);
    setVideoError(null);
    
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    
    // Check if video URL is valid
    if (!teacherVideoUrl) {
      setVideoError("No video URL provided");
      if (onError) onError("No video URL provided");
    }
  }, [teacherVideoUrl, images, onError]);

  // Get current and previous image URLs
  const currentImageUrl = images && images.length > 0 && currentImageIndex >= 0 && currentImageIndex < images.length 
    ? images[currentImageIndex] 
    : null;
  
  const prevImageUrl = prevImageIndex !== null && images && images.length > 0 && prevImageIndex >= 0 && prevImageIndex < images.length 
    ? images[prevImageIndex] 
    : null;

  return (
    <div 
      ref={containerRef}
      className="relative aspect-video w-full max-w-6xl mx-auto bg-black rounded-lg overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Title bar */}
      <TitleBar title={title} />
      
      {/* Video players container */}
      <div className="w-full h-full flex">
        {/* Image player container */}
        <div className={`${showTeacher ? 'w-3/4' : 'w-full'} h-full bg-black relative transition-all duration-300 ease-in-out`}>
          {currentImageUrl ? (
            <ImageTransition
              currentImage={currentImageUrl}
              prevImage={prevImageUrl}
              transitionType={currentTransitionType}
            />
          ) : (
            <div className="w-full h-full bg-gray-900 flex items-center justify-center">
              <p className="text-white text-lg">No images available</p>
            </div>
          )}
        </div>
        
        {/* Teacher video container */}
        {showTeacher && (
          <div className="w-1/4 h-full bg-blue-900 overflow-hidden transition-all duration-300 ease-in-out">
            {teacherVideoUrl ? (
              <video
                ref={teacherVideoRef}
                className="w-full h-full object-cover"
                src={teacherVideoUrl}
                onLoadedData={handleVideoLoadedData}
                onError={handleVideoError}
                onEnded={handleVideoEnded}
                onWaiting={handleWaiting}
                onCanPlay={handleCanPlay}
                playsInline
                preload="auto"
                muted={false}
                controls={false}
              />
            ) : (
              <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                <p className="text-white text-lg">No video available</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Loading indicator */}
      {!videoLoaded && teacherVideoUrl && !videoError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-white flex flex-col items-center">
            <Loader className="w-10 h-10 animate-spin mb-2" />
            <p>Loading video...</p>
          </div>
        </div>
      )}
      
      {/* Error message */}
      {videoError && (
        <div className="absolute top-12 left-0 right-0 bg-red-500 bg-opacity-80 text-white p-2 text-center">
          {videoError}
        </div>
      )}
      
      {/* Buffering indicator */}
      {isBuffering && isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-black bg-opacity-60 rounded-full p-3">
            <Loader className="w-8 h-8 text-white animate-spin" />
          </div>
        </div>
      )}
      
      {/* Play button overlay */}
      {!isPlaying && !isBuffering && videoLoaded && (
        <button 
          onClick={togglePlay}
          className="absolute inset-0 w-full h-full flex items-center justify-center bg-black bg-opacity-30 transition-all hover:bg-opacity-40"
        >
          <div className="bg-blue-600 hover:bg-blue-700 rounded-full p-5 transition-all">
            <div className="w-8 h-8 text-white flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            </div>
          </div>
        </button>
      )}
      
      {/* Video controls */}
      <VideoControls
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        isFullscreen={isFullscreen}
        showControlsUI={showControls}
        togglePlay={togglePlay}
        handleSeek={handleSeek}
        handleSkip={handleSkip}
        toggleFullscreen={toggleFullscreen}
        formatTime={formatTime}
      />
    </div>
  );
};

export default DualVideoPlayer;
