"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";

// TypeScript interfaces
interface Student {
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
    enrollmentStatus: string;
    user: {
        id: string;
        name: string;
        email: string;
        username: string | null;
        emailVerified: string;
        image: string | null;
        isVerified: boolean;
        coins: number;
        password: string;
        gender: string | null;
        dateOfBirth: string | null;
        address: string | null;
        phone: string | null;
        createdAt: string;
        updatedAt: string;
        role: string;
        institutionId: string;
    };
    department: {
        id: string;
        name: string;
        code: string;
        description: string | null;
        institutionId: string;
        createdAt: string;
        updatedAt: string;
    };
    batch: {
        id: string;
        batchName: string;
        year: number;
        departmentId: string;
        maxStudents: number;
        createdAt: string;
        updatedAt: string;
    };
    classEnrollments: Array<{
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
            semester: {
                name: string;
            };
        };
    }>;
}

interface GlobalFee {
    feeId: string;
    name: string;
    description: string;
    amountDue: number;
    baseAmount: number;
    taxPercentageIncluded: number;
    penaltyIncluded: number;
    isPenaltyApplied: boolean;
    paymentTerms: string;
    dueDate: string;
    classFeeId: string;
    paymentStatus: string;
    amountPaid: number;
    isVerified: boolean;
    paymentDate: string | null;
    paymentMethod: string | null;
    transactionId: string | null;
    feesCollectionId: string;
}

interface LocalFee {
    localFeesId: string;
    name: string;
    description: string;
    amountDue: number;
    baseAmount: number;
    taxPercentageIncluded: number;
    penaltyIncluded: number;
    isPenaltyApplied: boolean;
    paymentTerms: string;
    dueDate: string;
    classFeeId: string;
    paymentStatus: string;
    amountPaid: number;
    isVerified: boolean;
    paymentDate: string | null;
    paymentMethod: string | null;
    transactionId: string | null;
    feesCollectionId: string;
}

interface CombinedFee extends Omit<GlobalFee, 'feeId'> {
    id: string;
    feeType: 'global' | 'local';
}

const StudentFeesPage: React.FC = () => {
    const searchParams = useSearchParams();
    const [student, setStudent] = useState<Student | null>(null);
    const [globalFees, setGlobalFees] = useState<GlobalFee[]>([]);
    const [localFees, setLocalFees] = useState<LocalFee[]>([]);
    const [combinedFees, setCombinedFees] = useState<CombinedFee[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Get URL parameters
    const institutionId = searchParams.get('institutionId');
    const studentId = searchParams.get('studentId');
    const motherClassId = searchParams.get('motherClassId');

    useEffect(() => {
        if (institutionId && studentId && motherClassId) {
            fetchAllData();
        }
    }, [institutionId, studentId, motherClassId]);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch all three APIs simultaneously
            const [studentResponse, globalFeesResponse, localFeesResponse] = await Promise.all([
                axios.get(`/api/students/${studentId}`),
                axios.get(`/api/payment/fees-collection/global-fees?institutionId=${institutionId}&studentId=${studentId}&motherClassId=${motherClassId}`),
                axios.get(`/api/payment/fees-collection/local-fees?institutionId=${institutionId}&studentId=${studentId}`)
            ]);

            setStudent(studentResponse.data);
            setGlobalFees(globalFeesResponse.data);
            setLocalFees(localFeesResponse.data);

            // Combine fees for table display
            const combined: CombinedFee[] = [
                ...globalFeesResponse.data.map((fee: GlobalFee) => ({
                    ...fee,
                    id: fee.feeId,
                    feeType: 'global' as const
                })),
                ...localFeesResponse.data.map((fee: LocalFee) => ({
                    ...fee,
                    id: fee.localFeesId,
                    feeType: 'local' as const
                }))
            ];

            setCombinedFees(combined);
        } catch (err: any) {
            console.error('Error fetching data:', err);
            setError(err.response?.data?.message || 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handlePenaltyToggle = async (feeId: string, feeType: 'global' | 'local', currentStatus: boolean) => {
        // TODO: Implement penalty toggle API call
        console.log(`Toggle penalty for ${feeType} fee ${feeId}: ${!currentStatus}`);
    };

    const handleVerifiedToggle = async (feeId: string, feeType: 'global' | 'local', currentStatus: boolean) => {
        // TODO: Implement verified toggle API call
        console.log(`Toggle verified for ${feeType} fee ${feeId}: ${!currentStatus}`);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount: number) => {
        return `₹${amount.toFixed(2)}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading student fees data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-xl mb-4">Error</div>
                    <p className="text-gray-600">{error}</p>
                    <button
                        onClick={fetchAllData}
                        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!student) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Student not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Student Fees Management</h1>
                    <p className="text-gray-600 mt-2">View and manage student fee details</p>
                </div>

                {/* Student Information Card */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Student Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            <p className="mt-1 text-sm text-gray-900">{student.user.name}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Roll Number</label>
                            <p className="mt-1 text-sm text-gray-900">{student.studentRoll}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <p className="mt-1 text-sm text-gray-900">{student.user.email}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Department</label>
                            <p className="mt-1 text-sm text-gray-900">{student.department.name} ({student.department.code})</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Batch</label>
                            <p className="mt-1 text-sm text-gray-900">{student.batch.batchName}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Current Semester</label>
                            <p className="mt-1 text-sm text-gray-900">Semester {student.currentSemester}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Enrollment Status</label>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${student.enrollmentStatus === 'ACTIVE'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                {student.enrollmentStatus}
                            </span>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Phone</label>
                            <p className="mt-1 text-sm text-gray-900">{student.user.phone || 'Not provided'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Address</label>
                            <p className="mt-1 text-sm text-gray-900">{student.user.address || 'Not provided'}</p>
                        </div>
                    </div>
                </div>

                {/* Fees Table */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900">Fees Details</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Total Fees: {combinedFees.length} |
                            Global: {globalFees.length} |
                            Local: {localFees.length}
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Fee Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Roll
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Fee Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Amount Due
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Base Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tax %
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Due Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Payment Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Transaction ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Penalty Applied
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Verified
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {combinedFees.map((fee, index) => (
                                    <tr key={`${fee.feeType}-${fee.id}-${index}`} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{fee.name}</div>
                                                <div className="text-sm text-gray-500">{fee.description}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {student.studentRoll}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${fee.feeType === 'global'
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : 'bg-purple-100 text-purple-800'
                                                }`}>
                                                {fee.feeType.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {formatCurrency(fee.amountDue)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatCurrency(fee.baseAmount)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {fee.taxPercentageIncluded}%
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatDate(fee.dueDate)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${fee.paymentStatus === 'PENDING'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : fee.paymentStatus === 'PAID'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                {fee.paymentStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {fee.transactionId ? (
                                                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                                                    {fee.transactionId}
                                                </span>
                                            ) : (
                                                <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
                                                    Not Submitted
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => handlePenaltyToggle(fee.id, fee.feeType, fee.isPenaltyApplied)}
                                                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${fee.isPenaltyApplied
                                                        ? 'bg-red-500 border-red-500 text-white'
                                                        : 'border-gray-300 hover:border-red-400'
                                                    }`}
                                            >
                                                {fee.isPenaltyApplied && (
                                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => handleVerifiedToggle(fee.id, fee.feeType, fee.isVerified)}
                                                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${fee.isVerified
                                                        ? 'bg-green-500 border-green-500 text-white'
                                                        : 'border-gray-300 hover:border-green-400'
                                                    }`}
                                            >
                                                {fee.isVerified && (
                                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {combinedFees.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-gray-500">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No fees found</h3>
                                <p className="mt-1 text-sm text-gray-500">No fee records available for this student.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Summary Cards */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-medium text-gray-900">Total Amount Due</h3>
                        <p className="text-2xl font-bold text-red-600 mt-2">
                            {formatCurrency(combinedFees.reduce((sum, fee) => sum + fee.amountDue, 0))}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-medium text-gray-900">Total Amount Paid</h3>
                        <p className="text-2xl font-bold text-green-600 mt-2">
                            {formatCurrency(combinedFees.reduce((sum, fee) => sum + fee.amountPaid, 0))}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-medium text-gray-900">Pending Payments</h3>
                        <p className="text-2xl font-bold text-yellow-600 mt-2">
                            {combinedFees.filter(fee => fee.paymentStatus === 'PENDING').length}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentFeesPage;