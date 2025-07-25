'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Loader from '@/components/ui/Loader';

interface Student {
    id: string;
    name: string;
    roll: string;
    enrollmentStatus: string;
    email: string;
}

export default function ClassDetailsPage() {
    const params = useParams();
    const classId = params!.classId as string;

    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStudents = async () => {
            if (!classId) return;

            try {
                setLoading(true);
                setError(null);

                const response = await fetch(`/api/students/get-student-details?classSectionId=${classId}`, {
                    credentials: 'include',
                    cache: 'no-store'
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch students: ${response.status}`);
                }

                const data = await response.json();

                // Transform the data to match our Student interface
                const transformedStudents = data.studentEnrollments ? data.studentEnrollments.map((enrollment: any) => ({
                    id: enrollment.student.id,
                    name: enrollment.student.user.name,
                    roll: enrollment.student.studentRoll,
                    enrollmentStatus: enrollment.student.enrollmentStatus,
                    email: enrollment.student.user.email
                })) : [];

                setStudents(transformedStudents);
            } catch (error) {
                console.error('Error fetching students:', error);
                setError('Failed to load student details. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, [classId]);

    const getStatusBadgeColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'inactive':
                return 'bg-red-100 text-red-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader size="large" />
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-2">Student Details</h1>
                <p className="text-gray-600">Class ID: {classId}</p>
            </div>

            {error ? (
                <div className="bg-red-50 text-red-500 p-4 rounded-md mb-6">
                    <p>{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            ) : null}

            {students.length === 0 && !error ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No students found in this class.</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Roll Number
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Enrollment Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {students.map((student, index) => (
                                    <tr key={student.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{student.roll}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(student.enrollmentStatus)}`}>
                                                {student.enrollmentStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{student.email}</div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {students.length > 0 && (
                        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                            <p className="text-sm text-gray-700">
                                Total Students: <span className="font-medium">{students.length}</span>
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}