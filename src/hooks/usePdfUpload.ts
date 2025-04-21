import { useState } from "react";
import { API_URLS } from "../lib/constants";

export const useUploadPdf = () => {
    const [uploading, setUploading] = useState(false);
    const [fileUrl, setFileUrl] = useState(null);
    const [error, setError] = useState<string | null>(null);

    const uploadPdf = async (pdfFile: string | Blob) => {
        if (!pdfFile) {
            setError("No file selected");
            return null;
        }

        setUploading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append("pdf", pdfFile);
            
            // Add AWS credentials to the request for S3 upload
            formData.append("awsAccessKey", API_URLS.AWS_ACCESS_KEY);
            formData.append("awsSecretKey", API_URLS.AWS_SECRET_KEY);
            formData.append("awsRegion", API_URLS.AWS_REGION);
            formData.append("bucketName", API_URLS.S3_BUCKET_NAME);

            console.log("Uploading PDF to S3...");
            const response = await fetch(API_URLS.PDF_UPLOAD_API, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                console.log("PDF uploaded successfully:", result.url);
                setFileUrl(result.url);
                return result.url;
            } else {
                throw new Error(result.message || "File upload failed");
            }
        } catch (err) {
            console.error("PDF upload error:", err);
            if (err instanceof Error) {
                setError(err.message || "Error uploading PDF");
            } else {
                setError("Error uploading PDF");
            }
            return null;
        } finally {
            setUploading(false);
        }
    };

    return { uploadPdf, uploading, fileUrl, error };
};
