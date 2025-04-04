import React from 'react';
import PdfToVideoController from '@/components/PdfToVideoController';

export default function PdfToVideoPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">PDF to Video Converter</h1>
      <PdfToVideoController />
    </div>
  );
}