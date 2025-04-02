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
  };
  department?: {
    name: string;
  };
}

interface TeachersListProps {
  teachers: Teacher[];
  onViewTeacher: (teacherId: string) => void;
}

export default function TeachersList({ teachers, onViewTeacher }: TeachersListProps) {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Teachers</h2>
      
      {teachers.length === 0 ? (
        <p className="text-gray-500">No teachers found</p>
      ) : (
        <div className="overflow-x-auto">
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
                <tr key={teacher.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {teacher.teacherCode}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {teacher.user.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {teacher.user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {teacher.qualification}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${teacher.employmentStatus === 'FULL_TIME' ? 'bg-green-100 text-green-800' : 
                        teacher.employmentStatus === 'PART_TIME' ? 'bg-yellow-100 text-yellow-800' : 
                        teacher.employmentStatus === 'CONTRACT' ? 'bg-red-100 text-red-800' : 
                        'bg-blue-100 text-blue-800'}`}>
                      {teacher.employmentStatus.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => onViewTeacher(teacher.id)} 
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