import React from 'react';

export interface ClassSectionDetail {
  id: string;
  sectionName: string;
  batchId: string;
  courseId: string;
  semesterId: string;
  teacherId: string;
  maxStudents: number;
  createdAt: string;
  updatedAt: string;
  batch?: {
    id: string;
    batchName: string;
    year: number;
  };
  course?: {
    id: string;
    courseCode: string;
    name: string;
  };
  semester?: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
  };
  teacher?: {
    id: string;
    teacherCode: string;
    user?: {
      name: string;
    };
  };
  // Optional fields that might be present in a detailed view
  enrolledStudents?: number;
  schedule?: {
    day: string;
    startTime: string;
    endTime: string;
    room: string;
  }[];
}

interface ClassSectionDetailProps {
  classSection: ClassSectionDetail;
  onBack: () => void;
}

export default function ClassSectionDetail({ classSection, onBack }: ClassSectionDetailProps) {
  // Format date function
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="bg-white">
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-lg font-medium text-blue-600">CS</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{classSection.sectionName || 'Unnamed Section'}</h2>
              <p className="text-sm text-gray-500">Class Section Details</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
              {classSection.course?.courseCode || 'No Code'}
            </span> */}
            <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
              {classSection.batch?.batchName || 'No Batch'}
            </span>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Basic Information</h3>
              </div>
              <div className="px-4 py-5 sm:p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Section Name</p>
                    <p className="mt-1 text-sm text-gray-900">{classSection.sectionName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Max Students</p>
                    <p className="mt-1 text-sm text-gray-900">{classSection.maxStudents || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Enrolled Students</p>
                    <p className="mt-1 text-sm text-gray-900">{classSection.enrolledStudents || 'Not available'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Course Information */}
            {/* <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Course Information</h3>
              </div>
              <div className="px-4 py-5 sm:p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Course Code</p>
                    <p className="mt-1 text-sm text-gray-900">{classSection.course?.courseCode || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Course Name</p>
                    <p className="mt-1 text-sm text-gray-900">{classSection.course?.name || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div> */}
            
            {/* Teacher Information */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Teacher Information</h3>
              </div>
              <div className="px-4 py-5 sm:p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Teacher Name</p>
                    <p className="mt-1 text-sm text-gray-900">{classSection.teacher?.user?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Teacher Code</p>
                    <p className="mt-1 text-sm text-gray-900">{classSection.teacher?.teacherCode || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Academic Information */}
          <div className="space-y-6">
            {/* Batch Information */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Batch Information</h3>
              </div>
              <div className="px-4 py-5 sm:p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Batch Name</p>
                    <p className="mt-1 text-sm text-gray-900">{classSection.batch?.batchName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Batch Year</p>
                    <p className="mt-1 text-sm text-gray-900">{classSection.batch?.year || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Semester Information */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Semester Information</h3>
              </div>
              <div className="px-4 py-5 sm:p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Semester Name</p>
                    <p className="mt-1 text-sm text-gray-900">{classSection.semester?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Duration</p>
                    <p className="mt-1 text-sm text-gray-900">
                      {classSection.semester?.startDate && classSection.semester?.endDate
                        ? `${formatDate(classSection.semester.startDate)} - ${formatDate(classSection.semester.endDate)}`
                        : 'Dates not available'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Administrative Information */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Administrative Information</h3>
              </div>
              <div className="px-4 py-5 sm:p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Created At</p>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(classSection.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Last Updated</p>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(classSection.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
        <div className="flex justify-end">
          <button 
            type="button"
            onClick={onBack}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to List
          </button>
        </div>
      </div>
    </div>
  );
}