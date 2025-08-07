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
}

interface SectionFeeData {
    id: number;
    sectionName: string;
    globalFees: Fee[];
}

interface Receipt {
    name: string;
}

interface Student {
    id: string;
    name: string;
    roll: string;
    email: string;
    enrollmentStatus: string;
    localFees: LocalFee[];
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

interface StudentEnrollment {
    student: {
        id: string;
        studentRoll: string;
        enrollmentStatus: string;
        user: {
            name: string;
            email: string;
        };
        localFees: Array<{
            localFees: LocalFee;
        }>;
    };
}

interface StudentResponse {
    institute: string;
    section: string;
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
            const response = await axios.delete(`/api/payment/global-fees?globalFeesId=${currentFees[index].id}`);
        } catch (err) {
            console.error("Error removing fee:", err);
        }

        const updatedFees = currentFees.filter((_, i) => i !== index);
        setCurrentFees(updatedFees);
    };

    const handleSave = async () => {
        // Filter out any fees with empty names before saving
        const validFees = currentFees.filter((fee) => fee.name.trim() !== '');
        try {
            // API expects globalFeesToUpdate array
            await axios.patch('/api/payment/global-fees', {
                globalFeesToUpdate: validFees
            });
        } catch (err) {
            console.error('Failed to update global fees', err);
            // Optionally show error to user
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
                            <div className="col-span-2">
                                <label htmlFor={`terms-${fee.id}`} className="block text-sm font-medium text-slate-700 mb-1">Payment Terms</label>
                                <select
                                    id={`terms-${fee.id}`}
                                    value={['Monthly', '3 Months', '5 Months', '12 Months'].includes(fee.paymentterms || '') ? fee.paymentterms : ''}
                                    onChange={(e) => handleFeeChange(index, 'paymentterms', e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">Select Payment Terms</option>
                                    <option value="Monthly">Monthly</option>
                                    <option value="3 Months">3 Months</option>
                                    <option value="6 Months">6 Months</option>
                                    <option value="12 Months">12 Months</option>
                                </select>
                            </div>
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
    onAdd: (newFee: any) => void;
    title: string;
    sectionId: number | null;
    studentIds: string[];
}

const LocalFeeAddModal: React.FC<LocalFeeAddModalProps> = ({ isOpen, onClose, onAdd, title, sectionId, studentIds }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        amount: '',
        taxPercentage: '',
        paymentterms: '',
        penalty: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData({
                name: '',
                description: '',
                amount: '',
                taxPercentage: '',
                paymentterms: '',
                penalty: ''
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
        if (!formData.name.trim() || !sectionId || studentIds.length === 0) return;

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

            const body = {
                institutionId,
                localFees: [{
                    name: formData.name,
                    description: formData.description,
                    amount: parseFloat(formData.amount) || 0,
                    taxPercentage: parseFloat(formData.taxPercentage) || 0,
                    paymentterms: formData.paymentterms,
                    penalty: parseFloat(formData.penalty) || 0,
                    motherClassId: String(sectionId),
                    studentIds: studentIds
                }]
            };

            console.log("Local fee body:", body);
            await axios.post('/api/payment/local-fees', body);
            onAdd(formData);
        } catch (err) {
            console.error('Failed to add local fee', err);
        } finally {
            setSubmitting(false);
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

// --- NEW --- Fee Add Modal Component ---
interface FeeAddModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (newFee: Fee) => void;
    title: string;
    addingFeeSectionId: number | null;
}

const FeeAddModal: React.FC<FeeAddModalProps> = ({ isOpen, onClose, onAdd, title, addingFeeSectionId }) => {
    const [fee, setFee] = useState<Fee>({
        id: `new_${Date.now()}`,
        name: '',
        amount: 0,
        taxPercentage: undefined,
        paymentterms: '',
        penalty: undefined,
        description: '',
    });

    useEffect(() => {
        if (isOpen) {
            setFee({
                id: `new_${Date.now()}`,
                name: '',
                amount: 0,
                taxPercentage: undefined,
                paymentterms: '',
                penalty: undefined,
                description: '',
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
        if (fee.name.trim() === '') return;
        let institutionId = '';
        try {
            const user = localStorage.getItem('user');
            if (user) {
                const data = JSON.parse(user);
                institutionId = data.institutionId || '';
            }
        } catch { }
        // Always send the correct section id as motherClassIds
        const motherClassIds = addingFeeSectionId !== null ? [String(addingFeeSectionId)] : [];
        try {
            const body = {
                institutionId,
                globalFees: [{
                    name: fee.name,
                    description: fee.description,
                    amount: fee.amount,
                    taxPercentage: fee.taxPercentage,
                    paymentterms: fee.paymentterms,
                    penalty: fee.penalty,
                    motherClassIds
                }]
            }
            console.log("add body ---", body);
            await axios.post('/api/payment/global-fees', body);
        } catch (err) {
            console.error('Failed to add global fee', err);
            // Optionally show error to user
        }
        onAdd(fee);
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
                        <div className="col-span-2">
                            <label htmlFor="add-terms" className="block text-sm font-medium text-slate-700 mb-1">Payment Terms</label>
                            <select
                                id="add-terms"
                                value={['Monthly', '3 Months', '5 Months', '12 Months'].includes(fee.paymentterms || '') ? fee.paymentterms : ''}
                                onChange={(e) => handleChange('paymentterms', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">Select Payment Terms</option>
                                <option value="Monthly">Monthly</option>
                                <option value="3 Months">3 Months</option>
                                <option value="6 Months">6 Months</option>
                                <option value="12 Months">12 Months</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-slate-50 border-t flex justify-end gap-3 rounded-lg">
                    <button onClick={onClose} className="py-2 px-5 bg-white text-slate-700 border border-slate-300 font-semibold rounded-md shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition-all">
                        Cancel
                    </button>
                    <button onClick={handleAdd} className="py-2 px-5 bg-emerald-600 text-white font-semibold rounded-md shadow-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all">
                        Add Fee
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
    // --- NEW --- State for Fee Editor Modal ---
    const [isFeeEditorOpen, setIsFeeEditorOpen] = useState(false);
    // For section global fees editing
    const [editingFeeDetails, setEditingFeeDetails] = useState<{ rowId: number | null, field: string, title: string, fees: Fee[] }>({ rowId: null, field: '', title: '', fees: [] });
    // --- NEW --- State for Fee Add Modal ---
    const [isFeeAddOpen, setIsFeeAddOpen] = useState(false);
    const [addingFeeSectionId, setAddingFeeSectionId] = useState<number | null>(null);
    const [addingFeeSectionName, setAddingFeeSectionName] = useState<string>('');
    const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
    const [studentData, setStudentData] = useState<Student[]>([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [maxLocalFeesCount, setMaxLocalFeesCount] = useState<number>(0);
    // --- NEW --- State for Local Fee Add Modal ---
    const [isLocalFeeAddOpen, setIsLocalFeeAddOpen] = useState(false);


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
                const response = await axios.get(`/api/payment/get-all-global-fees?institutionId=${institutionId}`);
                const motherClass = response.data?.motherClass || [];
                // Map API response to SectionFeeData[]
                const mappedFeesData = motherClass.map((section: any) => ({
                    id: section.id,
                    sectionName: section.sectionName,
                    globalFees: (section.classfee || [])
                        .filter((feeObj: any) => feeObj.globalFees !== null) // Filter out null globalFees
                        .map((feeObj: any) => {
                            const fee = feeObj.globalFees;
                            return {
                                id: fee.id,
                                name: fee.name,
                                amount: fee.amount,
                                taxPercentage: fee.taxPercentage,
                                paymentterms: fee.paymentterms,
                                penalty: fee.penalty,
                                description: fee.description,
                                institutionId: fee.institutionId
                            };
                        })
                }));
                setFeesData(mappedFeesData);
            } catch (err) {
                console.log("error fetching fees data", err);
                setFeesData([]);
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

    // For section global fees adding
    const handleOpenFeeAdd = (rowId: number, sectionName: string) => {
        setAddingFeeSectionId(rowId);
        setAddingFeeSectionName(sectionName);
        setIsFeeAddOpen(true);
    };

    const handleCloseFeeAdd = () => {
        setIsFeeAddOpen(false);
        setAddingFeeSectionId(null);
        setAddingFeeSectionName('');
    };

    const handleAddFee = (newFee: Fee) => {
        if (addingFeeSectionId === null) return;
        setFeesData(prev => prev.map(row =>
            row.id === addingFeeSectionId
                ? { ...row, globalFees: [...row.globalFees, newFee] }
                : row
        ));
        handleCloseFeeAdd();
    };

    // --- NEW --- Handlers for Local Fee Add Modal ---
    const handleOpenLocalFeeAdd = () => {
        if (selectedSectionId === null || studentData.length === 0) return;
        setIsLocalFeeAddOpen(true);
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
    const fetchStudents = async (motherClassId: number) => {
        setLoadingStudents(true);
        try {
            const response = await axios.get(`/api/payment/local-fees?motherClassId=${motherClassId}`);
            const studentEnrollments: StudentEnrollment[] = response.data.studentEnrollments || [];

            const mappedStudents: Student[] = studentEnrollments.map((enrollment) => ({
                id: enrollment.student.id,
                name: enrollment.student.user.name,
                roll: enrollment.student.studentRoll,
                email: enrollment.student.user.email,
                enrollmentStatus: enrollment.student.enrollmentStatus,
                localFees: enrollment.student.localFees?.map(fee => fee.localFees) || []
            }));

            // Calculate the maximum number of local fees any student has
            const maxFees = Math.max(...mappedStudents.map(student => student.localFees.length), 0);
            setMaxLocalFeesCount(maxFees);

            setStudentData(mappedStudents);
        } catch (err) {
            console.error("Error fetching students:", err);
            setStudentData([]);
            setMaxLocalFeesCount(0);
        } finally {
            setLoadingStudents(false);
        }
    };

    // --- Handlers for Section Selection and Student Data ---
    const handleSectionSelect = (sectionId: number) => {
        if (selectedSectionId === sectionId) {
            setSelectedSectionId(null);
            setStudentData([]);
        } else {
            setSelectedSectionId(sectionId);
            fetchStudents(sectionId);
        }
    };

    const handleStudentClick = (studentId: string) => {
        console.log("clicked student id -", studentId);
        window.location.href = `/a/fees/${studentId}`;
    };

    // --- Helper function to calculate sum of fees from an array ---
    const calculateFeeSum = (feesArray: Fee[]): number => feesArray.reduce((sum: number, fee: Fee) => sum + fee.amount, 0);

    const selectedSectionName = feesData.find(sec => sec.id === selectedSectionId)?.sectionName;

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
                            {paymentDetails.upiqrCode ? (
                                <img src={paymentDetails.upiqrCode} alt="UPI QR Code" className="w-40 h-40 object-cover mb-4 border-4 border-slate-100 rounded-lg" />
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
                <div className="w-full  ">
                    <h2 className="text-2xl font-semibold text-slate-800 mb-6">Fee Structure</h2>
                    <div className="rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                        <div className="h-[500px] overflow-y-auto">
                            <table className="w-full text-sm text-left text-slate-700">
                                <thead className="text-xs text-slate-800 uppercase bg-slate-100 sticky top-0 z-10">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Section Name</th>
                                        <th scope="col" className="px-6 py-3">Global Fees</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loadingFees ? (
                                        <tr className="bg-white">
                                            <td colSpan={2} className="text-center py-8 text-slate-500">
                                                Loading...
                                            </td>
                                        </tr>
                                    ) : feesData.length > 0 ? (
                                        feesData.map((row) => {
                                            const globalFeesTotal = calculateFeeSum(row.globalFees);
                                            return (
                                                <tr key={row.id}
                                                    className={`border-b last:border-b-0 cursor-pointer transition-colors ${selectedSectionId === row.id ? 'bg-indigo-50 hover:bg-indigo-100' : 'bg-white hover:bg-slate-50'}`}
                                                    onClick={() => handleSectionSelect(row.id)}
                                                >
                                                    <th scope="row" className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                                                        {row.sectionName}
                                                    </th>
                                                    {/* --- Fee Cells with Details and Edit Button --- */}
                                                    <td className="px-6 py-4">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                {row.globalFees.length > 0 ? (
                                                                    row.globalFees.map(fee => (
                                                                        <div key={fee.id} className="mb-2 text-xs text-slate-600 border-b-2 border-slate-200 pb-2">
                                                                            <div><span className="font-semibold">{fee.name}</span>: ₹{fee.amount?.toFixed(2)}</div>
                                                                            {fee.taxPercentage !== undefined && (
                                                                                <div>Tax: {fee.taxPercentage}%</div>
                                                                            )}
                                                                            {fee.paymentterms && (
                                                                                <div>Terms: {fee.paymentterms}</div>
                                                                            )}
                                                                            {fee.penalty !== undefined && (
                                                                                <div>Penalty: ₹{fee.penalty}</div>
                                                                            )}
                                                                            {fee.description && (
                                                                                <div className="text-slate-500">{fee.description}</div>
                                                                            )}
                                                                        </div>
                                                                    ))
                                                                ) : (
                                                                    <div className="text-xs text-slate-400">No global fees</div>
                                                                )}
                                                                <div className="font-semibold mt-1">Total: ₹{globalFeesTotal.toFixed(2)}</div>
                                                            </div>
                                                            <div className="flex flex-col gap-2 items-end">
                                                                <button onClick={(e) => { e.stopPropagation(); handleOpenFeeEditor(row.id, 'globalFees', row.sectionName); }} className="p-1 text-slate-500 rounded-full hover:bg-slate-200 hover:text-slate-800">
                                                                    <Pencil className="h-5 w-5" />
                                                                </button>
                                                                <button onClick={(e) => { e.stopPropagation(); handleOpenFeeAdd(row.id, row.sectionName); }} className="p-1 text-green-600 rounded-full hover:bg-green-100 hover:text-green-800">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr className="bg-white">
                                            <td colSpan={2} className="text-center py-8 text-slate-500">
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
                                disabled={studentData.length === 0}
                                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Add Local Fees to all Students
                            </button>
                        </div>
                        <div className="rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                            <div className="max-h-[500px] overflow-y-auto overflow-x-auto">
                                <table className="w-full text-sm text-left text-slate-700 min-w-max">
                                    <thead className="text-xs text-slate-800 uppercase bg-slate-100 sticky top-0 z-10">
                                        <tr>
                                            <th scope="col" className="px-4 py-3 min-w-[150px]">Student Name</th>
                                            <th scope="col" className="px-4 py-3 min-w-[100px]">Roll No.</th>
                                            <th scope="col" className="px-4 py-3 min-w-[200px]">Email</th>
                                            <th scope="col" className="px-4 py-3 min-w-[120px]">Status</th>
                                            {Array.from({ length: maxLocalFeesCount }, (_, index) => (
                                                <th key={index} scope="col" className="px-4 py-3 min-w-[200px]">
                                                    Local Fee {index + 1}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loadingStudents ? (
                                            <tr className="bg-white">
                                                <td colSpan={4 + maxLocalFeesCount} className="text-center py-8 text-slate-500">
                                                    Loading students...
                                                </td>
                                            </tr>
                                        ) : studentData.length > 0 ? (
                                            studentData.map((student) => (
                                                <tr
                                                    key={student.id}
                                                    className="bg-white border-b last:border-b-0 hover:bg-slate-50 cursor-pointer"
                                                    onClick={() => handleStudentClick(student.id)}
                                                >
                                                    <td className="px-4 py-4 font-medium text-slate-900">
                                                        {student.name}
                                                    </td>
                                                    <td className="px-4 py-4">{student.roll}</td>
                                                    <td className="px-4 py-4">{student.email}</td>
                                                    <td className="px-4 py-4">
                                                        <span className={`text-xs font-semibold rounded-full px-3 py-1 ${student.enrollmentStatus === 'ACTIVE'
                                                            ? 'bg-emerald-100 text-emerald-800'
                                                            : 'bg-amber-100 text-amber-800'
                                                            }`}>
                                                            {student.enrollmentStatus}
                                                        </span>
                                                    </td>
                                                    {Array.from({ length: maxLocalFeesCount }, (_, index) => {
                                                        const localFee = student.localFees[index];
                                                        return (
                                                            <td key={index} className="px-4 py-4">
                                                                {localFee ? (
                                                                    <div className="text-xs space-y-1">
                                                                        <div className="font-semibold text-slate-900">
                                                                            {localFee.name}
                                                                        </div>
                                                                        <div className="text-slate-600">
                                                                            Amount: ₹{localFee.amount}
                                                                        </div>
                                                                        <div className="text-slate-600">
                                                                            Tax: {localFee.taxPercentage}%
                                                                        </div>
                                                                        <div className="text-slate-600">
                                                                            Terms: {localFee.paymentterms}
                                                                        </div>
                                                                        <div className="text-slate-600">
                                                                            Penalty: ₹{localFee.penalty}
                                                                        </div>
                                                                        {localFee.description && (
                                                                            <div className="text-slate-500 italic">
                                                                                {localFee.description}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <div className="text-xs text-slate-400">-</div>
                                                                )}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))
                                        ) : (
                                            <tr className="bg-white">
                                                <td colSpan={4 + maxLocalFeesCount} className="text-center py-8 text-slate-500">
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
            {/* --- Fee Add Modal Render (for section global fees) --- */}
            <FeeAddModal
                isOpen={isFeeAddOpen}
                onClose={handleCloseFeeAdd}
                onAdd={handleAddFee}
                title={`Add New Fee to ${addingFeeSectionName}`}
                addingFeeSectionId={addingFeeSectionId}
            />

            {/* --- Local Fee Add Modal Render --- */}
            <LocalFeeAddModal
                isOpen={isLocalFeeAddOpen}
                onClose={handleCloseLocalFeeAdd}
                onAdd={handleAddLocalFee}
                title={`Add Local Fee to All Students in ${selectedSectionName}`}
                sectionId={selectedSectionId}
                studentIds={studentData.map(student => student.id)}
            />

        </main>
    );
}