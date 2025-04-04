
import React from 'react';
import { Play, Pause, Maximize, Minimize, SkipForward } from "lucide-react";

interface VideoControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isFullscreen: boolean;
  showControlsUI: boolean;
  togglePlay: () => void;
  handleSeek: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleSkip: () => void;
  toggleFullscreen: () => void;
  formatTime: (time: number) => string;
}

const VideoControls: React.FC<VideoControlsProps> = ({
  isPlaying,
  currentTime,
  duration,
  isFullscreen,
  showControlsUI,
  togglePlay,
  handleSeek,
  handleSkip,
  toggleFullscreen,
  formatTime
}) => {
  return (
    <div 
      className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 py-3 transition-opacity duration-300 ${
        showControlsUI ? "opacity-100" : "opacity-0"
      }`}
      style={{ pointerEvents: showControlsUI ? "auto" : "none" }}
    >
      {/* Progress bar handled by VideoProgress component */}
      <div 
        className="h-1 w-full bg-gray-700 mb-3 rounded-full cursor-pointer"
        onClick={handleSeek}
      >
        <div 
          className="h-full bg-accent rounded-full"
          style={{ width: `${(currentTime / duration) * 100}%` }}
        ></div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Play/Pause button */}
          <button 
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? 
              <Pause size={18} className="text-white" /> : 
              <Play size={18} className="text-white" />
            }
          </button>
          
          {/* Skip button */}
          <button
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            onClick={handleSkip}
            aria-label="Skip to end"
          >
            <SkipForward size={18} className="text-white" />
          </button>
          
          {/* Time display */}
          <div className="text-white text-sm">
            <span>{formatTime(currentTime)}</span>
            <span className="mx-1">/</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        
        {/* Fullscreen button */}
        <button
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullscreen ? 
            <Minimize size={18} className="text-white" /> : 
            <Maximize size={18} className="text-white" />
          }
        </button>
      </div>
    </div>
  );
};

export default VideoControls;
