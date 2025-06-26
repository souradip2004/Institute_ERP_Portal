import React, { useEffect, useState } from 'react';

export interface ClassSection {
  id: string;
  sectionName: string;
  batchId: string;
  optional:boolean;
  courseId: string;
  motherClassId: string;
  isOptional:boolean;
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

interface MotherClassWithInheritedData {
  id: string;
  name: string;
  sectionCount: number;
  inheritedBatch?: ClassSection['batch'];
  inheritedSemester?: ClassSection['semester'];
}

interface ClassSectionsListProps {
  classSections: ClassSection[];
  onViewClassSection: (sectionId: string) => void;
}

export default function ClassSectionsList({ classSections, onViewClassSection }: ClassSectionsListProps) {
  const [motherClasses, setMotherClasses] = useState<MotherClassWithInheritedData[]>([]);
  const [selectedMotherClassId, setSelectedMotherClassId] = useState<string | null>(null);

  // This useEffect now handles both fetching mother classes and processing their inherited data
  useEffect(() => {
    const fetchAndProcessMotherClasses = async () => {
      try {
        const user = localStorage.getItem("user");
        const institutionId = user ? JSON.parse(user).institutionId : null;
        if (!institutionId) return;

        const response = await fetch(`/api/institutions/${institutionId}/motherclass`);
        const data = await response.json();

        const processedMotherClasses: MotherClassWithInheritedData[] = data.map((mc: any) => {
          const sectionsForThisMotherClass = classSections.filter(section => section.motherClassId === mc.id);
          const sectionCount = sectionsForThisMotherClass.length;

          let inheritedBatch: ClassSection['batch'] | undefined;
          let inheritedSemester: ClassSection['semester'] | undefined;

          // Find the first section with batch and semester info to inherit
          // Assuming consistency across sections within the same mother class
          for (const section of sectionsForThisMotherClass) {
            if (section.batch) {
              inheritedBatch = section.batch;
            }
            if (section.semester) {
              inheritedSemester = section.semester;
            }
            if (inheritedBatch && inheritedSemester) {
              break; // Found both, no need to check further
            }
          }

          return {
            id: mc.id,
            name: mc.sectionName || "Unnamed Mother Class",
            sectionCount: sectionCount,
            inheritedBatch: inheritedBatch,
            inheritedSemester: inheritedSemester,
          };
        });
        setMotherClasses(processedMotherClasses);
      } catch (err) {
        console.error("Failed to load or process mother classes:", err);
      }
    };

    fetchAndProcessMotherClasses();
  }, [classSections]); // Re-run when classSections prop changes

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Find the inherited batch and semester for the currently selected Mother Class
  const currentMotherClassInheritedData = selectedMotherClassId
    ? motherClasses.find(mc => mc.id === selectedMotherClassId)
    : null;

  return (
    <div className="p-6">
      {!selectedMotherClassId ? (
        <>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Classes Overview</h2>
          {motherClasses.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4m0-10V9a2 2 0 00-2-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No Class found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new Class.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Number of Subjects</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Semester</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {motherClasses.map(mc => (
                    <tr key={mc.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{mc.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{mc.sectionCount}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {mc.inheritedBatch ? `${mc.inheritedBatch.batchName} (${mc.inheritedBatch.year})` : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {mc.inheritedSemester
                            ? `${mc.inheritedSemester.name} (${formatDate(mc.inheritedSemester.startDate)} - ${formatDate(mc.inheritedSemester.endDate)})`
                            : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                        <button
                          onClick={() => setSelectedMotherClassId(mc.id)}
                          className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                        >
                          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View Subjects
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Subject for {currentMotherClassInheritedData?.name || 'Selected Class'}</h2>
            <button
              onClick={() => setSelectedMotherClassId(null)}
              className="text-sm text-blue-600 hover:underline inline-flex items-center"
            >
              <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Classes
            </button>
          </div>

          {classSections.filter(section => section.motherClassId === selectedMotherClassId).length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No Subjects found</h3>
              <p className="mt-1 text-sm text-gray-500">This class has no subjects yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* Restored: Display inherited Batch and Semester as a consolidated row if available */}
                  {(currentMotherClassInheritedData?.inheritedBatch || currentMotherClassInheritedData?.inheritedSemester) && (
                    <tr className="bg-blue-50/50">
                      <td colSpan={3} className="px-6 py-3 whitespace-nowrap text-sm text-gray-700 font-semibold">
                        <div className="flex items-center">
                          <span className="mr-3 text-blue-800">
                            <svg className="h-5 w-5 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.279a1.125 1.125 0 011.272 1.272l-1.55 7.518a1.125 1.125 0 01-1.272 1.272h-12.186a1.125 1.125 0 01-1.272-1.272l1.55-7.518a1.125 1.125 0 011.272-1.272H20.432z" />
                            </svg>
                            Common Batch & Semester:
                          </span>
                          {currentMotherClassInheritedData?.inheritedBatch && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-2">
                              Batch: {currentMotherClassInheritedData.inheritedBatch.batchName} ({currentMotherClassInheritedData.inheritedBatch.year})
                            </span>
                          )}
                          {currentMotherClassInheritedData?.inheritedSemester && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Semester: {currentMotherClassInheritedData.inheritedSemester.name} ({formatDate(currentMotherClassInheritedData.inheritedSemester.startDate)} - {formatDate(currentMotherClassInheritedData.inheritedSemester.endDate)})
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}

                  {classSections
                    .filter(section => section.motherClassId === selectedMotherClassId)
                    .map(section => (
                      <tr key={section.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 flex-shrink-0 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">CS</span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{section.sectionName + `${section.isOptional?" (Optional)":""}` || 'Unnamed Section'}</div>
                              <div className="text-sm text-gray-500">Max: {section.maxStudents || 'N/A'}</div>
                            </div>
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
        </>
      )}
    </div>
  );
}