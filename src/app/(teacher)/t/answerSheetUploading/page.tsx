'use client';

import React from 'react';

const AnswerSheetUpload = () => {
    return (
        <div className="w-full">
            {/* Header Section */}
            <div className="p-6 sm:p-8 border-b border-gray-200">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                    Answer Sheet Uploading
                </h1>
            </div>

            {/* Main Content Centering Container */}
            <div className="flex justify-center items-center pt-24 sm:pt-32">

                {/* The main form box */}
                <div className="border border-gray-200 rounded-xl p-8 sm:p-12 w-full max-w-2xl shadow-sm bg-[#F9F9F9]">
                    <div className="space-y-8">

                        {/* Select Class/Batch Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-4">
                            <label
                                htmlFor="class-batch"
                                className="font-semibold text-indigo-600 text-base sm:text-right col-span-1"
                            >
                                Select Class/Batch :
                            </label>
                            <select
                                id="class-batch"
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 col-span-2"
                            >
                                <option>Class 12-B Science</option>
                                <option>Class 11-A Commerce</option>
                                <option>Class 10-C</option>
                            </select>
                        </div>

                        {/* Select Exam Topic Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-4">
                            <label
                                htmlFor="exam-topic"
                                className="font-semibold text-indigo-600 text-base sm:text-right col-span-1"
                            >
                                Select Exam Topic :
                            </label>
                            <select
                                id="exam-topic"
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 col-span-2"
                            >
                                <option>Topic ABC</option>
                                <option>Topic XYZ</option>
                            </select>
                        </div>

                    </div>

                    {/* Proceed Button */}
                    <div className="mt-12 flex justify-center">
                        <button className="bg-indigo-600 text-white font-semibold py-3 px-12 rounded-lg hover:bg-indigo-700 transition-colors"
                            onClick={() => {
                                window.location.href = '/t/answerSheetUploading/upload';
                            }}
                        >
                            Proceed
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AnswerSheetUpload;