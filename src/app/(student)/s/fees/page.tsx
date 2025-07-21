"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

// --- SIMULATED LOGGED-IN STUDENT ---
// Change this ID to see the portal for different students.
// 101: 'cleared' status
// 102: 'pending' status
const LOGGED_IN_STUDENT_ID = 102;

// --- Sample Data for the Fees Table (Unchanged) ---
const initialFeesData = [
    {
        id: 1, sectionName: 'CSE 1',
        globalFees: [
            { id: 'g1', name: 'Tuition Fee', amount: 100000 },
            { id: 'g2', name: 'Development Fee', amount: 20000 }
        ],
        variableFees: [
            { id: 'v1', name: 'Lab Fee', amount: 15000 }
        ]
    },
    {
        id: 2, sectionName: 'CSE 2',
        globalFees: [
            { id: 'g3', name: 'Tuition Fee', amount: 20000 }
        ],
        variableFees: [
            { id: 'v2', name: 'Sports Fee', amount: 5000 }
        ]
    },
    // ... other section fee data
];

// --- Sample Data for the Student List (Unchanged) ---
const initialStudentData = {
    1: [
        { id: 101, name: 'Aarav Sharma', roll: 'CSE-1-001', status: 'cleared', receipt: { name: 'aarav_receipt.pdf' } },
        { id: 102, name: 'Diya Patel', roll: 'CSE-1-002', status: 'pending', receipt: null },
        { id: 103, name: 'Rohan Mehta', roll: 'CSE-1-003', status: 'cleared', receipt: { name: 'rohan_receipt.pdf' } },
    ],
    2: [
        { id: 201, name: 'Ishaan Singh', roll: 'CSE-2-001', status: 'pending', receipt: null },
        { id: 202, name: 'Ananya Gupta', roll: 'CSE-2-002', status: 'pending', receipt: null },
    ],
    // ... other student data
};


// A reusable component to display details
const DetailItem = ({ label, value }) => (
    <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="text-lg text-slate-800">{value}</p>
    </div>
);

export default function Home() {
    // State for student data, which can change when a receipt is uploaded
    const [studentData, setStudentData] = useState(initialStudentData);
    const [instituteData, setInstituteData] = useState(null);
    const [paymentDetails, setPaymentDetails] = useState({
        id: '',
        accountHolder: '',
        accountNumber: '',
        ifscCode: '',
        bankName: '',
        branchName: '',
        upiqrCode: ''
    });

    // --- Data Derivation for the Logged-in Student ---
    const studentDetails = useMemo(() => {
        for (const sectionId in studentData) {
            const student = studentData[sectionId].find(s => s.id === LOGGED_IN_STUDENT_ID);
            if (student) {
                // Return student info along with their section ID
                return { ...student, sectionId: parseInt(sectionId, 10) };
            }
        }
        return null; // Student not found
    }, [studentData]);

    const sectionFeeDetails = useMemo(() => {
        if (!studentDetails) return null;
        return initialFeesData.find(section => section.id === studentDetails.sectionId);
    }, [studentDetails]);

    useEffect(() => {

    }, [])


    useEffect(() => {
        const user = localStorage.getItem('user');
        if (!user) return; // Guard clause if no user is logged in
        const data = JSON.parse(user);

        const fetchInstituteData = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/institutions/${data.institutionId}`);
                setInstituteData(response.data);
            } catch (err) {
                console.log("Error fetching institute data", err);
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

    // --- Handler for student to upload their payment receipt ---
    const handleReceiptUpload = (file) => {
        if (!file || !studentDetails) return;

        const { id: studentId, sectionId } = studentDetails;

        // In a real app, you would upload the file and an admin would verify it.
        // For this demo, we'll optimistically update the status to 'cleared'.
        const updatedStudentsInSection = studentData[sectionId].map(student =>
            student.id === studentId ? { ...student, receipt: file, status: 'cleared' } : student
        );

        setStudentData({ ...studentData, [sectionId]: updatedStudentsInSection });
        console.log(`Uploaded ${file.name} for student ID ${studentId}`);
    };

    // --- Helper function to calculate sum of fees ---
    const calculateFeeSum = (feesArray = []) => feesArray.reduce((sum, fee) => sum + fee.amount, 0);

    // --- Loading / Error State ---
    if (!studentDetails || !sectionFeeDetails) {
        return (
            <main className="bg-slate-50 min-h-screen flex items-center justify-center">
                <p className="text-slate-600 text-lg">Loading student data or student not found...</p>
            </main>
        );
    }

    // --- Calculate Totals ---
    const globalFeesTotal = calculateFeeSum(sectionFeeDetails.globalFees);
    const variableFeesTotal = calculateFeeSum(sectionFeeDetails.variableFees);
    const totalFees = globalFeesTotal + variableFeesTotal;

    return (
        <main className="bg-slate-50 min-h-screen">
            <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
                {/* --- Header Section (Unchanged) --- */}
                <div className="flex flex-col sm:flex-row items-center gap-6 bg-white p-6 rounded-xl shadow-sm">
                    <img src={instituteData?.logoUrl} alt="Institution Logo" className="w-28 h-28 sm:w-36 sm:h-36 object-cover rounded-lg shadow-md flex-shrink-0" />
                    <div className="text-center sm:text-left">
                        <h1 className="text-3xl font-bold text-indigo-800 mb-2">{instituteData?.name}</h1>
                        <p className="text-sm text-slate-600">Email: {instituteData?.email}</p>
                        <p className="text-sm text-slate-600">Phone: {instituteData?.phone}</p>
                        <p className="text-sm text-slate-600">Address: {instituteData?.city}, {instituteData?.state}, {instituteData?.country}</p>
                    </div>
                </div>

                <hr className="my-8 border-t border-slate-200" />

                {/* --- Student Profile & Fee Summary --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* --- Column 1: Student Profile --- */}
                    <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm space-y-4">
                        <h2 className="text-xl font-semibold text-slate-800 border-b pb-3 mb-3">Student Profile</h2>
                        <DetailItem label="Student Name" value={studentDetails.name} />
                        <DetailItem label="Roll Number" value={studentDetails.roll} />
                        <DetailItem label="Section" value={sectionFeeDetails.sectionName} />
                    </div>

                    {/* --- Column 2: Fee Breakdown --- */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
                        <h2 className="text-xl font-semibold text-slate-800 border-b pb-3 mb-4">Fee Breakdown</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-slate-600 mb-2">Global Fees</h3>
                                {sectionFeeDetails.globalFees.map(fee => (
                                    <div key={fee.id} className="flex justify-between items-center text-slate-700 py-1">
                                        <span>{fee.name}</span>
                                        <span className="font-medium">₹{fee.amount.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-600 mb-2">Variable Fees</h3>
                                {sectionFeeDetails.variableFees.map(fee => (
                                    <div key={fee.id} className="flex justify-between items-center text-slate-700 py-1">
                                        <span>{fee.name}</span>
                                        <span className="font-medium">₹{fee.amount.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t pt-4 mt-4 flex justify-between items-center">
                                <span className="text-lg font-bold text-slate-800">Total Due</span>
                                <span className="text-lg font-bold text-indigo-600">₹{totalFees.toFixed(2)}</span>
                            </div>
                            <div className="border-t pt-4 mt-4 flex justify-between items-center">
                                <span className="text-lg font-bold text-slate-800">Payment Status</span>
                                <span className={`text-sm font-bold rounded-full px-4 py-1 ${studentDetails.status === 'cleared'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                    }`}>
                                    {studentDetails.status.toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <hr className="my-8 border-t border-slate-200" />

                {/* --- Payment & Receipt Section (Conditional) --- */}
                <div>
                    <h2 className="text-2xl font-semibold text-slate-800 mb-6">
                        {studentDetails.status === 'cleared' ? 'Payment Confirmed' : 'Complete Your Payment'}
                    </h2>

                    {studentDetails.status === 'pending' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white p-6 rounded-xl shadow-sm">
                                <h3 className="text-lg font-semibold text-slate-700 mb-4">Payment Options</h3>
                                <div className="flex flex-col sm:flex-row gap-6 items-center">
                                    <img src={paymentDetails.upiqrCode} alt="UPI QR Code" className="w-36 h-36 object-cover border-4 border-slate-100 rounded-lg" />
                                    <div>
                                        <p className="font-semibold text-indigo-600 mb-3">Scan to Pay with any UPI App</p>
                                        <p className="text-sm font-semibold text-slate-700 mt-2">Or use Bank Transfer:</p>
                                        <p className="text-sm text-slate-600">A/C Name: {paymentDetails.accountHolder}</p>
                                        <p className="text-sm text-slate-600">IFSC: {paymentDetails.ifscCode}</p>
                                        <p className="text-sm text-slate-600">Bank: {paymentDetails.bankName}</p>
                                        <p className="text-sm text-slate-600">Branch: {paymentDetails.branchName}</p>
                                        <p className="text-sm text-slate-600">A/C No: {paymentDetails.accountNumber}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col items-center justify-center text-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <h3 className="text-lg font-semibold text-slate-700 mb-2">Upload Payment Receipt</h3>
                                <p className="text-sm text-slate-500 mb-4">After payment, please upload the receipt/screenshot for verification.</p>
                                <input
                                    type="file"
                                    id="receipt-upload"
                                    className="hidden"
                                    accept="image/*,application/pdf"
                                    onChange={(e) => handleReceiptUpload(e.target.files[0])}
                                />
                                <label
                                    htmlFor="receipt-upload"
                                    className="cursor-pointer inline-flex items-center px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-md hover:bg-indigo-700 transition-colors"
                                >
                                    Choose File to Upload
                                </label>
                            </div>
                        </div>
                    )}

                    {studentDetails.status === 'cleared' && (
                        <div className="bg-white p-8 rounded-xl shadow-sm flex flex-col items-center justify-center text-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-emerald-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="text-xl font-semibold text-slate-800">All Dues Cleared!</h3>
                            <p className="text-slate-600 mt-2 mb-4">Your payment has been confirmed. Thank you.</p>
                            {studentDetails.receipt && (
                                <a href="#" className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-md hover:bg-slate-200 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                    View Receipt ({studentDetails.receipt.name})
                                </a>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}