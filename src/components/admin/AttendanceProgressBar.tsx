// components/AttendanceProgressBar.tsx

import React from 'react';

// Define the props the component will accept
interface AttendanceProgressBarProps {
  // The value can be a number or null
  value: number | null | undefined;
}

const AttendanceProgressBar: React.FC<AttendanceProgressBarProps> = ({ value }) => {
  // --- Handle the "N/A" case first ---
  if (value === null || typeof value === 'undefined') {
    return (
      <div className="text-sm text-gray-500">
        N/A
      </div>
    );
  }

  // --- Logic to determine the bar's color based on percentage ---
  let barColor = 'bg-blue-600'; // Default color
  if (value >= 90) {
    barColor = 'bg-green-600'; // Excellent
  } else if (value >= 75) {
    barColor = 'bg-yellow-500'; // Good
  } else {
    barColor = 'bg-red-600'; // Needs improvement
  }

  // Ensure value is within the 0-100 range for styling
  const clampedValue = Math.max(0, Math.min(100, value));

  // --- Render the progress bar ---
  return (
    <div className="flex items-center">
      {/* The background of the progress bar */}
      <div className="w-24 bg-gray-200 rounded-full h-2.5 mr-3">
        {/* The foreground (the actual progress) */}
        <div
          className={`${barColor} h-2.5 rounded-full`}
          style={{ width: `${clampedValue}%` }}
        ></div>
      </div>
      {/* The percentage text */}
      <span className="text-sm font-medium text-gray-700">
        {Math.round(clampedValue)}%
      </span>
    </div>
  );
};

export default AttendanceProgressBar;