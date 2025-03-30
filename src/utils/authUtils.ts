// src/utils/authUtils.ts
import { NextRequest } from 'next/server';
import prisma from '@/config/prisma';
import { auth } from '@/auth';
import { Role } from '@prisma/client';

export interface User {
  id: string;
  role: Role;
  institutionId: string | null;
  student?: {
    id: string;
  };
  teacher?: {
    id: string;
  };
}

export class AuthUtils {
  /**
   * Gets the current user from the auth session
   */
  static async getCurrentUser(): Promise<User | null> {
    try {
      const session = await auth();
      //console.log("Session in auth utils", session);
      
      if (!session) {
        //console.log("No session found or user ID is missing");
        return null;
      }
      
      // Fetch user data with related entities
      const user = await prisma.user.findUnique({
        where: { email: session.user.email as string },
        include: {
          student: {
            select: { id: true }
          },
          teacher: {
            select: { id: true }
          }
        }
      });
      //console.log("User in auth utils", user);
      
      if (!user) {
        return null;
      }
      
      return user as User;
    } catch (error) {
      console.error('Error authenticating user:', error);
      return null;
    }
  }
  
  static async isTeacherAssignedToClassSection(teacherId: string, classSectionId: string): Promise<boolean> {
    try {
      const classSection = await prisma.classSection.findFirst({
        where: {
          id: classSectionId,
          teacherId: teacherId
        }
      });
      
      return !!classSection;
    } catch (error) {
      console.error('Error checking teacher class assignment:', error);
      return false;
    }
  }
  
  static async doesTeacherTeachStudent(teacherId: string, studentId: string): Promise<boolean> {
    try {
      const teacherClasses = await prisma.classSection.findMany({
        where: {
          teacherId: teacherId
        },
        select: {
          id: true
        }
      });
      
      const classSectionIds = teacherClasses.map(tc => tc.id);
      
      if (classSectionIds.length === 0) {
        return false;
      }
      
      const studentEnrollment = await prisma.studentClassEnrollment.findFirst({
        where: {
          studentId: studentId,
          classSectionId: {
            in: classSectionIds
          }
        }
      });
      
      return !!studentEnrollment;
    } catch (error) {
      console.error('Error checking if teacher teaches student:', error);
      return false;
    }
  }

  static async isStudentEnrolledInClassSection(studentId: string, classSectionId: string): Promise<boolean> {
    try {
      const enrollment = await prisma.studentClassEnrollment.findFirst({
        where: {
          studentId: studentId,
          classSectionId: classSectionId
        }
      });
      
      return !!enrollment;
    } catch (error) {
      console.error('Error checking student enrollment:', error);
      return false;
    }
  }
}