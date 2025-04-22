// Format time for display (convert seconds to MM:SS format)
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

// Normalize text for highlighting
export function normalizeText(text: string): string {
  return text
    .replace(/[^\S\r\n]+/g, " ") // collapse multiple spaces but preserve line breaks
    .replace(/[\u2018\u2019]/g, "'") // normalize single quotes
    .replace(/[\u201C\u201D]/g, '"') // normalize double quotes
    .replace(/–|—/g, "-") // normalize dashes
    .replace(/[^\x20-\x7E]/g, "") // remove non-ASCII/control characters
    .replace(/\s+/g, " ") // collapse all whitespace
    .trim();
}

// Apply highlights to text based on markers
export function highlightText(text: string, markers: string[]): string {
  let highlightedText = text;
  markers.forEach((marker) => {
    const normalizedMarker = normalizeText(marker);
    const regex = new RegExp(
      `(${normalizedMarker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gim"
    );
    highlightedText = highlightedText.replace(
      regex,
      (match) => `<span class="text-orange-500 font-medium">${match}</span>`
    );
  });
  return highlightedText;
}

// Mark paragraphs containing markers
export function markParagraphsHTML(text: string, markers: string[]): string {
  const paragraphs = text.split("\n\n"); // Split text into paragraphs
  const markedParagraphs = paragraphs.map((paragraph) => {
    const normalizedParagraph = normalizeText(paragraph);
    const hasMarker = markers.some((marker) => {
      const normalizedMarker = normalizeText(marker);
      return normalizedParagraph.includes(normalizedMarker);
    });
    return hasMarker
      ? `<div class="bg-red-100 p-3 rounded-lg mb-2 border-l-4 border-red-400">${paragraph}</div>`
      : `<div class="mb-2">${paragraph}</div>`;
  });
  return markedParagraphs.join("\n\n");
}

// Store video data in localStorage
export function storeVideoDataLocally(noteId: string, videoData: unknown): void {
  try {
    // Validate the data before storing
    if (!videoData) {
      console.error("Cannot store null or undefined video data");
      return;
    }
    
    if (Array.isArray(videoData) && videoData.length === 0) {
      console.error("Cannot store empty array as video data");
      return;
    }
    
    // Log data being stored for debugging
    const dataSize = JSON.stringify(videoData).length;
    console.log(`Storing video data for note ${noteId} (size: ${dataSize} bytes)`);
    
    // Make sure the data is properly structured before storing
    if (!Array.isArray(videoData)) {
      console.error("Video data must be an array");
      return;
    }
    
    localStorage.setItem(`noteVideoData_${noteId}`, JSON.stringify(videoData));
    console.log(`Successfully stored video data for note ${noteId} in localStorage`);
  } catch (error) {
    console.error("Error storing video data in localStorage:", error);
  }
}

// Get video data from localStorage
export function getLocalVideoData(noteId: string): unknown[] | null {
  try {
    const key = `noteVideoData_${noteId}`;
    const data = localStorage.getItem(key);
    
    if (!data) {
      console.log(`No video data found in localStorage for note ${noteId}`);
      return null;
    }
    
    try {
      const parsedData = JSON.parse(data);
      
      // Verify that the data is in the expected format
      if (!Array.isArray(parsedData)) {
        console.error(`Invalid video data format for note ${noteId} - not an array`);
        return null;
      }
      
      if (parsedData.length === 0) {
        console.warn(`Empty video data array for note ${noteId}`);
        return null;
      }
      
      // Basic structure validation
      for (const item of parsedData) {
        if (typeof item !== 'object' || item === null) {
          console.error(`Invalid item in video data for note ${noteId}:`, item);
          return null;
        }
      }
      
      console.log(`Successfully retrieved video data for note ${noteId} (${parsedData.length} items)`);
      return parsedData;
    } catch (parseError) {
      console.error(`Failed to parse video data for note ${noteId}:`, parseError);
      // If data is corrupted, remove it to prevent future errors
      localStorage.removeItem(key);
      return null;
    }
  } catch (error) {
    console.error("Error retrieving video data from localStorage:", error);
    return null;
  }
}

// Check if video data exists in localStorage
export function hasLocalVideoData(noteId: string): boolean {
  const key = `noteVideoData_${noteId}`;
  const data = localStorage.getItem(key);
  
  if (!data) {
    return false;
  }
  
  try {
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) && parsed.length > 0;
  } catch {
    // If we can't parse the data, it's not valid
    localStorage.removeItem(key);
    return false;
  }
}
