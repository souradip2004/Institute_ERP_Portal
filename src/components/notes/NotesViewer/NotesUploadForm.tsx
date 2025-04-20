'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { processNotesData, splitPdfToImages } from './api';
import { TrialData } from './types';

interface NotesUploadFormProps {
    onSubmit: (pdfUrl: string, trialData: TrialData) => void;
    initialPdfUrl?: string;
}

export default function NotesUploadForm({ onSubmit, initialPdfUrl }: NotesUploadFormProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [link, setLink] = useState<string>(initialPdfUrl || '');
    const [lang, setLang] = useState<string>('hinglish');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const uploadPdf = async (pdfFile: File | null) => {
        if (!pdfFile) {
            setError("No file selected");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append("pdf", pdfFile);

            const response = await fetch("/api/upload/pdf", {
                method: "POST",
                body: formData,
            });

            const result = await response.json();

            if (result.success) {
                setLink(result.fileUrl);
                return result.fileUrl;
            } else {
                throw new Error(result.message || "File upload failed");
            }
        } catch (err: any) {
            setError(err.message);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // If there's no link yet but there is a selected file, upload it first
            const pdfUrl = link || await uploadPdf(selectedFile);

            if (!pdfUrl) {
                setError("Please upload a PDF file or provide a URL");
                setIsLoading(false);
                return;
            }

            // Split PDF into images
            const images = await splitPdfToImages(pdfUrl);

            // Process the images to get trial data
            const trialData = await processNotesData(images);

            // Call the parent component's onSubmit with the results
            onSubmit(pdfUrl, trialData);
        } catch (err: any) {
            setError(err.message || "Failed to process PDF");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-blue-50 to-indigo-50 px-4 py-10">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">
                    <span className="inline-block mr-2">📄</span>
                    Notes Viewer
                </h1>
                <p className="text-gray-600">
                    Transform your PDF notes into an interactive learning experience
                </p>
            </div>

            <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 mb-6">
                <Label htmlFor="pdf-upload" className="block text-sm font-medium text-gray-700 mb-2">
                    Upload your PDF notes
                </Label>
                <div className="flex items-center">
                    <input
                        id="pdf-upload"
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                <Button
                    onClick={() => uploadPdf(selectedFile)}
                    disabled={!selectedFile || isLoading}
                    className="mt-4 w-full"
                >
                    {isLoading ? "Uploading..." : "Upload"}
                </Button>
            </div>

            {link && (
                <div className="w-full max-w-xl bg-white rounded-xl shadow-lg p-6 mb-8">
                    <div className="flex items-center text-green-600 mb-4">
                        <svg
                            className="h-5 w-5 mr-2"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <span>PDF uploaded successfully</span>
                    </div>

                    <div className="mb-6">
                        <iframe
                            src={link}
                            className="w-full h-96 border border-gray-200 rounded-lg"
                            title="PDF Preview"
                        ></iframe>
                    </div>

                    <div className="mb-4">
                        <Label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
                            Choose output language:
                        </Label>
                        <Select defaultValue={lang} onValueChange={setLang}>
                            <SelectTrigger id="language">
                                <SelectValue placeholder="Select a language" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="english">English</SelectItem>
                                <SelectItem value="hindi">Hindi</SelectItem>
                                <SelectItem value="hinglish">Hinglish</SelectItem>
                                <SelectItem value="tamil">Tamil</SelectItem>
                                <SelectItem value="telugu">Telugu</SelectItem>
                                <SelectItem value="kannada">Kannada</SelectItem>
                                <SelectItem value="malayalam">Malayalam</SelectItem>
                                <SelectItem value="bengali">Bengali</SelectItem>
                                <SelectItem value="marathi">Marathi</SelectItem>
                                <SelectItem value="gujarati">Gujarati</SelectItem>
                                <SelectItem value="punjabi">Punjabi</SelectItem>
                                <SelectItem value="urdu">Urdu</SelectItem>
                                <SelectItem value="assamese">Assamese</SelectItem>
                                <SelectItem value="odisha">Odia</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            )}

            {error && (
                <div className="w-full max-w-md bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
                    {error}
                </div>
            )}

            <Button
                onClick={handleSubmit}
                disabled={(!link && !selectedFile) || isLoading}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-lg shadow-md hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105"
            >
                {isLoading ? "Processing..." : "Start Learning 🚀"}
            </Button>
        </div>
    );
} 