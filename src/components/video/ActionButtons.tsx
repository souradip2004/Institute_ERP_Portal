
import React from "react";
import { useNavigate } from "react-router-dom";
import { Download, HelpCircle } from "lucide-react";

interface ActionButtonsProps {
  onDownloadNotes: () => void;
  isDownloading: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ 
  onDownloadNotes, 
  isDownloading 
}) => {
  const navigate = useNavigate();

  const handleAskDoubts = () => {
    navigate("/doubt");
  };

  return (
    <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
      <button 
        className="flex items-center gap-2 px-6 py-3 bg-navy-light rounded-full hover:bg-navy transition-colors scale-hover disabled:opacity-70"
        onClick={onDownloadNotes}
        disabled={isDownloading}
      >
        <Download size={20} />
        <span className="font-medium">
          {isDownloading ? "PREPARING NOTES..." : "DOWNLOAD NOTES"}
        </span>
      </button>
      
      <button 
        className="flex items-center gap-2 px-6 py-3 bg-navy-light rounded-full hover:bg-navy transition-colors scale-hover"
        onClick={handleAskDoubts}
      >
        <HelpCircle size={20} />
        <span className="font-medium">CLICK TO ASK DOUBTS</span>
      </button>
    </div>
  );
};

export default ActionButtons;
