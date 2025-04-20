import prisma from "../lib/prisma";
import { Note, NoteAttachment, Prisma } from "@prisma/client";

type CreateNoteInput = {
  title: string;
  content?: string;
  classSectionId: string;
  teacherId: string;
  subjectName?: string;
  fileType?: string;
  isPublished?: boolean;
};

type UpdateNoteInput = Partial<CreateNoteInput>;

type NoteAttachmentInput = {
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedById: string;
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
    return prisma.note.create({
      data: {
        ...noteData,
        attachments: {
          create: attachments,
        },
      },
      include: {
        attachments: true,
      },
    });
  }

  static async updateNote(id: string, data: UpdateNoteInput): Promise<Note> {
    return prisma.note.update({
      where: { id },
      data,
    });
  }

  static async getNoteById(id: string): Promise<Note | null> {
    return prisma.note.findUnique({
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
    return prisma.noteAttachment.create({
      data: {
        ...attachment,
        noteId,
      },
    });
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
}
