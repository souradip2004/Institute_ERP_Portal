import { NextRequest, NextResponse } from "next/server";
import { NoteService } from "../services/noteService";
import { z } from "zod";

// Validation schemas
const createNoteSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().optional(),
  classSectionId: z.string().min(1, "Class section ID is required"),
  teacherId: z.string().min(1, "Teacher ID is required"),
  subjectName: z.string().optional(),
  fileType: z.string().optional(),
  isPublished: z.boolean().optional(),
  videoData: z.any().optional(),
  attachments: z
    .array(
      z.object({
        fileUrl: z.string().min(1, "File URL is required"),
        fileName: z.string().min(1, "File name is required"),
        fileType: z.string().min(1, "File type is required"),
        fileSize: z.number().int().positive("File size must be positive"),
        uploadedById: z.string().min(1, "Uploader ID is required"),
      })
    )
    .optional(),
});

const updateNoteSchema = createNoteSchema.partial();

const noteAttachmentSchema = z.object({
  fileUrl: z.string().min(1, "File URL is required"),
  fileName: z.string().min(1, "File name is required"),
  fileType: z.string().min(1, "File type is required"),
  fileSize: z.number().int().positive("File size must be positive"),
  uploadedById: z.string().min(1, "Uploader ID is required"),
});

const videoDataSchema = z.object({
  videoData: z.any(),
});

export class NoteController {
  // Create a new note
  static async createNote(req: NextRequest) {
    try {
      const body = await req.json();

      // Validate input
      const validationResult = createNoteSchema.safeParse(body);
      if (!validationResult.success) {
        return NextResponse.json(
          { error: "Validation error", details: validationResult.error.errors },
          { status: 400 }
        );
      }

      const { attachments, ...noteData } = body;

      // Create note with or without attachments
      let note;
      let attachmentErrors = [];

      try {
        if (
          attachments &&
          Array.isArray(attachments) &&
          attachments.length > 0
        ) {
          // Validate attachments
          const validAttachments = [];
          for (const attachment of attachments) {
            const validationResult = noteAttachmentSchema.safeParse(attachment);
            if (!validationResult.success) {
              attachmentErrors.push({
                fileName: attachment.fileName || "Unknown file",
                errors: validationResult.error.errors,
              });
              continue;
            }
            validAttachments.push(attachment);
          }

          if (validAttachments.length === 0) {
            // No valid attachments were found, but create the note anyway
            note = await NoteService.createNote(noteData);
          } else {
            note = await NoteService.createNoteWithAttachments(
              noteData,
              validAttachments
            );
          }
        } else {
          note = await NoteService.createNote(noteData);
        }
      } catch (noteError: any) {
        if (noteError.message && noteError.message.includes("User with ID")) {
          // This is a user validation error
          return NextResponse.json(
            {
              error: "Invalid user reference",
              details: noteError.message,
            },
            { status: 400 }
          );
        }
        throw noteError; // Re-throw other errors to be caught by the outer catch
      }

      // Return the created note with any attachment errors
      const response: any = { ...note };
      if (attachmentErrors.length > 0) {
        response.attachmentErrors = attachmentErrors;
      }

      return NextResponse.json(response, { status: 201 });
    } catch (error: any) {
      console.error("Error creating note:", error);
      return NextResponse.json(
        { error: "Failed to create note", details: error.message },
        { status: 500 }
      );
    }
  }

  // Get a note by ID
  static async getNoteById(
    req: NextRequest,
    { params }: { params: { id: string } }
  ) {
    try {
      const { id } = await params;
      const note = await NoteService.getNoteById(id);

      if (!note) {
        return NextResponse.json({ error: "Note not found" }, { status: 404 });
      }

      return NextResponse.json(note);
    } catch (error: any) {
      console.error("Error fetching note:", error);
      return NextResponse.json(
        { error: "Failed to fetch note", details: error.message },
        { status: 500 }
      );
    }
  }

  // Get notes by class section
  static async getNotesByClassSection(
    req: NextRequest,
    { params }: { params: { classSectionId: string } }
  ) {
    try {
      const { classSectionId } = await params;
      const notes = await NoteService.getNotesByClassSection(classSectionId);
      return NextResponse.json(notes);
    } catch (error: any) {
      console.error("Error fetching notes by class section:", error);
      return NextResponse.json(
        { error: "Failed to fetch notes", details: error.message },
        { status: 500 }
      );
    }
  }

  // Get notes by subject
  static async getNotesBySubject(
    req: NextRequest,
    { params }: { params: { classSectionId: string; subjectName: string } }
  ) {
    try {
      const { classSectionId, subjectName } = await params;
      const notes = await NoteService.getNotesBySubject(
        classSectionId,
        subjectName
      );
      return NextResponse.json(notes);
    } catch (error: any) {
      console.error("Error fetching notes by subject:", error);
      return NextResponse.json(
        { error: "Failed to fetch notes", details: error.message },
        { status: 500 }
      );
    }
  }

  // Get notes by teacher
  static async getNotesByTeacher(
    req: NextRequest,
    { params }: { params: { teacherId: string } }
  ) {
    try {
      const { teacherId } = await params;
      const notes = await NoteService.getNotesByTeacher(teacherId);
      return NextResponse.json(notes);
    } catch (error: any) {
      console.error("Error fetching notes by teacher:", error);
      return NextResponse.json(
        { error: "Failed to fetch notes", details: error.message },
        { status: 500 }
      );
    }
  }

  // Update a note
  static async updateNote(
    req: NextRequest,
    { params }: { params: { id: string } }
  ) {
    try {
      const { id } = await params;
      const body = await req.json();

      // Validate input
      const validationResult = updateNoteSchema.safeParse(body);
      if (!validationResult.success) {
        return NextResponse.json(
          { error: "Validation error", details: validationResult.error.errors },
          { status: 400 }
        );
      }

      const updatedNote = await NoteService.updateNote(id, body);
      return NextResponse.json(updatedNote);
    } catch (error: any) {
      console.error("Error updating note:", error);
      return NextResponse.json(
        { error: "Failed to update note", details: error.message },
        { status: 500 }
      );
    }
  }

  // Delete a note
  static async deleteNote(
    req: NextRequest,
    { params }: { params: { id: string } }
  ) {
    try {
      const { id } = await params;
      const deletedNote = await NoteService.deleteNote(id);
      return NextResponse.json(deletedNote);
    } catch (error: any) {
      console.error("Error deleting note:", error);
      return NextResponse.json(
        { error: "Failed to delete note", details: error.message },
        { status: 500 }
      );
    }
  }

  // Add attachment to a note
  static async addAttachment(
    req: NextRequest,
    { params }: { params: { id: string } }
  ) {
    try {
      const { id } = await params;
      const body = await req.json();

      // Validate input
      const validationResult = noteAttachmentSchema.safeParse(body);
      if (!validationResult.success) {
        return NextResponse.json(
          { error: "Validation error", details: validationResult.error.errors },
          { status: 400 }
        );
      }

      try {
        const attachment = await NoteService.addAttachmentToNote(id, body);
        return NextResponse.json(attachment, { status: 201 });
      } catch (attachmentError: any) {
        // Check for specific errors
        if (attachmentError.message) {
          if (attachmentError.message.includes("Note with ID")) {
            return NextResponse.json(
              { error: "Note not found", details: attachmentError.message },
              { status: 404 }
            );
          }
          if (attachmentError.message.includes("User with ID")) {
            return NextResponse.json(
              {
                error: "Invalid user reference",
                details: attachmentError.message,
              },
              { status: 400 }
            );
          }
        }

        // For other errors, re-throw to be caught by the outer catch
        throw attachmentError;
      }
    } catch (error: any) {
      console.error("Error adding attachment:", error);
      return NextResponse.json(
        { error: "Failed to add attachment", details: error.message },
        { status: 500 }
      );
    }
  }

  // Delete an attachment
  static async deleteAttachment(
    req: NextRequest,
    { params }: { params: { id: string } }
  ) {
    try {
      const { id } = await params;
      const deletedAttachment = await NoteService.deleteAttachment(id);
      return NextResponse.json(deletedAttachment);
    } catch (error: any) {
      console.error("Error deleting attachment:", error);
      return NextResponse.json(
        { error: "Failed to delete attachment", details: error.message },
        { status: 500 }
      );
    }
  }

  // Search notes
  static async searchNotes(req: NextRequest) {
    try {
      const url = new URL(req.url);
      const query = url.searchParams.get("query") || "";
      const classSectionId =
        url.searchParams.get("classSectionId") || undefined;
      const subjectName = url.searchParams.get("subjectName") || undefined;

      const notes = await NoteService.searchNotes(
        query,
        classSectionId as string | undefined,
        subjectName as string | undefined
      );

      return NextResponse.json(notes);
    } catch (error: any) {
      console.error("Error searching notes:", error);
      return NextResponse.json(
        { error: "Failed to search notes", details: error.message },
        { status: 500 }
      );
    }
  }

  // Update note video data
  static async updateVideoData(
    req: NextRequest,
    { params }: { params: { id: string } }
  ) {
    try {
      const { id } = await params;
      console.log(`Updating video data for note ID: ${id}`);

      const body = await req.json();

      // Validate input
      const validationResult = videoDataSchema.safeParse(body);
      if (!validationResult.success) {
        console.log(`Video data validation failed for note ID: ${id}`);
        return NextResponse.json(
          { error: "Validation error", details: validationResult.error.errors },
          { status: 400 }
        );
      }

      // Log the video data structure for debugging
      console.log(
        `Video data structure:`,
        JSON.stringify(body.videoData).substring(0, 200) + "..."
      );

      const updatedNote = await NoteService.updateNoteVideoData(
        id,
        body.videoData
      );

      console.log(`Successfully updated video data for note ID: ${id}`);
      return NextResponse.json({
        id: updatedNote.id,
        videoData: updatedNote.videoData,
      });
    } catch (error: any) {
      console.error("Error updating note video data:", error);
      return NextResponse.json(
        { error: "Failed to update video data", details: error.message },
        { status: 500 }
      );
    }
  }

  // Get note with video data
  static async getNoteWithVideoData(
    req: NextRequest,
    { params }: { params: { id: string } }
  ) {
    try {
      const { id } = await params;
      console.log(`Fetching video data for note ID: ${id}`);

      const note = await NoteService.getNoteWithVideoData(id);

      if (!note) {
        console.log(`Note with ID ${id} not found`);
        return NextResponse.json({ error: "Note not found" }, { status: 404 });
      }

      // Check if videoData exists in the note
      if (!note.videoData) {
        console.log(`Note with ID ${id} has no video data`);
        return NextResponse.json(
          { error: "Video data not found" },
          { status: 404 }
        );
      }

      console.log(`Successfully retrieved video data for note ID: ${id}`);
      return NextResponse.json({
        id: note.id,
        videoData: note.videoData,
      });
    } catch (error: any) {
      console.error("Error fetching note with video data:", error);
      return NextResponse.json(
        { error: "Failed to fetch note", details: error.message },
        { status: 500 }
      );
    }
  }

  // Check if note has video data
  static async checkVideoDataExists(
    req: NextRequest,
    { params }: { params: { id: string } }
  ) {
    try {
      const { id } = await params;
      console.log(`Checking video data existence for note ID: ${id}`);

      const hasVideoData = await NoteService.checkNoteHasVideoData(id);

      console.log(`Video data exists for note ID ${id}: ${hasVideoData}`);
      return NextResponse.json({ hasVideoData });
    } catch (error: any) {
      console.error("Error checking video data:", error);
      return NextResponse.json(
        { error: "Failed to check video data", details: error.message },
        { status: 500 }
      );
    }
  }
}
