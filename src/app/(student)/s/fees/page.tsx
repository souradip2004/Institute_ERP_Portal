"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";


// Types for fee data
interface GlobalFee {
    feeId: string;
    name: string;
    description: string;
    amountDue: number;
    baseAmount: number;
    taxPercentageIncluded: number;
    penaltyIncluded: number;
    isPenaltyApplied: boolean;
    paymentStatus: string;
    dueDate: string;
    feesCollectionId: string;
    classFeeId: string;
    amountPaid?: number;
    paymentDate?: string | null;
    paymentMethod?: string | null;
    transactionId?: string | null;
}

interface LocalFee {
    classFeeId: string;
    localFeesId: string;
    name: string;
    description: string;
    amountDue: number;
    baseAmount: number;
    taxPercentageIncluded: number;
    penaltyIncluded: number;
    isPenaltyApplied: boolean;
    paymentStatus: string;
    dueDate: string;
    amountPaid: number;
    paymentDate: string | null;
    paymentMethod: string | null;
    transactionId: string | null;
    feesCollectionId: string;
}

interface CombinedFee {
    classFeeId: string;
    id: string;
    name: string;
    description: string;
    baseAmount: number;
    amountDue: number;
    taxIncluded: number;
    penaltyAmount: number;
    isPenaltyApplied: boolean;
    dueDate: string;
    status: string;
    feeType: 'Global' | 'Local';
    transactionId?: string | null;
    paymentDate?: string | null;
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
    const [paymentForm, setPaymentForm] = useState({
        amountPaid: 0,
        paymentMethod: 'UPI',
        transactionId: '',
        isCashPayment: false
    });
    const [paymentSubmitted, setPaymentSubmitted] = useState(false);
    const [submittingPayment, setSubmittingPayment] = useState(false);

    // Combine and transform fees data
    const combineFeesData = (globalFees: GlobalFee[], localFees: LocalFee[]): CombinedFee[] => {
        const combined: CombinedFee[] = [];

        // Process global fees
        globalFees.forEach(fee => {
            combined.push({
                classFeeId: fee.classFeeId,
                id: fee.feeId,
                name: fee.name,
                description: fee.description,
                baseAmount: fee.baseAmount,
                amountDue: fee.amountDue,
                taxIncluded: fee.taxPercentageIncluded,
                penaltyAmount: fee.penaltyIncluded,
                isPenaltyApplied: fee.isPenaltyApplied,
                dueDate: fee.dueDate,
                status: fee.paymentStatus,
                feeType: 'Global',
                transactionId: fee.transactionId,
                paymentDate: fee.paymentDate,
                amountPaid: fee.amountPaid || 0,
                feesCollectionId: fee.feesCollectionId
            });
        });

        // Process local fees
        localFees.forEach(fee => {
            combined.push({
                classFeeId: fee.classFeeId,
                id: fee.localFeesId,
                name: fee.name,
                description: fee.description,
                baseAmount: fee.baseAmount,
                amountDue: fee.amountDue,
                taxIncluded: fee.taxPercentageIncluded,
                penaltyAmount: fee.penaltyIncluded,
                isPenaltyApplied: fee.isPenaltyApplied,
                dueDate: fee.dueDate,
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

    // Calculate total amount due
    const totalAmountDue = useMemo(() => {
        return filteredFees.reduce((sum, fee) => sum + fee.amountDue, 0);
    }, [filteredFees]);

    // Handle payment modal open
    const handlePayFeeClick = () => {
        setPaymentForm({
            amountPaid: totalAmountDue,
            paymentMethod: 'UPI',
            transactionId: '',
            isCashPayment: false
        });
        setPaymentSubmitted(false);
        setShowPaymentModal(true);
    };

    // Handle payment form submission
    const handlePaymentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmittingPayment(true);

        try {
            const user = localStorage.getItem('user');
            if (!user) return;

            const userData = JSON.parse(user);
            const studentId = userData.studentId;

            const requestBody = {
                amountPaid: paymentForm.amountPaid,
                paymentMethod: paymentForm.paymentMethod,
                studentId: studentId,
                transactionId: paymentForm.transactionId,
                isCashPayment: paymentForm.isCashPayment
            };

            await axios.patch('/api/payment/fees-collection', requestBody);

            setPaymentSubmitted(true);
        } catch (error) {
            console.error('Payment submission error:', error);
            alert('Failed to submit payment. Please try again.');
        } finally {
            setSubmittingPayment(false);
        }
    };

    // Handle modal close
    const handleModalClose = () => {
        setShowPaymentModal(false);
        setPaymentSubmitted(false);
        if (paymentSubmitted) {
            // Refresh the page data after successful payment
            window.location.reload();
        }
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
        <main className="bg-gray-50 min-h-screen p-4 md:p-6">
            <div className="w-full">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm mb-6 md:max-w-[calc(100vw-370px)] mx-auto">
                    <div className="px-4 md:px-6 py-4 border-b border-gray-200">
                        <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Fee Payment</h1>
                    </div>

                    {/* Institution and Student Info */}
                    <div className="p-4 md:p-6">
                        <div className="flex flex-col lg:flex-row items-start gap-6">
                            <div className="flex flex-col sm:flex-row items-start gap-4 w-full">
                                <img
                                    src={instituteData?.logoUrl}
                                    alt="Institution Logo"
                                    className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-lg md:text-2xl font-bold text-indigo-700 mb-2 break-words">{instituteData?.name}</h2>
                                    <div className="text-sm text-gray-600 space-y-1">
                                        <p className="break-words">Address: {instituteData.city}, {instituteData.state}, {instituteData.country}</p>
                                        <p className="break-words">Phone: {instituteData.phone}</p>
                                        <p className="break-words">Email: {instituteData.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Student Details */}
                            <div className="w-full lg:w-auto lg:min-w-0 lg:max-w-md">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email:</label>
                                        <input
                                            type="text"
                                            value={studentData.email}
                                            readOnly
                                            className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm"
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
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
                <div className="bg-white rounded-lg shadow-sm mb-6 md:max-w-[calc(100vw-370px)] mx-auto">
                    <div className="px-4 md:px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Fee Details</h2>
                        <p className="text-sm text-gray-600 mt-1">Total fees: {filteredFees.length}</p>

                        {/* Summary */}
                        {filteredFees.length > 0 && (
                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                                <div className="flex justify-between items-center">
                                    <div className="text-sm font-medium text-gray-900">
                                        Total Amount Due: ₹{totalAmountDue.toFixed(2)}
                                    </div>
                                    <div>
                                        <button
                                            onClick={handlePayFeeClick}
                                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
                                        >
                                            Pay fee
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>


                    <div className="overflow-x-auto">
                        <table className="w-full" style={{ minWidth: '1100px' }}>
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name & Description</th>
                                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Total Amount</th>
                                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Tax (Included)</th>
                                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Penalty</th>
                                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Amount Due</th>
                                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Amount Paid</th>
                                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Due Date</th>
                                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Fee Type</th>
                                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Transaction ID</th>
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
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">₹{fee.baseAmount.toFixed(2)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <span className="text-green-600 font-medium">{fee.taxIncluded}%</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {fee.isPenaltyApplied ? (
                                                    <div className="text-red-600">
                                                        <div className="font-medium">₹{fee.penaltyAmount.toFixed(2)}</div>
                                                        <div className="text-xs">Applied</div>
                                                    </div>
                                                ) : (
                                                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                                        N/A
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">₹{fee.amountDue.toFixed(2)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{(fee.amountPaid || 0).toFixed(2)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {new Date(fee.dueDate).toLocaleDateString('en-IN')}
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
                                    Total Amount Due: ₹{totalAmountDue.toFixed(2)}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Payment Details */}
                <div className="bg-white rounded-lg shadow-sm w-fit mx-auto">
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
                            <div className="flex justify-center">
                                <div className="flex flex-col">
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
            </div>

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-900">Payment Details</h3>
                                <button
                                    onClick={handleModalClose}
                                    className="text-gray-400 hover:text-gray-600 text-xl"
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            {!paymentSubmitted ? (
                                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                                    {/* Total Amount Due */}
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="text-sm text-gray-600 mb-2">Total Amount Due</div>
                                        <div className="text-2xl font-bold text-indigo-600">₹{totalAmountDue.toFixed(2)}</div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            (Tax and penalty included if applicable)
                                        </div>
                                    </div>

                                    {/* Payment Method Toggle */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                                        <div className="flex space-x-4">
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="paymentType"
                                                    checked={!paymentForm.isCashPayment}
                                                    onChange={() => setPaymentForm(prev => ({
                                                        ...prev,
                                                        isCashPayment: false,
                                                        paymentMethod: 'UPI'
                                                    }))}
                                                    className="mr-2"
                                                />
                                                <span className="text-sm">Online (UPI/Bank)</span>
                                            </label>
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="paymentType"
                                                    checked={paymentForm.isCashPayment}
                                                    onChange={() => setPaymentForm(prev => ({
                                                        ...prev,
                                                        isCashPayment: true,
                                                        paymentMethod: 'CASH'
                                                    }))}
                                                    className="mr-2"
                                                />
                                                <span className="text-sm">Cash (Offline)</span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Payment Method Dropdown (for online payments) */}
                                    {!paymentForm.isCashPayment && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Online Payment Method</label>
                                            <select
                                                value={paymentForm.paymentMethod}
                                                onChange={(e) => setPaymentForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                required
                                            >
                                                <option value="UPI">UPI</option>
                                                <option value="BANK_TRANSFER">Bank Transfer</option>
                                                <option value="NET_BANKING">Net Banking</option>
                                            </select>
                                        </div>
                                    )}

                                    {/* Transaction ID */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {paymentForm.isCashPayment ? 'Receipt Number (Optional)' : 'Transaction ID'}
                                        </label>
                                        <input
                                            type="text"
                                            value={paymentForm.transactionId}
                                            onChange={(e) => setPaymentForm(prev => ({ ...prev, transactionId: e.target.value }))}
                                            placeholder={paymentForm.isCashPayment ? 'Enter receipt number if available' : 'Enter UPI/Bank transaction ID'}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            required={!paymentForm.isCashPayment}
                                        />
                                    </div>

                                    {/* Amount Paid */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount Paid</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max={totalAmountDue}
                                            value={paymentForm.amountPaid}
                                            onChange={(e) => setPaymentForm(prev => ({ ...prev, amountPaid: parseFloat(e.target.value) || 0 }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            required
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex space-x-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={handleModalClose}
                                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={submittingPayment}
                                            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors"
                                        >
                                            {submittingPayment ? 'Submitting...' : 'Submit Payment'}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                /* Success Message */
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Payment Info Submitted!</h4>
                                    <p className="text-sm text-gray-600 mb-6">
                                        Please wait for institution admin to verify the payment and your total amount due will be reduced.
                                    </p>
                                    <button
                                        onClick={handleModalClose}
                                        className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                                    >
                                        Close
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </main >
    );
}