import React, {useEffect, useState} from 'react';
import {Trash2} from 'lucide-react';
import {useRouter} from "next/navigation"; // Using lucide-react for consistency

export interface ClassSection {
  id: string;
  sectionName: string;
  batchId: string;
  optional: boolean;
  courseId: string;
  motherClassId: string;
  isOptional: boolean;
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
  _count: {
    attendanceSessions: number
  }
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
  handleDeleteMotherClass: (motherClassId: string) => void;
  deletingClassSection: boolean;
}

export default function ClassSectionsList({
  classSections,
  onViewClassSection,
  deletingClassSection,
  handleDeleteMotherClass
}: ClassSectionsListProps) {
  const [motherClasses, setMotherClasses] = useState<MotherClassWithInheritedData[]>([]);
  const [selectedMotherClassId, setSelectedMotherClassId] = useState<string | null>(null);

  // --- MODAL STATE ---
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [classToDeleteId, setClassToDeleteId] = useState<string | null>(null);

  const router = useRouter();

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

          for (const section of sectionsForThisMotherClass) {
            if (section.batch) inheritedBatch = section.batch;
            if (section.semester) inheritedSemester = section.semester;
            if (inheritedBatch && inheritedSemester) break;
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

  // --- MODAL HANDLERS ---
  const openDeleteModal = (motherClassId: string) => {
    setClassToDeleteId(motherClassId);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (deletingClassSection) return;
    setClassToDeleteId(null);
    setDeleteModalOpen(false);
  };

  const confirmDelete = () => {
    if (classToDeleteId) {
      handleDeleteMotherClass(classToDeleteId);

      closeDeleteModal();
    }
  };


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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4m0-10V9a2 2 0 00-2-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                </svg>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No Class found</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new Class.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Number
                    of Subjects
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Semester
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions
                  </th>
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
                      <div
                        className="text-sm text-gray-900">{mc.inheritedBatch ? `${mc.inheritedBatch.batchName} (${mc.inheritedBatch.year})` : 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className="text-sm text-gray-900">{mc.inheritedSemester ? `${mc.inheritedSemester.name} (${formatDate(mc.inheritedSemester.startDate)} - ${formatDate(mc.inheritedSemester.endDate)})` : 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                      {/* --- ACTIONS CONTAINER --- */}
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => setSelectedMotherClassId(mc.id)}
                          className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                        >
                          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                          </svg>
                          View Subjects
                        </button>
                        {/* --- DELETE BUTTON ADDED HERE --- */}
                        <button
                          onClick={() => openDeleteModal(mc.id)}
                          className="text-red-600 hover:text-red-900"
                          aria-label={`Delete class ${mc.name}`}
                        >
                          <Trash2 className="h-4 w-4"/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        // Detailed view of sections within a mother class
        <>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Subjects
              for {currentMotherClassInheritedData?.name || 'Selected Class'}</h2>
            <button onClick={() => setSelectedMotherClassId(null)}
                    className="text-sm text-blue-600 hover:underline inline-flex items-center">
              <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
              Back to Classes
            </button>
          </div>

          {classSections.filter(section => section.motherClassId === selectedMotherClassId).length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">View
                    Attendance
                  </th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {classSections.filter(section => section.motherClassId === selectedMotherClassId).map(section => (
                  <tr key={section.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className="h-8 w-8 flex-shrink-0 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">CS</span></div>
                        <div className="ml-4">
                          <div
                            className="text-sm font-medium text-gray-900">{section.sectionName + `${section.isOptional ? " (Optional)" : ""}` || 'Unnamed Section'}</div>
                          <div className="text-sm text-gray-500">Max: {section.maxStudents || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{section.teacher?.user?.name || 'No Teacher'}</div>
                      <div className="text-sm text-gray-500">{section.teacher?.teacherCode || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap  text-sm font-medium">
                      <button onClick={() => onViewClassSection(section.id)}
                              className="text-purple-600 hover:text-blue-900 inline-flex items-center">
                        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                        View Details
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap  text-sm font-medium">
                      <button
                        onClick={() => router.push(`/a/attendance?classSectionId=${section.id}`)

                        }
                        disabled={section._count.attendanceSessions === 0}
                        className={`text-purple-600 hover:text-blue-900 inline-flex items-center 
                        ${section._count.attendanceSessions === 0 ? 'opacity-80 grayscale-50 cursor-not-allowed' : ''}
                        `}>

                        {section._count.attendanceSessions === 0 ? "Attendance not created" : (
                          <>
                          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                          </svg>
                            View Attendance
                          </>
                        )}

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

      {/* --- DELETE CONFIRMATION MODAL ADDED HERE --- */}
      {isDeleteModalOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Confirm Deletion</h2>
            <p className="mb-6 text-gray-600">Are you sure you want to delete this class and all its subjects? This
              action cannot be undone.</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={closeDeleteModal}
                disabled={deletingClassSection}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deletingClassSection}
                className="w-32 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-red-400 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {deletingClassSection ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg"
                         fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                              strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  'OK'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}