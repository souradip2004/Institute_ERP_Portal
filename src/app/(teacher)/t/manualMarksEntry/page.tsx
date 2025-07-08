'use client';

import React, { useState, useMemo } from 'react';
import { FiPlusCircle, FiTrash2 } from 'react-icons/fi';

interface Question {
    number: string;
    marks: string;
}

const AnswerSheetForm = () => {
    // State for the dynamic list of questions
    const [questions, setQuestions] = useState<Question[]>([
        { number: '', marks: '' },
        { number: '', marks: '' },
        { number: '', marks: '' },
        { number: '', marks: '' },
        { number: '', marks: '' },
    ]);

    // Handler to add a new question row
    const handleAddQuestion = () => {
        setQuestions([...questions, { number: '', marks: '' }]);
    };

    // Handler to delete a question row
    const handleDeleteQuestion = (index: number) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    // Handler to update a specific question's details
    const handleQuestionChange = (index: number, field: keyof Question, value: string) => {
        const newQuestions = [...questions];
        newQuestions[index][field] = value;
        setQuestions(newQuestions);
    };

    // Calculate total questions and marks
    const { totalQuestions, totalMarks } = useMemo(() => {
        const totalMarks = questions.reduce((sum, q) => sum + (parseInt(q.marks, 10) || 0), 0);
        return {
            totalQuestions: questions.length,
            totalMarks,
        };
    }, [questions]);

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

            {/* Main Form Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Left Column */}
                <div className="space-y-8">
                    <div>
                        <label htmlFor="class-batch" className="text-md font-semibold text-gray-700 mb-2 block">
                            Select Class/Batch :
                        </label>
                        <select
                            id="class-batch"
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option>Class 12-B Science</option>
                            <option>Class 11-A Commerce</option>
                            <option>Class 10-C</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-md font-bold text-indigo-700 mb-2 block">
                            Upload Reference Answer-Sheet
                        </label>
                        <div className="w-full p-3 border border-gray-300 rounded-md text-gray-500">
                            <input type="file" id="file-upload" className="hidden" />
                            <label htmlFor="file-upload" className="cursor-pointer">
                                No File Chosen
                            </label>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="exam-title" className="text-md font-bold text-indigo-700 mb-2 block">
                            Exam Title
                        </label>
                        <input
                            type="text"
                            id="exam-title"
                            placeholder="Write Your Title Here"
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="exam-description" className="text-md font-bold text-indigo-700 mb-2 block">
                            Exam Description
                        </label>
                        <textarea
                            id="exam-description"
                            placeholder="Write Your Description Here"
                            rows={5}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                </div>

                {/* Right Column */}
                <div className="border border-gray-200 rounded-lg p-6 h-fit">
                    <h2 className="text-xl font-bold text-indigo-700 mb-6">Update Marks Per Questions</h2>
                    <div className="space-y-4">
                        {questions.map((q, index) => (
                            <div key={index} className="grid grid-cols-2 md:grid-cols-3 gap-4 items-center">
                                <input
                                    type="text"
                                    placeholder="Question Number"
                                    value={q.number}
                                    onChange={(e) => handleQuestionChange(index, 'number', e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                                <input
                                    type="text"
                                    placeholder="Marks For The Question"
                                    value={q.marks}
                                    onChange={(e) => handleQuestionChange(index, 'marks', e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleDeleteQuestion(index)}
                                    className="text-red-500 hover:text-red-700 flex justify-center items-center"
                                    aria-label="Delete Question"
                                >
                                    <FiTrash2 size={20} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4">
                        <button onClick={handleAddQuestion} className="text-blue-600 hover:text-blue-800">
                            <FiPlusCircle size={24} />
                        </button>
                    </div>

                    <hr className="my-6" />

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-100 p-3 rounded-md text-center text-gray-600 font-medium">
                            Total Questions: {totalQuestions}
                        </div>
                        <div className="bg-gray-100 p-3 rounded-md text-center text-gray-600 font-medium">
                            Total Marks: {totalMarks}
                        </div>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="mt-12 flex justify-center">
                <button className="bg-green-600 text-white font-bold py-3 px-12 rounded-md hover:bg-green-700 transition-colors text-lg"
                    onClick={() => {
                        window.location.href = '/t/manualMarksEntry/updateStudentMarks';
                    }}
                >
                    Save Configuration
                </button>
            </div>
        </div>
    );
};

export default AnswerSheetForm;