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

const STATUS_STYLES = {
  'FULL_TIME': 'bg-green-100 text-green-800',
  'PART_TIME': 'bg-yellow-100 text-yellow-800',
  'CONTRACT': 'bg-red-100 text-red-800',
  'VISITING': 'bg-blue-100 text-blue-800'
};

const PERFORMANCE_STYLES = {
  excellent: 'text-green-600',
  good: 'text-blue-600',
  satisfactory: 'text-yellow-600',
  needsImprovement: 'text-red-600'
};

export default function TeacherDetail({ teacher, onBack }: TeacherDetailProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString();
  };

  const getPerformanceLevel = (score: number) => {
    if (score >= 90) return { level: 'Excellent', style: PERFORMANCE_STYLES.excellent };
    if (score >= 80) return { level: 'Good', style: PERFORMANCE_STYLES.good };
    if (score >= 70) return { level: 'Satisfactory', style: PERFORMANCE_STYLES.satisfactory };
    return { level: 'Needs Improvement', style: PERFORMANCE_STYLES.needsImprovement };
  };

  const performanceInfo = getPerformanceLevel(teacher.performanceScore);
  const statusStyle = STATUS_STYLES[teacher.employmentStatus] || '';

  const InfoItem = ({ label, value, className = '' }: { label: string; value: string; className?: string }) => (
    <div className="grid grid-cols-2">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className={`text-sm ${className}`}>{value}</p>
    </div>
  );

  const InfoSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div>
      <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">{title}</h3>
      <div className="bg-gray-50 p-4 rounded-md space-y-3">
        {children}
      </div>
    </div>
  );

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Teacher Detail</h2>
        <div className="flex space-x-2">
          <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${statusStyle}`}>
            {teacher.employmentStatus.replace('_', ' ')}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <InfoSection title="Personal Information">
              <InfoItem label="Teacher Code" value={teacher.teacherCode} />
              <InfoItem label="Full Name" value={teacher.user.name} />
              <InfoItem label="Email" value={teacher.user.email} />
              <InfoItem label="Phone" value={teacher.user.phone || 'Not provided'} />
              <InfoItem label="Gender" value={teacher.user.gender || 'Not provided'} />
              <InfoItem label="Date of Birth" value={formatDate(teacher.user.dateOfBirth)} />
              <InfoItem label="Address" value={teacher.user.address || 'Not provided'} />
            </InfoSection>
            
            <InfoSection title="Account Information">
              <InfoItem label="User ID" value={teacher.userId} />
              <InfoItem label="Email Verified" value={teacher.user.emailVerified ? 'Yes' : 'No'} />
              <InfoItem label="Role" value={teacher.user.role} />
              <InfoItem label="Created At" value={formatDate(teacher.user.createdAt)} />
              <InfoItem label="Last Updated" value={formatDate(teacher.user.updatedAt)} />
            </InfoSection>
          </div>
          
          <div className="space-y-6">
            <InfoSection title="Professional Information">
              <InfoItem label="Qualification" value={teacher.qualification} />
              <InfoItem label="Department" value={teacher.department?.name || 'Not available'} />
              <InfoItem label="Joining Date" value={formatDate(teacher.joiningDate)} />
              <InfoItem label="Employment Status" value={teacher.employmentStatus.replace('_', ' ')} />
            </InfoSection>
            
            <InfoSection title="Performance Information">
              <InfoItem label="Performance Score" value={`${teacher.performanceScore}/100`} />
              <InfoItem label="Last Evaluation Date" value={formatDate(teacher.lastEvaluationDate)} />
              <InfoItem 
                label="Performance Level" 
                value={performanceInfo.level}
                className={`font-semibold ${performanceInfo.style}`} 
              />
            </InfoSection>
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-200 px-6 py-4 flex justify-end space-x-3">
        <button 
          type="button"
          onClick={onBack}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-700 hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
        >
          Back to List
        </button>
      </div>
    </div>
  );
}