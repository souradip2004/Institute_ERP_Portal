'use client';

import React, { useState } from 'react';

// Data types for our mock data
interface Student {
    name: string;
    roll: string;
    email: string;
    marksObtained: number;
    answerSheet: string;
}

interface QuestionMark {
    number: string;
    marks: string;
}

// Mock data to populate the UI
const studentsDataInit: Student[] = [
    { name: 'Arindam Kanrar', roll: '3456788765', email: 'mitanager@gmail.com', marksObtained: 0, answerSheet: 'my_answer.pdf' },
    { name: 'Arindam Kanrar', roll: '3456788765', email: 'mitanager@gmail.com', marksObtained: 0, answerSheet: 'my_answer.pdf' },
    { name: 'Arindam Kanrar', roll: '3456788765', email: 'mitanager@gmail.com', marksObtained: 0, answerSheet: 'my_answer.pdf' },
    { name: 'Arindam Kanrar', roll: '3456788765', email: 'mitanager@gmail.com', marksObtained: 0, answerSheet: 'my_answer.pdf' },
    { name: 'Arindam Kanrar', roll: '3456788765', email: 'mitanager@gmail.com', marksObtained: 0, answerSheet: 'my_answer.pdf' },
    { name: 'Arindam Kanrar', roll: '3456788765', email: 'mitanager@gmail.com', marksObtained: 0, answerSheet: 'my_answer.pdf' },
    { name: 'Arindam Kanrar', roll: '3456788765', email: 'mitanager@gmail.com', marksObtained: 0, answerSheet: 'my_answer.pdf' },
    { name: 'Arindam Kanrar', roll: '3456788765', email: 'mitanager@gmail.com', marksObtained: 0, answerSheet: 'my_answer.pdf' },
];

const defaultQuestions = Array(8).fill({ number: '', marks: '' });

const ManualMarksEntry = () => {
    const [students, setStudents] = useState<Student[]>(studentsDataInit);
    // Each student has their own questionsData
    const [questionsPerStudent, setQuestionsPerStudent] = useState<QuestionMark[][]>(
        studentsDataInit.map(() => defaultQuestions.map(q => ({ ...q })))
    );
    const [selectedStudentIndex, setSelectedStudentIndex] = useState<number>(0);

    // Helper to sum marks for a student
    const getTotalMarks = (studentIdx: number) => {
        return questionsPerStudent[studentIdx]
            .reduce((sum, q) => sum + (parseFloat(q.marks) || 0), 0);
    };

    const [confirmAndProceed, setConfirmAndProceed] = useState<boolean>(false);

    // Handle input change for question marks
    const handleQuestionChange = (qIdx: number, field: 'number' | 'marks', value: string) => {
        setQuestionsPerStudent(prev => {
            const updated = prev.map(arr => arr.map(q => ({ ...q })));
            updated[selectedStudentIndex][qIdx][field] = value;
            // Update marksObtained in students as well
            const total = updated[selectedStudentIndex].reduce((sum, q) => sum + (parseFloat(q.marks) || 0), 0);
            setStudents(students => {
                const newStudents = [...students];
                newStudents[selectedStudentIndex] = {
                    ...newStudents[selectedStudentIndex],
                    marksObtained: total
                };
                return newStudents;
            });
            return updated;
        });
    };

    // When switching students, ensure marksObtained is up to date
    const handleSelectStudent = (index: number) => {
        // Update marksObtained for current student before switching
        setStudents(students => {
            const newStudents = [...students];
            newStudents[selectedStudentIndex] = {
                ...newStudents[selectedStudentIndex],
                marksObtained: getTotalMarks(selectedStudentIndex)
            };
            return newStudents;
        });
        setSelectedStudentIndex(index);
    };

    return (
        <div className="max-w-7xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-sm">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Answer Sheet Checking</h1>
                <button className="mt-4 sm:mt-0 bg-blue-600 text-white font-semibold py-2 px-6 rounded-md hover:bg-blue-700 transition-colors">
                    Manual Marks Entry
                </button>
            </div>

            <hr className="mb-8" />

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                    <label htmlFor="class-batch" className="text-md font-semibold text-gray-700">
                        Select Class/Batch :
                    </label>
                    <select
                        id="class-batch"
                        className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option>Class 12-B Science</option>
                        <option>Class 11-A Commerce</option>
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-md font-semibold text-gray-700">Exam Topic</label>
                    <div className="p-2 bg-gray-200 text-gray-600 rounded-md px-4">
                        Physics Thermodynamics
                    </div>
                </div>
                <button className="ml-auto bg-white text-green-600 border-2 border-green-500 font-semibold py-2 px-4 rounded-md hover:bg-green-50 transition-colors">
                    View Marks Data
                </button>
            </div>

            {/* Student Table */}
            <div className="bg-green-50/50 border border-green-200 rounded-lg p-3 mb-8">
                <div className="overflow-auto h-52">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-200">
                            <tr>
                                <th scope="col" className="px-6 py-3">Name</th>
                                <th scope="col" className="px-6 py-3">Roll</th>
                                <th scope="col" className="px-6 py-3">Email</th>
                                <th scope="col" className="px-6 py-3">Marks Obtained</th>
                                <th scope="col" className="px-6 py-3">Upload Answer Sheet</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student, index) => (
                                <tr
                                    key={index}
                                    className={`border-b cursor-pointer ${selectedStudentIndex === index ? 'bg-green-200/60' : 'hover:bg-green-100/70'}`}
                                    onClick={() => handleSelectStudent(index)}
                                >
                                    <td className="px-6 py-3 font-medium">{student.name}</td>
                                    <td className="px-6 py-3">{student.roll}</td>
                                    <td className="px-6 py-3">{student.email}</td>
                                    <td className="px-6 py-3">{student.marksObtained}</td>
                                    <td className="px-6 py-3">{student.answerSheet}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bottom Section */}
            {!confirmAndProceed && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* Left: Update Marks */}
                    <div className="border border-gray-200 rounded-lg p-4">
                        <h2 className="text-lg font-bold text-indigo-700 mb-4">Update Student Marks</h2>
                        <div className="space-y-3 h-48 overflow-y-auto pr-2">
                            {questionsPerStudent[selectedStudentIndex].map((q, index) => (
                                <div key={index} className="grid grid-cols-2 gap-3">
                                    <input
                                        type="text"
                                        placeholder="Question Number"
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                        value={q.number}
                                        onChange={e => handleQuestionChange(index, 'number', e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Marks For The Question"
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                        value={q.marks}
                                        onChange={e => handleQuestionChange(index, 'marks', e.target.value)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Totals and Remarks */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-lg font-bold text-indigo-700 mb-2">Total Marks Obtained</h2>
                                <div className="p-2 bg-gray-200 text-gray-600 rounded-md w-48 text-center">
                                    {getTotalMarks(selectedStudentIndex)}
                                </div>
                            </div>
                            <button
                                className="bg-indigo-700 text-white font-semibold py-2 px-6 rounded-md hover:bg-indigo-800 transition-colors"
                                onClick={() => {
                                    // Save current student's marks (already handled by state)
                                    // Move to next student if not last
                                    if (selectedStudentIndex < students.length - 1) {
                                        handleSelectStudent(selectedStudentIndex + 1);
                                    }
                                    // Optionally, to loop to first student, uncomment below:
                                    // else {
                                    //     handleSelectStudent(0);
                                    // }
                                }}
                            >
                                Save and Next
                            </button>
                        </div>

                        <div>
                            <label htmlFor="remarks" className="text-lg font-bold text-indigo-700 mb-2 block">
                                Add Remarks
                            </label>
                            <textarea
                                id="remarks"
                                placeholder="Write Your Remarks Here"
                                rows={4}
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Footer Buttons */}
            <div className="flex justify-end gap-4 mt-8">
                <button className="bg-white text-indigo-600 border-2 border-indigo-500 font-semibold py-2 px-4 rounded-md hover:bg-indigo-50 transition-colors">
                    Download Excel Sheet
                </button>
                <button className="bg-white text-green-600 border-2 border-green-500 font-semibold py-2 px-4 rounded-md hover:bg-green-50 transition-colors"
                    onClick={() => {
                        setConfirmAndProceed(true);
                        setSelectedStudentIndex(0);
                    }}>
                    Confirm and Proceed
                </button>
            </div>
        </div>
    );
};

export default ManualMarksEntry;