import React, { useState } from 'react';
import { MdDelete } from 'react-icons/md';

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
  handleDeleteTeacher: (userId: string) => void;
  deletingTeacher: boolean; // Changed to boolean for clarity
}

const STATUS_STYLES = {
  'FULL_TIME': 'bg-green-100 text-green-800',
  'PART_TIME': 'bg-yellow-100 text-yellow-800',
  'CONTRACT': 'bg-red-100 text-red-800',
  'VISITING': 'bg-blue-100 text-blue-800'
};

export default function TeachersList({ teachers, onViewTeacher, handleDeleteTeacher, deletingTeacher }: TeachersListProps) {
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<string | null>(null);

  const openDeleteModal = (userId: string) => {
    setTeacherToDelete(userId);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (deletingTeacher) return; // Prevent closing while deletion is in progress
    setTeacherToDelete(null);
    setDeleteModalOpen(false);
  };

  const confirmDelete = () => {
    if (teacherToDelete) {
      handleDeleteTeacher(teacherToDelete);
      // The modal will now close only after deletion is complete,
      // which you can handle in the parent component by tracking `deletingTeacher` state.
      // For now, we assume the parent component will manage closing the modal if needed.
    }
  };

  return (
    <div className="p-4 sm:p-6">
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
              <th scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Code
              </th>
              <th scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                <td
                  className="px-6 py-4 text-sm text-gray-700 max-w-[150px] sm:max-w-none truncate sm:whitespace-normal">
                  {teacher.user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${STATUS_STYLES[teacher.employmentStatus]}`}>
                      <span className="hidden sm:inline">{teacher.employmentStatus.replace('_', ' ')}</span>
                      <span
                        className="sm:hidden">{teacher.employmentStatus.split('_')[0].charAt(0)}.{teacher.employmentStatus.split('_')[1].charAt(0)}.</span>
                    </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-9">
                  <button
                    onClick={() => onViewTeacher(teacher.id)}
                    className="text-purple-600 hover:text-purple-900 transition-colors focus:outline-none focus:underline"
                    aria-label={`View details for ${teacher.user.name}`}
                  >
                    View
                  </button>
                  <button onClick={() => openDeleteModal(teacher.userId)}>
                    <MdDelete color={"red"} size={20} />
                  </button>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      )}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Confirm Deletion</h2>
            <p className="mb-6 text-gray-600">Are you sure you want to delete this teacher? This action cannot be undone.</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={closeDeleteModal}
                disabled={deletingTeacher}
                className="px-4 py-2 bg-gray-200 text-gray-400 rounded-md hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deletingTeacher}
                className="w-28 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-red-400 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {deletingTeacher ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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