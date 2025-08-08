"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";


// Types for fee data
interface GlobalFee {
    feeId: string;
    name: string;
    description: string;
    amountDue: number;
    taxPercentage: number;
    penalty: number;
    paymentTerms: string;
    paymentStatus: string;
    feesCollectionId: string;
    classFeeId: string;
}

interface LocalFee {
    classFeeId: string;
    localFeesId: string;
    name: string;
    description: string;
    amountDue: number;
    taxPercentage: number;
    penalty: number;
    paymentTerms: string;
    paymentStatus: string;
    amountPaid: number;
    paymentDate: string;
    paymentMethod: string;
    transactionId: string | null;
    feesCollectionId: string;
}

interface CombinedFee {
    classFeeId: string;
    id: string;
    name: string;
    description: string;
    amount: number;
    tax: number;
    penalty: number;
    total: number;
    paymentTerms: string;
    status: string;
    feeType: 'Global' | 'Local';
    transactionId?: string | null;
    paymentDate?: string;
    amountPaid?: number;
    feesCollectionId?: string;
}



export default function Home() {
    const [studentData, setStudentData] = useState(null);
    const [instituteData, setInstituteData] = useState({
        name: '',
        logoUrl: '',
        email: '',
        phone: '',
        city: '',
        state: '',
        country: ''
    });
    const [paymentDetails, setPaymentDetails] = useState({
        accountHolder: '',
        accountNumber: '',
        ifscCode: '',
        bankName: '',
        branchName: '',
        upiqrCode: '',
        upilink: ' ',
    });
    const [selectedTerm, setSelectedTerm] = useState('Spring 2021');
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [loading, setLoading] = useState(true);
    const [feesData, setFeesData] = useState<CombinedFee[]>([]);
    const [filteredFees, setFilteredFees] = useState<CombinedFee[]>([]);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedFee, setSelectedFee] = useState<CombinedFee | null>(null);
    const [paymentForm, setPaymentForm] = useState({
        amountPaid: '',
        paymentMethod: 'UPI',
        paymentDate: new Date().toISOString().split('T')[0],
        transactionId: ''
    });
    const [paymentLoading, setPaymentLoading] = useState(false);

    // Combine and transform fees data
    const combineFeesData = (globalFees: GlobalFee[], localFees: LocalFee[]): CombinedFee[] => {
        const combined: CombinedFee[] = [];

        // Process global fees
        globalFees.forEach(fee => {
            const taxAmount = (fee.amountDue * fee.taxPercentage) / 100;
            const total = fee.amountDue + taxAmount + fee.penalty;

            combined.push({
                classFeeId: fee.classFeeId,
                id: fee.feeId,
                name: fee.name,
                description: fee.description,
                amount: fee.amountDue,
                tax: taxAmount,
                penalty: fee.penalty,
                total: total,
                paymentTerms: fee.paymentTerms,
                status: fee.paymentStatus,
                feeType: 'Global',
                feesCollectionId: fee.feesCollectionId
            });
        });

        // Process local fees
        localFees.forEach(fee => {
            const taxAmount = (fee.amountDue * fee.taxPercentage) / 100;
            const total = fee.amountDue + taxAmount + fee.penalty;

            combined.push({
                classFeeId: fee.classFeeId,
                id: fee.localFeesId,
                name: fee.name,
                description: fee.description,
                amount: fee.amountDue,
                tax: taxAmount,
                penalty: fee.penalty,
                total: total,
                paymentTerms: fee.paymentTerms,
                status: fee.paymentStatus,
                feeType: 'Local',
                transactionId: fee.transactionId,
                paymentDate: fee.paymentDate,
                amountPaid: fee.amountPaid,
                feesCollectionId: fee.feesCollectionId
            });
        });

        return combined;
    };

    // Filter fees based on selected status
    useEffect(() => {
        if (selectedStatus === 'All') {
            setFilteredFees(feesData);
        } else {
            setFilteredFees(feesData.filter(fee => fee.status === selectedStatus));
        }
    }, [feesData, selectedStatus]);

    // Handle payment modal
    const handlePayFee = (fee: CombinedFee) => {
        setSelectedFee(fee);
        setPaymentForm({
            amountPaid: fee.total.toString(),
            paymentMethod: 'UPI',
            paymentDate: new Date().toISOString().split('T')[0],
            transactionId: ''
        });
        setShowPaymentModal(true);
    };

    const handlePaymentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFee) return;

        setPaymentLoading(true);
        try {
            const user = localStorage.getItem('user');
            if (!user) return;
            const userData = JSON.parse(user);
            const studentId = userData.studentId;

            const paymentData = {
                studentId: studentId,
                classFeeId: selectedFee.classFeeId,
                amountPaid: parseFloat(paymentForm.amountPaid),
                paymentMethod: paymentForm.paymentMethod,
                paymentDate: paymentForm.paymentDate,
                transactionId: paymentForm.transactionId,
                feesCollectionId: selectedFee.feesCollectionId
            };

            await axios.patch('/api/payment/fees-collection', paymentData);

            // Refresh fees data
            const institutionId = userData.institutionId;
            const studentInfo = studentData as any;

            const [globalFeesResponse, localFeesResponse] = await Promise.all([
                axios.get(`/api/payment/fees-collection/global-fees?institutionId=${institutionId}&studentId=${studentId}&motherClassId=${studentInfo.motherclassId}`),
                axios.get(`/api/payment/fees-collection/local-fees?institutionId=${institutionId}&studentId=${studentId}`)
            ]);

            const globalFees: GlobalFee[] = globalFeesResponse.data || [];
            const localFees: LocalFee[] = localFeesResponse.data || [];
            const combinedFees = combineFeesData(globalFees, localFees);
            setFeesData(combinedFees);

            setShowPaymentModal(false);
            setSelectedFee(null);
            alert('Payment submitted successfully!');
        } catch (error) {
            console.error('Payment error:', error);
            alert('Payment failed. Please try again.');
        } finally {
            setPaymentLoading(false);
        }
    };

    const closeModal = () => {
        setShowPaymentModal(false);
        setSelectedFee(null);
        setPaymentForm({
            amountPaid: '',
            paymentMethod: 'UPI',
            paymentDate: new Date().toISOString().split('T')[0],
            transactionId: ''
        });
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const user = localStorage.getItem('user');
                if (!user) {
                    setLoading(false);
                    return;
                }
                const userData = JSON.parse(user);
                const studentId = userData.studentId;
                const institutionId = userData.institutionId;

                // Fetch student data
                const studentResponse = await axios.get(`/api/students/${studentId}`);
                const student = studentResponse.data;

                // Extract only required fields
                const studentInfo = {
                    name: student.user.name,
                    roll: student.studentRoll,
                    email: student.user.email,
                    departmentName: student.department.name,
                    motherclassId: student.classEnrollments[0].classSection.motherClassId
                };
                console.log("studentInfo ---", studentInfo);
                setStudentData(studentInfo);

                // Fetch institute data
                const instituteResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/institutions/${institutionId}`);
                setInstituteData(instituteResponse.data);

                // Fetch payment details
                const paymentResponse = await axios.get(`/api/payment/create-fee-account?institutionId=${institutionId}`);
                if (paymentResponse.data) {
                    setPaymentDetails({
                        accountHolder: paymentResponse.data.accountHolder || 'Vijay Mallya',
                        accountNumber: paymentResponse.data.accountNumber || 'SBIN42042042042042O',
                        ifscCode: paymentResponse.data.ifscCode || 'SBIN42042042042042O',
                        bankName: paymentResponse.data.bankName || 'State Bank of India',
                        branchName: paymentResponse.data.branchName || 'Mumbai Central Andheri West',
                        upiqrCode: paymentResponse.data.upiqrCode || '/placeholder.png',
                        upilink: paymentResponse.data.upilink || ''
                    });
                }

                // Fetch fees data
                const [globalFeesResponse, localFeesResponse] = await Promise.all([
                    axios.get(`/api/payment/fees-collection/global-fees?institutionId=${institutionId}&studentId=${studentId}&motherClassId=${studentInfo.motherclassId}`),
                    axios.get(`/api/payment/fees-collection/local-fees?institutionId=${institutionId}&studentId=${studentId}`)
                ]);

                const globalFees: GlobalFee[] = globalFeesResponse.data || [];
                const localFees: LocalFee[] = localFeesResponse.data || [];

                const combinedFees = combineFeesData(globalFees, localFees);
                setFeesData(combinedFees);

                setLoading(false);
            } catch (err) {
                console.log("Error fetching data", err);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading || !studentData) {
        return (
            <main className="bg-gray-50 min-h-screen flex items-center justify-center">
                <p className="text-gray-600 text-lg">Loading student data...</p>
            </main>
        );
    }

    return (
        <main className="bg-gray-50 min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm mb-6">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h1 className="text-2xl font-semibold text-gray-900">Fee Payment</h1>
                    </div>

                    {/* Institution and Student Info */}
                    <div className="p-6">
                        <div className="flex items-start gap-6">
                            <img
                                src={instituteData?.logoUrl}
                                alt="Institution Logo"
                                className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                            />
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-indigo-700 mb-2">{instituteData?.name}</h2>
                                <div className="text-sm text-gray-600 space-y-1">
                                    <p>Address: {instituteData.city}, {instituteData.state}, {instituteData.country}</p>
                                    <p>Phone: {instituteData.phone} </p>
                                    <p>Email: {instituteData.email}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 min-w-96">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Roll:</label>
                                    <input
                                        type="text"
                                        value={studentData.roll}
                                        readOnly
                                        className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name:</label>
                                    <input
                                        type="text"
                                        value={studentData.name}
                                        readOnly
                                        className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email:</label>
                                    <input
                                        type="text"
                                        value={studentData.email}
                                        readOnly
                                        className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Department:</label>
                                    <input
                                        type="text"
                                        value={studentData.departmentName}
                                        readOnly
                                        className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                {/* <div className="bg-white rounded-lg shadow-sm mb-6 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div>
                                <label className="block text-sm font-medium text-indigo-600 mb-1">Term:</label>
                                <select
                                    value={selectedTerm}
                                    onChange={(e) => setSelectedTerm(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option>Spring 2021</option>
                                    <option>Fall 2021</option>
                                    <option>Summer 2021</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-indigo-600 mb-1">Status:</label>
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="All">All</option>
                                    <option value="PENDING">Pending</option>
                                    <option value="NOT_GENERATED">Not Generated</option>
                                    <option value="PAID">Paid</option>
                                    <option value="OVERDUE">Overdue</option>
                                </select>
                            </div>
                        </div>
                        <button className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                            Proceed
                        </button>
                    </div>
                </div> */}

                {/* Fee Table */}
                <div className="bg-white rounded-lg shadow-sm mb-6">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Fee Details</h2>
                        <p className="text-sm text-gray-600 mt-1">Total fees: {filteredFees.length}</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Name & Description</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Tax</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Penalty</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Total</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Payment Terms</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Fee Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Transaction ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredFees.length === 0 ? (
                                    <tr>
                                        <td colSpan={10} className="px-6 py-8 text-center text-gray-500">
                                            No fees found for the selected criteria
                                        </td>
                                    </tr>
                                ) : (
                                    filteredFees.map((fee) => (
                                        <tr key={fee.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                <div className="min-w-48">
                                                    <div className="font-medium">{fee.name}</div>
                                                    <div className="text-gray-500 text-xs mt-1">{fee.description}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{fee.amount.toFixed(2)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{fee.tax.toFixed(2)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{fee.penalty.toFixed(2)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">₹{fee.total.toFixed(2)}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                <div className="max-w-32 truncate" title={fee.paymentTerms}>{fee.paymentTerms}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${fee.status === 'PAID'
                                                    ? 'bg-green-100 text-green-800'
                                                    : fee.status === 'PENDING'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : fee.status === 'NOT_GENERATED'
                                                            ? 'bg-gray-100 text-gray-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {fee.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${fee.feeType === 'Global'
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : 'bg-purple-100 text-purple-800'
                                                    }`}>
                                                    {fee.feeType}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {fee.transactionId || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {fee.status !== 'PAID' && (
                                                    <button
                                                        onClick={() => handlePayFee(fee)}
                                                        className="px-3 py-1 bg-indigo-600 text-white text-xs font-medium rounded hover:bg-indigo-700 transition-colors"
                                                    >
                                                        Pay Fee
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Summary */}
                    {filteredFees.length > 0 && (
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                            <div className="flex justify-between items-center">
                                <div className="text-sm text-gray-600">
                                    Showing {filteredFees.length} fee(s)
                                </div>
                                <div className="text-sm font-medium text-gray-900">
                                    Total Amount: ₹{filteredFees.reduce((sum, fee) => sum + fee.total, 0).toFixed(2)}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Payment Details */}
                <div className="bg-white rounded-lg shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-indigo-700">{instituteData?.name || 'XYZ Institution'} Payment Details</h2>
                    </div>
                    <div className="p-6">
                        <div className="flex gap-8">
                            {/* QR Code */}
                            <div className="flex-shrink-0">
                                <div className="w-48 h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                                    <div className="text-center">
                                        {paymentDetails.upiqrCode ? (
                                            <img src={paymentDetails.upilink} alt="UPI QR Code" className="w-32 h-32 mx-auto mb-2 rounded" />
                                        ) : (
                                            <div className="w-32 h-32 bg-gray-200 mx-auto mb-2 rounded flex items-center justify-center">
                                                <span className="text-gray-500 text-xs">QR Code</span>
                                            </div>
                                        )}
                                        <p className="text-sm font-medium text-gray-700">UPI QR</p>
                                    </div>
                                </div>
                            </div>

                            {/* Banking Details */}
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-indigo-600 mb-4">Banking Details</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-indigo-600 mb-1">Account Holder Name:</label>
                                        <input
                                            type="text"
                                            value={paymentDetails.accountHolder}
                                            readOnly
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-indigo-600 mb-1">Bank Name and Branch Location:</label>
                                        <input
                                            type="text"
                                            value={`${paymentDetails.bankName}, ${paymentDetails.branchName}`}
                                            readOnly
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-indigo-600 mb-1">Bank IFSC Code:</label>
                                        <input
                                            type="text"
                                            value={paymentDetails.ifscCode}
                                            readOnly
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-indigo-600 mb-1">Bank Account Number:</label>
                                        <input
                                            type="text"
                                            value={paymentDetails.accountNumber}
                                            readOnly
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && selectedFee && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-2xl flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">Pay Fee</h3>
                                <button
                                    onClick={closeModal}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handlePaymentSubmit} className="p-6">
                            <div className="mb-4">
                                <h4 className="font-medium text-gray-900 mb-2">{selectedFee.name}</h4>
                                <p className="text-sm text-gray-600 mb-4">{selectedFee.description}</p>
                                <div className="bg-gray-50 p-3 rounded-md">
                                    <div className="flex justify-between text-sm">
                                        <span>Amount:</span>
                                        <span>₹{selectedFee.amount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Tax:</span>
                                        <span>₹{selectedFee.tax.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Penalty:</span>
                                        <span>₹{selectedFee.penalty.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-medium border-t pt-2 mt-2">
                                        <span>Total:</span>
                                        <span>₹{selectedFee.total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Amount Paid *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={paymentForm.amountPaid}
                                        onChange={(e) => setPaymentForm({ ...paymentForm, amountPaid: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Payment Method *
                                    </label>
                                    <select
                                        value={paymentForm.paymentMethod}
                                        onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        required
                                    >
                                        <option value="UPI">UPI</option>
                                        <option value="NEFT">NEFT</option>
                                        <option value="RTGS">RTGS</option>
                                        <option value="CASH">Cash</option>
                                        <option value="CHEQUE">Cheque</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Payment Date *
                                    </label>
                                    <input
                                        type="date"
                                        value={paymentForm.paymentDate}
                                        onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Transaction ID *
                                    </label>
                                    <input
                                        type="text"
                                        value={paymentForm.transactionId}
                                        onChange={(e) => setPaymentForm({ ...paymentForm, transactionId: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Enter transaction ID"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                                    disabled={paymentLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                    disabled={paymentLoading}
                                >
                                    {paymentLoading ? 'Processing...' : 'Submit Payment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}