import { NextRequest, NextResponse } from "next/server";
import { AuthUtils } from "@/utils/authUtils";
import { Role } from "@prisma/client";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest, props: { params: Promise<{ submissionId: string }> }) {
  const params = await props.params;
  try {
    
console.log("triggered")
    const submissionId = params.submissionId;
    
    // Check if submission exists
    const submission = await prisma.assignmentSubmission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: {
          select: {
            classSectionId: true,
            maxPoints: true,
          },
        },
      },
    });

    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    // Check if teacher is assigned to the class section

    
    

    // Parse request body
    const data = await request.json();
    const { obtainedPoints, feedback,teacherId } = data;
console.log(obtainedPoints,feedback,teacherId)
    // Validate obtained points
    if (
      typeof obtainedPoints !== "number" ||
      obtainedPoints < 0 ||
      obtainedPoints > submission.assignment.maxPoints
    ) {
      return NextResponse.json(
        {
          error: `Points must be a number between 0 and ${submission.assignment.maxPoints}`,
        },
        { status: 400 }
      );
    }

    // Update the submission
    const updatedSubmission = await prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        obtainedPoints,
        feedback,
        status: "GRADED",
        gradedById: teacherId,
        gradedAt: new Date(),
      },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        assignment: true,
      },
    });

    // Optionally: Create a notification for the student about the graded assignment
    // await prisma.notification.create({
    //   data: {
    //     userId: updatedSubmission.student.user.id,
    //     title: "Assignment Graded",
    //     message: `Your submission for "${updatedSubmission.assignment.title}" has been graded.`,
    //     notificationType: "ASSIGNMENT_GRADED",
    //     actionUrl: `/s/assignments/view/${updatedSubmission.assignmentId}`,
    //   },
    // });
    
    return NextResponse.json(updatedSubmission, { status: 200 });
  } catch (error) {
    console.error("Error grading submission:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 