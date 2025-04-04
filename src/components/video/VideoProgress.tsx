
import React from 'react';

interface VideoProgressProps {
  progress: number;
  handleSeek: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const VideoProgress: React.FC<VideoProgressProps> = ({ progress, handleSeek }) => {
  return (
    <div 
      className="h-1 w-full bg-gray-700 mb-3 rounded-full cursor-pointer"
      onClick={handleSeek}
    >
      <div 
        className="h-full bg-accent rounded-full"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
};

export default VideoProgress;
