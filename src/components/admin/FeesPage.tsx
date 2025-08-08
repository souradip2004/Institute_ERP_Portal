"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pencil } from 'lucide-react';

// TypeScript interfaces and types
interface FormFieldProps {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isEditing: boolean;
    type?: string;
}

interface Fee {
    id: string | number;
    name: string;
    amount: number;
    taxPercentage?: number;
    paymentterms?: string;
    penalty?: number;
    description?: string;
    institutionId?: string;
    dueDate?: string;
}

interface SectionFeeData {
    id: number;
    sectionName: string;
    globalFees: Fee[];
}

interface GlobalFee {
    id: string;
    name: string;
    description: string;
    amount: number;
    taxPercentage: number;
    paymentterms: string;
    penalty: number;
    institutionId: string;
    createdAt: string;
    updatedAt: string;
    classFees: {
        dueDate: string;
        id: string;
        motherClassId: string;
    }[];
}

interface MotherClass {
    id: string;
    institutionId: string;
    sectionName: string;
    classfee: {
        dueDate: string;
        id: string;
    }[];
}

interface GlobalClassFee {
    id: string;
    globalFeesId: string | null;
    motherClassId: string;
    localFeesId: string | null;
    createdAt: string;
    updatedAt: string;
    dueDate: string;
    feeCategoryId: string | null;
    globalFees: {
        id: string;
        name: string;
        description: string;
        amount: number;
        taxPercentage: number;
        paymentterms: string;
        penalty: number;
        institutionId: string;
        createdAt: string;
        updatedAt: string;
    } | null;
}

interface FeeStructureData {
    globalFees: GlobalFee[];
    motherClasses: MotherClass[];
}

interface SectionFeeDetails {
    [motherClassId: string]: GlobalClassFee[];
}



interface LocalFee {
    id: string;
    name: string;
    description: string;
    amount: number;
    taxPercentage: number;
    paymentterms: string;
    penalty: number;
    createdAt: string;
    updatedAt: string;
}

interface FeeLink {
    localFeeId: string;
    localFeesOnStudentId: string | null;
    offsetFee: number | null;
}

interface StudentEnrollment {
    id: string;
    studentRoll: string;
    enrollmentStatus: string;
    user: {
        name: string;
        email: string;
    };
    feeLinks: FeeLink[];
}

interface StudentResponse {
    institute: string;
    section: string;
    localFees: LocalFee[];
    studentEnrollments: StudentEnrollment[];
}

// A reusable FormField component (from your original code)
const FormField: React.FC<FormFieldProps> = ({ label, name, value, onChange, isEditing, type = "text" }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1">
            {label}
        </label>
        <input
            type={type}
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            disabled={!isEditing}
            className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                       disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none"
        />
    </div>
);






// --- NEW --- Fee Editor Modal Component ---

interface FeeEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (fees: Fee[]) => void;
    details: {
        title: string;
        fees: Fee[];
    };
}

const FeeEditorModal: React.FC<FeeEditorModalProps> = ({ isOpen, onClose, onSave, details }) => {
    const [currentFees, setCurrentFees] = useState<Fee[]>([]);

    useEffect(() => {
        // Deep copy the fees to edit them in isolation
        if (details?.fees) {
            setCurrentFees(JSON.parse(JSON.stringify(details.fees)));
        }
    }, [details]);

    if (!isOpen) return null;

    const handleFeeChange = (index: number, field: keyof Fee, value: string | number) => {
        const updatedFees = [...currentFees];
        if (field === 'amount' || field === 'taxPercentage' || field === 'penalty') {
            updatedFees[index][field] = typeof value === 'number' ? value : parseFloat(value as string) || 0;
        } else {
            updatedFees[index][field] = value as string;
        }
        setCurrentFees(updatedFees);
    };

    const handleRemoveFee = async (index: number) => {
        console.log("Removing fee at index:", index);
        console.log("fees id --- ", currentFees[index].id);

        try {
            await axios.delete(`/api/payment/global-fees?globalFeesId=${currentFees[index].id}`);
        } catch (err) {
            console.error("Error removing fee:", err);
        }

        const updatedFees = currentFees.filter((_, i) => i !== index);
        setCurrentFees(updatedFees);
    };

    const handleSave = async () => {
        // Filter out any fees with empty names before saving
        const validFees = currentFees.filter((fee) => fee.name.trim() !== '');

        if (validFees.length === 0) {
            console.error('No valid fees to update');
            return;
        }

        try {
            // Format fees to include only required fields for API
            const formattedFees = validFees.map(fee => {
                if (!fee.id || !fee.institutionId) {
                    console.error('Missing required fields for fee:', fee);
                    throw new Error(`Fee "${fee.name}" is missing required id or institutionId`);
                }

                return {
                    id: fee.id,
                    name: fee.name.trim(),
                    amount: Number(fee.amount) || 0,
                    institutionId: fee.institutionId,
                    // Include optional fields only if they have values
                    ...(fee.description && { description: fee.description.trim() }),
                    ...(fee.taxPercentage !== undefined && { taxPercentage: Number(fee.taxPercentage) }),
                    ...(fee.paymentterms && { paymentterms: fee.paymentterms.trim() }),
                    ...(fee.penalty !== undefined && { penalty: Number(fee.penalty) }),
                    ...(fee.dueDate && { dueDate: fee.dueDate })
                };
            });

            // Check if any fee has ONE_TIME payment terms to determine if we need dueDate
            const hasOneTimeFee = formattedFees.some(fee => fee.paymentterms === 'ONE_TIME');

            let requestBody = {};
            if (hasOneTimeFee) {
                // Use the first fee's due date as global due date, or current date if none
                const globalDueDate = formattedFees[0]?.dueDate || new Date().toISOString().split('T')[0];
                requestBody = {
                    dueDate: globalDueDate,
                    globalFeesToUpdate: formattedFees
                };
            } else {
                requestBody = {
                    globalFeesToUpdate: formattedFees
                };
            }

            console.log('Updating global fees with body:', JSON.stringify(requestBody, null, 2));

            await axios.patch('/api/payment/global-fees', requestBody);
            console.log('Global fees updated successfully');
        } catch (err: any) {
            console.error('Failed to update global fees', err);
            console.error('Error details:', err.response?.data);
            // Show error to user
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Unknown error occurred';
            alert(`Failed to update global fees: ${errorMessage}`);
            return; // Don't close modal on error
        }
        onSave(validFees);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <div className="p-6 border-b">
                    <h3 className="text-xl font-semibold text-slate-800">{details.title}</h3>
                </div>
                <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                    {currentFees.map((fee, index) => (
                        <div key={fee.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-slate-50 rounded-md">
                            <div>
                                <label htmlFor={`feename-${fee.id}`} className="block text-sm font-medium text-slate-700 mb-1">Fee Name</label>
                                <input
                                    id={`feename-${fee.id}`}
                                    type="text"
                                    placeholder="Fee Name (e.g., Tuition)"
                                    value={fee.name}
                                    onChange={(e) => handleFeeChange(index, 'name', e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label htmlFor={`amount-${fee.id}`} className="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
                                <input
                                    id={`amount-${fee.id}`}
                                    type="number"
                                    placeholder="Amount"
                                    value={fee.amount}
                                    onChange={(e) => handleFeeChange(index, 'amount', e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label htmlFor={`tax-${fee.id}`} className="block text-sm font-medium text-slate-700 mb-1">Tax Percentage (%)</label>
                                <input
                                    id={`tax-${fee.id}`}
                                    type="number"
                                    placeholder="Tax (%)"
                                    value={fee.taxPercentage ?? ''}
                                    onChange={(e) => handleFeeChange(index, 'taxPercentage', e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label htmlFor={`penalty-${fee.id}`} className="block text-sm font-medium text-slate-700 mb-1">Penalty (₹)</label>
                                <input
                                    id={`penalty-${fee.id}`}
                                    type="number"
                                    placeholder="Penalty (₹)"
                                    value={fee.penalty ?? ''}
                                    onChange={(e) => handleFeeChange(index, 'penalty', e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="col-span-2">
                                <label htmlFor={`description-${fee.id}`} className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <textarea
                                    id={`description-${fee.id}`}
                                    placeholder="Description"
                                    value={fee.description ?? ''}
                                    onChange={(e) => handleFeeChange(index, 'description', e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    rows={2}
                                />
                            </div>
                            <div>
                                <label htmlFor={`terms-${fee.id}`} className="block text-sm font-medium text-slate-700 mb-1">Payment Terms</label>
                                <select
                                    id={`terms-${fee.id}`}
                                    value={['MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY', 'ONE_TIME'].includes(fee.paymentterms || '') ? fee.paymentterms : ''}
                                    onChange={(e) => handleFeeChange(index, 'paymentterms', e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">Select Payment Terms</option>
                                    <option value="MONTHLY">Monthly</option>
                                    <option value="QUARTERLY">Quarterly</option>
                                    <option value="HALF_YEARLY">Half Yearly</option>
                                    <option value="YEARLY">Yearly</option>
                                    <option value="ONE_TIME">One Time</option>
                                </select>
                            </div>
                            {fee.paymentterms === 'ONE_TIME' && (
                                <div>
                                    <label htmlFor={`duedate-${fee.id}`} className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                                    <input
                                        id={`duedate-${fee.id}`}
                                        type="date"
                                        value={fee.dueDate ?? ''}
                                        onChange={(e) => handleFeeChange(index, 'dueDate', e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            )}
                            <button onClick={() => handleRemoveFee(index)} className="col-span-2 p-2 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors w-fit ml-auto">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
                <div className="p-4 bg-slate-50 border-t flex justify-end gap-3 rounded-lg">
                    <button onClick={onClose} className="py-2 px-5 bg-white text-slate-700 border border-slate-300 font-semibold rounded-md shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition-all">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="py-2 px-5 bg-indigo-600 text-white font-semibold rounded-md shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- NEW --- Local Fee Add Modal Component ---
interface LocalFeeAddModalProps {
    isOpen: boolean;
    onClose: () => void;
    refresh: () => void;
    onAdd: (newFee: any) => void;
    title: string;
    sectionId: string | null;
}

const LocalFeeAddModal: React.FC<LocalFeeAddModalProps> = ({ isOpen, onClose, refresh, onAdd, title, sectionId }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        amount: '',
        taxPercentage: '',
        paymentterms: '',
        penalty: '',
        dueDate: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Set default due date to today
            const today = new Date().toISOString().split('T')[0];
            setFormData({
                name: '',
                description: '',
                amount: '',
                taxPercentage: '',
                paymentterms: '',
                penalty: '',
                dueDate: today
            });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim() || !sectionId || !formData.dueDate) return;

        setSubmitting(true);
        try {
            let institutionId = '';
            try {
                const user = localStorage.getItem('user');
                if (user) {
                    const data = JSON.parse(user);
                    institutionId = data.institutionId || '';
                }
            } catch { }

            let body = {}

            if (formData.paymentterms === 'ONE_TIME') {
                body = {
                    institutionId,
                    localFees: [{
                        name: formData.name,
                        description: formData.description,
                        amount: parseFloat(formData.amount) || 0,
                        taxPercentage: parseFloat(formData.taxPercentage) || 0,
                        paymentterms: formData.paymentterms,
                        penalty: parseFloat(formData.penalty) || 0,
                        motherClassId: String(sectionId),
                        dueDate: formData.dueDate
                    }]
                };
            } else {
                body = {
                    institutionId,
                    localFees: [{
                        name: formData.name,
                        description: formData.description,
                        amount: parseFloat(formData.amount) || 0,
                        taxPercentage: parseFloat(formData.taxPercentage) || 0,
                        paymentterms: formData.paymentterms,
                        penalty: parseFloat(formData.penalty) || 0,
                        motherClassId: String(sectionId)
                    }]
                };
            }

            console.log("Local fee body:", body);
            await axios.post('/api/payment/local-fees', body);
            onAdd(formData);
        } catch (err) {
            console.error('Failed to add local fee', err);
        } finally {
            setSubmitting(false);
            refresh()
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 text-xl"
                        >
                            ×
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fee Name *</label>
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tax Percentage (%) *</label>
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms *</label>
                            <select
                                name="paymentterms"
                                value={['MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY', 'ONE_TIME'].includes(formData.paymentterms || '') ? formData.paymentterms : ''}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                                <option value="">Select Payment Terms</option>
                                <option value="MONTHLY">Monthly</option>
                                <option value="QUARTERLY">Quarterly</option>
                                <option value="HALF_YEARLY">Half Yearly</option>
                                <option value="YEARLY">Yearly</option>
                                <option value="ONE_TIME">One Time</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Penalty (₹) *</label>
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
                        {formData.paymentterms === 'ONE_TIME' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
                                <input
                                    type="date"
                                    name="dueDate"
                                    value={formData.dueDate}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                        )}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
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
    );
};

// --- NEW --- Local Fee Column Edit Modal Component ---
interface LocalFeeColumnEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (updatedFee: any) => void;
    editingLocalFeeColumn: {
        id: string;
        name: string;
        description: string;
        amount: number;
        taxPercentage: number;
        paymentterms: string;
        penalty: number;
        classFeesId: string;
        dueDate: string;
    } | null;
}

const LocalFeeColumnEditModal: React.FC<LocalFeeColumnEditModalProps> = ({ isOpen, onClose, onSave, editingLocalFeeColumn }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        amount: '',
        taxPercentage: '',
        paymentterms: '',
        penalty: '',
        dueDate: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen && editingLocalFeeColumn) {
            setFormData({
                name: editingLocalFeeColumn.name,
                description: editingLocalFeeColumn.description,
                amount: editingLocalFeeColumn.amount.toString(),
                taxPercentage: editingLocalFeeColumn.taxPercentage.toString(),
                paymentterms: editingLocalFeeColumn.paymentterms,
                penalty: editingLocalFeeColumn.penalty.toString(),
                dueDate: editingLocalFeeColumn.dueDate
            });
        }
    }, [isOpen, editingLocalFeeColumn]);

    if (!isOpen || !editingLocalFeeColumn) return null;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.dueDate) return;

        setSubmitting(true);
        try {
            let body = {};

            if (formData.paymentterms === 'ONE_TIME') {
                body = {
                    localFees: [{
                        id: editingLocalFeeColumn.id,
                        name: formData.name.trim(),
                        description: formData.description.trim(),
                        amount: parseFloat(formData.amount) || 0,
                        taxPercentage: parseFloat(formData.taxPercentage) || 0,
                        paymentterms: formData.paymentterms.trim(),
                        penalty: parseFloat(formData.penalty) || 0,
                        classFeesId: editingLocalFeeColumn.classFeesId,
                        dueDate: new Date(formData.dueDate).toISOString()
                    }]
                };
            } else {
                body = {
                    localFees: [{
                        id: editingLocalFeeColumn.id,
                        name: formData.name.trim(),
                        description: formData.description.trim(),
                        amount: parseFloat(formData.amount) || 0,
                        taxPercentage: parseFloat(formData.taxPercentage) || 0,
                        paymentterms: formData.paymentterms.trim(),
                        penalty: parseFloat(formData.penalty) || 0,
                        classFeesId: editingLocalFeeColumn.classFeesId
                    }]
                };
            }

            console.log("Local fee column edit body:", body);
            await axios.patch('/api/payment/local-fees', body);
            onSave(formData);
        } catch (err) {
            console.error('Failed to update local fee', err);
            alert('Failed to update local fee. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Edit Local Fee: {editingLocalFeeColumn.name}</h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 text-xl"
                        >
                            ×
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fee Name *</label>
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tax Percentage (%) *</label>
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms *</label>
                            <select
                                name="paymentterms"
                                value={['MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY', 'ONE_TIME'].includes(formData.paymentterms || '') ? formData.paymentterms : ''}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                                <option value="">Select Payment Terms</option>
                                <option value="MONTHLY">Monthly</option>
                                <option value="QUARTERLY">Quarterly</option>
                                <option value="HALF_YEARLY">Half Yearly</option>
                                <option value="YEARLY">Yearly</option>
                                <option value="ONE_TIME">One Time</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Penalty (₹) *</label>
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
                        {formData.paymentterms === 'ONE_TIME' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
                                <input
                                    type="date"
                                    name="dueDate"
                                    value={formData.dueDate}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                        )}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
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
    );
};

// --- NEW --- Local Fee Edit Modal Component ---
interface LocalFeeEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (newOffset: number) => void;
    editingFee: {
        studentId: string;
        studentName: string;
        localFeeId: string;
        feeName: string;
        currentOffset: number;
        baseAmount: number;
    } | null;
}

const LocalFeeEditModal: React.FC<LocalFeeEditModalProps> = ({ isOpen, onClose, onSave, editingFee }) => {
    const [offsetAmount, setOffsetAmount] = useState<string>('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen && editingFee) {
            setOffsetAmount(editingFee.currentOffset.toString());
        }
    }, [isOpen, editingFee]);

    if (!isOpen || !editingFee) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const newOffset = parseFloat(offsetAmount) || 0;
            await onSave(newOffset);
        } finally {
            setSubmitting(false);
        }
    };

    const totalAmount = editingFee.baseAmount + (parseFloat(offsetAmount) || 0);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Edit Fee Amount</h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 text-xl"
                        >
                            ×
                        </button>
                    </div>

                    <div className="mb-4 p-3 bg-slate-50 rounded-md">
                        <div className="text-sm text-gray-600">
                            <div><span className="font-medium">Student:</span> {editingFee.studentName}</div>
                            <div><span className="font-medium">Fee:</span> {editingFee.feeName}</div>
                            <div><span className="font-medium">Base Amount:</span> ₹{editingFee.baseAmount.toFixed(2)}</div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Offset Amount (₹)
                            </label>
                            <input
                                type="number"
                                value={offsetAmount}
                                onChange={(e) => setOffsetAmount(e.target.value)}
                                step="0.01"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="0.00"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Positive values increase the fee, negative values decrease it
                            </p>
                        </div>

                        <div className="p-3 bg-blue-50 rounded-md">
                            <div className="text-sm">
                                <span className="font-medium text-blue-800">Total Amount: </span>
                                <span className="text-blue-900">₹{totalAmount.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

// --- NEW --- Global Fee Edit Modal Component ---
interface GlobalFeeEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (updatedFee: any) => void;
    editingGlobalFee: {
        id: string;
        name: string;
        description: string;
        amount: number;
        taxPercentage: number;
        paymentterms: string;
        penalty: number;
        institutionId: string;
        dueDate: string;
        sectionName: string;
    } | null;
}

const GlobalFeeEditModal: React.FC<GlobalFeeEditModalProps> = ({ isOpen, onClose, onSave, editingGlobalFee }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        amount: '',
        taxPercentage: '',
        paymentterms: '',
        penalty: '',
        dueDate: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen && editingGlobalFee) {
            setFormData({
                name: editingGlobalFee.name,
                description: editingGlobalFee.description,
                amount: editingGlobalFee.amount.toString(),
                taxPercentage: editingGlobalFee.taxPercentage.toString(),
                paymentterms: editingGlobalFee.paymentterms,
                penalty: editingGlobalFee.penalty.toString(),
                dueDate: editingGlobalFee.dueDate
            });
        }
    }, [isOpen, editingGlobalFee]);

    if (!isOpen || !editingGlobalFee) return null;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.dueDate) return;

        setSubmitting(true);
        try {
            let body = {};

            if (formData.paymentterms === 'ONE_TIME') {
                body = {
                    dueDate: formData.dueDate,
                    globalFeesToUpdate: [{
                        id: editingGlobalFee.id,
                        name: formData.name.trim(),
                        description: formData.description.trim(),
                        amount: parseFloat(formData.amount) || 0,
                        taxPercentage: parseFloat(formData.taxPercentage) || 0,
                        paymentterms: formData.paymentterms.trim(),
                        penalty: parseFloat(formData.penalty) || 0,
                        institutionId: editingGlobalFee.institutionId
                    }]
                };
            } else {
                body = {
                    globalFeesToUpdate: [{
                        id: editingGlobalFee.id,
                        name: formData.name.trim(),
                        description: formData.description.trim(),
                        amount: parseFloat(formData.amount) || 0,
                        taxPercentage: parseFloat(formData.taxPercentage) || 0,
                        paymentterms: formData.paymentterms.trim(),
                        penalty: parseFloat(formData.penalty) || 0,
                        institutionId: editingGlobalFee.institutionId
                    }]
                };
            }

            console.log("Global fee edit body:", body);
            await axios.patch('/api/payment/global-fees', body);
            onSave(formData);
        } catch (err) {
            console.error('Failed to update global fee', err);
            alert('Failed to update global fee. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b">
                    <h3 className="text-xl font-semibold text-slate-800">
                        Edit Global Fee: {editingGlobalFee.name}
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">
                        Section: {editingGlobalFee.sectionName}
                    </p>
                </div>
                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fee Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="e.g., Tuition Fee"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tax Percentage (%) *</label>
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms *</label>
                            <select
                                name="paymentterms"
                                value={['MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY', 'ONE_TIME'].includes(formData.paymentterms || '') ? formData.paymentterms : ''}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                                <option value="">Select Payment Terms</option>
                                <option value="MONTHLY">Monthly</option>
                                <option value="QUARTERLY">Quarterly</option>
                                <option value="HALF_YEARLY">Half Yearly</option>
                                <option value="YEARLY">Yearly</option>
                                <option value="ONE_TIME">One Time</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Penalty (₹) *</label>
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
                        {formData.paymentterms === 'ONE_TIME' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
                                <input
                                    type="date"
                                    name="dueDate"
                                    value={formData.dueDate}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                        )}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
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
    );
};

// --- NEW --- Global Fee Add Modal Component ---
interface GlobalFeeAddModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (newFee: Fee) => void;
    title: string;
    feeStructureData: FeeStructureData | null;
}

const GlobalFeeAddModal: React.FC<GlobalFeeAddModalProps> = ({ isOpen, onClose, onAdd, title, feeStructureData }) => {
    const [fee, setFee] = useState<Fee>({
        id: `new_${Date.now()}`,
        name: '',
        amount: 0,
        taxPercentage: undefined,
        paymentterms: '',
        penalty: undefined,
        description: '',
        dueDate: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Set default due date to today
            const today = new Date().toISOString().split('T')[0];
            setFee({
                id: `new_${Date.now()}`,
                name: '',
                amount: 0,
                taxPercentage: undefined,
                paymentterms: '',
                penalty: undefined,
                description: '',
                dueDate: today,
            });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleChange = (field: keyof Fee, value: string | number) => {
        setFee(prev => ({
            ...prev,
            [field]: field === 'amount' || field === 'taxPercentage' || field === 'penalty'
                ? (typeof value === 'number' ? value : parseFloat(value as string) || 0)
                : value
        }));
    };

    const handleAdd = async () => {
        if (fee.name.trim() === '' || !fee.dueDate) {
            console.error('Missing required fields:', { name: fee.name, dueDate: fee.dueDate });
            alert('Please fill in all required fields (Name and Due Date)');
            return;
        }

        setIsSubmitting(true);
        let institutionId = '';
        try {
            const user = localStorage.getItem('user');
            if (user) {
                const data = JSON.parse(user);
                institutionId = data.institutionId || '';
            }
        } catch { }

        // Get all motherClass IDs from the fee structure data
        let motherClassIds: string[] = [];
        if (feeStructureData?.motherClasses) {
            motherClassIds = feeStructureData.motherClasses.map(mc => mc.id);
        }
        console.log('Adding global fee to all sections. MotherClassIds:', motherClassIds);

        try {
            // Validate the date before sending
            const testDate = new Date(fee.dueDate!);
            if (isNaN(testDate.getTime())) {
                alert('Invalid due date selected. Please choose a valid date.');
                return;
            }
            console.log(`Using date: ${fee.dueDate} -> Valid: ${!isNaN(testDate.getTime())}`);

            let body = {}
            if (fee.paymentterms === 'ONE_TIME') {
                body = {
                    institutionId,
                    globalFees: [{
                        name: fee.name.trim(),
                        description: fee.description?.trim() || '',
                        amount: Number(fee.amount) || 0,
                        taxPercentage: Number(fee.taxPercentage) || 0,
                        paymentterms: fee.paymentterms?.trim() || '',
                        penalty: Number(fee.penalty) || 0,
                        dueDate: fee.dueDate,
                        motherClassIds
                    }]
                }
            } else {
                body = {
                    institutionId,
                    globalFees: [{
                        name: fee.name.trim(),
                        description: fee.description?.trim() || '',
                        amount: Number(fee.amount) || 0,
                        taxPercentage: Number(fee.taxPercentage) || 0,
                        paymentterms: fee.paymentterms?.trim() || '',
                        penalty: Number(fee.penalty) || 0,
                        // dueDate: fee.dueDate,
                        motherClassIds
                    }]
                }
            }

            console.log("Global fee add body ---", JSON.stringify(body, null, 2));
            const response = await axios.post('/api/payment/global-fees', body);
            console.log("API response:", response.data);
            onAdd(fee);
            onClose();
        } catch (err: any) {
            console.error('Failed to add global fee', err);
            console.error('Error details:', err.response?.data);
            // Show detailed error to user
            const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Unknown error occurred';
            alert(`Failed to add global fee: ${errorMessage}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <div className="p-6 border-b">
                    <h3 className="text-xl font-semibold text-slate-800">{title}</h3>
                </div>
                <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-slate-50 rounded-md">
                        <div>
                            <label htmlFor="add-feename" className="block text-sm font-medium text-slate-700 mb-1">Fee Name</label>
                            <input
                                id="add-feename"
                                type="text"
                                placeholder="Fee Name (e.g., Tuition)"
                                value={fee.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="add-amount" className="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
                            <input
                                id="add-amount"
                                type="number"
                                placeholder="Amount"
                                value={fee.amount}
                                onChange={(e) => handleChange('amount', e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="add-tax" className="block text-sm font-medium text-slate-700 mb-1">Tax Percentage (%)</label>
                            <input
                                id="add-tax"
                                type="number"
                                placeholder="Tax (%)"
                                value={fee.taxPercentage ?? ''}
                                onChange={(e) => handleChange('taxPercentage', e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="add-penalty" className="block text-sm font-medium text-slate-700 mb-1">Penalty (₹)</label>
                            <input
                                id="add-penalty"
                                type="number"
                                placeholder="Penalty (₹)"
                                value={fee.penalty ?? ''}
                                onChange={(e) => handleChange('penalty', e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div className="col-span-2">
                            <label htmlFor="add-description" className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                            <textarea
                                id="add-description"
                                placeholder="Description"
                                value={fee.description ?? ''}
                                onChange={(e) => handleChange('description', e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                rows={2}
                            />
                        </div>
                        <div>
                            <label htmlFor="add-terms" className="block text-sm font-medium text-slate-700 mb-1">Payment Terms</label>
                            <select
                                id="add-terms"
                                value={['MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY', 'ONE_TIME'].includes(fee.paymentterms || '') ? fee.paymentterms : ''}
                                onChange={(e) => handleChange('paymentterms', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">Select Payment Terms</option>
                                <option value="MONTHLY">Monthly</option>
                                <option value="QUARTERLY">Quarterly</option>
                                <option value="HALF_YEARLY">Half Yearly</option>
                                <option value="YEARLY">Yearly</option>
                                <option value="ONE_TIME">One Time</option>
                            </select>
                        </div>
                        {fee.paymentterms === 'ONE_TIME' && (
                            <div>
                                <label htmlFor="add-duedate" className="block text-sm font-medium text-slate-700 mb-1">Due Date *</label>
                                <input
                                    id="add-duedate"
                                    type="date"
                                    value={fee.dueDate ?? ''}
                                    onChange={(e) => handleChange('dueDate', e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                        )}

                    </div>
                </div>
                <div className="p-4 bg-slate-50 border-t flex justify-end gap-3 rounded-lg">
                    <button onClick={onClose} className="py-2 px-5 bg-white text-slate-700 border border-slate-300 font-semibold rounded-md shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition-all">
                        Cancel
                    </button>
                    <button
                        onClick={handleAdd}
                        disabled={isSubmitting}
                        className="py-2 px-5 bg-emerald-600 text-white font-semibold rounded-md shadow-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Adding...' : 'Add Fee'}
                    </button>
                </div>
            </div>
        </div>
    );
};


export default function Home() {
    // --- State for the Payment Details Form ---
    const [isEditing, setIsEditing] = useState(false);
    // Payment details state
    const [paymentDetails, setPaymentDetails] = useState({
        id: '',
        accountHolder: '',
        accountNumber: '',
        ifscCode: '',
        bankName: '',
        branchName: '',
        upiqrCode: '',
        upilink: '',
    });
    const [isSavingPayment, setIsSavingPayment] = useState(false);
    interface InstituteData {
        logoUrl?: string;
        name?: string;
        email?: string;
        phone?: string;
        city?: string;
        state?: string;
        country?: string;
    }
    const [instituteData, SetInstituteData] = useState<InstituteData | null>(null);

    // --- State for the Fees Table ---
    const [feesData, setFeesData] = useState<SectionFeeData[]>([]);
    const [loadingFees, setLoadingFees] = useState(false);
    // --- NEW --- State for dynamic fee structure ---
    const [feeStructureData, setFeeStructureData] = useState<FeeStructureData | null>(null);
    const [sectionFeeDetails, setSectionFeeDetails] = useState<SectionFeeDetails>({});
    // --- NEW --- State for Fee Editor Modal ---
    const [isFeeEditorOpen, setIsFeeEditorOpen] = useState(false);
    // For section global fees editing
    const [editingFeeDetails, setEditingFeeDetails] = useState<{ rowId: number | null, field: string, title: string, fees: Fee[] }>({ rowId: null, field: '', title: '', fees: [] });
    // --- NEW --- State for Global Fee Add Modal ---
    const [isGlobalFeeAddOpen, setIsGlobalFeeAddOpen] = useState(false);
    const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
    const [studentResponse, setStudentResponse] = useState<StudentResponse | null>(null);
    const [loadingStudents, setLoadingStudents] = useState(false);
    // --- NEW --- State for Local Fee Add Modal ---
    const [isLocalFeeAddOpen, setIsLocalFeeAddOpen] = useState(false);
    // --- NEW --- State for Local Fee Edit Modal ---
    const [isLocalFeeEditOpen, setIsLocalFeeEditOpen] = useState(false);
    const [editingLocalFee, setEditingLocalFee] = useState<{
        studentId: string;
        studentName: string;
        localFeeId: string;
        feeName: string;
        currentOffset: number;
        baseAmount: number;
    } | null>(null);
    // --- NEW --- State for Local Fee Column Edit Modal ---
    const [isLocalFeeColumnEditOpen, setIsLocalFeeColumnEditOpen] = useState(false);
    const [editingLocalFeeColumn, setEditingLocalFeeColumn] = useState<{
        id: string;
        name: string;
        description: string;
        amount: number;
        taxPercentage: number;
        paymentterms: string;
        penalty: number;
        classFeesId: string;
        dueDate: string;
    } | null>(null);
    // --- NEW --- State for Global Fee Edit Modal ---
    const [isGlobalFeeEditOpen, setIsGlobalFeeEditOpen] = useState(false);
    const [editingGlobalFee, setEditingGlobalFee] = useState<{
        id: string;
        name: string;
        description: string;
        amount: number;
        taxPercentage: number;
        paymentterms: string;
        penalty: number;
        institutionId: string;
        dueDate: string;
        sectionName: string;
    } | null>(null);


    useEffect(() => {
        const user = localStorage.getItem('user');
        if (!user) return;
        const data = JSON.parse(user as string);

        const fetchInstituteData = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/institutions/${data.institutionId}`);
                SetInstituteData(response.data);
            } catch (err) {
                console.log("error fetching institute data", err);
            }
        };

        const fetchPaymentDetails = async () => {
            try {
                const res = await axios.get(`/api/payment/create-fee-account?institutionId=${data.institutionId}`);
                if (res.data) {
                    setPaymentDetails({
                        id: res.data.id || '',
                        accountHolder: res.data.accountHolder || '',
                        accountNumber: res.data.accountNumber || '',
                        ifscCode: res.data.ifscCode || '',
                        bankName: res.data.bankName || '',
                        branchName: res.data.branchName || '',
                        upiqrCode: res.data.upiqrCode || '',
                        upilink: res.data.upilink || '',
                    });
                }
            } catch (err) {
                console.log("error fetching payment details", err);
            }
        };

        fetchInstituteData();
        fetchPaymentDetails();
    }, []);



    useEffect(() => {
        // Fetch fees data from API
        const user = localStorage.getItem('user');
        if (!user) return;
        const data = JSON.parse(user as string);
        const institutionId = data.institutionId;

        const fetchFeesData = async () => {
            setLoadingFees(true);
            try {
                // First API call to get global fees and mother classes
                const response = await axios.get(`/api/payment/global-fees?institutionId=${institutionId}`);
                const feeStructure: FeeStructureData = response.data;
                setFeeStructureData(feeStructure);

                // Second API calls to get details for each mother class
                const sectionDetails: SectionFeeDetails = {};
                for (const motherClass of feeStructure.motherClasses) {
                    try {
                        const detailResponse = await axios.get(`/api/payment/global-fees/fees?motherClassId=${motherClass.id}`);
                        sectionDetails[motherClass.id] = detailResponse.data.globalClassFees || [];
                    } catch (err) {
                        console.log(`Error fetching details for section ${motherClass.sectionName}:`, err);
                        sectionDetails[motherClass.id] = [];
                    }
                }
                setSectionFeeDetails(sectionDetails);

                // Keep the old format for backward compatibility with existing modals
                const mappedFeesData = feeStructure.motherClasses.map((section) => ({
                    id: parseInt(section.id.slice(-8), 16), // Convert string ID to number for compatibility
                    sectionName: section.sectionName,
                    globalFees: (sectionDetails[section.id] || [])
                        .filter((feeObj) => feeObj.globalFees !== null)
                        .map((feeObj) => {
                            const fee = feeObj.globalFees!;
                            return {
                                id: fee.id,
                                name: fee.name,
                                amount: fee.amount,
                                taxPercentage: fee.taxPercentage,
                                paymentterms: fee.paymentterms,
                                penalty: fee.penalty,
                                description: fee.description,
                                institutionId: fee.institutionId,
                                dueDate: feeObj.dueDate
                            };
                        })
                }));
                setFeesData(mappedFeesData);
            } catch (err) {
                console.log("error fetching fees data", err);
                setFeesData([]);
                setFeeStructureData(null);
                setSectionFeeDetails({});
            } finally {
                setLoadingFees(false);
            }
        };

        fetchFeesData();
    }, []);



    // --- Handlers for the Payment Details Form ---
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPaymentDetails({ ...paymentDetails, [e.target.name]: e.target.value });
    };
    const handleEdit = () => setIsEditing(true);
    const handleSave = async () => {
        setIsSavingPayment(true);
        try {
            // PATCH API call to update payment details
            const payload = {
                id: paymentDetails.id,
                accountHolder: paymentDetails.accountHolder,
                accountNumber: paymentDetails.accountNumber,
                ifscCode: paymentDetails.ifscCode,
                bankName: paymentDetails.bankName,
                branchName: paymentDetails.branchName,
                upiqrCode: paymentDetails.upiqrCode,
            };
            await axios.patch('/api/payment/create-fee-account', payload, {
                headers: { 'Content-Type': 'application/json' },
            });
            setIsEditing(false);
        } catch (err) {
            console.error('Failed to update payment details', err);
            // Optionally show error to user
        } finally {
            setIsSavingPayment(false);
        }
    };


    // --- NEW --- Handlers for the Fee Editor and Add Modal ---
    // For section global fees editing
    const handleOpenFeeEditor = (rowId: number, field: 'globalFees', sectionName: string) => {
        const row = feesData.find(r => r.id === rowId);
        if (!row) return;
        const title = `Editing Global Fees for ${sectionName}`;
        setEditingFeeDetails({
            rowId: rowId,
            field: field,
            title: title,
            fees: row.globalFees
        });
        setIsFeeEditorOpen(true);
    };

    const handleCloseFeeEditor = () => {
        setIsFeeEditorOpen(false);
        setEditingFeeDetails({ rowId: null, field: '', title: '', fees: [] });
    };

    const handleSaveFees = (updatedFees: Fee[]) => {
        const { rowId, field } = editingFeeDetails;
        if (rowId === null || !field) return;
        const updatedData = feesData.map((row: SectionFeeData) => {
            if (row.id === rowId) {
                return { ...row, globalFees: updatedFees };
            }
            return row;
        });
        setFeesData(updatedData);
        handleCloseFeeEditor();
    };

    // For global fees adding to all sections
    const handleOpenGlobalFeeAdd = () => {
        setIsGlobalFeeAddOpen(true);
    };

    const handleCloseGlobalFeeAdd = () => {
        setIsGlobalFeeAddOpen(false);
    };

    const handleAddGlobalFee = async (newFee: Fee) => {
        // Refresh the fee structure data to get the latest data from server
        try {
            const user = localStorage.getItem('user');
            if (user) {
                const data = JSON.parse(user as string);
                const institutionId = data.institutionId;

                // Fetch updated fee structure
                const response = await axios.get(`/api/payment/global-fees?institutionId=${institutionId}`);
                const feeStructure: FeeStructureData = response.data;
                setFeeStructureData(feeStructure);

                // Refresh section details for all mother classes
                const sectionDetails: SectionFeeDetails = {};
                for (const motherClass of feeStructure.motherClasses) {
                    try {
                        const detailResponse = await axios.get(`/api/payment/global-fees/fees?motherClassId=${motherClass.id}`);
                        sectionDetails[motherClass.id] = detailResponse.data.globalClassFees || [];
                    } catch (err) {
                        console.log(`Error fetching details for section ${motherClass.sectionName}:`, err);
                        sectionDetails[motherClass.id] = [];
                    }
                }
                setSectionFeeDetails(sectionDetails);

                // Update the mapped fees data
                const mappedFeesData = feeStructure.motherClasses.map((section) => ({
                    id: parseInt(section.id.slice(-8), 16),
                    sectionName: section.sectionName,
                    globalFees: (sectionDetails[section.id] || [])
                        .filter((feeObj) => feeObj.globalFees !== null)
                        .map((feeObj) => {
                            const fee = feeObj.globalFees!;
                            return {
                                id: fee.id,
                                name: fee.name,
                                amount: fee.amount,
                                taxPercentage: fee.taxPercentage,
                                paymentterms: fee.paymentterms,
                                penalty: fee.penalty,
                                description: fee.description,
                                institutionId: fee.institutionId,
                                dueDate: feeObj.dueDate
                            };
                        })
                }));
                setFeesData(mappedFeesData);
            }
        } catch (err) {
            console.error('Error refreshing fee structure:', err);
        }

        handleCloseGlobalFeeAdd();
    };

    // --- NEW --- Handlers for Local Fee Add Modal ---
    const handleOpenLocalFeeAdd = () => {
        if (selectedSectionId === null) return;
        setIsLocalFeeAddOpen(true);
    };
    const refershStudents = () => {
        if (selectedSectionId !== null) {
            const motherClass = feeStructureData?.motherClasses.find(
                mc => mc.id.includes(selectedSectionId)
            );
            if (motherClass) {
                fetchStudents(motherClass.id);
            }
        }
    };
    const handleCloseLocalFeeAdd = () => {
        setIsLocalFeeAddOpen(false);

    };

    const handleAddLocalFee = (newLocalFee: any) => {
        console.log('Local fee added successfully:', newLocalFee);
        // Optionally show success message or refresh data
        handleCloseLocalFeeAdd();
    };

    // Fetch students for selected section
    const fetchStudents = async (motherClassId: string) => {
        setLoadingStudents(true);
        try {
            const response = await axios.get(`/api/payment/local-fees?motherClassId=${motherClassId}`);
            setStudentResponse(response.data);
        } catch (err) {
            console.error("Error fetching students:", err);
            setStudentResponse(null);
        } finally {
            setLoadingStudents(false);
        }
    };

    // --- Handlers for Section Selection and Student Data ---
    const handleSectionSelect = (sectionId: string) => {
        if (selectedSectionId !== null && sectionId.includes(selectedSectionId.toString())) {
            setSelectedSectionId(null);
            setStudentResponse(null);
        } else {
            setSelectedSectionId(sectionId);
            // Find the actual motherClass ID from the fee structure data
            const motherClass = feeStructureData?.motherClasses.find(
                mc => mc.id.includes(sectionId)
            );
            if (motherClass) {
                fetchStudents(motherClass.id);
            }
        }
    };

    const handleFeeToggle = async (studentId: string, localFeeId: string, currentStatus: boolean, localFeesOnStudentId?: string | null) => {
        try {
            if (currentStatus) {
                // Disable/Delete the fee
                if (localFeesOnStudentId) {
                    await axios.delete('/api/payment/local-fees/fees', {
                        data: {
                            records: [{
                                studentId: studentId,
                                localFeeOnStudentId: localFeesOnStudentId
                            }]
                        }
                    });
                }
            } else {
                // Enable the fee
                await axios.post('/api/payment/local-fees/fees', {
                    studentIds: [studentId],
                    localFeesId: localFeeId,
                    offsetFee: 0
                });
            }
            // Refresh the student data
            if (selectedSectionId) {
                const motherClass = feeStructureData?.motherClasses.find(
                    mc => mc.id.includes(selectedSectionId)
                );
                if (motherClass) {
                    fetchStudents(motherClass.id);
                }
            }
        } catch (err) {
            console.error('Failed to toggle fee:', err);
        }
    };

    const handleFeeToggleAll = async (localFeeId: string, markAll: boolean) => {
        if (!studentResponse?.studentEnrollments) return;

        try {
            if (markAll) {
                // Mark all students for this fee
                const allStudentIds = studentResponse.studentEnrollments.map(enrollment => enrollment.id);
                await axios.post('/api/payment/local-fees/fees', {
                    studentIds: allStudentIds,
                    localFeesId: localFeeId,
                    offsetFee: 0
                });
            } else {
                // Unmark all students for this fee - collect all records for this specific fee
                const recordsToDelete = studentResponse.studentEnrollments
                    .map(enrollment => {
                        const feeLink = enrollment.feeLinks.find(link => link.localFeeId === localFeeId);
                        if (feeLink?.localFeesOnStudentId) {
                            return {
                                studentId: enrollment.id,
                                localFeeOnStudentId: feeLink.localFeesOnStudentId
                            };
                        }
                        return null;
                    })
                    .filter(record => record !== null);

                if (recordsToDelete.length > 0) {
                    await axios.delete('/api/payment/local-fees/fees', {
                        data: {
                            records: recordsToDelete
                        }
                    });
                }
            }
            // Refresh the student data
            if (selectedSectionId) {
                const motherClass = feeStructureData?.motherClasses.find(
                    mc => mc.id.includes(selectedSectionId)
                );
                if (motherClass) {
                    fetchStudents(motherClass.id);
                }
            }
        } catch (err) {
            console.error('Failed to toggle all fees:', err);
        }
    };

    const handleAmountEdit = (studentId: string, localFeeId: string, currentAmount: number, baseAmount: number, studentName: string, feeName: string) => {
        const currentOffset = currentAmount - baseAmount;
        setEditingLocalFee({
            studentId,
            studentName,
            localFeeId,
            feeName,
            currentOffset,
            baseAmount
        });
        setIsLocalFeeEditOpen(true);
    };

    const handleCloseLocalFeeEdit = () => {
        setIsLocalFeeEditOpen(false);
        setEditingLocalFee(null);
    };

    const handleSaveLocalFeeEdit = async (newOffset: number) => {
        if (!editingLocalFee) return;

        try {
            await axios.post('/api/payment/local-fees/fees', {
                studentIds: [editingLocalFee.studentId],
                localFeesId: editingLocalFee.localFeeId,
                offsetFee: newOffset
            });

            // Refresh the student data
            if (selectedSectionId) {
                const motherClass = feeStructureData?.motherClasses.find(
                    mc => mc.id.includes(selectedSectionId)
                );
                if (motherClass) {
                    fetchStudents(motherClass.id);
                }
            }
            handleCloseLocalFeeEdit();
        } catch (err) {
            console.error('Failed to update fee amount:', err);
        }
    };

    // --- NEW --- Handlers for Local Fee Column Edit Modal ---
    const handleOpenLocalFeeColumnEdit = (localFee: any) => {
        const dueDate = localFee.classFees && localFee.classFees.length > 0
            ? new Date(localFee.classFees[0].dueDate).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0];

        const classFeesId = localFee.classFees && localFee.classFees.length > 0
            ? localFee.classFees[0].id
            : '';

        setEditingLocalFeeColumn({
            id: localFee.id,
            name: localFee.name,
            description: localFee.description,
            amount: localFee.amount,
            taxPercentage: localFee.taxPercentage,
            paymentterms: localFee.paymentterms,
            penalty: localFee.penalty,
            classFeesId: classFeesId,
            dueDate: dueDate
        });
        setIsLocalFeeColumnEditOpen(true);
    };

    const handleCloseLocalFeeColumnEdit = () => {
        setIsLocalFeeColumnEditOpen(false);
        setEditingLocalFeeColumn(null);
    };

    const handleSaveLocalFeeColumnEdit = async (updatedFee: any) => {
        console.log('Local fee column updated successfully:', updatedFee);
        // Refresh the student data to show updated fee information
        if (selectedSectionId) {
            const motherClass = feeStructureData?.motherClasses.find(
                mc => mc.id.includes(selectedSectionId)
            );
            if (motherClass) {
                fetchStudents(motherClass.id);
            }
        }
        handleCloseLocalFeeColumnEdit();
    };

    // --- NEW --- Handlers for Global Fee Edit Modal ---
    const handleCloseGlobalFeeEdit = () => {
        setIsGlobalFeeEditOpen(false);
        setEditingGlobalFee(null);
    };

    const handleSaveGlobalFeeEdit = async (updatedFee: any) => {
        console.log('Global fee updated successfully:', updatedFee);

        // Refresh the fee structure data after successful update
        try {
            const user = localStorage.getItem('user');
            if (user) {
                const data = JSON.parse(user as string);
                const institutionId = data.institutionId;

                // Fetch updated fee structure
                const response = await axios.get(`/api/payment/global-fees?institutionId=${institutionId}`);
                const feeStructure: FeeStructureData = response.data;
                setFeeStructureData(feeStructure);

                // Refresh section details for all mother classes
                const sectionDetails: SectionFeeDetails = {};
                for (const motherClass of feeStructure.motherClasses) {
                    try {
                        const detailResponse = await axios.get(`/api/payment/global-fees/fees?motherClassId=${motherClass.id}`);
                        sectionDetails[motherClass.id] = detailResponse.data.globalClassFees || [];
                    } catch (err) {
                        console.log(`Error fetching details for section ${motherClass.sectionName}:`, err);
                        sectionDetails[motherClass.id] = [];
                    }
                }
                setSectionFeeDetails(sectionDetails);

                // Update the mapped fees data
                const mappedFeesData = feeStructure.motherClasses.map((section) => ({
                    id: parseInt(section.id.slice(-8), 16),
                    sectionName: section.sectionName,
                    globalFees: (sectionDetails[section.id] || [])
                        .filter((feeObj) => feeObj.globalFees !== null)
                        .map((feeObj) => {
                            const fee = feeObj.globalFees!;
                            return {
                                id: fee.id,
                                name: fee.name,
                                amount: fee.amount,
                                taxPercentage: fee.taxPercentage,
                                paymentterms: fee.paymentterms,
                                penalty: fee.penalty,
                                description: fee.description,
                                institutionId: fee.institutionId,
                                dueDate: feeObj.dueDate
                            };
                        })
                }));
                setFeesData(mappedFeesData);
            }
        } catch (err) {
            console.error('Error refreshing fee structure after edit:', err);
        }

        handleCloseGlobalFeeEdit();
    };

    // --- Helper function to calculate sum of fees from an array ---
    const calculateFeeSum = (feesArray: Fee[]): number => feesArray.reduce((sum: number, fee: Fee) => sum + fee.amount, 0);

    // --- Helper function to refresh fee structure data ---
    const refreshFeeStructureData = async () => {
        const user = localStorage.getItem('user');
        if (user) {
            const data = JSON.parse(user as string);
            const institutionId = data.institutionId;

            // Fetch updated fee structure
            const response = await axios.get(`/api/payment/global-fees?institutionId=${institutionId}`);
            const feeStructure: FeeStructureData = response.data;
            setFeeStructureData(feeStructure);

            // Refresh section details for all mother classes
            const sectionDetails: SectionFeeDetails = {};
            for (const motherClass of feeStructure.motherClasses) {
                try {
                    const detailResponse = await axios.get(`/api/payment/global-fees/fees?motherClassId=${motherClass.id}`);
                    sectionDetails[motherClass.id] = detailResponse.data.globalClassFees || [];
                } catch (err) {
                    console.log(`Error fetching details for section ${motherClass.sectionName}:`, err);
                    sectionDetails[motherClass.id] = [];
                }
            }
            setSectionFeeDetails(sectionDetails);

            // Update the mapped fees data
            const mappedFeesData = feeStructure.motherClasses.map((section) => ({
                id: parseInt(section.id.slice(-8), 16),
                sectionName: section.sectionName,
                globalFees: (sectionDetails[section.id] || [])
                    .filter((feeObj) => feeObj.globalFees !== null)
                    .map((feeObj) => {
                        const fee = feeObj.globalFees!;
                        return {
                            id: fee.id,
                            name: fee.name,
                            amount: fee.amount,
                            taxPercentage: fee.taxPercentage,
                            paymentterms: fee.paymentterms,
                            penalty: fee.penalty,
                            description: fee.description,
                            institutionId: fee.institutionId,
                            dueDate: feeObj.dueDate
                        };
                    })
            }));
            setFeesData(mappedFeesData);
        }
    };

    const selectedSectionName = feesData.find(sec => sec.id === selectedSectionId)?.sectionName;

    // --- NEW --- Fee structure button handlers ---
    const handleEditGlobalFee = (feeId: string, motherClassId: string = '') => {
        // Find the global fee from the fee structure data
        const globalFee = feeStructureData?.globalFees.find(fee => fee.id === feeId);
        if (!globalFee) {
            console.error('Global fee not found:', feeId);
            return;
        }

        // Get the due date from any section that has this fee enabled
        let dueDate = new Date().toISOString().split('T')[0]; // Default to today

        // Look for the due date in section details
        for (const [motherClassId, details] of Object.entries(sectionFeeDetails)) {
            const classFee = details.find(detail => detail.globalFeesId === feeId);
            if (classFee && classFee.dueDate) {
                dueDate = new Date(classFee.dueDate).toISOString().split('T')[0];
                break;
            }
        }

        setEditingGlobalFee({
            id: globalFee.id,
            name: globalFee.name,
            description: globalFee.description,
            amount: globalFee.amount,
            taxPercentage: globalFee.taxPercentage,
            paymentterms: globalFee.paymentterms,
            penalty: globalFee.penalty,
            institutionId: globalFee.institutionId,
            dueDate: dueDate,
            sectionName: 'All Sections' // Since this is a global fee edit
        });
        setIsGlobalFeeEditOpen(true);
    };

    const handleMarkAllForFee = async (feeId: string) => {
        try {
            let institutionId = '';
            try {
                const user = localStorage.getItem('user');
                if (user) {
                    const data = JSON.parse(user);
                    institutionId = data.institutionId || '';
                }
            } catch { }

            // Get all motherClass IDs from the fee structure data
            const allMotherClassIds = feeStructureData?.motherClasses.map(mc => mc.id) || [];

            if (allMotherClassIds.length === 0) {
                console.warn('No sections found to mark');
                return;
            }

            // Enable the fee for all sections
            const body = {
                globalFeeId: feeId,
                motherClassIds: allMotherClassIds,
                institutionId: institutionId
            };

            console.log('Marking all sections for fee with body:', body);
            await axios.post('/api/payment/global-fees/fees', body);

            // Refresh the fee structure data after successful operation
            await refreshFeeStructureData();
        } catch (err: any) {
            console.error('Failed to mark all sections for fee:', err);
            console.error('Error details:', err.response?.data);
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Unknown error occurred';
            alert(`Failed to mark all sections for fee: ${errorMessage}`);
        }
    };

    const handleUnmarkAllForFee = async (feeId: string) => {
        try {
            // Get all motherClass IDs from the fee structure data
            const allMotherClassIds = feeStructureData?.motherClasses.map(mc => mc.id) || [];

            if (allMotherClassIds.length === 0) {
                console.warn('No sections found to unmark');
                return;
            }

            // Disable the fee for all sections
            const body = {
                globalFeeId: feeId,
                motherClassIds: allMotherClassIds
            };

            console.log('Unmarking all sections for fee with body:', body);
            await axios.delete('/api/payment/global-fees/fees', { data: body });

            // Refresh the fee structure data after successful operation
            await refreshFeeStructureData();
        } catch (err: any) {
            console.error('Failed to unmark all sections for fee:', err);
            console.error('Error details:', err.response?.data);
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Unknown error occurred';
            alert(`Failed to unmark all sections for fee: ${errorMessage}`);
        }
    };

    const handleDeleteGlobalFee = async (feeId: string, feeName: string) => {
        // Show confirmation dialog
        const isConfirmed = window.confirm(`Are you sure you want to delete the global fee "${feeName}"? This action cannot be undone and will remove this fee from all sections.`);

        if (!isConfirmed) return;

        try {
            await axios.delete(`/api/payment/global-fees?globalFeesId=${feeId}`);

            // Refresh the fee structure data after successful deletion
            const user = localStorage.getItem('user');
            if (user) {
                const data = JSON.parse(user as string);
                const institutionId = data.institutionId;

                // Fetch updated fee structure
                const response = await axios.get(`/api/payment/global-fees?institutionId=${institutionId}`);
                const feeStructure: FeeStructureData = response.data;
                setFeeStructureData(feeStructure);

                // Refresh section details for all mother classes
                const sectionDetails: SectionFeeDetails = {};
                for (const motherClass of feeStructure.motherClasses) {
                    try {
                        const detailResponse = await axios.get(`/api/payment/global-fees/fees?motherClassId=${motherClass.id}`);
                        sectionDetails[motherClass.id] = detailResponse.data.globalClassFees || [];
                    } catch (err) {
                        console.log(`Error fetching details for section ${motherClass.sectionName}:`, err);
                        sectionDetails[motherClass.id] = [];
                    }
                }
                setSectionFeeDetails(sectionDetails);

                // Update the mapped fees data
                const mappedFeesData = feeStructure.motherClasses.map((section) => ({
                    id: parseInt(section.id.slice(-8), 16),
                    sectionName: section.sectionName,
                    globalFees: (sectionDetails[section.id] || [])
                        .filter((feeObj) => feeObj.globalFees !== null)
                        .map((feeObj) => {
                            const fee = feeObj.globalFees!;
                            return {
                                id: fee.id,
                                name: fee.name,
                                amount: fee.amount,
                                taxPercentage: fee.taxPercentage,
                                paymentterms: fee.paymentterms,
                                penalty: fee.penalty,
                                description: fee.description,
                                institutionId: fee.institutionId,
                                dueDate: feeObj.dueDate
                            };
                        })
                }));
                setFeesData(mappedFeesData);
            }
        } catch (err: any) {
            console.error('Failed to delete global fee:', err);
            console.error('Error details:', err.response?.data);
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Unknown error occurred';
            alert(`Failed to delete global fee: ${errorMessage}`);
        }
    };

    const handleToggleFeeForSection = async (feeId: string, motherClassId: string, isEnabled: boolean) => {
        try {
            let institutionId = '';
            try {
                const user = localStorage.getItem('user');
                if (user) {
                    const data = JSON.parse(user);
                    institutionId = data.institutionId || '';
                }
            } catch { }

            if (isEnabled) {
                // Enable the fee for this section
                const body = {
                    globalFeeId: feeId,
                    motherClassIds: [motherClassId],
                    institutionId: institutionId
                };
                console.log('Enabling fee with body:', body);
                await axios.post('/api/payment/global-fees/fees', body);
            } else {
                // Disable the fee for this section
                const body = {
                    globalFeeId: feeId,
                    motherClassIds: [motherClassId]
                };
                console.log('Disabling fee with body:', body);
                await axios.delete('/api/payment/global-fees/fees', { data: body });
            }

            // Refresh the fee structure data after successful toggle
            await refreshFeeStructureData();
        } catch (err: any) {
            console.error('Failed to toggle fee for section:', err);
            console.error('Error details:', err.response?.data);
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Unknown error occurred';
            alert(`Failed to ${isEnabled ? 'enable' : 'disable'} fee: ${errorMessage}`);
        }
    };

    return (
        <main className="bg-slate-50 min-h-screen">
            <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
                {/* --- Header Section (Unchanged) --- */}
                <div className="flex flex-col sm:flex-row items-center gap-6 bg-white p-6 rounded-xl shadow-sm">
                    <img src={instituteData?.logoUrl} alt="Institution" className="w-28 h-28 sm:w-36 sm:h-36 object-cover rounded-lg shadow-md flex-shrink-0" />
                    <div className="text-center sm:text-left">
                        <h1 className="text-3xl font-bold text-indigo-800 mb-2">{instituteData?.name}</h1>
                        <p className="text-sm text-slate-600">Email- {instituteData?.email}</p>
                        <p className="text-sm text-slate-600">Phone- {instituteData?.phone}</p>
                        <p className="text-sm text-slate-600">Address- {instituteData?.city}, {instituteData?.state}, {instituteData?.country}</p>
                    </div>
                </div>

                <hr className="my-8 border-t border-slate-200" />

                {/* --- Payment Details Section (Now dynamic from API) --- */}
                <div>
                    <h2 className="text-2xl font-semibold text-slate-800 mb-6">Payment Details</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm flex flex-col items-center justify-center text-center">
                            {paymentDetails.upilink ? (
                                <img src={paymentDetails.upilink} alt="UPI QR Code" className="w-40 h-40 object-cover mb-4 border-4 border-slate-100 rounded-lg" />
                            ) : (
                                <div className="w-40 h-40 flex items-center justify-center bg-slate-100 mb-4 rounded-lg text-slate-400">No QR</div>
                            )}
                            <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">Scan to Pay with UPI</a>
                        </div>
                        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
                            <h3 className="text-lg font-semibold text-slate-700 mb-4">Banking Details</h3>
                            <div className="space-y-4">
                                <FormField label="Account Holder Name" name="accountHolder" value={paymentDetails.accountHolder} onChange={handleChange} isEditing={isEditing} />
                                <FormField label="Bank Name" name="bankName" value={paymentDetails.bankName} onChange={handleChange} isEditing={isEditing} />
                                <FormField label="Branch Location" name="branchName" value={paymentDetails.branchName} onChange={handleChange} isEditing={isEditing} />
                                <FormField label="Bank IFSC Code" name="ifscCode" value={paymentDetails.ifscCode} onChange={handleChange} isEditing={isEditing} />
                                <FormField label="Account Number" name="accountNumber" value={paymentDetails.accountNumber} onChange={handleChange} isEditing={isEditing} />
                                <FormField label="UPI ID" name="upiqrCode" value={paymentDetails.upiqrCode} onChange={handleChange} isEditing={isEditing} />
                            </div>
                            <div className="mt-6 flex justify-end">
                                {!isEditing ? (
                                    <button onClick={handleEdit} className="py-2 px-5 bg-indigo-600 text-white font-semibold rounded-md shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all">
                                        Edit
                                    </button>
                                ) : (
                                    <button onClick={handleSave} disabled={isSavingPayment} className={`py-2 px-5 bg-emerald-500 text-white font-semibold rounded-md shadow-md hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all ${isSavingPayment ? 'opacity-60 cursor-not-allowed' : ''}`}>
                                        {isSavingPayment ? 'Saving...' : 'Save Changes'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <hr className="my-8 border-t border-slate-200" />

                {/* --- Fee Structure Section --- */}
                <div className="w-full">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold text-slate-800">Fee Structure</h2>
                        <button
                            onClick={() => handleOpenGlobalFeeAdd()}
                            className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-md shadow-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all"
                        >
                            Add New Global Fee
                        </button>
                    </div>
                    <div className="rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                        <div className="h-[500px] overflow-auto">
                            <table className="w-full text-sm text-left text-slate-700">
                                <thead className="text-xs text-slate-800 uppercase bg-slate-100 sticky top-0 z-10">
                                    <tr>
                                        <th scope="col" className="px-4 py-3 min-w-[150px]">Section Name</th>
                                        {feeStructureData?.globalFees.map((fee) => (
                                            <th key={fee.id} scope="col" className="px-3 py-3 min-w-[220px] text-center">
                                                <div className="flex flex-col">
                                                    <div className="font-semibold text-slate-900 mb-1">{fee.name}</div>
                                                    <div className="text-xs font-normal text-slate-600 mb-1">₹{fee.amount.toFixed(2)}</div>
                                                    <div className="text-xs font-normal text-slate-500 mb-1">Tax: {fee.taxPercentage}%</div>
                                                    <div className="text-xs font-normal text-slate-500 mb-1">{fee.paymentterms}</div>
                                                    {fee.penalty > 0 && (
                                                        <div className="text-xs font-normal text-slate-500 mb-1">Penalty: ₹{fee.penalty}</div>
                                                    )}
                                                    {fee.description && (
                                                        <div className="text-xs font-normal text-slate-400 mb-2 truncate" title={fee.description}>
                                                            {fee.description}
                                                        </div>
                                                    )}
                                                    <div className="grid grid-cols-2 gap-1 justify-center">
                                                        <button
                                                            onClick={() => handleEditGlobalFee(fee.id)}
                                                            className="px-1.5 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                                            title="Edit this fee"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteGlobalFee(fee.id, fee.name)}
                                                            className="px-1.5 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                                            title="Delete this fee"
                                                        >
                                                            Delete
                                                        </button>
                                                        <button
                                                            onClick={() => handleMarkAllForFee(fee.id)}
                                                            className="px-1.5 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                                                            title="Mark all sections for this fee"
                                                        >
                                                            Mark All
                                                        </button>
                                                        <button
                                                            onClick={() => handleUnmarkAllForFee(fee.id)}
                                                            className="px-1.5 py-1 text-xs bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
                                                            title="Unmark all sections for this fee"
                                                        >
                                                            Unmark All
                                                        </button>
                                                    </div>
                                                </div>
                                            </th>
                                        ))}

                                    </tr>
                                </thead>
                                <tbody>
                                    {loadingFees ? (
                                        <tr className="bg-white">
                                            <td colSpan={1 + (feeStructureData?.globalFees.length || 0)} className="text-center py-8 text-slate-500">
                                                Loading...
                                            </td>
                                        </tr>
                                    ) : feeStructureData?.motherClasses.length ? (
                                        feeStructureData.motherClasses.map((motherClass) => {
                                            const sectionDetails = sectionFeeDetails[motherClass.id] || [];
                                            const sectionId = motherClass.id
                                            return (
                                                <tr
                                                    key={motherClass.id}
                                                    className={`border-b last:border-b-0 cursor-pointer transition-colors ${selectedSectionId === sectionId ? 'bg-indigo-50 hover:bg-indigo-100' : 'bg-white hover:bg-slate-50'}`}
                                                    onClick={() => handleSectionSelect(motherClass.id)}
                                                >
                                                    <td className="px-4 py-4 font-medium text-slate-900 whitespace-nowrap">
                                                        {motherClass.sectionName}
                                                    </td>
                                                    {feeStructureData.globalFees.map((globalFee) => {
                                                        const classFee = sectionDetails.find(
                                                            (detail) => detail.globalFeesId === globalFee.id
                                                        );
                                                        const isEnabled = classFee && classFee.globalFees !== null;

                                                        return (
                                                            <td key={globalFee.id} className="px-4 py-4 text-center">
                                                                <div className="flex flex-col items-center">
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleToggleFeeForSection(globalFee.id, motherClass.id, !isEnabled);
                                                                        }}
                                                                        className={`w-8 h-8 rounded border-2 flex items-center justify-center transition-colors mb-2 ${isEnabled
                                                                            ? 'bg-green-500 border-green-500 text-white hover:bg-green-600'
                                                                            : 'bg-white border-slate-300 hover:border-slate-400'
                                                                            }`}
                                                                        title={isEnabled ? 'Click to disable this fee for this section' : 'Click to enable this fee for this section'}
                                                                    >
                                                                        {isEnabled ? (
                                                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                            </svg>
                                                                        ) : (
                                                                            <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                                                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                                            </svg>
                                                                        )}
                                                                    </button>
                                                                    {isEnabled && classFee && (
                                                                        <div className="flex items-center gap-1">
                                                                            <div className="text-xs text-slate-600 space-y-1">
                                                                                <div>Amount: ₹{classFee.globalFees?.amount}</div>
                                                                                <div>Tax: ₹{((classFee.globalFees?.amount || 0) * (classFee.globalFees?.taxPercentage || 0) / 100).toFixed(2)}</div>
                                                                                <div>Penalty: ₹{classFee.globalFees?.penalty}</div>
                                                                                {/* <div>Due: {new Date(classFee.dueDate).toLocaleDateString()}</div> */}
                                                                            </div>
                                                                            {/* edit not needed here */}
                                                                            {/* <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleEditGlobalFee(globalFee.id, motherClass.id);
                                                                                }}
                                                                                className="p-0.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                                                                                title="Edit fee details for this section"
                                                                            >
                                                                                <Pencil className="w-3 h-3" />
                                                                            </button> */}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        );
                                                    })}

                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr className="bg-white">
                                            <td colSpan={1 + (feeStructureData?.globalFees.length || 0)} className="text-center py-8 text-slate-500">
                                                No fee data available.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* --- Student Details Section --- */}
                {selectedSectionId && (
                    <div className="mt-8">
                        <div className="flex justify-between align-middle items-center">
                            <h2 className="text-2xl font-semibold text-slate-800 mb-6">Student List: {selectedSectionName}</h2>
                            <button
                                onClick={handleOpenLocalFeeAdd}
                                disabled={selectedSectionId === null}
                                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Add Local Fees to all Students
                            </button>
                        </div>
                        <div className="rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                            <div className="max-h-[500px] overflow-x-auto overflow-y-auto">
                                <table className="w-full text-sm text-left text-slate-700">
                                    <thead className="text-xs text-slate-800 uppercase bg-slate-100 sticky top-0 z-10">
                                        <tr>
                                            <th scope="col" className="px-4 py-3 min-w-[150px]">Student Name</th>
                                            <th scope="col" className="px-4 py-3 min-w-[100px]">Roll No.</th>
                                            <th scope="col" className="px-4 py-3 min-w-[200px]">Email</th>
                                            <th scope="col" className="px-4 py-3 min-w-[120px]">Status</th>
                                            {studentResponse?.localFees.map((fee) => (
                                                <th key={fee.id} scope="col" className="px-4 py-3 min-w-[150px] text-center">
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center justify-center gap-2 mb-1">
                                                            <span className="font-semibold">{fee.name}</span>
                                                            <button
                                                                onClick={() => handleOpenLocalFeeColumnEdit(fee)}
                                                                className="p-1 text-slate-500 rounded-full hover:bg-slate-200 hover:text-slate-800 transition-colors"
                                                                title="Edit this local fee"
                                                            >
                                                                <Pencil className="h-3 w-3" />
                                                            </button>
                                                        </div>
                                                        <span className="text-xs font-normal text-slate-600">₹{fee.amount}</span>
                                                        <span className="text-xs font-normal text-slate-500">Tax: {fee.taxPercentage}%</span>
                                                        <span className="text-xs font-normal text-slate-500">{fee.paymentterms}</span>
                                                        <div className="flex gap-1 mt-2 justify-center">
                                                            <button
                                                                onClick={() => handleFeeToggleAll(fee.id, true)}
                                                                className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                                                                title="Mark all students for this fee"
                                                            >
                                                                Mark All
                                                            </button>
                                                            <button
                                                                onClick={() => handleFeeToggleAll(fee.id, false)}
                                                                className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                                                title="Unmark all students for this fee"
                                                            >
                                                                Unmark All
                                                            </button>
                                                        </div>
                                                    </div>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loadingStudents ? (
                                            <tr className="bg-white">
                                                <td colSpan={4 + (studentResponse?.localFees.length || 0)} className="text-center py-8 text-slate-500">
                                                    Loading students...
                                                </td>
                                            </tr>
                                        ) : studentResponse?.studentEnrollments.length ? (
                                            studentResponse.studentEnrollments.map((enrollment) => (
                                                <tr
                                                    key={enrollment.id}
                                                    className="bg-white border-b last:border-b-0 hover:bg-slate-50"
                                                >
                                                    <td className="px-4 py-4 font-medium text-slate-900 whitespace-nowrap">
                                                        {enrollment.user.name}
                                                    </td>
                                                    <td className="px-4 py-4">{enrollment.studentRoll}</td>
                                                    <td className="px-4 py-4">{enrollment.user.email}</td>
                                                    <td className="px-4 py-4">
                                                        <span className={`text-xs font-semibold rounded-full px-3 py-1 ${enrollment.enrollmentStatus === 'ACTIVE'
                                                            ? 'bg-emerald-100 text-emerald-800'
                                                            : 'bg-amber-100 text-amber-800'
                                                            }`}>
                                                            {enrollment.enrollmentStatus}
                                                        </span>
                                                    </td>
                                                    {studentResponse.localFees.map((fee) => {
                                                        const feeLink = enrollment.feeLinks.find(link => link.localFeeId === fee.id);
                                                        const isAssigned = feeLink?.localFeesOnStudentId !== null;
                                                        const totalAmount = fee.amount + (feeLink?.offsetFee || 0);

                                                        return (
                                                            <td key={fee.id} className="px-4 py-4 text-center">
                                                                <div className="flex flex-col items-center">
                                                                    <button
                                                                        onClick={() => handleFeeToggle(enrollment.id, fee.id, isAssigned, feeLink?.localFeesOnStudentId)}
                                                                        className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${isAssigned
                                                                            ? 'bg-green-500 border-green-500 text-white hover:bg-green-600'
                                                                            : 'bg-white border-slate-300 hover:border-slate-400'
                                                                            }`}
                                                                    >
                                                                        {isAssigned ? (
                                                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                            </svg>
                                                                        ) : (
                                                                            <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                                                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                                            </svg>
                                                                        )}
                                                                    </button>
                                                                    {isAssigned && (
                                                                        <div className="flex items-center gap-1 mt-1">
                                                                            <span className="text-xs text-slate-600">
                                                                                ₹{totalAmount.toFixed(2)}
                                                                            </span>
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleAmountEdit(enrollment.id, fee.id, totalAmount, fee.amount, enrollment.user.name, fee.name);
                                                                                }}
                                                                                className="p-0.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                                                                                title="Edit amount"
                                                                            >
                                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                                </svg>
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))
                                        ) : (
                                            <tr className="bg-white">
                                                <td colSpan={4 + (studentResponse?.localFees.length || 0)} className="text-center py-8 text-slate-500">
                                                    No students found for this section.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* --- Fee Editor Modal Render (for section global fees) --- */}
            <FeeEditorModal
                isOpen={isFeeEditorOpen}
                onClose={handleCloseFeeEditor}
                onSave={handleSaveFees}
                details={editingFeeDetails}
            />
            {/* --- Global Fee Add Modal Render --- */}
            <GlobalFeeAddModal
                isOpen={isGlobalFeeAddOpen}
                onClose={handleCloseGlobalFeeAdd}
                onAdd={handleAddGlobalFee}
                title="Add New Global Fee to All Sections"
                feeStructureData={feeStructureData}
            />

            {/* --- Local Fee Add Modal Render --- */}
            <LocalFeeAddModal
                isOpen={isLocalFeeAddOpen}
                onClose={handleCloseLocalFeeAdd}
                onAdd={handleAddLocalFee}
                refresh={refershStudents}
                title={`Add Local Fee to All Students in ${selectedSectionName}`}
                sectionId={selectedSectionId}
            />

            {/* --- Local Fee Edit Modal Render --- */}
            <LocalFeeEditModal
                isOpen={isLocalFeeEditOpen}
                onClose={handleCloseLocalFeeEdit}
                onSave={handleSaveLocalFeeEdit}
                editingFee={editingLocalFee}
            />

            {/* --- Local Fee Column Edit Modal Render --- */}
            <LocalFeeColumnEditModal
                isOpen={isLocalFeeColumnEditOpen}
                onClose={handleCloseLocalFeeColumnEdit}
                onSave={handleSaveLocalFeeColumnEdit}
                editingLocalFeeColumn={editingLocalFeeColumn}
            />

            {/* --- Global Fee Edit Modal Render --- */}
            <GlobalFeeEditModal
                isOpen={isGlobalFeeEditOpen}
                onClose={handleCloseGlobalFeeEdit}
                onSave={handleSaveGlobalFeeEdit}
                editingGlobalFee={editingGlobalFee}
            />

        </main>
    );
}