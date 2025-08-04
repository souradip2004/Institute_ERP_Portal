"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";


// --- Sample Data for the Fees Table ---
const initialFeesData = [
    {
        id: 1, sectionName: 'Class 12-B Science',
        fees: [
            { id: 'f1', type: 'Admission Fees', amount: 11234.00, status: 'Cleared', transactionId: '12345u7664778nj', receipt: 'Receipt/center_Date.pdf' },
            { id: 'f2', type: 'Admission Fees', amount: 11234.00, status: 'Cleared', transactionId: '12345u7664778nj', receipt: 'Receipt/center_Date.pdf' },
            { id: 'f3', type: 'Admission Fees', amount: 11234.00, status: 'Cleared', transactionId: '12345u7664778nj', receipt: 'Receipt/center_Date.pdf' },
            { id: 'f4', type: 'Admission Fees', amount: 11234.00, status: 'Cleared', transactionId: '12345u7664778nj', receipt: 'Receipt/center_Date.pdf' },
            { id: 'f5', type: 'Admission Fees', amount: 11234.00, status: 'Pending', transactionId: '', receipt: '' },
        ]
    }
];



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
    const [selectedStatus, setSelectedStatus] = useState('Pending');
    const [loading, setLoading] = useState(true);

    const sectionFeeDetails = useMemo(() => {
        return initialFeesData[0]; // Using the first section for now
    }, []);

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
                const instituteResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/institutions/${userData.institutionId}`);
                setInstituteData(instituteResponse.data);

                // Fetch payment details
                const paymentResponse = await axios.get(`/api/payment/create-fee-account?institutionId=${userData.institutionId}`);
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
                <div className="bg-white rounded-lg shadow-sm mb-6 p-6">
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
                                    <option>Pending</option>
                                    <option>Cleared</option>
                                    <option>Overdue</option>
                                </select>
                            </div>
                        </div>
                        <button className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                            Proceed
                        </button>
                    </div>
                </div>

                {/* Fee Table */}
                <div className="bg-white rounded-lg shadow-sm mb-6">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {sectionFeeDetails.fees.map((fee) => (
                                    <tr key={fee.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{fee.type}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Rs {fee.amount.toFixed(2)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${fee.status === 'Cleared'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {fee.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{fee.transactionId}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-800">
                                            {fee.receipt && (
                                                <a href="#" className="underline">{fee.receipt}</a>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
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