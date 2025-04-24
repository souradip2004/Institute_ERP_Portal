import React from 'react';

export interface ClassSection {
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
}

interface ClassSectionsListProps {
  classSections: ClassSection[];
  onViewClassSection: (sectionId: string) => void;
}

export default function ClassSectionsList({ classSections, onViewClassSection }: ClassSectionsListProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Class Sections</h2>
        <div className="text-sm text-gray-500">
          Total Sections: {classSections.length}
        </div>
      </div>
      
      {!classSections || classSections.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No class sections found</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new class section.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Section Name
                </th>
                {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th> */}
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Batch
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Semester
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teacher
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {classSections.map((section) => (
                <tr key={section.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 flex-shrink-0 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">CS</span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{section.sectionName || 'Unnamed Section'}</div>
                        <div className="text-sm text-gray-500">Max: {section.maxStudents || 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  {/* <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{section.course?.name || 'No Course'}</div>
                    <div className="text-sm text-gray-500">{section.course?.courseCode || 'N/A'}</div>
                  </td> */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{section.batch?.batchName || 'No Batch'}</div>
                    <div className="text-sm text-gray-500">Year {section.batch?.year || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{section.semester?.name || 'No Semester'}</div>
                    <div className="text-sm text-gray-500">
                      {section.semester?.startDate && section.semester?.endDate ? 
                        `${formatDate(section.semester.startDate)} - ${formatDate(section.semester.endDate)}` : 
                        'Dates not available'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{section.teacher?.user?.name || 'No Teacher'}</div>
                    <div className="text-sm text-gray-500">{section.teacher?.teacherCode || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => onViewClassSection(section.id)} 
                      className="text-purple-600 hover:text-blue-900 inline-flex items-center"
                    >
                      <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View Details
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