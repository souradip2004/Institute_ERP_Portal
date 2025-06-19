// components/PDFUploadComponent.tsx
'use client';

import { useState, useRef } from 'react';
import { FaFilePdf } from 'react-icons/fa';

interface PDFUploadComponentProps {
  onFileUpload: (file: File) => void;
  isUploading: boolean;
}

export function PDFUploadComponent({ onFileUpload, isUploading }: PDFUploadComponentProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
      } else {
        alert('Please select a PDF file');
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
      } else {
        alert('Please select a PDF file');
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFile) {
      onFileUpload(selectedFile);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className=" rounded-md mb-4" style={{ position: 'relative' }}>
        {/* <div className="absolute -top-4 left-2 bg-white px-1 text-black text-base font-normal">Upload Answer Sheet (PDF)</div> */}
        <div
          className={`flex flex-col items-center bg-gray-100 justify-center border-2 border-dashed rounded-md min-h-[120px] py-8 transition-colors ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-blue-300 bg-gray-50'}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="application/pdf"
            className="hidden"
          />
          <div className="flex flex-row items-center">
            <div className='' ><FaFilePdf className="text-4xl text-blue-500" /></div>
            <div className="flex flex-col items-center">
              <span className="text-gray-500 text-sm">( Drag and Drop Your files here )</span>
              <button
                type="button"
                onClick={handleBrowseClick}
                className="text-blue-700 underline text-sm mt-1"
                tabIndex={-1}
              >
                Choose From Computer
              </button>
              {selectedFile && (
                <span className="mt-2 text-sm text-gray-600">{selectedFile.name}</span>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-row items-center justify-between">
        <button
          type="submit"
          disabled={!selectedFile || isUploading}
          className={`w-40 h-10 rounded-md text-white text-lg font-semibold mt-2 ${!selectedFile || isUploading ? 'bg-purple-200 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}
        >
          {isUploading ? 'Uploading...' : 'Proceed'}
        </button>
        <button className="border border-blue-500 text-blue-500 px-4 py-2 rounded-md"
          onClick={() => window.location.reload()}
        >Upload New</button>
      </div>
    </form>
  );
}