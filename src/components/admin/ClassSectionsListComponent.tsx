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
}

interface ClassSectionsListProps {
  classSections: ClassSection[];
  onViewClassSection: (sectionId: string) => void;
}

export default function ClassSectionsList({ classSections, onViewClassSection }: ClassSectionsListProps) {
  // Format date function
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Class Sections</h2>
      
      {classSections.length === 0 ? (
        <p className="text-gray-500">No class sections found</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Section Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
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
                <tr key={section.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {section.sectionName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {section.course.courseCode}: {section.course.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {section.batch.batchName} ({section.batch.year})
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {section.semester.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {section.teacher.user.name} ({section.teacher.teacherCode})
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => onViewClassSection(section.id)} 
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