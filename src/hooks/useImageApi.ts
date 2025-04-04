import { useState, useEffect, useCallback, useRef } from "react";
import { API_URLS, API_AUTH_TOKEN } from "../lib/constants";

interface ImageResponse {
    image?: string;
}

interface CachedImage {
    url: string;
    isLoaded: boolean;
    element: HTMLImageElement | null;
}

export const useImageApi = () => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    
    // Cache for generated images
    const imageCache = useRef<Map<string, CachedImage>>(new Map());
    const requestTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());
    
    // Clear all request timeouts on unmount
    useEffect(() => {
        return () => {
            requestTimeouts.current.forEach(timeout => clearTimeout(timeout));
            requestTimeouts.current.clear();
        };
    }, []);
    
    // Preload an image to ensure it's in the browser cache
    const preloadImage = useCallback((url: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            if (!url) {
                reject(new Error("No URL provided for preloading"));
                return;
            }
            
            // Check if already cached and loaded
            const cached = imageCache.current.get(url);
            if (cached && cached.isLoaded) {
                resolve();
                return;
            }
            
            const img = new Image();
            img.onload = () => {
                // Update cache
                imageCache.current.set(url, { url, isLoaded: true, element: img });
                resolve();
            };
            img.onerror = () => {
                reject(new Error(`Failed to preload image: ${url}`));
            };
            img.src = url;
            
            // Add to cache as loading
            imageCache.current.set(url, { url, isLoaded: false, element: img });
        });
    }, []);

    const fetchImage = async (prompt: string): Promise<string> => {
        try {
            // Check if we already have this prompt in cache
            const cachedPrompt = Array.from(imageCache.current.entries())
                .find(([key, _]) => key.includes(prompt));
            
            if (cachedPrompt) {
                console.log("Using cached image for prompt:", prompt);
                return cachedPrompt[1].url;
            }
            
            setIsLoading(true);
            console.log("Fetching image for prompt:", prompt);
            
            // Create a timeout to fail the request if it takes too long
            const timeoutPromise = new Promise<never>((_, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error("Image request timed out after 15 seconds"));
                }, 15000);
                
                requestTimeouts.current.set(prompt, timeout);
            });
            
            // Actual API request
            const fetchPromise = fetch(API_URLS.IMAGE_API, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${API_AUTH_TOKEN}`
                },
                body: JSON.stringify({ prompt }),
            });
            
            // Race between the timeout and the fetch
            const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;
            
            // Clear the timeout if the request succeeded
            if (requestTimeouts.current.has(prompt)) {
                clearTimeout(requestTimeouts.current.get(prompt)!);
                requestTimeouts.current.delete(prompt);
            }

            if (!response.ok) {
                throw new Error(`Image API HTTP error! status: ${response.status}`);
            }

            const result = await response.json() as ImageResponse;
            const imageUrl = result.image || "";
            
            if (!imageUrl) {
                throw new Error("No image URL returned from API");
            }
            
            // Preload the image
            await preloadImage(imageUrl);
            
            setImageUrl(imageUrl);
            setIsLoading(false);
            
            // Cache the result with the prompt as key
            imageCache.current.set(`${prompt}_${Date.now()}`, { 
                url: imageUrl, 
                isLoaded: true,
                element: null 
            });
            
            console.log("Image generated successfully");
            return imageUrl;
        } catch (err) {
            console.error("Image API error:", err);
            setError("Failed to fetch image URL");
            setIsLoading(false);
            
            // Generate a consistent fallback based on the prompt
            const promptHash = prompt.split('').reduce((a, b) => {
                a = (a << 5) - a + b.charCodeAt(0);
                return a & a;
            }, 0);
            
            const dummyImageUrl = `https://picsum.photos/seed/${Math.abs(promptHash)}/800/600`;
            setImageUrl(dummyImageUrl);
            
            // Preload the fallback image
            await preloadImage(dummyImageUrl);
            
            return dummyImageUrl;
        }
    };

    // Generate multiple images based on sentences
    const generateImagesForSentences = async (sentences: string[]): Promise<string[]> => {
        try {
            setIsLoading(true);
            console.log(`Generating ${sentences.length} images for sentences`);
            
            if (sentences.length === 0) {
                setIsLoading(false);
                return [];
            }
            
            // Process in batches to avoid overwhelming the API
            const batchSize = 3;
            const imageUrls: string[] = [];
            
            for (let i = 0; i < sentences.length; i += batchSize) {
                const batch = sentences.slice(i, i + batchSize);
                const batchPromises = batch.map(sentence => fetchImage(sentence));
                const batchResults = await Promise.all(batchPromises);
                imageUrls.push(...batchResults);
            }
            
            setIsLoading(false);
            
            console.log(`Successfully generated ${imageUrls.length} images`);
            return imageUrls;
        } catch (err) {
            console.error("Failed to generate images for sentences:", err);
            setError("Failed to generate images for sentences");
            setIsLoading(false);
            
            // Return fallback images
            return sentences.map((sentence) => {
                // Generate a consistent fallback based on the sentence
                const sentenceHash = sentence.split('').reduce((a, b) => {
                    a = (a << 5) - a + b.charCodeAt(0);
                    return a & a;
                }, 0);
                
                return `https://picsum.photos/seed/${Math.abs(sentenceHash)}/800/600`;
            });
        }
    };
    
    // Preload a batch of images for future use
    const preloadImages = async (prompts: string[]): Promise<void> => {
        try {
            console.log(`Preloading ${prompts.length} images`);
            
            // First, get all the URLs
            const imageUrls = await generateImagesForSentences(prompts);
            
            // Then preload them all
            await Promise.all(imageUrls.map(url => preloadImage(url)));
            
            console.log("Image preloading completed");
        } catch (err) {
            console.error("Error preloading images:", err);
        }
    };

    return { 
        imageUrl, 
        error, 
        isLoading, 
        fetchImage, 
        generateImagesForSentences,
        preloadImages,
        preloadImage
    };
};
