
import React, { useState, useRef, useEffect } from "react";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";
import InfoCard from "../InfoCard";
import VideoBuffering from "./VideoBuffering";
import VideoControls from "./VideoControls";

interface SingleVideoPlayerProps {
  videoSrc: string;
  onEnded?: () => void;
  autoPlay?: boolean;
  showControls?: boolean;
  className?: string;
  showInfoCard?: boolean;
  infoCardMessage?: string;
  onInfoCardClick?: () => void;
}

const SingleVideoPlayer: React.FC<SingleVideoPlayerProps> = ({
  videoSrc,
  onEnded,
  autoPlay = true,
  showControls = true,
  className,
  showInfoCard = false,
  infoCardMessage = "More information",
  onInfoCardClick
}) => {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const [showControlsUI, setShowControlsUI] = useState(true);
  const [displayInfoCard, setDisplayInfoCard] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<number | null>(null);
  
  // Show InfoCard after 30% of the video has played
  useEffect(() => {
    if (showInfoCard && progress > 30 && progress < 80) {
      setDisplayInfoCard(true);
    } else {
      setDisplayInfoCard(false);
    }
  }, [progress, showInfoCard]);
  
  // Initialize video
  useEffect(() => {
    const video = videoRef.current;
    
    if (!video) return;
    
    const handleCanPlay = () => {
      setIsBuffering(false);
      setDuration(video.duration);
      
      if (autoPlay) {
        playVideo();
      }
    };
    
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      setProgress((video.currentTime / video.duration) * 100);
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      if (onEnded) onEnded();
    };
    
    const handleLoadStart = () => {
      setIsBuffering(true);
    };
    
    const handleError = (e: Event) => {
      console.error("Video error in SingleVideoPlayer:", e);
    };
    
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('error', handleError);
    
    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('error', handleError);
    };
  }, [videoRef.current, videoSrc, autoPlay, onEnded]);
  
  // Setup controls visibility
  useEffect(() => {
    if (!showControls) return;
    
    const handleMouseMove = () => {
      setShowControlsUI(true);
      
      if (controlsTimeoutRef.current) {
        window.clearTimeout(controlsTimeoutRef.current);
      }
      
      controlsTimeoutRef.current = window.setTimeout(() => {
        if (isPlaying) {
          setShowControlsUI(false);
        }
      }, 3000);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (controlsTimeoutRef.current) {
        window.clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying, showControls]);
  
  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  const playVideo = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.play()
      .then(() => {
        console.log("Video started playing in SingleVideoPlayer");
        setIsPlaying(true);
      })
      .catch(err => {
        console.error("Error playing video in SingleVideoPlayer:", err);
        // Try with muted as a fallback (browsers often block autoplay)
        video.muted = true;
        video.play()
          .then(() => {
            console.log("Video started playing muted in SingleVideoPlayer");
            video.muted = false;
            setIsPlaying(true);
          })
          .catch(e => console.error("Still couldn't play video in SingleVideoPlayer:", e));
      });
  };
  
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      playVideo();
    }
  };
  
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error("Error attempting to enable fullscreen:", err);
      });
    } else {
      document.exitFullscreen();
    }
  };
  
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video) return;
    
    const progressBar = e.currentTarget;
    const clickPosition = (e.clientX - progressBar.getBoundingClientRect().left) / progressBar.offsetWidth;
    const newTime = clickPosition * video.duration;
    
    video.currentTime = newTime;
    setCurrentTime(newTime);
    setProgress(clickPosition * 100);
  };
  
  const handleSkip = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.currentTime = video.duration - 0.1;
  };
  
  const formatTime = (timeInSeconds: number): string => {
    if (isNaN(timeInSeconds)) return "00:00";
    
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleInfoCardOpen = () => {
    if (onInfoCardClick) {
      // Pause the video when info card is clicked
      if (videoRef.current && isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
      onInfoCardClick();
    }
  };

  return (
    <div 
      ref={containerRef}
      className={cn("relative aspect-video bg-black overflow-hidden", className)}
    >
      <video
        ref={videoRef}
        src={videoSrc}
        className="w-full h-full object-contain"
        playsInline
        onClick={togglePlay}
        poster="/placeholder.svg"
      />
      
      {/* Info Card */}
      {showInfoCard && displayInfoCard && (
        <InfoCard 
          message={infoCardMessage}
          onOpen={handleInfoCardOpen}
          visibleTime={8000}
          position="top-right"
          timeout={1000}
        />
      )}
      
      {/* Buffering indicator */}
      <VideoBuffering isBuffering={isBuffering} />
      
      {/* Video controls */}
      {showControls && (
        <VideoControls 
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          isFullscreen={isFullscreen}
          showControlsUI={showControlsUI}
          togglePlay={togglePlay}
          handleSeek={handleSeek}
          handleSkip={handleSkip}
          toggleFullscreen={toggleFullscreen}
          formatTime={formatTime}
        />
      )}
      
      {/* Play button overlay */}
      {!isPlaying && !isBuffering && (
        <div 
          className="absolute inset-0 flex items-center justify-center cursor-pointer"
          onClick={togglePlay}
        >
          <div className="rounded-full bg-black/50 p-6 hover:scale-105 transition-transform">
            <Play size={40} className="text-white" />
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleVideoPlayer;
