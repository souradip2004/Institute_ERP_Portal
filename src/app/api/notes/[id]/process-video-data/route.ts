import { NextRequest, NextResponse } from "next/server";
import { NoteService } from "@/services/noteService";
import {
  splitPdfToImages,
  processNotesData,
} from "@/components/notes/NotesViewer/api";

// This endpoint processes PDF files to generate video data in the background
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const { pdfUrl, gender = "Male" } = await req.json();

    if (!pdfUrl) {
      return NextResponse.json(
        { error: "PDF URL is required" },
        { status: 400 }
      );
    }

    // Check if note exists
    const note = await NoteService.getNoteById(id);
    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    // Start background processing
    (async () => {
      try {
        console.log(`Starting PDF processing for note ${id}`);

        // Split PDF to images
        const images = await splitPdfToImages(pdfUrl);
        console.log(`Split PDF into ${images.length} images`);

        // If no images were extracted, log an error and stop processing
        if (!images || images.length === 0) {
          console.error(`Error: Could not extract any images from PDF for note ${id}`);
          return;
        }

        // Process the images to get video data
        const videoData = await processNotesData(images, gender);
        
        // Check if we got valid data
        if (!videoData || (Array.isArray(videoData) && videoData.length === 0)) {
          console.error(`Error: Received empty or invalid video data for note ${id}`);
          return;
        }
        
        console.log(`Received video data for note ${id}: ${JSON.stringify(videoData).substring(0, 300)}...`);

        // Save the video data to the note
        await NoteService.updateNoteVideoData(id, videoData);

        console.log(`PDF processing completed for note ${id}`);
      } catch (error) {
        console.error(`Error processing PDF for note ${id}:`, error);
      }
    })();

    // Return immediately while processing continues in the background
    return NextResponse.json({
      success: true,
      message: "PDF processing started in the background",
    });
  } catch (error: Error | unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error starting PDF processing:", error);
    return NextResponse.json(
      { error: "Failed to start PDF processing", details: errorMessage },
      { status: 500 }
    );
  }
}
