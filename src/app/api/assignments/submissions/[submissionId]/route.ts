import { NextRequest, NextResponse } from "next/server";
import { AuthUtils } from "@/utils/authUtils";
import { Role } from "@prisma/client";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { submissionId: string } }
) {
  try {
    const user = await AuthUtils.getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const submissionId = params.submissionId;
    
    // Check if submission exists
    const submission = await prisma.assignmentSubmission.findUnique({
      where: { id: submissionId },
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        assignment: {
          select: {
            id: true,
            title: true,
            maxPoints: true,
            description: true,
            classSectionId: true,
            dueDate: true,
            createdById: true,
          },
        },
        attachments: true,
        gradedBy: user.role === Role.TEACHER ? {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        } : false,
      },
    });

    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    // Check permissions
    if (user.role === Role.STUDENT) {
      // Students can only view their own submissions
      if (user.student?.id !== submission.studentId) {
        return NextResponse.json(
          { error: "Not authorized to view this submission" },
          { status: 403 }
        );
      }
    } else if (user.role === Role.TEACHER) {
      // Teachers can only view submissions for classes they teach
      const isAssigned = await AuthUtils.isTeacherAssignedToClassSection(
        user.teacher!.id,
        submission.assignment.classSectionId
      );
      
      if (!isAssigned) {
        return NextResponse.json(
          { error: "Not authorized to view this submission" },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(submission, { status: 200 });
  } catch (error) {
    console.error("Error getting submission:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 