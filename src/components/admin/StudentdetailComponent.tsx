import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StudentAttendance from './StudentAttendance';

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
    username?: string | null;
    emailVerified: string | null;
    image: string | null;
    isVerified?: boolean;
    coins?: number;
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
    id: string;
    name: string;
    code: string;
    description: string | null;
    institutionId: string;
    createdAt: string;
    updatedAt: string;
  };
  batch?: {
    id: string;
    batchName: string;
    year: number;
    departmentId: string;
    maxStudents: number;
    createdAt: string;
    updatedAt: string;
  };
  classEnrollments?: Array<{
    id: string;
    studentId: string;
    classSectionId: string;
    createdAt: string;
    updatedAt: string;
    enrollmentStatus: string;
    classSection: {
      id: string;
      sectionName: string;
      batchId: string;
      semesterId: string;
      teacherId: string;
      maxStudents: number;
      createdAt: string;
      updatedAt: string;
      creditsUsed: number;
      isOptional: boolean;
      motherClassId: string;
    };
  }>;
}

interface StudentDetailProps {
  studentId: string;
  onBack: () => void;
}

const STATUS_STYLES = {
  'ACTIVE': 'bg-green-100 text-green-800',
  'INACTIVE': 'bg-yellow-100 text-yellow-800',
  'SUSPENDED': 'bg-red-100 text-red-800',
  'GRADUATED': 'bg-blue-100 text-blue-800'
};

export default function StudentDetail({ studentId, onBack }: StudentDetailProps) {
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAttendance, setShowAttendance] = useState(false);

  useEffect(() => {
    const fetchStudentDetail = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/students/${studentId}?includeClassSection=true`);
        setStudent(response.data);
      } catch (err) {
        setError('Failed to fetch student details');
        console.error('Error fetching student:', err);
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      fetchStudentDetail();
    }
  }, [studentId]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">{error || 'Student not found'}</div>
          <button
            onClick={onBack}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-700 hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
          >
            Back to List
          </button>
        </div>
      </div>
    );
  }

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
      <StudentAttendance
        studentId={student.id}
        motherClassId={student.classEnrollments?.[0]?.classSection?.motherClassId || ''}
        isOpen={showAttendance}
        onClose={() => setShowAttendance(false)}
      />

      <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Student Detail</h2>
        <div className="flex space-x-2 items-center">
          <button
            onClick={() => setShowAttendance(true)}
            disabled={!student.classEnrollments?.[0]?.classSection?.motherClassId}
            className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            View Attendance
          </button>
          <span
            className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${STATUS_STYLES[student.enrollmentStatus]}`}>
            {student.enrollmentStatus}
          </span>
        </div>
      </div>

      <div className="p-6">
        {/* Summary Card */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 mb-6">
          <div className="flex items-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold mr-4">
              {student.user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{student.user.name}</h3>
              <p className="text-gray-600">{student.user.email}</p>
              {/* <div className="flex items-center mt-1">
                <span className="text-sm text-gray-500 mr-2">Coins:</span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  🪙 {student.user.coins || 0}
                </span>
              </div> */}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Student Roll</p>
              <p className="text-lg font-semibold text-gray-900">{student.studentRoll}</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Department</p>
              <p className="text-lg font-semibold text-gray-900">{student.department?.name || 'N/A'}</p>
              {student.department?.code && (
                <p className="text-xs text-gray-500">({student.department.code})</p>
              )}
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Current Semester</p>
              <p className="text-lg font-semibold text-gray-900">{student.currentSemester}</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Academic Year</p>
              <p className="text-lg font-semibold text-gray-900">{student.currentYear}</p>
            </div>
          </div>
          {student.batch && (
            <div className="mt-4 text-center">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                Batch: {student.batch.batchName} ({student.batch.year}) - Max Students: {student.batch.maxStudents}
              </span>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Enrolled Classes</p>
                <p className="text-lg font-semibold text-gray-900">{student.classEnrollments?.length || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Account Status</p>
                <p className="text-lg font-semibold text-gray-900">{student.user.isVerified ? 'Verified' : 'Pending'}</p>
              </div>
            </div>
          </div>

          {/* <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Coins Balance</p>
                <p className="text-lg font-semibold text-gray-900">{student.user.coins || 0}</p>
              </div>
            </div>
          </div> */}

          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Member Since</p>
                <p className="text-lg font-semibold text-gray-900">{formatDate(student.user.createdAt).split('/')[2] || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <InfoSection title="Student Information">
              <InfoItem label="Roll Number" value={student.studentRoll} />
              <InfoItem label="Full Name" value={student.user.name} />
              <InfoItem label="Email" value={student.user.email} />
              <InfoItem label="Username" value={student.user.username || 'Not set'} />
              <InfoItem label="Gender" value={student.user.gender || 'Not provided'} />
              <InfoItem label="Date of Birth" value={formatDate(student.user.dateOfBirth)} />
              <InfoItem label="Phone" value={student.user.phone || 'Not provided'} />
              <InfoItem label="Address" value={student.user.address || 'Not provided'} />
            </InfoSection>

            <InfoSection title="Parent/Guardian Information">
              <InfoItem label="Guardian Name" value={student.parentGuardianName || 'Not provided'} />
              <InfoItem label="Guardian Phone" value={student.parentGuardianPhone || 'Not provided'} />
              <InfoItem label="Guardian Email" value={student.parentGuardianEmail || 'Not provided'} />
            </InfoSection>

            <InfoSection title="Account Information">
              <InfoItem label="Email Verified" value={student.user.emailVerified ? 'Yes' : 'No'} />
              <InfoItem label="Account Verified" value={student.user.isVerified ? 'Yes' : 'No'} />
              <InfoItem label="Coins Balance" value={student.user.coins || 0} />
              <InfoItem label="Role" value={student.user.role} />
              <InfoItem label="Created At" value={formatDate(student.user.createdAt)} />
              <InfoItem label="Last Updated" value={formatDate(student.user.updatedAt)} />
            </InfoSection>
          </div>

          <div className="space-y-6">
            <InfoSection title="Academic Information">
              <InfoItem label="Department" value={student.department?.name || 'Not available'} />
              {student.department?.code && (
                <InfoItem label="Department Code" value={student.department.code} />
              )}
              {student.department?.description && (
                <InfoItem label="Department Description" value={student.department.description} />
              )}
              <InfoItem
                label="Batch"
                value={student.batch ? `${student.batch.batchName} (${student.batch.year})` : 'Not available'}
              />
              {student.batch && (
                <InfoItem label="Batch Max Students" value={student.batch.maxStudents} />
              )}
              <InfoItem label="Current Semester" value={student.currentSemester} />
              <InfoItem label="Current Year" value={student.currentYear} />
              <InfoItem label="Enrollment Status" value={student.enrollmentStatus} />
              <InfoItem
                label="Total Enrolled Classes"
                value={student.classEnrollments?.length || 0}
              />
            </InfoSection>

            <InfoSection title={`Enrolled Classes (${student.classEnrollments?.length || 0})`}>
              {student.classEnrollments && student.classEnrollments.length > 0 ? (
                <div className="space-y-4">
                  {student.classEnrollments.map((enrollment, index) => (
                    <div key={enrollment.id} className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 text-lg">{enrollment.classSection.sectionName}</h4>
                            <p className="text-sm text-gray-500">Class Section ID: {enrollment.classSection.id}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${enrollment.enrollmentStatus === 'ENROLLED'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                          }`}>
                          {enrollment.enrollmentStatus}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="bg-gray-50 p-3 rounded-md">
                          <p className="font-medium text-gray-500 mb-1">Max Students</p>
                          <p className="text-gray-900 font-semibold">{enrollment.classSection.maxStudents}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-md">
                          <p className="font-medium text-gray-500 mb-1">Credits Used</p>
                          <p className="text-gray-900 font-semibold">{enrollment.classSection.creditsUsed}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-md">
                          <p className="font-medium text-gray-500 mb-1">Course Type</p>
                          <p className="text-gray-900 font-semibold">{enrollment.classSection.isOptional ? 'Optional' : 'Mandatory'}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-md">
                          <p className="font-medium text-gray-500 mb-1">Enrolled Date</p>
                          <p className="text-gray-900 font-semibold">{formatDate(enrollment.createdAt)}</p>
                        </div>
                      </div>

                      {enrollment.classSection.motherClassId && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-xs text-gray-500">
                            <span className="font-medium">Mother Class ID:</span> {enrollment.classSection.motherClassId}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <p className="text-gray-500 font-medium">No enrolled classes found</p>
                  <p className="text-sm text-gray-400 mt-1">This student is not currently enrolled in any classes.</p>
                </div>
              )}
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