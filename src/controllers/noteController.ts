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
});

const updateNoteSchema = createNoteSchema.partial();

const noteAttachmentSchema = z.object({
  fileUrl: z.string().min(1, "File URL is required"),
  fileName: z.string().min(1, "File name is required"),
  fileType: z.string().min(1, "File type is required"),
  fileSize: z.number().int().positive("File size must be positive"),
  uploadedById: z.string().min(1, "Uploader ID is required"),
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
      if (attachments && Array.isArray(attachments) && attachments.length > 0) {
        // Validate attachments
        const validAttachments = [];
        for (const attachment of attachments) {
          const validationResult = noteAttachmentSchema.safeParse(attachment);
          if (!validationResult.success) {
            return NextResponse.json(
              {
                error: "Validation error in attachment",
                details: validationResult.error.errors,
              },
              { status: 400 }
            );
          }
          validAttachments.push(attachment);
        }

        note = await NoteService.createNoteWithAttachments(
          noteData,
          validAttachments
        );
      } else {
        note = await NoteService.createNote(noteData);
      }

      return NextResponse.json(note, { status: 201 });
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
      const { id } = params;
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
      const { classSectionId } = params;
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
      const { classSectionId, subjectName } = params;
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
      const { teacherId } = params;
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
      const { id } = params;
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
      const { id } = params;
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
      const { id } = params;
      const body = await req.json();

      // Validate input
      const validationResult = noteAttachmentSchema.safeParse(body);
      if (!validationResult.success) {
        return NextResponse.json(
          { error: "Validation error", details: validationResult.error.errors },
          { status: 400 }
        );
      }

      const attachment = await NoteService.addAttachmentToNote(id, body);
      return NextResponse.json(attachment, { status: 201 });
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
      const { id } = params;
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
}
