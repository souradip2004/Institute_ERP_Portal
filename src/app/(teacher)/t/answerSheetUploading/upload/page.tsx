'use client';

import React, { useState, useRef } from 'react';
import { FiFileText } from 'react-icons/fi';

// Data types for our mock data
interface Student {
    name: string;
    roll: string;
    email: string;
    marksObtained: number;
    answerSheet: string;
}

// Mock data to populate the UI
const studentsData: Student[] = [
    { name: 'Arindam Kanrar', roll: '3456788765', email: 'mitanager@gmail.com', marksObtained: 0, answerSheet: 'my_answer.pdf' },
    { name: 'Arindam Kanrar', roll: '3456788765', email: 'mitanager@gmail.com', marksObtained: 0, answerSheet: 'my_answer.pdf' },
    { name: 'Arindam Kanrar', roll: '3456788765', email: 'mitanager@gmail.com', marksObtained: 0, answerSheet: 'my_answer.pdf' },
    { name: 'Arindam Kanrar', roll: '3456788765', email: 'mitanager@gmail.com', marksObtained: 0, answerSheet: 'my_answer.pdf' },
    { name: 'Arindam Kanrar', roll: '3456788765', email: 'mitanager@gmail.com', marksObtained: 0, answerSheet: 'my_answer.pdf' },
    { name: 'Arindam Kanrar', roll: '3456788765', email: 'mitanager@gmail.com', marksObtained: 0, answerSheet: 'my_answer.pdf' },
    { name: 'Arindam Kanrar', roll: '3456788765', email: 'mitanager@gmail.com', marksObtained: 0, answerSheet: 'my_answer.pdf' },
];

const StudentAnswerSheetUpload = () => {
    const [selectedStudentIndex, setSelectedStudentIndex] = useState<number>(0);
    const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Handles file selection and generates preview URLs
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const files = Array.from(event.target.files);
            const fileUrls = files.map(file => URL.createObjectURL(file));
            setUploadedFiles(prev => [...prev, ...fileUrls]);
        }
    };

    // Triggers the hidden file input
    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="max-w-7xl mx-auto p-6 sm:p-8">
            {/* Header */}
            <div className="border-b border-gray-200 pb-6 mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Answer Sheet Uploading</h1>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                    <label htmlFor="class-batch" className="text-md font-semibold text-gray-700">
                        Select Class/Batch :
                    </label>
                    <select
                        id="class-batch"
                        className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-100"
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
            </div>

            {/* Student Table */}
            <div className="bg-green-50/50 border border-green-200 rounded-lg p-3 mb-8">
                <div className="overflow-x-auto">
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
                    </table>
                </div>
                <div className="overflow-y-auto h-48">
                    <table className="w-full text-sm text-left text-gray-600">
                        <tbody>
                            {studentsData.map((student, index) => (
                                <tr
                                    key={index}
                                    className={`border-b cursor-pointer ${selectedStudentIndex === index ? 'bg-green-200/60' : 'hover:bg-green-100/70'
                                        }`}
                                    onClick={() => setSelectedStudentIndex(index)}
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

            {/* Upload and Preview Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
                {/* File Uploader */}
                <div
                    className="border-2 border-dashed border-indigo-300 rounded-lg flex flex-col justify-center items-center p-8 cursor-pointer h-80 hover:bg-indigo-50 transition-colors"
                    onClick={handleUploadClick}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        multiple
                        accept="image/*"
                        className="hidden"
                    />
                    <FiFileText className="text-indigo-500 mb-4" size={50} />
                    <p className="text-xl font-bold text-indigo-600">Upload Answer-Sheet</p>
                    <p className="text-sm text-gray-500 mt-1">(Upload Images)</p>
                </div>

                {/* Image Previews */}
                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 h-80">
                    <button className="absolute -top-4 -right-4 bg-indigo-700 text-white font-semibold py-2 px-6 rounded-md hover:bg-indigo-800 transition-colors z-10">
                        Save and Next
                    </button>
                    <div className="h-full overflow-y-auto pr-2">
                        {uploadedFiles.length > 0 ? (
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                                {uploadedFiles.map((url, index) => (
                                    <div key={index} className="aspect-w-1 aspect-h-1">
                                        <img src={url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover rounded-lg border border-gray-300" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex justify-center items-center h-full text-gray-400">
                                <p>Image previews will appear here</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer Button */}
            <div className="flex justify-end mt-8">
                <button className="bg-white text-green-600 border-2 border-green-500 font-semibold py-2 px-6 rounded-md hover:bg-green-50 transition-colors">
                    Save and Proceed
                </button>
            </div>
        </div>
    );
};

export default StudentAnswerSheetUpload;