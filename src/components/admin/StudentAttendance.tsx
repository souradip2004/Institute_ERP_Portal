"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface AttendanceSession {
    sessionType: string;
    courseName: string;
    classSectionName: string;
    status: 'PRESENT' | 'ABSENT' | 'NOT_MARKED';
}

interface AttendanceDay {
    date: string;
    sessions: AttendanceSession[];
}

interface StudentAttendanceData {
    studentId: string;
    studentName: string;
    studentEmail: string;
    studentRoll: string;
    motherClassName: string;
    attendanceHistory: AttendanceDay[];
}

interface StudentAttendanceProps {
    studentId: string;
    motherClassId: string;
    isOpen: boolean;
    onClose: () => void;
}

const STATUS_STYLES = {
    'PRESENT': 'bg-green-100 text-green-800 border-green-200',
    'ABSENT': 'bg-red-100 text-red-800 border-red-200',
    'NOT_MARKED': 'bg-gray-100 text-gray-600 border-gray-200'
};

const STATUS_ICONS = {
    'PRESENT': '✓',
    'ABSENT': '✗',
    'NOT_MARKED': '—'
};

export default function StudentAttendance({
    studentId,
    motherClassId,
    isOpen,
    onClose
}: StudentAttendanceProps) {
    const [attendanceData, setAttendanceData] = useState<StudentAttendanceData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && studentId && motherClassId) {
            fetchAttendanceData();
        }
    }, [isOpen, studentId, motherClassId]);

    const fetchAttendanceData = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await axios.get(
                `/api/attendance/student-attendance/${studentId}?motherClassId=${motherClassId}`
            );

            setAttendanceData(response.data);
        } catch (err) {
            console.error('Error fetching attendance data:', err);
            setError('Failed to fetch attendance data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getAttendanceStats = () => {
        if (!attendanceData?.attendanceHistory) return { total: 0, present: 0, absent: 0, notMarked: 0 };

        let total = 0;
        let present = 0;
        let absent = 0;
        let notMarked = 0;

        attendanceData.attendanceHistory.forEach(day => {
            day.sessions.forEach(session => {
                total++;
                switch (session.status) {
                    case 'PRESENT':
                        present++;
                        break;
                    case 'ABSENT':
                        absent++;
                        break;
                    case 'NOT_MARKED':
                        notMarked++;
                        break;
                }
            });
        });

        return { total, present, absent, notMarked };
    };

    if (!isOpen) return null;

    const stats = getAttendanceStats();
    const attendancePercentage = stats.total > 0 ? Math.round((stats.present / (stats.total - stats.notMarked)) * 100) : 0;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-2xl flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center bg-gradient-to-r from-purple-50 to-blue-50">
                    <h2 className="text-xl font-bold text-gray-800">Student Attendance</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                            <span className="ml-3 text-gray-600">Loading attendance data...</span>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <div className="text-red-500 text-lg mb-4">{error}</div>
                            <button
                                onClick={fetchAttendanceData}
                                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                            >
                                Retry
                            </button>
                        </div>
                    ) : attendanceData ? (
                        <div className="space-y-6">
                            {/* Student Info */}
                            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
                                <div className="flex items-center mb-4">
                                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold mr-4">
                                        {attendanceData.studentName.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">{attendanceData.studentName}</h3>
                                        <p className="text-gray-600">{attendanceData.studentEmail}</p>
                                        <div className="flex items-center mt-1 space-x-4">
                                            <span className="text-sm text-gray-500">Roll: <span className="font-medium">{attendanceData.studentRoll}</span></span>
                                            <span className="text-sm text-gray-500">Class: <span className="font-medium">{attendanceData.motherClassName}</span></span>
                                        </div>
                                    </div>
                                </div>

                                {/* Attendance Stats */}
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-gray-500">Total Sessions</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-gray-500">Present</p>
                                        <p className="text-2xl font-bold text-green-600">{stats.present}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-gray-500">Absent</p>
                                        <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-gray-500">Not Marked</p>
                                        <p className="text-2xl font-bold text-gray-500">{stats.notMarked}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-gray-500">Attendance %</p>
                                        <p className={`text-2xl font-bold ${attendancePercentage >= 75 ? 'text-green-600' : attendancePercentage >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                                            {isNaN(attendancePercentage) ? 'N/A' : `${attendancePercentage}%`}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Attendance History */}
                            {attendanceData.attendanceHistory.length === 0 ? (
                                <div className="text-center py-12 bg-gray-50 rounded-lg">
                                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Attendance Data</h3>
                                    <p className="text-gray-500">No attendance records found for this student in the selected class.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <h4 className="text-lg font-semibold text-gray-900">Attendance History</h4>
                                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Date
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Session Type
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Course
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Class Section
                                                        </th>
                                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Status
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {attendanceData.attendanceHistory.map((day, dayIndex) =>
                                                        day.sessions.map((session, sessionIndex) => (
                                                            <tr key={`${dayIndex}-${sessionIndex}`} className="hover:bg-gray-50">
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                    {sessionIndex === 0 ? formatDate(day.date) : ''}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                        {session.sessionType}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                    {session.courseName}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                    {session.classSectionName}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${STATUS_STYLES[session.status]}`}>
                                                                        <span className="mr-1">{STATUS_ICONS[session.status]}</span>
                                                                        {session.status.replace('_', ' ')}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 px-6 py-4 flex justify-end bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}