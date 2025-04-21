import prisma from "@/lib/prisma";
import { Note, NoteAttachment, Prisma } from "@prisma/client";

type CreateNoteInput = {
  title: string;
  content?: string;
  classSectionId: string;
  teacherId: string;
  subjectName?: string;
  fileType?: string;
  isPublished?: boolean;
  videoData?: any;
};

type UpdateNoteInput = Partial<CreateNoteInput>;

type NoteAttachmentInput = {
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedById: string;
};

type VideoDataInput = {
  noteId: string;
  videoData: any;
};

export class NoteService {
  static async createNote(data: CreateNoteInput): Promise<Note> {
    return prisma.note.create({
      data,
    });
  }

  static async createNoteWithAttachments(
    noteData: CreateNoteInput,
    attachments: NoteAttachmentInput[]
  ): Promise<Note> {
    try {
      console.log(
        "Creating note with data:",
        JSON.stringify(noteData, null, 2)
      );

      // First create the note without attachments
      const note = await prisma.note.create({
        data: {
          title: noteData.title,
          content: noteData.content,
          classSectionId: noteData.classSectionId,
          teacherId: noteData.teacherId,
          subjectName: noteData.subjectName,
          fileType: noteData.fileType,
          isPublished: noteData.isPublished ?? false,
          videoData: noteData.videoData,
        },
      });

      console.log(`Note created with ID: ${note.id}`);

      // Then add attachments separately
      if (attachments.length > 0) {
        console.log(`Processing ${attachments.length} attachments`);

        const createdAttachments = [];
        const failedAttachments = [];

        for (const attachment of attachments) {
          console.log(`Processing attachment: ${attachment.fileName}`);

          try {
            // Verify that the user exists before creating the attachment
            const user = await prisma.user.findUnique({
              where: { id: attachment.uploadedById },
              select: { id: true },
            });

            if (!user) {
              console.error(
                `User with ID ${attachment.uploadedById} not found. Skipping attachment ${attachment.fileName}`
              );
              failedAttachments.push({
                fileName: attachment.fileName,
                reason: `User with ID ${attachment.uploadedById} not found`,
              });
              continue; // Skip this attachment
            }

            console.log(
              `Creating attachment with uploadedById: ${attachment.uploadedById}`
            );

            const newAttachment = await prisma.noteAttachment.create({
              data: {
                fileUrl: attachment.fileUrl,
                fileName: attachment.fileName,
                fileType: attachment.fileType,
                fileSize: attachment.fileSize,
                uploadedById: attachment.uploadedById,
                noteId: note.id,
              },
            });

            console.log(`Attachment created with ID: ${newAttachment.id}`);
            createdAttachments.push(newAttachment);
          } catch (attachmentError) {
            console.error(
              `Error creating attachment ${attachment.fileName}:`,
              attachmentError
            );
            failedAttachments.push({
              fileName: attachment.fileName,
              error: attachmentError,
            });
          }
        }

        if (failedAttachments.length > 0) {
          console.warn(
            `Failed to create ${failedAttachments.length} attachments:`,
            failedAttachments
          );
        }

        console.log(
          `Successfully created ${createdAttachments.length} attachments`
        );
      }

      // Return the note with attachments
      const noteWithAttachments = await prisma.note.findUnique({
        where: { id: note.id },
        include: {
          attachments: true,
        },
      });

      if (!noteWithAttachments) {
        throw new Error(
          `Failed to retrieve note with ID: ${note.id} after creating attachments`
        );
      }

      return noteWithAttachments;
    } catch (error) {
      console.error("Error in createNoteWithAttachments:", error);
      throw error;
    }
  }

  static async updateNote(id: string, data: UpdateNoteInput): Promise<Note> {
    return prisma.note.update({
      where: { id },
      data,
    });
  }

  static async getNoteById(id: string): Promise<Note | null> {
    try {
      const note = await prisma.note.findUnique({
        where: { id },
        include: {
          attachments: true,
          teacher: {
            include: {
              user: {
                select: {
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
      });

      if (note) {
        console.log(
          `Retrieved note ID ${id} with ${note.attachments.length} attachments`
        );
      } else {
        console.log(`Note with ID ${id} not found`);
      }

      return note;
    } catch (error) {
      console.error(`Error retrieving note with ID ${id}:`, error);
      throw error;
    }
  }

  static async getNotesByClassSection(classSectionId: string): Promise<Note[]> {
    return prisma.note.findMany({
      where: {
        classSectionId,
        isPublished: true,
      },
      include: {
        attachments: true,
        teacher: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  static async getNotesByTeacher(teacherId: string): Promise<Note[]> {
    return prisma.note.findMany({
      where: {
        teacherId,
      },
      include: {
        attachments: true,
        classSection: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  static async getNotesBySubject(
    classSectionId: string,
    subjectName: string
  ): Promise<Note[]> {
    return prisma.note.findMany({
      where: {
        classSectionId,
        subjectName,
        isPublished: true,
      },
      include: {
        attachments: true,
        teacher: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  static async deleteNote(id: string): Promise<Note> {
    return prisma.note.delete({
      where: { id },
    });
  }

  static async addAttachmentToNote(
    noteId: string,
    attachment: NoteAttachmentInput
  ): Promise<NoteAttachment> {
    try {
      // Verify that the note exists
      const note = await prisma.note.findUnique({
        where: { id: noteId },
        select: { id: true },
      });

      if (!note) {
        throw new Error(`Note with ID ${noteId} not found`);
      }

      // Verify that the user exists
      const user = await prisma.user.findUnique({
        where: { id: attachment.uploadedById },
        select: { id: true },
      });

      if (!user) {
        throw new Error(`User with ID ${attachment.uploadedById} not found`);
      }

      // Create the attachment
      return prisma.noteAttachment.create({
        data: {
          ...attachment,
          noteId,
        },
      });
    } catch (error) {
      console.error(`Error adding attachment to note ${noteId}:`, error);
      throw error;
    }
  }

  static async deleteAttachment(id: string): Promise<NoteAttachment> {
    return prisma.noteAttachment.delete({
      where: { id },
    });
  }

  static async searchNotes(
    query: string,
    classSectionId?: string,
    subjectName?: string
  ): Promise<Note[]> {
    const where: Prisma.NoteWhereInput = {
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { content: { contains: query, mode: "insensitive" } },
      ],
      isPublished: true,
    };

    if (classSectionId) {
      where.classSectionId = classSectionId;
    }

    if (subjectName) {
      where.subjectName = subjectName;
    }

    return prisma.note.findMany({
      where,
      include: {
        attachments: true,
        teacher: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  // New methods for video data handling
  static async updateNoteVideoData(
    noteId: string,
    videoData: any
  ): Promise<Note> {
    try {
      console.log(`Service: Updating video data for note ID: ${noteId}`);

      // First check if the note exists
      const noteExists = await prisma.note.findUnique({
        where: { id: noteId },
        select: { id: true },
      });

      if (!noteExists) {
        console.log(`Service: Note with ID ${noteId} not found`);
        throw new Error(`Note with ID ${noteId} not found`);
      }

      const updatedNote = await prisma.note.update({
        where: { id: noteId },
        data: { videoData },
      });

      console.log(
        `Service: Successfully updated video data for note ID: ${noteId}`
      );
      return updatedNote;
    } catch (error) {
      console.error(
        `Service: Error updating video data for note ID ${noteId}:`,
        error
      );
      throw error;
    }
  }

  static async getNoteWithVideoData(noteId: string): Promise<Note | null> {
    try {
      console.log(`Service: Fetching note with video data for ID: ${noteId}`);

      const note = await prisma.note.findUnique({
        where: { id: noteId },
      });

      if (!note) {
        console.log(`Service: Note with ID ${noteId} not found`);
        return null;
      }

      if (note.videoData === null) {
        console.log(`Service: Note with ID ${noteId} has null videoData`);
      } else {
        console.log(
          `Service: Successfully retrieved videoData for note ID ${noteId}`
        );
      }

      return note;
    } catch (error) {
      console.error(
        `Service: Error retrieving note with video data for ID ${noteId}:`,
        error
      );
      throw error;
    }
  }

  static async checkNoteHasVideoData(noteId: string): Promise<boolean> {
    const note = await prisma.note.findUnique({
      where: { id: noteId },
      select: { id: true, videoData: true },
    });
    return note !== null && note.videoData !== null;
  }
}
