"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Upload, Play } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useToast } from '../hooks/use-toast'; // Changed import path
import DualVideoPlayer from './DualVideoPlayer';

// Import custom hooks
import { useUploadPdf } from '../hooks/usePdfUpload';
import { useSummaryChunks, SummaryData } from '../hooks/useSummaryChunks';
import { useAudioProcessingApi } from '../hooks/useAudioProcessingApi';
import { useChunkProcessing } from '../hooks/useChunkProcessing';
import { useImageApi } from '../hooks/useImageApi';
import { useTeacherVideo } from '../hooks/useTeacherVideo';

interface ProcessingState {
  step: string;
  progress: number;
}

const PdfToVideoController: React.FC = () => {
  // Replace react-hot-toast with useToast
  const { toast } = useToast();
  
  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUpload, setIsUpload] = useState(false);
  const [text, setText] = useState("");
  
  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingState, setProcessingState] = useState<ProcessingState>({
    step: 'Idle',
    progress: 0,
  });
  
  // Video player state
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [teacherVideoUrl, setTeacherVideoUrl] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [readyToPlay, setReadyToPlay] = useState(false);
  const [videoTitle, setVideoTitle] = useState<string>("Educational Video");
  
  // Hooks
  const { uploadPdf, uploading, fileUrl, error: uploadError } = useUploadPdf();
  const { fetchSummaryChunks, error: summaryError } = useSummaryChunks();
  const { processChunk } = useAudioProcessingApi();
  const { processChunk: splitIntoSentences } = useChunkProcessing();
  const { generateImagesForSentences, preloadImages } = useImageApi();
  const { generateTeacherVideo, videoUrl } = useTeacherVideo();

  // Handle text input changes
  const handleText = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  };

  // Handle submit search
  const handleSearch = () => {
    if (text) {
      // Update toast notification using the new toast API
      toast({
        title: "Search feature coming soon!",
        description: "This functionality will be available in a future update.",
      });
    }
  };

  // Process dropped files
  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log(acceptedFiles);
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
      setIsUpload(true);
      setVideoTitle(`Video: ${acceptedFiles[0].name.replace('.pdf', '')}`);
      
      // Update toast notification
      toast({
        title: "File selected",
        description: `${acceptedFiles[0].name}`,
      });
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1
  });

  // Process PDF
  const handleProcessPdf = async () => {
    if (!selectedFile) {
      // Update error toast
      toast({
        title: "Error",
        description: "Please select a PDF file first",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessing(true);
      setReadyToPlay(false);
      
      // Step 1: Upload PDF to S3
      setProcessingState({
        step: 'Uploading PDF to S3...',
        progress: 10,
      });
      
      const uploadedPdfUrl = await uploadPdf(selectedFile);
      
      if (!uploadedPdfUrl) {
        throw new Error('PDF upload failed');
      }
      
      toast({
        title: "Success",
        description: "PDF uploaded successfully",
      });
      
      // Step 2: Convert PDF to summary chunks
      setProcessingState({
        step: 'Extracting content from PDF...',
        progress: 30,
      });
      
      const summary = await fetchSummaryChunks(uploadedPdfUrl);
      setSummaryData(summary);
      
      if (!summary || !summary.chunks || summary.chunks.length === 0) {
        throw new Error('Failed to extract content from PDF');
      }
      
      toast({
        title: "Success",
        description: "Content extracted successfully",
      });
      
      // Step 3: Process audio from summary
      setProcessingState({
        step: 'Converting text to audio...',
        progress: 50,
      });
      
      const fullText = summary.summary || summary.chunks.join(' ');
      const audioResult = await processChunk(fullText, 'english', `pdf_${Date.now()}`, 1, '');
      
      // Calculate total audio duration from sentence durations
      let totalDuration = 0;
      Object.values(audioResult.sentence_with_audio_durations).forEach(([_, duration]) => {
        totalDuration += duration;
      });
      
      setAudioDuration(totalDuration);
      toast({
        title: "Success",
        description: "Audio generated successfully",
      });
      
      // Step 4: Process chunks into sentences
      setProcessingState({
        step: 'Processing content chunks...',
        progress: 60,
      });
      
      const allSentences: string[] = [];
      summary.chunks.forEach(chunk => {
        const sentences = splitIntoSentences(chunk);
        allSentences.push(...sentences);
      });
      
      // Step 5: Generate images for each sentence
      setProcessingState({
        step: 'Generating images for content...',
        progress: 70,
      });
      
      const images = await generateImagesForSentences(allSentences);
      setImageUrls(images);
      toast({
        title: "Success",
        description: "Images generated successfully",
      });
      
      // Step 6: Generate teacher video
      setProcessingState({
        step: 'Creating teacher video...',
        progress: 90,
      });
      
      await generateTeacherVideo(audioResult["Chunk Audio url"], 1, `pdf_${Date.now()}`);
      setTeacherVideoUrl(videoUrl);
      
      // Complete processing
      setProcessingState({
        step: 'Processing complete!',
        progress: 100,
      });
      
      toast({
        title: "Success",
        description: "Video ready to play!",
      });
      setReadyToPlay(true);
      
    } catch (error) {
      console.error('Error processing PDF:', error);
      
      toast({
        title: "Error",
        description: "Error occurred during processing. Using fallback data.",
        variant: "destructive",
      });
      
      // Set dummy data for fallback
      setProcessingState({
        step: 'Error occurred. Using fallback data...',
        progress: 100,
      });
      
      // Fallback data
      setAudioDuration(60); // 60 seconds
      
      // Generate dummy images if needed
      if (imageUrls.length === 0) {
        const dummyImages = Array(10).fill(0).map((_, i) => 
          `https://picsum.photos/seed/${i + 100}/800/600`
        );
        setImageUrls(dummyImages);
      }
      
      // Set fallback teacher video
      if (!teacherVideoUrl) {
        setTeacherVideoUrl("https://cdn.pixabay.com/video/2025/03/12/264272_large.mp4");
      }
      
      setReadyToPlay(true);
      
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
      }, 1000);
    }
  };

  // Sync videoUrl from the hook
  useEffect(() => {
    if (videoUrl) {
      setTeacherVideoUrl(videoUrl);
    }
  }, [videoUrl]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-black px-4 py-12">
      {!readyToPlay ? (
        <section className="w-full min-h-screen flex flex-col items-center justify-center gap-y-6">
          {/* Header Section */}
          <div className="w-full max-w-4xl font-bold text-center mb-8">
            <h1 className="text-white text-4xl md:text-5xl leading-tight mb-4">
              Study with any Text/Image/PDF/Questions
            </h1>
            <p className="text-gray-300 text-lg md:text-xl leading-relaxed w-full md:w-4/5 mx-auto">
              Join millions of students, researchers and professionals to instantly answer questions and understand research with AI
            </p>
          </div>

          {/* Upload Options */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 w-full max-w-4xl">
            {/* PDF Upload Box */}
            <div 
              {...getRootProps()}
              className="relative w-full md:w-1/2 aspect-square max-w-xs border border-dashed border-white rounded-xl flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-transform bg-blue-950/30"
            >
              <input {...getInputProps()} name="file" />
              <div className="text-center p-6">
                <div className="mx-auto mb-4 w-16 h-16 flex items-center justify-center">
                  <Upload className="w-12 h-12 text-white" />
                </div>
                <p className="text-white font-medium mb-1">Drop PDF here</p>
                <p className="text-gray-400 text-sm">Browse to upload</p>
              </div>
              {isDragActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white rounded-xl">
                  Drop the files here...
                </div>
              )}
            </div>

            {/* Numericals Ask Box */}
            <div 
              className="relative w-full md:w-1/2 aspect-square max-w-xs rounded-xl flex flex-col items-center justify-center cursor-pointer transition-transform hover:scale-105 bg-blue-600"
              onClick={() => toast({
                title: "Coming Soon!",
                description: "This feature will be available in a future update."
              })}
            >
              <div className="text-center p-6">
                <div className="mx-auto mb-4 w-16 h-16 flex items-center justify-center">
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="6" y="6" width="12" height="12" stroke="white" strokeWidth="2"/>
                    <rect x="22" y="6" width="12" height="12" stroke="white" strokeWidth="2"/>
                    <rect x="6" y="22" width="12" height="12" stroke="white" strokeWidth="2"/>
                    <rect x="22" y="22" width="12" height="12" stroke="white" strokeWidth="2"/>
                  </svg>
                </div>
                <p className="text-white font-medium mb-1">Ask your</p>
                <p className="text-white font-medium">Numericals</p>
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 text-white rounded-xl">
                <p className="text-center text-xl font-medium">Coming Soon</p>
              </div>
            </div>
          </div>

          {/* Search Section */}
          <div className="w-full max-w-3xl mt-10">
            <p className="text-center text-lg mb-4">
              <span className="text-white">You can also </span>
              <span className="text-blue-500 font-medium">search</span>
              <span className="text-white"> for your answers below</span>
            </p>

            {/* Search Input */}
            <div className="relative w-full">
              <div className="bg-blue-950/30 border border-blue-500 rounded-full flex items-center p-2 shadow-lg shadow-blue-900/20">
                <div className="flex items-center justify-center ml-2 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input 
                  type="text" 
                  className="flex-grow bg-transparent text-white text-lg placeholder-gray-400 outline-none" 
                  placeholder="Ask your doubt"
                  value={text} 
                  onChange={handleText}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button 
                  onClick={handleSearch}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full transition-colors ml-2"
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          {/* Process Button Section */}
          <div className="w-full max-w-3xl mt-10">
            {selectedFile && !isProcessing && (
              <div className="text-center">
                <p className="text-green-400 mb-2">
                  {selectedFile.name} selected
                </p>
                <Button 
                  onClick={handleProcessPdf}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-3 rounded-lg text-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Process PDF
                </Button>
              </div>
            )}

            {/* Progress Section */}
            {isProcessing && (
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing PDF
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-300">{processingState.step}</p>
                    <Progress value={processingState.progress} className="h-2 bg-gray-700" />
                    <p className="text-sm text-gray-400">This may take a few minutes...</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      ) : (
        <section className="w-full">
          <DualVideoPlayer 
            title={videoTitle}
            teacherVideoUrl={teacherVideoUrl || ""}
            images={imageUrls}
            audioDuration={audioDuration}
          />
          <div className="mt-8 text-center">
            <Button
              onClick={() => setReadyToPlay(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Process Another PDF
            </Button>
          </div>
        </section>
      )}
    </div>
  );
};

export default PdfToVideoController;
