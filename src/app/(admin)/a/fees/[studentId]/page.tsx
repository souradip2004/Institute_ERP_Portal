"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";

// TypeScript interfaces
interface LocalFee {
    id: string;
    name: string;
    amount: number;
    taxPercentage: number;
    paymentterms: string;
    penalty: number;
}

interface StudentLocalFee {
    id: string;
    localFeesId: string;
    studentId: string;
    localFees: LocalFee;
}

interface StudentInfo {
    id: string;
    studentRoll: string;
    user: {
        name: string;
        email: string;
    };
    department: {
        name: string;
    };
    classEnrollments: Array<{
        classSection: {
            sectionName: string;
            motherClassId: string;
        };
    }>;
}

export default function StudentFeesPage() {
    const params = useParams();
    const studentId = params!.studentId as string;

    const [institutionId, setInstitutionId] = useState<string | null>(null);
    const [feesData, setFeesData] = useState<StudentLocalFee[]>([]);
    const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
    const [motherClassId, setMotherClassId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editingFee, setEditingFee] = useState<LocalFee | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        amount: '',
        taxPercentage: '',
        paymentterms: '',
        penalty: ''
    });
    const [editFormData, setEditFormData] = useState({
        name: '',
        description: '',
        amount: '',
        taxPercentage: '',
        paymentterms: '',
        penalty: ''
    });
    const [deletingFeeId, setDeletingFeeId] = useState<string | null>(null);

    useEffect(() => {
        try {
            const user = localStorage.getItem('user');
            if (user) {
                const data = JSON.parse(user);
                setInstitutionId(data.institutionId);
                console.log("Institution ID:", data.institutionId);
            }
        } catch { }
    }, []);


    useEffect(() => {
        const fetchStudentData = async () => {
            if (!studentId) return;

            try {
                setLoading(true);
                setError(null);

                // Fetch student info and fees data in parallel
                const [studentResponse, feesResponse] = await Promise.all([
                    axios.get(`/api/students/${studentId}`),
                    axios.get(`/api/payment/local-fees?studentId=${studentId}`)
                ]);

                setStudentInfo(studentResponse.data);
                setFeesData(feesResponse.data || []);

                // Extract and save mother class ID
                if (studentResponse.data?.classEnrollments?.[0]?.classSection?.motherClassId) {
                    setMotherClassId(studentResponse.data.classEnrollments[0].classSection.motherClassId);
                }
            } catch (err) {
                console.error("Error fetching student data:", err);
                setError("Failed to fetch student data");
                setStudentInfo(null);
                setFeesData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchStudentData();
    }, [studentId]);

    const calculateTotalAmount = (amount: number, taxPercentage: number) => {
        const taxAmount = (amount * taxPercentage) / 100;
        return amount + taxAmount;
    };

    const calculateGrandTotal = () => {
        return feesData.reduce((total, fee) => {
            return total + calculateTotalAmount(fee.localFees.amount, fee.localFees.taxPercentage);
        }, 0);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEditFee = (fee: LocalFee) => {
        setEditingFee(fee);
        setEditFormData({
            name: fee.name,
            description: '', // Description not available in LocalFee interface
            amount: fee.amount.toString(),
            taxPercentage: fee.taxPercentage.toString(),
            paymentterms: fee.paymentterms,
            penalty: fee.penalty.toString()
        });
        setShowEditModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!institutionId || !motherClassId || !studentId) {
            setError("Missing required data. Please refresh the page.");
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                institutionId,
                localFees: [{
                    name: formData.name,
                    description: formData.description,
                    amount: parseFloat(formData.amount),
                    taxPercentage: parseFloat(formData.taxPercentage),
                    paymentterms: formData.paymentterms,
                    penalty: parseFloat(formData.penalty),
                    motherClassId,
                    studentIds: [studentId]
                }]
            };

            await axios.post('/api/payment/local-fees', payload);

            // Refresh fees data
            const feesResponse = await axios.get(`/api/payment/local-fees?studentId=${studentId}`);
            setFeesData(feesResponse.data || []);

            // Reset form and close modal
            setFormData({
                name: '',
                description: '',
                amount: '',
                taxPercentage: '',
                paymentterms: '',
                penalty: ''
            });
            setShowModal(false);

        } catch (err) {
            console.error("Error adding fee:", err);
            setError("Failed to add fee. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!editingFee) return;

        setSubmitting(true);
        try {
            const payload = {
                localFees: [{
                    id: editingFee.id,
                    name: editFormData.name,
                    amount: parseFloat(editFormData.amount),
                    taxPercentage: parseFloat(editFormData.taxPercentage),
                    paymentterms: editFormData.paymentterms,
                    penalty: parseFloat(editFormData.penalty)
                }]
            };

            await axios.patch('/api/payment/local-fees', payload);

            // Refresh fees data
            const feesResponse = await axios.get(`/api/payment/local-fees?studentId=${studentId}`);
            setFeesData(feesResponse.data || []);

            // Reset form and close modal
            setEditFormData({
                name: '',
                description: '',
                amount: '',
                taxPercentage: '',
                paymentterms: '',
                penalty: ''
            });
            setEditingFee(null);
            setShowEditModal(false);

        } catch (err) {
            console.error("Error updating fee:", err);
            setError("Failed to update fee. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteFee = async (localFeesId: string) => {
        if (!confirm("Are you sure you want to delete this fee? This action cannot be undone.")) {
            return;
        }

        setDeletingFeeId(localFeesId);
        try {
            await axios.delete(`/api/payment/local-fees?localFeesId=${localFeesId}`);

            // Refresh fees data
            const feesResponse = await axios.get(`/api/payment/local-fees?studentId=${studentId}`);
            setFeesData(feesResponse.data || []);

        } catch (err) {
            console.error("Error deleting fee:", err);
            setError("Failed to delete fee. Please try again.");
        } finally {
            setDeletingFeeId(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading student fees...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-xl mb-4">⚠️</div>
                    <p className="text-red-600 font-medium">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Fees Details</h1>
                    <p className="text-gray-600">Student ID: {studentId}</p>
                </div>

                {/* Student Info Card */}
                {studentInfo && (
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Student Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Name</label>
                                <p className="text-gray-900 font-medium">{studentInfo.user.name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Roll Number</label>
                                <p className="text-gray-900 font-medium">{studentInfo.studentRoll}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Email</label>
                                <p className="text-gray-900 font-medium">{studentInfo.user.email}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Department</label>
                                <p className="text-gray-900 font-medium">{studentInfo.department.name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Class Section</label>
                                <p className="text-gray-900 font-medium">
                                    {studentInfo.classEnrollments?.[0]?.classSection?.sectionName || 'Not assigned'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Add Fees Button */}
                <div className="mb-6 flex justify-end">
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors font-medium"
                    >
                        Add Fees
                    </button>
                </div>

                {/* Fees Table */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    {feesData.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="text-gray-400 text-6xl mb-4">📋</div>
                            <h3 className="text-xl font-medium text-gray-900 mb-2">No Fees Data Found</h3>
                            <p className="text-gray-500">No local fees have been assigned to this student yet.</p>
                        </div>
                    ) : (
                        <>
                            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900">Local Fees Summary</h2>
                                <p className="text-sm text-gray-600">Total fees: {feesData.length} items</p>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Fee Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Base Amount (₹)
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Tax (%)
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Tax Amount (₹)
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Total Amount (₹)
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Payment Terms
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Penalty (₹)
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {feesData.map((feeItem, index) => {
                                            const { localFees } = feeItem;
                                            const taxAmount = (localFees.amount * localFees.taxPercentage) / 100;
                                            const totalAmount = localFees.amount + taxAmount;

                                            return (
                                                <tr key={feeItem.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">{localFees.name}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">₹{localFees.amount.toFixed(2)}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{localFees.taxPercentage}%</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">₹{taxAmount.toFixed(2)}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-semibold text-gray-900">₹{totalAmount.toFixed(2)}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{localFees.paymentterms}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-red-600">₹{localFees.penalty.toFixed(2)}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleEditFee(localFees)}
                                                                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteFee(localFees.id)}
                                                                disabled={deletingFeeId === localFees.id}
                                                                className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                {deletingFeeId === localFees.id ? 'Deleting...' : 'Delete'}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Summary Footer */}
                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                                <div className="flex justify-between items-center">
                                    <div className="text-sm text-gray-600">
                                        Total Items: {feesData.length}
                                    </div>
                                    <div className="text-lg font-bold text-gray-900">
                                        Grand Total: ₹{calculateGrandTotal().toFixed(2)}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Add Fees Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Add New Fee</h3>
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="text-gray-400 hover:text-gray-600 text-xl"
                                    >
                                        ×
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Fee Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            placeholder="e.g., Library Fee"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Description
                                        </label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            placeholder="Brief description of the fee"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Amount (₹) *
                                        </label>
                                        <input
                                            type="number"
                                            name="amount"
                                            value={formData.amount}
                                            onChange={handleInputChange}
                                            required
                                            min="0"
                                            step="0.01"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            placeholder="0.00"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Tax Percentage (%) *
                                        </label>
                                        <input
                                            type="number"
                                            name="taxPercentage"
                                            value={formData.taxPercentage}
                                            onChange={handleInputChange}
                                            required
                                            min="0"
                                            max="100"
                                            step="0.01"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            placeholder="0"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Payment Terms *
                                        </label>
                                        <select
                                            name="paymentterms"
                                            value={formData.paymentterms}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        >
                                            <option value="">Select Payment Terms</option>
                                            <option value="1 month">1 month</option>
                                            <option value="3 months">3 months</option>
                                            <option value="6 months">6 months</option>
                                            <option value="12 months">12 months</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Penalty (₹) *
                                        </label>
                                        <input
                                            type="number"
                                            name="penalty"
                                            value={formData.penalty}
                                            onChange={handleInputChange}
                                            required
                                            min="0"
                                            step="0.01"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            placeholder="0.00"
                                        />
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowModal(false)}
                                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {submitting ? 'Adding...' : 'Add Fee'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Fees Modal */}
                {showEditModal && editingFee && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Edit Fee</h3>
                                    <button
                                        onClick={() => {
                                            setShowEditModal(false);
                                            setEditingFee(null);
                                        }}
                                        className="text-gray-400 hover:text-gray-600 text-xl"
                                    >
                                        ×
                                    </button>
                                </div>

                                <form onSubmit={handleEditSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Fee Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={editFormData.name}
                                            onChange={handleEditInputChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            placeholder="e.g., Library Fee"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Amount (₹) *
                                        </label>
                                        <input
                                            type="number"
                                            name="amount"
                                            value={editFormData.amount}
                                            onChange={handleEditInputChange}
                                            required
                                            min="0"
                                            step="0.01"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            placeholder="0.00"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Tax Percentage (%) *
                                        </label>
                                        <input
                                            type="number"
                                            name="taxPercentage"
                                            value={editFormData.taxPercentage}
                                            onChange={handleEditInputChange}
                                            required
                                            min="0"
                                            max="100"
                                            step="0.01"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            placeholder="0"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Payment Terms *
                                        </label>
                                        <select
                                            name="paymentterms"
                                            value={editFormData.paymentterms}
                                            onChange={handleEditInputChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        >
                                            <option value="">Select Payment Terms</option>
                                            <option value="1 month">1 month</option>
                                            <option value="3 months">3 months</option>
                                            <option value="6 months">6 months</option>
                                            <option value="12 months">12 months</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Penalty (₹) *
                                        </label>
                                        <input
                                            type="number"
                                            name="penalty"
                                            value={editFormData.penalty}
                                            onChange={handleEditInputChange}
                                            required
                                            min="0"
                                            step="0.01"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            placeholder="0.00"
                                        />
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowEditModal(false);
                                                setEditingFee(null);
                                            }}
                                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {submitting ? 'Updating...' : 'Update Fee'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}