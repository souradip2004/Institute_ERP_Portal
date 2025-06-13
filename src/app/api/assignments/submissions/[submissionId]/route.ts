import { NextRequest, NextResponse } from "next/server";
import { AuthUtils } from "@/utils/authUtils";
import { Role } from "@prisma/client";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { submissionId: string } }
) {
  try {
    
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
        
      },
    });

    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    // Check permissions

    return NextResponse.json(submission, { status: 200 });
  } catch (error) {
    console.error("Error getting submission:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 