// components/PDFUploadComponent.tsx
'use client';

import { useState, useRef } from 'react';
import { FaFilePdf, FaTimes } from 'react-icons/fa';
import jsPDF from 'jspdf';

interface PDFUploadComponentProps {
  onFileUpload: (file: File) => void;
  isUploading: boolean;
}

export function PDFUploadComponent({ onFileUpload, isUploading }: PDFUploadComponentProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to check if files are mixed (pdf + images)
  const isMixedFiles = (files: File[]) => {
    const hasPdf = files.some((file) => file.type === 'application/pdf');
    const hasImage = files.some((file) => file.type.startsWith('image/'));
    return hasPdf && hasImage;
  };

  // Helper to check if all files are images
  const isAllImages = (files: File[]) => files.length > 0 && files.every((file) => file.type.startsWith('image/'));

  // Helper to convert images to PDF using jsPDF
  const imagesToPdf = async (imageFiles: File[]): Promise<File> => {
    const pdf = new jsPDF();
    for (let i = 0; i < imageFiles.length; i++) {
      const imgData = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(imageFiles[i]);
      });
      const img = new window.Image();
      img.src = imgData;
      await new Promise((res) => { img.onload = res; });
      const width = pdf.internal.pageSize.getWidth();
      const height = (img.height * width) / img.width;
      if (i > 0) pdf.addPage();
      // Detect image type from file
      const fileType = imageFiles[i].type;
      let format = 'JPEG';
      if (fileType === 'image/png') format = 'PNG';
      else if (fileType === 'image/webp') format = 'WEBP';
      // Add image in detected format
      pdf.addImage(imgData, format, 0, 0, width, height);
    }
    const pdfBlob = pdf.output('blob');
    return new File([pdfBlob], 'images.pdf', { type: 'application/pdf' });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).filter(
        (file) => file.type === 'application/pdf' || file.type.startsWith('image/')
      );
      if (files.length > 0) {
        const allFiles = [...selectedFiles, ...files];
        if (isMixedFiles(allFiles)) {
          alert('Cannot upload PDF and images together. Please upload either PDF or images.');
          window.location.reload();
          return;
        }
        setSelectedFiles((prev) => [...prev, ...files]);
      } else {
        alert('Please select PDF or image files');
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files) {
      const files = Array.from(e.dataTransfer.files).filter(
        (file) => file.type === 'application/pdf' || file.type.startsWith('image/')
      );
      if (files.length > 0) {
        const allFiles = [...selectedFiles, ...files];
        if (isMixedFiles(allFiles)) {
          alert('Cannot upload PDF and images together. Please upload either PDF or images.');
          window.location.reload();
          return;
        }
        setSelectedFiles((prev) => [...prev, ...files]);
      } else {
        alert('Please select PDF or image files');
      }
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length > 0) {
      if (isAllImages(selectedFiles)) {
        // Convert images (even if only 1) to PDF and upload
        const pdfFile = await imagesToPdf(selectedFiles);
        onFileUpload(pdfFile);
      } else {
        // Single PDF
        onFileUpload(selectedFiles[0]);
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

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="rounded-md mb-4" style={{ position: 'relative' }}>
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
            accept="application/pdf,image/*"
            className="hidden"
            multiple
          />
          <div className="flex flex-row items-center">
            <div className=""><FaFilePdf className="text-4xl text-blue-500" /></div>
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
            </div>
          </div>
        </div>
      </div>
      {/* Scrollable grid list of uploaded files */}
      {selectedFiles.length > 0 && (
        <div className="mb-4 max-h-40 overflow-y-auto">
          <div className="grid grid-cols-3 gap-4">
            {selectedFiles.map((file, idx) => (
              <div key={idx} className="relative flex flex-col items-center border rounded p-2 bg-white">
                <button
                  type="button"
                  className="absolute top-1 right-1 text-red-500 hover:text-red-700"
                  onClick={() => handleRemoveFile(idx)}
                  aria-label="Remove file"
                >
                  <FaTimes />
                </button>
                {file.type.startsWith('image/') ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-16 h-16 object-cover rounded mb-1"
                  />
                ) : (
                  <FaFilePdf className="text-4xl text-blue-500 mb-1" />
                )}
                <span className="text-xs text-center break-all max-w-[64px]">{file.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="flex flex-row items-center justify-between">
        <button
          type="submit"
          disabled={selectedFiles.length === 0 || isUploading}
          className={`w-40 h-10 rounded-md text-white text-lg font-semibold mt-2 ${selectedFiles.length === 0 || isUploading ? 'bg-purple-200 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}
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