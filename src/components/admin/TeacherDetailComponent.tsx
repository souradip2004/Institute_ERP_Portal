import React from 'react';

export interface TeacherDetail {
  id: string;
  userId: string;
  teacherCode: string;
  qualification: string;
  joiningDate: string;
  employmentStatus: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'VISITING';
  departmentId: string;
  performanceScore: number;
  lastEvaluationDate: string;
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
}

interface TeacherDetailProps {
  teacher: TeacherDetail;
  onBack: () => void;
}

export default function TeacherDetail({ teacher, onBack }: TeacherDetailProps) {
  // Format date function
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Teacher Detail</h2>
        <div className="flex space-x-2">
          <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full 
            ${teacher.employmentStatus === 'FULL_TIME' ? 'bg-green-100 text-green-800' : 
              teacher.employmentStatus === 'PART_TIME' ? 'bg-yellow-100 text-yellow-800' : 
              teacher.employmentStatus === 'CONTRACT' ? 'bg-red-100 text-red-800' : 
              'bg-blue-100 text-blue-800'}`}>
            {teacher.employmentStatus.replace('_', ' ')}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Teacher Personal Information */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Personal Information</h3>
              <div className="bg-gray-50 p-4 rounded-md space-y-3">
                <div className="grid grid-cols-2">
                  <p className="text-sm font-medium text-gray-500">Teacher Code</p>
                  <p className="text-sm text-gray-900">{teacher.teacherCode}</p>
                </div>
                <div className="grid grid-cols-2">
                  <p className="text-sm font-medium text-gray-500">Full Name</p>
                  <p className="text-sm text-gray-900">{teacher.user.name}</p>
                </div>
                <div className="grid grid-cols-2">
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-sm text-gray-900">{teacher.user.email}</p>
                </div>
                <div className="grid grid-cols-2">
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p className="text-sm text-gray-900">{teacher.user.phone || 'Not provided'}</p>
                </div>
                <div className="grid grid-cols-2">
                  <p className="text-sm font-medium text-gray-500">Gender</p>
                  <p className="text-sm text-gray-900">{teacher.user.gender || 'Not provided'}</p>
                </div>
                <div className="grid grid-cols-2">
                  <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                  <p className="text-sm text-gray-900">{formatDate(teacher.user.dateOfBirth)}</p>
                </div>
                <div className="grid grid-cols-2">
                  <p className="text-sm font-medium text-gray-500">Address</p>
                  <p className="text-sm text-gray-900">{teacher.user.address || 'Not provided'}</p>
                </div>
              </div>
            </div>
            
            {/* Account Information */}
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Account Information</h3>
              <div className="bg-gray-50 p-4 rounded-md space-y-3">
                <div className="grid grid-cols-2">
                  <p className="text-sm font-medium text-gray-500">User ID</p>
                  <p className="text-sm text-gray-900">{teacher.userId}</p>
                </div>
                <div className="grid grid-cols-2">
                  <p className="text-sm font-medium text-gray-500">Email Verified</p>
                  <p className="text-sm text-gray-900">{teacher.user.emailVerified ? 'Yes' : 'No'}</p>
                </div>
                <div className="grid grid-cols-2">
                  <p className="text-sm font-medium text-gray-500">Role</p>
                  <p className="text-sm text-gray-900">{teacher.user.role}</p>
                </div>
                <div className="grid grid-cols-2">
                  <p className="text-sm font-medium text-gray-500">Created At</p>
                  <p className="text-sm text-gray-900">{formatDate(teacher.user.createdAt)}</p>
                </div>
                <div className="grid grid-cols-2">
                  <p className="text-sm font-medium text-gray-500">Last Updated</p>
                  <p className="text-sm text-gray-900">{formatDate(teacher.user.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Professional Information */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Professional Information</h3>
              <div className="bg-gray-50 p-4 rounded-md space-y-3">
                <div className="grid grid-cols-2">
                  <p className="text-sm font-medium text-gray-500">Qualification</p>
                  <p className="text-sm text-gray-900">{teacher.qualification}</p>
                </div>
                <div className="grid grid-cols-2">
                  <p className="text-sm font-medium text-gray-500">Department</p>
                  <p className="text-sm text-gray-900">{teacher.department?.name || 'Not available'}</p>
                </div>
                <div className="grid grid-cols-2">
                  <p className="text-sm font-medium text-gray-500">Joining Date</p>
                  <p className="text-sm text-gray-900">{formatDate(teacher.joiningDate)}</p>
                </div>
                <div className="grid grid-cols-2">
                  <p className="text-sm font-medium text-gray-500">Employment Status</p>
                  <p className="text-sm text-gray-900">{teacher.employmentStatus.replace('_', ' ')}</p>
                </div>
              </div>
            </div>
            
            {/* Performance Information */}
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Performance Information</h3>
              <div className="bg-gray-50 p-4 rounded-md space-y-3">
                <div className="grid grid-cols-2">
                  <p className="text-sm font-medium text-gray-500">Performance Score</p>
                  <p className="text-sm text-gray-900">{teacher.performanceScore}/100</p>
                </div>
                <div className="grid grid-cols-2">
                  <p className="text-sm font-medium text-gray-500">Last Evaluation Date</p>
                  <p className="text-sm text-gray-900">{formatDate(teacher.lastEvaluationDate)}</p>
                </div>
                <div className="grid grid-cols-2">
                  <p className="text-sm font-medium text-gray-500">Performance Level</p>
                  <p className={`text-sm font-semibold ${
                    teacher.performanceScore >= 90 ? 'text-green-600' :
                    teacher.performanceScore >= 80 ? 'text-blue-600' :
                    teacher.performanceScore >= 70 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {
                      teacher.performanceScore >= 90 ? 'Excellent' :
                      teacher.performanceScore >= 80 ? 'Good' :
                      teacher.performanceScore >= 70 ? 'Satisfactory' :
                      'Needs Improvement'
                    }
                  </p>
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