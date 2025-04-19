'use client';

interface ClassCardProps {
  subjectName: string;
  teacherName: string;
  schedule: string;
  attendance: string;
  isAbsentToday: boolean;
  noClassToday?: boolean;
}

export default function ClassCard({
  subjectName,
  teacherName,
  schedule,
  attendance,
  isAbsentToday,
  noClassToday = false
}: ClassCardProps) {
  let statusLabel = "Present Today";
  let statusColor = "text-green-700";
  const bgColor = "bg-white";
  
  if (isAbsentToday) {
    statusLabel = "Absent Today";
    statusColor = "text-red-600";
  } else if (noClassToday) {
    statusLabel = "No Class Today";
    statusColor = "text-gray-600";
  }
  
  return (
    <div className={`${bgColor} p-5 rounded-lg shadow border border-gray-100`}>
      <div className="flex justify-between items-start mb-5">
        <h3 className="text-lg font-semibold text-gray-800">{subjectName}</h3>
        <span className={`text-sm font-medium ${statusColor}`}>{statusLabel}</span>
      </div>
      
      <p className="text-base font-medium text-gray-700 mb-5">{teacherName}</p>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-gray-500 mb-1">Today&apos;s Schedule</p>
          <p className="text-sm font-medium">{schedule}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Attendance</p>
          <p className="text-sm font-medium">{attendance}</p>
        </div>
      </div>
    </div>
  );
} 