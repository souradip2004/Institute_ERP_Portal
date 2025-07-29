import {NextRequest, NextResponse} from "next/server";
import prisma from "@/lib/prisma";
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(req: NextRequest) {
  try {
    // Get auth token from cookie
    const token = req.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({error: "Not authenticated"}, {status: 401});
    }

    // Verify token
    const decoded = jwt.verify(token, SECRET_KEY) as any;
    if (!decoded || !decoded.id) {
      return NextResponse.json({error: "Invalid token"}, {status: 401});
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: {id: decoded.id},
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    if (!user) {
      return NextResponse.json({error: "User not found"}, {status: 404});
    }

    if (user.role !== "TEACHER") {
      return NextResponse.json({error: "User is not a teacher"}, {status: 403});
    }

    // Get teacher details
    const teacher = await prisma.teacher.findFirst({
      where: {userId: user.id},
      include: {
        department: {
          select: {
            id: true,
            name: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!teacher) {
      return NextResponse.json({error: "Teacher record not found"}, {status: 404});
    }

    return NextResponse.json({
      success: true,
      teacher: {
        id: teacher.id,
        userId: teacher.userId,
        teacherCode: teacher.teacherCode,
        qualification: teacher.qualification,
        department: teacher.department,
        user: teacher.user
      }
    });
  } catch (error: any) {
    console.error("Error fetching teacher profile:", error);
    return NextResponse.json(
      {error: "Failed to fetch teacher profile: " + error.message},
      {status: 500}
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const {searchParams} = new URL(request.url);
    const userId = searchParams.get("id");

    if (!userId) {
      return NextResponse.json({error: "userId is required!"}, {status: 400});
    }

    // Use a transaction to ensure the entire operation is atomic
    const deletedTeacher = await prisma.$transaction(async (tx) => {
      // 1. Find the teacher and include their class sections to get motherClassIds
      const teacher = await tx.teacher.findUnique({
        where: {
          userId: userId,
        },
        include: {
          classSections: {
            select: {
              motherClassId: true,
            },
          },
        },
      });

      if (!teacher) {
        throw new Error("User does not exist");
      }

      // 2. Collect all unique, non-null motherClassIds associated with this teacher
      const motherClassIds = [
        ...new Set(
          teacher.classSections
          .map((section) => section.motherClassId)
          .filter((id): id is string => id !== null)
        ),
      ];

      // 3. Delete the teacher. Prisma's onDelete: Cascade will handle deleting associated ClassSections.
      const deletedTeacherRecord = await tx.teacher.delete({
        where: {
          userId: userId,
        },
      });

      // 4. Check for and delete any orphaned MotherClass records
      if (motherClassIds.length > 0) {
        // Find which of the mother classes are now empty
        const motherClassesToDelete = [];
        for (const id of motherClassIds) {
          const remainingSections = await tx.classSection.count({
            where: {
              motherClassId: id,
            }
          });

          if (remainingSections === 0) {
            motherClassesToDelete.push(id);
          }
        }

        // Delete the orphaned mother classes
        if (motherClassesToDelete.length > 0) {
          await tx.motherClass.deleteMany({
            where: {
              id: {
                in: motherClassesToDelete,
              },
            },
          });
        }
      }

      return deletedTeacherRecord;
    });

    return NextResponse.json(
      {message: "Deletion successful", deletedTeacher},
      {status: 200}
    );
  } catch (error: any) {
    console.error(error);

    if (error.message === "User does not exist") {
      return NextResponse.json({error: "User does not exist"}, {status: 404});
    }

    return NextResponse.json(
      {message: "Internal server error!", description: error.message},
      {status: 500}
    );
  }
}