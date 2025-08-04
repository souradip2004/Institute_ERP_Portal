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
    collectionId: string | null;
}

interface LocalFee {
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
        upiqrCode: ''
    });
    const [selectedTerm, setSelectedTerm] = useState('Spring 2021');
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [loading, setLoading] = useState(true);
    const [feesData, setFeesData] = useState<CombinedFee[]>([]);
    const [filteredFees, setFilteredFees] = useState<CombinedFee[]>([]);

    // Combine and transform fees data
    const combineFeesData = (globalFees: GlobalFee[], localFees: LocalFee[]): CombinedFee[] => {
        const combined: CombinedFee[] = [];

        // Process global fees
        globalFees.forEach(fee => {
            const taxAmount = (fee.amountDue * fee.taxPercentage) / 100;
            const total = fee.amountDue + taxAmount + fee.penalty;

            combined.push({
                id: fee.feeId,
                name: fee.name,
                description: fee.description,
                amount: fee.amountDue,
                tax: taxAmount,
                penalty: fee.penalty,
                total: total,
                paymentTerms: fee.paymentTerms,
                status: fee.paymentStatus,
                feeType: 'Global'
            });
        });

        // Process local fees
        localFees.forEach(fee => {
            const taxAmount = (fee.amountDue * fee.taxPercentage) / 100;
            const total = fee.amountDue + taxAmount + fee.penalty;

            combined.push({
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
                amountPaid: fee.amountPaid
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
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name & Description</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tax</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Penalty</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Terms</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredFees.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                                            No fees found for the selected criteria
                                        </td>
                                    </tr>
                                ) : (
                                    filteredFees.map((fee) => (
                                        <tr key={fee.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                <div>
                                                    <div className="font-medium">{fee.name}</div>
                                                    <div className="text-gray-500 text-xs mt-1">{fee.description}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{fee.amount.toFixed(2)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{fee.tax.toFixed(2)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{fee.penalty.toFixed(2)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">₹{fee.total.toFixed(2)}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                                                <div className="truncate" title={fee.paymentTerms}>{fee.paymentTerms}</div>
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
                                            <img src={paymentDetails.upiqrCode} alt="UPI QR Code" className="w-32 h-32 mx-auto mb-2 rounded" />
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
        </main>
    );
}