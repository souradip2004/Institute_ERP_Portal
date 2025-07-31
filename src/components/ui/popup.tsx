'use client';

import React from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

interface PopupProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'success' | 'error';
    title: string;
    message: string;
}

const Popup: React.FC<PopupProps> = ({ isOpen, onClose, type, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 ease-out scale-100">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        {type === 'success' ? (
                            <CheckCircle className="h-6 w-6 text-green-500" />
                        ) : (
                            <AlertCircle className="h-6 w-6 text-red-500" />
                        )}
                        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <p className="text-gray-600 leading-relaxed">{message}</p>
                </div>

                {/* Footer */}
                <div className="flex justify-end p-6 pt-0">
                    <button
                        onClick={onClose}
                        className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${type === 'success'
                            ? 'bg-green-500 hover:bg-green-600 text-white'
                            : 'bg-red-500 hover:bg-red-600 text-white'
                            }`}
                    >
                        Got it
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Popup;