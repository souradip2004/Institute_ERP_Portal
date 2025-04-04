
import React from 'react';
import { Loader } from "lucide-react";

interface VideoBufferingProps {
  isBuffering: boolean;
}

const VideoBuffering: React.FC<VideoBufferingProps> = ({ isBuffering }) => {
  if (!isBuffering) return null;
  
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
      <div className="bg-black/60 rounded-full p-3">
        <Loader size={32} className="text-white animate-spin" />
      </div>
    </div>
  );
};

export default VideoBuffering;
