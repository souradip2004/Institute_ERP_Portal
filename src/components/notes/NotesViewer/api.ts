import { PageItem } from "./types";

// API key for image recognition service - Only used in getImgCategoryFromGemini
const GEMINI_API_KEY = "AIzaSyA4JS-LxAnKP3BY2DDcYCuEKd96troXeyc";

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
  apiKey: string = GEMINI_API_KEY
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
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return `Error: ${errorMessage}`;
  }
}

// Split PDF into images
export async function splitPdfToImages(pdfUrl: string): Promise<string[]> {
  try {
    const response = await fetch(
        "https://api.aiclassroom.in/split-to-images",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fileUrl:pdfUrl }),
        }
      )
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const pdfData = await response.json();
    return pdfData.data.Pdf_Pages_Data || [];
  } catch (error) {
    console.error("Error splitting PDF:", error);
    throw error;
  }
}

// Process PDF data
export async function processNotesData(
  imageUrls: string[],
  gender: string = "Male"
): Promise<PageItem[]> {
  try {
    console.log(`Processing ${imageUrls.length} images with gender: ${gender}`);
    
    const response = await fetch(
      'https://notes-2-video-parallel-array-0ce7c4c-v1.app.beam.cloud',
      {
        method: "POST",
        headers: {
          Connection: "keep-alive",
          "Content-Type": "application/json",
          Authorization:
            "Bearer cpxjIHGyDUggeCZSEgd7TSs_xuIaJLxQyplSlPcpEv35qftljIUmetr9Drtj_MUyC9PUSJLvV1vbjljWohB8Sw==",
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
    console.log("API Response:", JSON.stringify(data).substring(0, 500) + "...");

    // Check if we have a valid response
    if (!data || !data.json_data_final || !Array.isArray(data.json_data_final) || data.json_data_final.length === 0) {
      console.error("Invalid or empty response from notes-2-video API");
      console.log("Full API Response:", JSON.stringify(data));
      throw new Error("Invalid response format from notes-2-video API");
    }

    const newdata: PageItem[] = [];
    let parsingErrors = 0;

    data.json_data_final.forEach((jsonItem: string, index: number) => {
      try {
        console.log(`Processing item ${index + 1}/${data.json_data_final.length}`);
        const parsedItem = JSON.parse(jsonItem);
        const finalItem = JSON.parse(parsedItem);
        newdata.push(finalItem);
      } catch (parseError) {
        console.error(`Error parsing item ${index}:`, parseError);
        parsingErrors++;
      }
    });

    console.log(`Processed ${newdata.length} items with ${parsingErrors} parsing errors`);
    
    if (newdata.length === 0) {
      throw new Error("No valid data items found in API response");
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
              "https://api.aiclassroom.in/generate-image",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({sentence:prompt}),
              }
            );

    if (!response.ok) {
      throw new Error(`Image generation failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data.image || "";
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
}

// Save video data to database
export async function saveVideoData(
  noteId: string,
  videoData: PageItem[]
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

    // Check for the custom header instead of trying to parse JSON from a HEAD request
    return response.headers.get('x-has-video-data') === 'true';
  } catch (error) {
    console.error("Error checking video data:", error);
    return false;
  }
}

// Get video data from server
export async function getVideoData(noteId: string): Promise<unknown[] | null> {
  try {
    console.log(`Fetching video data from server for note ${noteId}`);
    const response = await fetch(`/api/notes/${noteId}/video-data`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error(`Failed to retrieve video data: ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    
    if (!data || !data.videoData || !Array.isArray(data.videoData) || data.videoData.length === 0) {
      console.error("Invalid video data format received from server");
      return null;
    }
    
    console.log(`Successfully retrieved video data from server for note ${noteId}`);
    return data.videoData;
  } catch (error) {
    console.error("Error retrieving video data from server:", error);
    return null;
  }
}
