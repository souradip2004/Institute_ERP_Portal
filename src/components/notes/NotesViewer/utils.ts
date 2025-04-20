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
export function storeVideoDataLocally(noteId: string, videoData: any): void {
  try {
    localStorage.setItem(`noteVideoData_${noteId}`, JSON.stringify(videoData));
  } catch (error) {
    console.error("Error storing video data in localStorage:", error);
  }
}

// Get video data from localStorage
export function getLocalVideoData(noteId: string): any {
  try {
    const data = localStorage.getItem(`noteVideoData_${noteId}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Error retrieving video data from localStorage:", error);
    return null;
  }
}

// Check if video data exists in localStorage
export function hasLocalVideoData(noteId: string): boolean {
  return localStorage.getItem(`noteVideoData_${noteId}`) !== null;
}
