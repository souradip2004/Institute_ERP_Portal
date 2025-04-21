import { NextRequest, NextResponse } from "next/server";
import { NoteController } from "../../../../../controllers/noteController";

// GET endpoint to retrieve video data for a specific note
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await NoteController.getNoteWithVideoData(request, {
      params,
    });

    // Check if the result is a valid NextResponse
    if (result instanceof NextResponse) {
      // Parse the result body to check for video data
      const body = await result.json();

      // Log what was received for debugging
      console.log("GET video-data response:", body);

      if (body.error) {
        return result; // Return the error response as is
      }

      // Check if video data exists
      if (!body.videoData) {
        return NextResponse.json(
          { error: "Video data not found" },
          { status: 404 }
        );
      }

      // Return just the video data object
      return NextResponse.json(body.videoData);
    }

    // If it's not a NextResponse, something unexpected happened
    return NextResponse.json(
      { error: "Unexpected response format" },
      { status: 500 }
    );
  } catch (error) {
    console.error("Error in video-data GET route:", error);
    return NextResponse.json(
      { error: "Failed to retrieve video data" },
      { status: 500 }
    );
  }
}

// PUT endpoint to update video data for a specific note
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updatedVideoData = await NoteController.updateVideoData(request, {
      params,
    });

    if (!updatedVideoData) {
      return NextResponse.json(
        { error: "Failed to update video data" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedVideoData);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update video data" },
      { status: 500 }
    );
  }
}

// HEAD endpoint to check if video data exists for a note
export async function HEAD(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await NoteController.checkVideoDataExists(request, {
      params,
    });

    // Check if the result is a valid NextResponse
    if (result instanceof NextResponse) {
      // Parse the result body to check the hasVideoData property
      const body = await result.json();

      console.log("HEAD video-data response:", body);

      if (body.error) {
        return new NextResponse(null, { status: 500 });
      }

      // Return appropriate status based on whether video data exists
      if (!body.hasVideoData) {
        return new NextResponse(null, { status: 404 });
      }

      return new NextResponse(null, { status: 200 });
    }

    // If it's not a NextResponse, return a server error
    return new NextResponse(null, { status: 500 });
  } catch (error) {
    console.error("Error in video-data HEAD route:", error);
    return new NextResponse(null, { status: 500 });
  }
}
