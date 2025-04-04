export const API_URLS = {
    // AWS Configuration
    AWS_ACCESS_KEY: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY ,
    AWS_SECRET_KEY: process.env.NEXT_PUBLIC_AWS_SECRET_KEY ,
    AWS_REGION: process.env.NEXT_PUBLIC_AWS_REGION ,
    S3_BUCKET_NAME: process.env.NEXT_PUBLIC_S3_BUCKET_NAME ,
    
    // API Endpoints
    PDF_UPLOAD_API: process.env.NEXT_PUBLIC_PDF_UPLOAD_API || "http://localhost/pdfUpload/upload",
    SUMMARY_CHUNKS_API: process.env.NEXT_PUBLIC_SUMMARY_CHUNKS_API || "https://textsummarization-0d35868-v1.app.beam.cloud/",
    AUDIO_PROCESSING_API: process.env.NEXT_PUBLIC_AUDIO_PROCESSING_API || "https://auido-processing-22f6d13-v2.app.beam.cloud/",
    IMAGE_API: process.env.NEXT_PUBLIC_IMAGE_API || "https://sdxl-lightning-eaa3a25-v6.app.beam.cloud/",
    TEACHER_VIDEO_API: process.env.NEXT_PUBLIC_TEACHER_VIDEO_API || "https://deepfake-3287ab4-v18.app.beam.cloud/",
  };
  
  export const API_AUTH_TOKEN = process.env.NEXT_PUBLIC_API_AUTH_TOKEN ;