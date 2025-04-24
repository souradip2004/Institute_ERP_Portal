import prisma from "@/lib/prisma";
import { Assignment, AssignmentSubmission, Role } from "@prisma/client";
import { S3Utils } from "@/utils/s3Utils";

export class AssignmentService {
  static async createAssignment(data: {
    title: string;
    description?: string;
    classSectionId: string;
    createdById: string;
    dueDate?: Date;
    maxPoints: number;
    submissionType: "INDIVIDUAL" | "GROUP";
    groupId?: string;
    file?: { buffer: Buffer; originalName: string; mimetype: string };
    attachments?: { 
      create: Array<{
        fileUrl: string;
        fileName: string;
        fileType: string;
        fileSize: number;
        uploadedById: string;
      }>
    }
  }): Promise<Assignment> {
    let fileUrl: string | undefined;
    let fileName: string | undefined;
    let fileType: string | undefined;
    let fileSize: number | undefined;

    if (data.file && !data.attachments) {
      if (!data.file.originalName || !data.file.mimetype || !data.file.buffer) {
        throw new Error("Invalid file data: missing required file properties");
      }

      const s3Key = await S3Utils.uploadFile(
        data.file.buffer,
        data.file.originalName,
        data.file.mimetype
      );
      fileUrl = await S3Utils.getFileUrl(s3Key);
      fileName = data.file.originalName;
      fileType = data.file.mimetype;
      fileSize = data.file.buffer.length;
    }

    return prisma.assignment.create({
      data: {
        title: data.title,
        description: data.description,
        classSectionId: data.classSectionId,
        createdById: data.createdById,
        dueDate: data.dueDate,
        maxPoints: data.maxPoints,
        submissionType: data.submissionType,
        groupId: data.groupId,
        isPublished: false,
        status: "SCHEDULED",
        attachments: data.attachments ? data.attachments :
          (fileUrl && fileName && fileType && fileSize)
            ? {
                create: {
                  fileUrl,
                  fileName,
                  fileType,
                  fileSize,
                  uploadedById: data.createdById,
                },
              }
            : undefined,
      },
      include: {
        attachments: true,
        classSection: true,
        createdBy: true,
      },
    });
  }

  static async submitAssignment(data: {
    assignmentId: string;
    studentId: string;
    file?: { buffer: Buffer; originalName: string; mimetype: string };
  }): Promise<AssignmentSubmission> {
    let fileUrl: string | undefined;
    let fileName: string | undefined;
    let fileType: string | undefined;
    let fileSize: number | undefined;

    if (data.file) {
      if (!data.file.originalName || !data.file.mimetype || !data.file.buffer) {
        throw new Error("Invalid file data: missing required file properties");
      }

      const s3Key = await S3Utils.uploadFile(
        data.file.buffer,
        data.file.originalName,
        data.file.mimetype
      );
      fileUrl = await S3Utils.getFileUrl(s3Key);
      fileName = data.file.originalName;
      fileType = data.file.mimetype;
      fileSize = data.file.buffer.length;
    }

    const assignment = await prisma.assignment.findUnique({
      where: { id: data.assignmentId },
      select: { dueDate: true },
    });

    if (!assignment) {
      throw new Error("Assignment not found");
    }

    const isLate =
      (assignment.dueDate && new Date() > assignment.dueDate) || undefined;

    return prisma.assignmentSubmission.create({
      data: {
        assignmentId: data.assignmentId,
        studentId: data.studentId,
        submissionTime: new Date(),
        status: "PENDING",
        isLate,
        attachments:
          fileUrl && fileName && fileType && fileSize
            ? {
                create: {
                  fileUrl,
                  fileName,
                  fileType,
                  fileSize,
                  uploadedById: data.studentId,
                },
              }
            : undefined,
      },
      include: {
        attachments: true,
        assignment: true,
        student: true,
      },
    });
  }

  static async getAssignments(classSectionId?: string): Promise<Assignment[]> {
    return prisma.assignment.findMany({
      where: classSectionId ? { classSectionId } : undefined,
      include: {
        attachments: true,
        classSection: true,
        createdBy: true,
        submissions: {
          include: {
            student: true,
            attachments: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getAssignmentById(id: string): Promise<Assignment | null> {
    return prisma.assignment.findUnique({
      where: { id },
      include: {
        attachments: true,
        classSection: true,
        createdBy: true,
        submissions: {
          include: {
            student: true,
            attachments: true,
          },
        },
      },
    });
  }

  static async deleteAssignment(id: string): Promise<void> {
    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: { attachments: true },
    });

    if (!assignment) {
      throw new Error("Assignment not found");
    }

    for (const attachment of assignment.attachments) {
      await S3Utils.deleteFile(attachment.fileUrl.split("/").pop()!);
    }

    await prisma.assignment.delete({
      where: { id },
    });
  }
}
