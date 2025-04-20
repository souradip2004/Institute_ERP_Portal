import { PageItem } from "./types";

// API key for image recognition service
const API_KEY = "AIzaSyA4JS-LxAnKP3BY2DDcYCuEKd96troXeyc";

// Convert image URL to base64
export async function imageUrlToBase64(imageUrl: string): Promise<string> {
  const response = await fetch(imageUrl);
  const blob = await response.blob();
  const reader = new FileReader();

  return new Promise((resolve, reject) => {
    reader.onloadend = () => {
      const base64 = reader.result?.toString().split(",")[1];
      resolve(base64 || "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Get image category from Gemini API
export async function getImgCategoryFromGemini(
  imageUrl: string,
  apiKey: string
): Promise<string> {
  try {
    const base64Image = await imageUrlToBase64(imageUrl);

    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const headers = {
      "Content-Type": "application/json",
    };

    const body = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Classify This Image as any one of the following category:
  Considering the Majority Portion of the Image -
  1. Table
  2. Flowchart
  3. Diagram
  4. Graph
  5. Numericals or Math Equations
  6. Normal Image or Picture
  7. Text (Without Numericals or Math Equations)
  
  Return only the Category without any additional formating or text or headers`,
            },
            {
              inlineData: {
                mimeType: "image/png",
                data: base64Image,
              },
            },
          ],
        },
      ],
    };

    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    return (
      result?.candidates?.[0]?.content?.parts?.[0]?.text || "No OCR found."
    );
  } catch (error: any) {
    return `Error: ${error.message}`;
  }
}

// Split PDF into images
export async function splitPdfToImages(pdfUrl: string): Promise<string[]> {
  try {
    const response = await fetch(
      "https://split-pdf-to-images-4a0e826-v1.app.beam.cloud",
      {
        method: "POST",
        headers: {
          Connection: "keep-alive",
          "Content-Type": "application/json",
          Authorization:
            "Bearer qhZEcl0H-WNIMhaYUY3u_LTJxm34Z91YpX9ZB6P9KF48fjqYpE10MvnYzqLaXg_9f5mb4YjQr1YjAZZFOw_17Q==",
        },
        body: JSON.stringify({
          file_url: pdfUrl,
          file_uid: "xe5w-3345-we31-dfv",
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const pdfData = await response.json();
    return pdfData.Pdf_Pages_Data || [];
  } catch (error) {
    console.error("Error splitting PDF:", error);
    throw error;
  }
}

// Process PDF data
export async function processNotesData(
  imageUrls: string[]
): Promise<PageItem[]> {
  try {
    const response = await fetch(
      "https://notes-2-video-parallel-array-4a71759-v3.app.beam.cloud",
      {
        method: "POST",
        headers: {
          Connection: "keep-alive",
          "Content-Type": "application/json",
          Authorization:
            "Bearer qhZEcl0H-WNIMhaYUY3u_LTJxm34Z91YpX9ZB6P9KF48fjqYpE10MvnYzqLaXg_9f5mb4YjQr1YjAZZFOw_17Q==",
        },
        body: JSON.stringify({
          file_url_list: imageUrls,
          language: "hinglish",
          pdf_uid: "3456-22ded-2",
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    let newdata: PageItem[] = [];
    if (data.json_data_final) {
      data.json_data_final.forEach((jsonItem: string) => {
        const parsedItem = JSON.parse(jsonItem);
        newdata.push(JSON.parse(parsedItem));
      });
    }

    return newdata;
  } catch (error) {
    console.error("Error processing notes data:", error);
    throw error;
  }
}

// Generate image for text
export async function generateImageForText(prompt: string): Promise<string> {
  try {
    const response = await fetch(
      "https://image-generator-b89784e-v1.app.beam.cloud",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Bearer qhZEcl0H-WNIMhaYUY3u_LTJxm34Z91YpX9ZB6P9KF48fjqYpE10MvnYzqLaXg_9f5mb4YjQr1YjAZZFOw_17Q==",
        },
        body: JSON.stringify({ prompt }),
      }
    );

    if (!response.ok) {
      throw new Error(`Image generation failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.image || "";
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
}

// Save video data to database
export async function saveVideoData(
  noteId: string,
  videoData: any
): Promise<void> {
  try {
    const response = await fetch(`/api/notes/${noteId}/video-data`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ videoData }),
    });

    if (!response.ok) {
      throw new Error(`Failed to save video data: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error saving video data:", error);
    throw error;
  }
}

// Check if video data exists
export async function checkVideoDataExists(noteId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/notes/${noteId}/video-data`, {
      method: "HEAD",
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.hasVideoData || false;
  } catch (error) {
    console.error("Error checking video data:", error);
    return false;
  }
}

// Get video data
export async function getVideoData(noteId: string): Promise<any> {
  try {
    const response = await fetch(`/api/notes/${noteId}/video-data`);

    if (!response.ok) {
      throw new Error(`Failed to fetch video data: ${response.statusText}`);
    }

    const data = await response.json();
    return data.videoData;
  } catch (error) {
    console.error("Error fetching video data:", error);
    throw error;
  }
}
