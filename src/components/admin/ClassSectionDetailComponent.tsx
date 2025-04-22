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
  batch: {
    id: string;
    batchName: string;
    year: number;
  };
  course: {
    id: string;
    courseCode: string;
    name: string;
  };
  semester: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
  };
  teacher: {
    id: string;
    teacherCode: string;
    user: {
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
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Class Section Details</h2>
        <div className="flex space-x-2">
          <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
            {classSection.sectionName}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Basic Information</h3>
              <div className="bg-gray-50 p-4 rounded-md space-y-3">
                <div className="grid grid-cols-2">
                  <p className="text-sm font-medium text-gray-500">Section Name</p>
                  <p className="text-sm text-gray-900">{classSection.sectionName}</p>
                </div>
                <div className="grid grid-cols-2">
                  <p className="text-sm font-medium text-gray-500">Max Students</p>
                  <p className="text-sm text-gray-900">{classSection.maxStudents}</p>
                </div>
                <div className="grid grid-cols-2">
                  <p className="text-sm font-medium text-gray-500">Enrolled Students</p>
                  <p className="text-sm text-gray-900">{classSection.enrolledStudents || 'Not available'}</p>
                </div>
              </div>
            </div>
            
            {/* Course Information */}
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Course Information</h3>
              <div className="bg-gray-50 p-4 rounded-md space-y-3">
                <div className="grid grid-cols-2">
                  <p className="text-sm font-medium text-gray-500">Course Code</p>
                  <p className="text-sm text-gray-900">{classSection?.course?.courseCode}</p>
                </div>
                <div className="grid grid-cols-2">
                  <p className="text-sm font-medium text-gray-500">Course Name</p>
                  <p className="text-sm text-gray-900">{classSection?.course?.name}</p>
                </div>
                <div className="grid grid-cols-2">
                  <p className="text-sm font-medium text-gray-500">Course ID</p>
                  <p className="text-sm text-gray-900">{classSection?.courseId}</p>
                </div>
              </div>
            </div>
            
            {/* Teacher Information */}
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Teacher Information</h3>
              <div className="bg-gray-50 p-4 rounded-md space-y-3">
                <div className="grid grid-cols-2">
                  <p className="text-sm font-medium text-gray-500">Teacher Name</p>
                  <p className="text-sm text-gray-900">{classSection.teacher.user.name}</p>
                </div>
                <div className="grid grid-cols-2">
                  <p className="text-sm font-medium text-gray-500">Teacher Code</p>
                  <p className="text-sm text-gray-900">{classSection.teacher.teacherCode}</p>
                </div>
                <div className="grid grid-cols-2">
                  <p className="text-sm font-medium text-gray-500">Teacher ID</p>
                  <p className="text-sm text-gray-900">{classSection.teacherId}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Academic Information */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Batch Information</h3>
              <div className="bg-gray-50 p-4 rounded-md space-y-3">
                <div className="grid grid-cols-2">
                  <p className="text-sm font-medium text-gray-500">Batch Name</p>
                  <p className="text-sm text-gray-900">{classSection.batch.batchName}</p>
                </div>
                <div className="grid grid-cols-2">
                  <p className="text-sm font-medium text-gray-500">Batch Year</p>
                  <p className="text-sm text-gray-900">{classSection.batch.year}</p>
                </div>
                <div className="grid grid-cols-2">
                  <p className="text-sm font-medium text-gray-500">Batch ID</p>
                  <p className="text-sm text-gray-900">{classSection.batchId}</p>
                </div>
              </div>
            </div>
            
            {/* Semester Information */}
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Semester Information</h3>
              <div className="bg-gray-50 p-4 rounded-md space-y-3">
                <div className="grid grid-cols-2">
                  <p className="text-sm font-medium text-gray-500">Semester Name</p>
                  <p className="text-sm text-gray-900">{classSection.semester.name}</p>
                </div>
                <div className="grid grid-cols-2">
                  <p className="text-sm font-medium text-gray-500">Start Date</p>
                  <p className="text-sm text-gray-900">{formatDate(classSection.semester.startDate)}</p>
                </div>
                <div className="grid grid-cols-2">
                  <p className="text-sm font-medium text-gray-500">End Date</p>
                  <p className="text-sm text-gray-900">{formatDate(classSection.semester.endDate)}</p>
                </div>
                <div className="grid grid-cols-2">
                  <p className="text-sm font-medium text-gray-500">Semester ID</p>
                  <p className="text-sm text-gray-900">{classSection.semesterId}</p>
                </div>
              </div>
            </div>
            
            {/* Administrative Information */}
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Administrative Information</h3>
              <div className="bg-gray-50 p-4 rounded-md space-y-3">
                <div className="grid grid-cols-2">
                  <p className="text-sm font-medium text-gray-500">Created At</p>
                  <p className="text-sm text-gray-900">{formatDate(classSection.createdAt)}</p>
                </div>
                <div className="grid grid-cols-2">
                  <p className="text-sm font-medium text-gray-500">Last Updated</p>
                  <p className="text-sm text-gray-900">{formatDate(classSection.updatedAt)}</p>
                </div>
                <div className="grid grid-cols-2">
                  <p className="text-sm font-medium text-gray-500">Section ID</p>
                  <p className="text-sm text-gray-900">{classSection.id}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-200 px-6 py-4 flex justify-end space-x-3">
      
        <button 
          type="button"
          onClick={onBack}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Back to List
        </button>
      </div>
    </div>
  );
}