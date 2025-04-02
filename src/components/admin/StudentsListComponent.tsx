import React from 'react';

export interface Student {
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

interface StudentsListProps {
  students: Student[];
  onViewStudent: (studentId: string) => void;
}

export default function StudentsList({ students, onViewStudent }: StudentsListProps) {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Students</h2>
      
      {students.length === 0 ? (
        <p className="text-gray-500">No students found</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Roll Number
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Semester
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student) => (
                <tr key={student.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {student.studentRoll}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.user.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.currentSemester} ({student.currentYear})
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${student.enrollmentStatus === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                        student.enrollmentStatus === 'INACTIVE' ? 'bg-yellow-100 text-yellow-800' : 
                        student.enrollmentStatus === 'SUSPENDED' ? 'bg-red-100 text-red-800' : 
                        'bg-blue-100 text-blue-800'}`}>
                      {student.enrollmentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => onViewStudent(student.id)} 
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      View
                    </button>
              
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}