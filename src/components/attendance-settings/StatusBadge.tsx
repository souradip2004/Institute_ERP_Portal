import React from 'react';

type StatusType = 'success' | 'error' | 'warning' | 'info' | 'loading';

interface StatusBadgeProps {
  type: StatusType;
  text: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ type, text }) => {
  const baseClasses = "px-3 py-1 text-sm font-medium rounded-full";
  
  const typeClasses = {
    success: "bg-green-100 text-green-800",
    error: "bg-red-100 text-red-800",
    warning: "bg-yellow-100 text-yellow-800",
    info: "bg-blue-100 text-blue-800",
    loading: "bg-gray-100 text-gray-800",
  };

  return (
    <span className={`${baseClasses} ${typeClasses[type]}`}>
      {type === 'loading' && (
        <svg className="inline w-4 h-4 mr-1 animate-spin" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {text}
    </span>
  );
};

export default StatusBadge;