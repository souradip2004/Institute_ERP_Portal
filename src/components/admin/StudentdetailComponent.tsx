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

const STATUS_STYLES = {
  'ACTIVE': 'bg-green-100 text-green-800',
  'INACTIVE': 'bg-yellow-100 text-yellow-800',
  'SUSPENDED': 'bg-red-100 text-red-800',
  'GRADUATED': 'bg-blue-100 text-blue-800'
};

export default function StudentDetail({ student, onBack }: StudentDetailProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString();
  };

  const InfoItem = ({ label, value, className = '' }: { label: string; value: string | number; className?: string }) => (
    <div className="grid grid-cols-2">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className={`text-sm text-gray-900 ${className}`}>{value}</p>
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
        <h2 className="text-xl font-bold text-gray-800">Student Detail</h2>
        <div className="flex space-x-2">
          <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${STATUS_STYLES[student.enrollmentStatus]}`}>
            {student.enrollmentStatus}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <InfoSection title="Student Information">
              <InfoItem label="Roll Number" value={student.studentRoll} />
              <InfoItem label="Full Name" value={student.user.name} />
              <InfoItem label="Email" value={student.user.email} />
              <InfoItem label="Phone" value={student.user.phone || 'Not provided'} />
              <InfoItem label="Gender" value={student.user.gender || 'Not provided'} />
              <InfoItem label="Date of Birth" value={formatDate(student.user.dateOfBirth)} />
              <InfoItem label="Address" value={student.user.address || 'Not provided'} />
            </InfoSection>
            
            <InfoSection title="Parent/Guardian Information">
              <InfoItem label="Name" value={student.parentGuardianName || 'Not provided'} />
              <InfoItem label="Phone" value={student.parentGuardianPhone || 'Not provided'} />
              <InfoItem label="Email" value={student.parentGuardianEmail || 'Not provided'} />
            </InfoSection>
          </div>
          
          <div className="space-y-6">
            <InfoSection title="Academic Information">
              <InfoItem label="Department" value={student.department?.name || 'Not available'} />
              <InfoItem 
                label="Batch" 
                value={student.batch ? `${student.batch.batchName} (${student.batch.year})` : 'Not available'} 
              />
              <InfoItem label="Current Semester" value={student.currentSemester} />
              <InfoItem label="Current Year" value={student.currentYear} />
              <InfoItem label="Enrollment Status" value={student.enrollmentStatus} />
            </InfoSection>
            
            <InfoSection title="Account Information">
              <InfoItem label="User ID" value={student.userId} />
              <InfoItem label="Email Verified" value={student.user.emailVerified ? 'Yes' : 'No'} />
              <InfoItem label="Role" value={student.user.role} />
              <InfoItem label="Created At" value={formatDate(student.user.createdAt)} />
              <InfoItem label="Last Updated" value={formatDate(student.user.updatedAt)} />
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