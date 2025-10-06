import prisma from "@/lib/prisma";
import {Assignment, AssignmentSubmission} from "@prisma/client";
import {S3Utils} from "@/utils/s3Utils";

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
    attachments?: { // Made attachments optional for clarity
      create: Array<{
        fileUrl: string;
        fileName: string;
        fileType: string;
        fileSize: number;
        uploadedById: string;
      }>;
    };
  }): Promise<Assignment> {
    const {file, attachments, ...assignmentData} = data;

    console.log("Final data to be used for assignment creation:", data);
    // 4. Build and execute the final Prisma query
    return prisma.assignment.create({
      data: {
        ...assignmentData, // Use the destructured assignment data
        isPublished: false,
        status: "SCHEDULED",
        attachments
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
    userId: string;
    file: File;
  }): Promise<AssignmentSubmission> {


      if(!data.file || !data.file.name || !data.file.type || !data.file.size){
        throw new Error("Invalid file data: missing required file properties");
      }

      const s3Key = await S3Utils.uploadFile(
        data.file,
        data.file.name,
        data.file.type
      );

      const fileUrl = await S3Utils.getFileUrl(s3Key);
      const fileName = data.file.name;
      const fileType = data.file.type;
      const fileSize = data.file.size;


    const assignment = await prisma.assignment.findUnique({
      where: {id: data.assignmentId},
      select: {dueDate: true},
    });

    if (!assignment) {
      throw new Error("Assignment not found");
    }

    const isLate =
      (assignment.dueDate && new Date() > assignment.dueDate) || undefined;
    console.log("studentId", data.studentId);
    return prisma.assignmentSubmission.create({
      data: {
        assignmentId: data.assignmentId,
        studentId: data.studentId,
        submissionTime: new Date(),
        status: "PENDING",
        isLate,
        attachments: {
          create: {
            fileUrl,
            fileName,
            fileType,
            fileSize,
            uploadedById: data.userId,
          },
        }
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
      where: classSectionId ? {classSectionId} : undefined,
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
      orderBy: {createdAt: "desc"},
    });
  }

  static async getAssignmentById(id: string): Promise<Assignment | null> {
    return prisma.assignment.findUnique({
      where: {id},
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
      where: {id},
      include: {attachments: true},
    });

    if (!assignment) {
      throw new Error("Assignment not found");
    }

    for (const attachment of assignment.attachments) {
      await S3Utils.deleteFile(attachment.fileUrl.split("/").pop()!);
    }

    await prisma.assignment.delete({
      where: {id},
    });
  }

  static async getAssignmentsByClassSection(
    classSectionId: string,
    studentId: string
  ): Promise<Assignment[]> {
    return prisma.assignment.findMany({
      where: {
        classSectionId,
        isPublished: true, // Only get published assignments
      },
      include: {
        attachments: true,
        classSection: {
          include: {
            batch: true,
            semester: true,
          },
        },
        createdBy: true,
        submissions: {
          where: {
            studentId, // Only include submissions by this student
          },
          include: {
            student: true,
            attachments: true,
          },
        },
      },
      orderBy: {createdAt: "desc"},
    });
  }
}
