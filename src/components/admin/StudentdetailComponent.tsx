import React from 'react';

export interface StudentDetail {
  id: string;
  userId: string;
  studentRoll: string;
  parentGuardianName: string | null;
  parentGuardianPhone: string | null;
  parentGuardianEmail: string | null;
  departmentId: string;
  batchId: string;
  currentSemester: number;
  currentYear: number;
  enrollmentStatus: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'GRADUATED';
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: string | null;
    image: string | null;
    password: string | null;
    gender: string | null;
    dateOfBirth: string | null;
    address: string | null;
    phone: string | null;
    createdAt: string;
    updatedAt: string;
    role: string;
    institutionId: string | null;
  };
  department?: {
    name: string;
  };
  batch?: {
    batchName: string;
    year: number;
  };
}

interface StudentDetailProps {
  student: StudentDetail;
  onBack: () => void;
}

export default function StudentDetail({ student, onBack }: StudentDetailProps) {
  // Format date function
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Student Detail</h2>
        <div className="flex space-x-2">
          <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full 
            ${student.enrollmentStatus === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
              student.enrollmentStatus === 'INACTIVE' ? 'bg-yellow-100 text-yellow-800' : 
              student.enrollmentStatus === 'SUSPENDED' ? 'bg-red-100 text-red-800' : 
              'bg-blue-100 text-blue-800'}`}>
            {student.enrollmentStatus}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Student Information */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Student Information</h3>
              <div className="bg-gray-50 p-4 rounded-md space-y-3">
                <div className="grid grid-cols-2">
                  <p className="text-sm font-medium text-gray-500">Roll Number</p>
                  <p className="text-sm text-gray-900">{student.studentRoll}</p>
                </div>
                <div className="grid grid-cols-2">
                  <p className="text-sm font-medium text-gray-500">Full Name</p>
                  <p className="text-sm text-gray-900">{student.user.name}</p>
                </div>
                <div className="grid grid-cols-2">
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-sm text-gray-900">{student.user.email}</p>
                </div>
                <div className="grid grid-cols-2">
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p className="text-sm text-gray-900">{student.user.phone || 'Not provided'}</p>
                </div>
                <div className="grid grid-cols-2">
                  <p className="text-sm font-medium text-gray-500">Gender</p>
                  <p className="text-sm text-gray-900">{student.user.gender || 'Not provided'}</p>
                </div>
                <div className="grid grid-cols-2">
                  <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                  <p className="text-sm text-gray-900">{formatDate(student.user.dateOfBirth)}</p>
                </div>
                <div className="grid grid-cols-2">
                  <p className="text-sm font-medium text-gray-500">Address</p>
                  <p className="text-sm text-gray-900">{student.user.address || 'Not provided'}</p>
                </div>
              </div>
            </div>
            
            {/* Parent/Guardian Information */}
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Parent/Guardian Information</h3>
              <div className="bg-gray-50 p-4 rounded-md space-y-3">
                <div className="grid grid-cols-2">
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p className="text-sm text-gray-900">{student.parentGuardianName || 'Not provided'}</p>
                </div>
                <div className="grid grid-cols-2">
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p className="text-sm text-gray-900">{student.parentGuardianPhone || 'Not provided'}</p>
                </div>
                <div className="grid grid-cols-2">
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-sm text-gray-900">{student.parentGuardianEmail || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Academic Information */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Academic Information</h3>
              <div className="bg-gray-50 p-4 rounded-md space-y-3">
                <div className="grid grid-cols-2">
                  <p className="text-sm font-medium text-gray-500">Department</p>
                  <p className="text-sm text-gray-900">{student.department?.name || 'Not available'}</p>
                </div>
                <div className="grid grid-cols-2">
                  <p className="text-sm font-medium text-gray-500">Batch</p>
                  <p className="text-sm text-gray-900">
                    {student.batch ? `${student.batch.batchName} (${student.batch.year})` : 'Not available'}
                  </p>
                </div>
                <div className="grid grid-cols-2">
                  <p className="text-sm font-medium text-gray-500">Current Semester</p>
                  <p className="text-sm text-gray-900">{student.currentSemester}</p>
                </div>
                <div className="grid grid-cols-2">
                  <p className="text-sm font-medium text-gray-500">Current Year</p>
                  <p className="text-sm text-gray-900">{student.currentYear}</p>
                </div>
                <div className="grid grid-cols-2">
                  <p className="text-sm font-medium text-gray-500">Enrollment Status</p>
                  <p className="text-sm text-gray-900">{student.enrollmentStatus}</p>
                </div>
              </div>
            </div>
            
            {/* Account Information */}
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Account Information</h3>
              <div className="bg-gray-50 p-4 rounded-md space-y-3">
                <div className="grid grid-cols-2">
                  <p className="text-sm font-medium text-gray-500">User ID</p>
                  <p className="text-sm text-gray-900">{student.userId}</p>
                </div>
                <div className="grid grid-cols-2">
                  <p className="text-sm font-medium text-gray-500">Email Verified</p>
                  <p className="text-sm text-gray-900">{student.user.emailVerified ? 'Yes' : 'No'}</p>
                </div>
                <div className="grid grid-cols-2">
                  <p className="text-sm font-medium text-gray-500">Role</p>
                  <p className="text-sm text-gray-900">{student.user.role}</p>
                </div>
                <div className="grid grid-cols-2">
                  <p className="text-sm font-medium text-gray-500">Created At</p>
                  <p className="text-sm text-gray-900">{formatDate(student.user.createdAt)}</p>
                </div>
                <div className="grid grid-cols-2">
                  <p className="text-sm font-medium text-gray-500">Last Updated</p>
                  <p className="text-sm text-gray-900">{formatDate(student.user.updatedAt)}</p>
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