import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";

export class AnnouncementService {
  static async createAnnouncement(data: {
    title: string;
    content: string;
    institutionId: string;
    departmentId?: string;
    classSectionId?: string;
    isImportant?: boolean;
    isPinned?: boolean;
    expiryDate?: Date;
    createdById: string;
  }) {
    return prisma.announcement.create({
      data: {
        title: data.title,
        content: data.content,
        institutionId: data.institutionId,
        departmentId: data.departmentId,
        classSectionId: data.classSectionId,
        isImportant: data.isImportant ?? false,
        isPinned: data.isPinned ?? false,
        expiryDate: data.expiryDate,
        createdById: data.createdById,
      },
      include: {
        institution: { select: { name: true } },
        department: { select: { name: true } },
        classSection: { select: { sectionName: true } },
        createdByTeacher: { include: { user: { select: { name: true } } } },
      },
    });
  }

  static async getAnnouncements(params: {
    institutionId?: string | null;
    departmentId?: string;
    classSectionId?: string;
    batchId?: string;
    userRole: Role;
    studentClassSectionIds?: string[];
  }) {
    const where: any = {};

    // Apply institution filter
    if (params.institutionId) {
      where.institutionId = params.institutionId;
    }

    // Apply department filter
    if (params.departmentId) {
      where.departmentId = params.departmentId;
    }

    // Apply class section filter or student enrollment
    if (params.classSectionId) {
      where.classSectionId = params.classSectionId;
    } else if (
      params.userRole === Role.STUDENT &&
      params.studentClassSectionIds?.length
    ) {
      where.classSectionId = { in: params.studentClassSectionIds };
    }

    // Apply batch filter (join through classSection and batch)
    if (params.batchId) {
      where.classSection = { batchId: params.batchId };
    }

    // Only show non-expired announcements
    where.OR = [{ expiryDate: null }, { expiryDate: { gte: new Date() } }];

    return prisma.announcement.findMany({
      where,
      include: {
        institution: { select: { name: true } },
        department: { select: { name: true } },
        classSection: { select: { sectionName: true } },
        createdByTeacher: { include: { user: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getAnnouncementById(id: string) {
    return prisma.announcement.findUnique({
      where: { id },
    });
  }

  static async updateAnnouncement(
    id: string,
    data: {
      title?: string;
      content?: string;
      isImportant?: boolean;
      isPinned?: boolean;
      expiryDate?: Date | null;
    }
  ) {
    return prisma.announcement.update({
      where: { id },
      data,
      include: {
        institution: { select: { name: true } },
        department: { select: { name: true } },
        classSection: { select: { sectionName: true } },
        createdByTeacher: { include: { user: { select: { name: true } } } },
      },
    });
  }

  static async deleteAnnouncement(id: string) {
    return prisma.announcement.delete({
      where: { id },
    });
  }

  static async isDepartmentHead(teacherId: string, departmentId: string) {
    const departmentHead = await prisma.departmentHead.findFirst({
      where: {
        teacherId,
        departmentId,
        OR: [{ endDate: null }, { endDate: { gte: new Date() } }],
      },
    });
    return !!departmentHead;
  }

  static async getStudentClassSectionIds(studentId: string) {
    const enrollments = await prisma.studentClassEnrollment.findMany({
      where: { studentId },
      select: { classSectionId: true },
    });
    return enrollments.map((e) => e.classSectionId);
  }
}
