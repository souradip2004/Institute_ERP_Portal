
import React from "react";
import { Loader } from "lucide-react";

interface ProcessingIndicatorProps {
  isProcessing: boolean;
  processingStep: string;
  processingProgress: number;
}

const ProcessingIndicator: React.FC<ProcessingIndicatorProps> = ({
  isProcessing,
  processingStep,
  processingProgress
}) => {
  if (!isProcessing) return null;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-navy-dark">
      <Loader size={40} className="text-accent animate-spin mb-4" />
      <p className="text-white text-lg mb-2">
        {processingStep}
      </p>
      <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
        <div 
          className="h-full bg-accent"
          style={{ width: `${processingProgress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProcessingIndicator;
