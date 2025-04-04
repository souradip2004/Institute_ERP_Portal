import { useState } from "react";
import { API_URLS, API_AUTH_TOKEN } from "../lib/constants";
import { splitChunksIntoLines } from "./useChunkProcessing";

interface SummaryResponse {
    message: number;
    text: string;
    chunks: string[];
}

export interface SummaryData {
    summary: string;
    chunks: string[];
    lines?: string[];
    pdfUrl?: string;
}

export const useSummaryChunks = () => {
    const [data, setData] = useState<SummaryData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const fetchSummaryChunks = async (pdfUrl: string): Promise<SummaryData> => {
        try {
            setIsLoading(true);
            console.log("Fetching summary and chunks for PDF:", pdfUrl);
            
            const response = await fetch(API_URLS.SUMMARY_CHUNKS_API, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${API_AUTH_TOKEN}`
                },
                body: JSON.stringify({ file_path: pdfUrl }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json() as SummaryResponse;
            
            if (result.message === 1) {
                const chunks = result.chunks || [];
                const summaryData: SummaryData = {
                    summary: result.text,
                    chunks: chunks,
                    lines: splitChunksIntoLines(chunks),
                    pdfUrl: pdfUrl
                };
                
                console.log("Summary data processed:", {
                    summaryLength: result.text.length,
                    chunksCount: chunks.length
                });
                
                setData(summaryData);
                setIsLoading(false);
                return summaryData;
            } else {
                throw new Error(result.text || "Failed to process PDF");
            }
        } catch (err) {
            console.error("Summary chunks API error:", err);
            setError("Failed to fetch summary and chunks");
            setIsLoading(false);
            
            // Return empty data as fallback
            const emptyData: SummaryData = {
                summary: "This is falback hlo hlo hi",
                chunks: ["aaaaaaaaa", "bbbbbbbbbb", "cccccccccc"],
                lines: [],
                pdfUrl: pdfUrl
            };
            
            setData(emptyData);
            throw err;
        }
    };

    return { data, error, isLoading, fetchSummaryChunks };
};
