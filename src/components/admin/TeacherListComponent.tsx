import React from 'react';

export interface Teacher {
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
    gender: string | null;
    phone: string | null;
    role: string;
    institutionId: string | null;
  };
  department?: {
    name: string;
  };
}

interface TeachersListProps {
  teachers: Teacher[];
  onViewTeacher: (teacherId: string) => void;
}

const STATUS_STYLES = {
  'FULL_TIME': 'bg-green-100 text-green-800',
  'PART_TIME': 'bg-yellow-100 text-yellow-800',
  'CONTRACT': 'bg-red-100 text-red-800',
  'VISITING': 'bg-blue-100 text-blue-800'
};

export default function TeachersList({ teachers, onViewTeacher }: TeachersListProps) {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Teachers</h2>
      
      {teachers.length === 0 ? (
        <div className="bg-gray-50 p-8 text-center rounded-md">
          <p className="text-gray-500">No teachers found</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border border-gray-200">
          <table className="min-w-full bg-white divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teacher Code
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Qualification
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
              {teachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {teacher.teacherCode}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {teacher.user.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {teacher.user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {teacher.qualification}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${STATUS_STYLES[teacher.employmentStatus]}`}>
                      {teacher.employmentStatus.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => onViewTeacher(teacher.id)} 
                      className="text-purple-600 hover:text-purple-900 transition-colors focus:outline-none focus:underline"
                      aria-label={`View details for ${teacher.user.name}`}
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