// src/utils/authUtils.ts
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { Role } from "@prisma/client";
import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";

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
   * Gets the current user from the auth session or JWT token
   */
  static async getCurrentUser(request?: NextRequest): Promise<User | null> {
    try {
      // First, try to get the user from the JWT token in the request header
      if (request) {
        // Check for Authorization header (Bearer token)
        const authHeader = request.headers.get("Authorization");
        if (authHeader && authHeader.startsWith("Bearer ")) {
          const token = authHeader.substring(7); // Remove 'Bearer ' prefix
          try {
            // Verify the JWT token
            const decodedToken = verify(
              token,
              process.env.JWT_SECRET || "your-secret-key"
            ) as any;

            if (decodedToken && decodedToken.id) {
              // Get fresh user data from the database using the ID from the token
              const user = await prisma.user.findUnique({
                where: { id: decodedToken.id },
                include: {
                  student: {
                    select: { id: true },
                  },
                  teacher: {
                    select: { id: true },
                  },
                },
              });

              if (user) {
                return user as User;
              }
            }
          } catch (tokenError) {
            console.error("Error verifying JWT token:", tokenError);
          }
        }

        // Check for auth_token cookie
        const cookieValue = request.cookies.get("auth_token")?.value;
        if (cookieValue) {
          try {
            const decodedToken = verify(
              cookieValue,
              process.env.JWT_SECRET || "your-secret-key"
            ) as any;

            if (decodedToken && decodedToken.id) {
              const user = await prisma.user.findUnique({
                where: { id: decodedToken.id },
                include: {
                  student: {
                    select: { id: true },
                  },
                  teacher: {
                    select: { id: true },
                  },
                },
              });

              if (user) {
                return user as User;
              }
            }
          } catch (cookieError) {
            console.error("Error verifying cookie token:", cookieError);
          }
        }
      }

      // If no valid token found, try getting the user from the Next.js auth session
      const session = await auth();

      if (!session) {
        return null;
      }

      // Fetch user data from the database
      const user = await prisma.user.findUnique({
        where: { email: session.user.email as string },
        include: {
          student: {
            select: { id: true },
          },
          teacher: {
            select: { id: true },
          },
        },
      });

      if (!user) {
        return null;
      }

      return user as User;
    } catch (error) {
      console.error("Error authenticating user:", error);
      return null;
    }
  }

  static async isTeacherAssignedToClassSection(
    teacherId: string,
    classSectionId: string
  ): Promise<boolean> {
    try {
      const classSection = await prisma.classSection.findFirst({
        where: {
          id: classSectionId,
          teacherId: teacherId,
        },
      });

      return !!classSection;
    } catch (error) {
      console.error("Error checking teacher class assignment:", error);
      return false;
    }
  }

  static async doesTeacherTeachStudent(
    teacherId: string,
    studentId: string
  ): Promise<boolean> {
    try {
      const teacherClasses = await prisma.classSection.findMany({
        where: {
          teacherId: teacherId,
        },
        select: {
          id: true,
        },
      });

      const classSectionIds = teacherClasses.map((tc) => tc.id);

      if (classSectionIds.length === 0) {
        return false;
      }

      const studentEnrollment = await prisma.studentClassEnrollment.findFirst({
        where: {
          studentId: studentId,
          classSectionId: {
            in: classSectionIds,
          },
        },
      });

      return !!studentEnrollment;
    } catch (error) {
      console.error("Error checking if teacher teaches student:", error);
      return false;
    }
  }

  static async isStudentEnrolledInClassSection(
    studentId: string,
    classSectionId: string
  ): Promise<boolean> {
    try {
      const enrollment = await prisma.studentClassEnrollment.findFirst({
        where: {
          studentId: studentId,
          classSectionId: classSectionId,
        },
      });

      return !!enrollment;
    } catch (error) {
      console.error("Error checking student enrollment:", error);
      return false;
    }
  }
}
