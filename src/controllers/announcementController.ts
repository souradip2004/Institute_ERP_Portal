import { Role } from '@prisma/client';
import { AnnouncementService } from '@/services/announcementService';
import { AuthUtils } from '@/utils/authUtils';

export class AnnouncementController {
  static async createAnnouncement(user: { id: string; role: Role; teacher?: { id: string } }, data: any) {
    // Validate input
    if (!data.title || !data.content || !data.institutionId) {
      throw new Error('Title, content, and institutionId are required');
    }

    // Authorization checks
    if (user.role !== Role.ADMIN && user.role !== Role.TEACHER) {
      throw new Error('Only admins or teachers can create announcements');
    }

    if (user.role === Role.TEACHER && !user.teacher) {
      throw new Error('Teacher profile not found');
    }

    // If classSectionId is provided, check if teacher is assigned
    if (data.classSectionId && user.role === Role.TEACHER) {
      const isAssigned = await AuthUtils.isTeacherAssignedToClassSection(user.teacher!.id, data.classSectionId);
      if (!isAssigned) {
        throw new Error('Teacher not assigned to this class section');
      }
    }

    // If departmentId is provided, check if user is department head or admin
    if (data.departmentId && user.role === Role.TEACHER) {
      const isDepartmentHead = await AnnouncementService.isDepartmentHead(user.teacher!.id, data.departmentId);
      if (!isDepartmentHead) {
        throw new Error('Only department heads can create department-wide announcements');
      }
    }

    // Create announcement
    return AnnouncementService.createAnnouncement({
      ...data,
      createdById: user.teacher?.id,
    });
  }

  static async getAnnouncements(
    user: { id: string; role: Role; institutionId: string | null; student?: { id: string } },
    filters: {
      institutionId?: string;
      departmentId?: string;
      classSectionId?: string;
      batchId?: string;
    }
  ) {
    // Ensure user has access to the institution
    if (filters.institutionId && user.institutionId !== filters.institutionId && user.role !== Role.ADMIN) {
      throw new Error('Unauthorized access to institution');
    }

    // If student, filter by enrolled class sections
    let studentClassSectionIds: string[] = [];
    if (user.role === Role.STUDENT && user.student) {
      studentClassSectionIds = await AnnouncementService.getStudentClassSectionIds(user.student.id);
      
    }

    return AnnouncementService.getAnnouncements({
      ...filters,
      userRole: user.role,
      studentClassSectionIds,
      institutionId: filters.institutionId || user.institutionId,
    });
  }

  static async updateAnnouncement(user: { id: string; role: Role, teacher?: { id: string } }, announcementId: string, data: any) {
    // Validate input
    if (!data.title && !data.content && !data.isImportant && !data.isPinned && !data.expiryDate) {
      throw new Error('At least one field must be provided for update');
    }

    // Check if announcement exists and user has permission
    const announcement = await AnnouncementService.getAnnouncementById(announcementId);
    if (!announcement) {
      throw new Error('Announcement not found');
    }

    if (announcement.createdById !== user.teacher?.id && user.role !== Role.ADMIN) {
      throw new Error('Only the creator or admin can update this announcement');
    }

    return AnnouncementService.updateAnnouncement(announcementId, data);
  }

  static async deleteAnnouncement(user: { id: string; role: Role }, announcementId: string) {
    // Check if announcement exists and user has permission
    const announcement = await AnnouncementService.getAnnouncementById(announcementId);
    if (!announcement) {
      throw new Error('Announcement not found');
    }

    if (announcement.createdById !== user.id && user.role !== Role.ADMIN) {
      throw new Error('Only the creator or admin can delete this announcement');
    }

    return AnnouncementService.deleteAnnouncement(announcementId);
  }
}