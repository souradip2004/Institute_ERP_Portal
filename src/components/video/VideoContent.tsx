
import React from "react";
import ImageSequence from "../ImageSequence";

interface VideoContentProps {
  currentImages: string[];
  imageDurations: number[];
  isPlaying: boolean;
  currentTime: number;
  teacherVideoRef: React.RefObject<HTMLVideoElement>;
  currentSegment: any;
  togglePlay: () => void;
  handleNextSegment: () => void;
}

const VideoContent: React.FC<VideoContentProps> = ({
  currentImages,
  imageDurations,
  isPlaying,
  currentTime,
  teacherVideoRef,
  currentSegment,
  togglePlay,
  handleNextSegment
}) => {
  return (
    <div className="flex h-full">
      <div className="w-1/2 relative overflow-hidden">
        {/* Image Sequence (replacing Animation Video) */}
        {currentImages.length > 0 && imageDurations.length > 0 && (
          <ImageSequence
            images={currentImages}
            durations={imageDurations}
            isPlaying={isPlaying}
            currentTime={currentTime}
            onTimeUpdate={(time) => {
              if (teacherVideoRef.current && Math.abs(teacherVideoRef.current.currentTime - time) > 0.5) {
                teacherVideoRef.current.currentTime = time;
              }
            }}
            onEnded={handleNextSegment}
          />
        )}
      </div>
      
      <div className="w-1/2 relative overflow-hidden border-l border-white/20">
        <video
          ref={teacherVideoRef}
          src={currentSegment?.teacherUrl}
          className="w-full h-full object-cover"
          playsInline
          onClick={togglePlay}
        />
      </div>
    </div>
  );
};

export default VideoContent;
