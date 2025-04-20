import { NextRequest, NextResponse } from "next/server";
import { NoteService } from "@/services/noteService";
import {
  splitPdfToImages,
  processNotesData,
  saveVideoData,
} from "@/components/notes/NotesViewer/api";

// This endpoint processes PDF files to generate video data in the background
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { pdfUrl } = await req.json();

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

        // Process the images to get video data
        const videoData = await processNotesData(images);

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
  } catch (error: any) {
    console.error("Error starting PDF processing:", error);
    return NextResponse.json(
      { error: "Failed to start PDF processing", details: error.message },
      { status: 500 }
    );
  }
}
