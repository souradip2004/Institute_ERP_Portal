import { NextRequest, NextResponse } from "next/server";
import { AssignmentService } from "@/services/assignmentService";
import { AuthUtils } from "@/utils/authUtils";
import { Role } from "@prisma/client";

export class AssignmentController {
  static async createAssignment(request: NextRequest): Promise<NextResponse> {
    try {
      const user = await AuthUtils.getCurrentUser(request);
      if (!user || user.role !== Role.TEACHER || !user.teacher) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const formData = await request.formData();
      const title = formData.get("title") as string;
      const description = formData.get("description") as string | undefined;
      const classSectionId = formData.get("classSectionId") as string;
      const dueDate = formData.get("dueDate") as string | undefined;
      const maxPoints = parseFloat(formData.get("maxPoints") as string);
      const submissionType = formData.get("submissionType") as
        | "INDIVIDUAL"
        | "GROUP";
      const groupId = formData.get("groupId") as string | undefined;
      const file = formData.get("file") as File | null;

      if (!title || !classSectionId || !maxPoints || !submissionType) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        );
      }

      const isTeacherAssigned = await AuthUtils.isTeacherAssignedToClassSection(
        user.teacher.id,
        classSectionId
      );
      if (!isTeacherAssigned) {
        return NextResponse.json(
          { error: "Teacher not assigned to this class" },
          { status: 403 }
        );
      }

      let fileData;
      if (file) {
        const buffer = Buffer.from(await file.arrayBuffer());
        fileData = {
          buffer,
          originalName: file.name,
          mimetype: file.type,
        };
      }

      const assignment = await AssignmentService.createAssignment({
        title,
        description,
        classSectionId,
        createdById: user.teacher.id,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        maxPoints,
        submissionType,
        groupId,
        file: fileData,
      });

      return NextResponse.json(assignment, { status: 201 });
    } catch (error) {
      console.log("Error creating assignment:", error);
      console.error("Error creating assignment:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }

  static async createAssignmentJson(
    request: NextRequest
  ): Promise<NextResponse> {
    try {
      

      // Parse JSON data
      const data = await request.json();
      const {
        title,
        description,
        classSectionId,
        userId,
        dueDate,
        maxPoints,
        teacherId,
        submissionType = "INDIVIDUAL",
        groupId,
        attachments = [],
      } = data;
console.log("User ID:", userId);
      console.log("Teacher ID:", teacherId);
      console.log("classSectionId:", classSectionId);
      if (!title || !classSectionId || !maxPoints || !submissionType) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        );
      }

   

      // Process attachments if provided
      let attachmentsData;
      if (attachments && attachments.length > 0) {
        attachmentsData = {
          create: attachments.map(
            (attachment: {
              fileUrl: string;
              fileName: string;
              fileType: string;
              fileSize: number | string;
            }) => ({
              fileUrl: attachment.fileUrl,
              fileName: attachment.fileName,
              fileType: attachment.fileType,
              fileSize: Number(attachment.fileSize),
              uploadedById: userId, // User ID for the User relation
            })
          ),
        };
      }

      // Create assignment with attachments
      const assignment = await AssignmentService.createAssignment({
        title,
        description,
        classSectionId,
        createdById: teacherId,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        maxPoints: parseFloat(maxPoints),
        submissionType,
        groupId,
        attachments: attachmentsData,
      });

      return NextResponse.json(assignment, { status: 201 });
    } catch (error) {
      console.error("Error creating assignment:", error);
      return NextResponse.json(
        {
          error: "Internal server error",
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 500 }
      );
    }
  }

  static async submitAssignment(request: NextRequest): Promise<NextResponse> {
    try {
      const user = await AuthUtils.getCurrentUser(request);
      if (!user || user.role !== Role.STUDENT || !user.student) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const formData = await request.formData();
      const assignmentId = formData.get("assignmentId") as string;
      const file = formData.get("file") as File | null;

      if (!assignmentId) {
        return NextResponse.json(
          { error: "Missing assignmentId" },
          { status: 400 }
        );
      }

      const assignment = await AssignmentService.getAssignmentById(
        assignmentId
      );
      if (!assignment) {
        return NextResponse.json(
          { error: "Assignment not found" },
          { status: 404 }
        );
      }

      const isEnrolled = await AuthUtils.isStudentEnrolledInClassSection(
        user.student.id,
        assignment.classSectionId
      );
      if (!isEnrolled) {
        return NextResponse.json(
          { error: "Student not enrolled in this class" },
          { status: 403 }
        );
      }

      let fileData;
      if (file) {
        const buffer = Buffer.from(await file.arrayBuffer());
        fileData = {
          buffer,
          originalName: file.name,
          mimetype: file.type,
        };
      }

      const submission = await AssignmentService.submitAssignment({
        assignmentId,
        studentId: user.student.id,
        file: fileData,
      });

      return NextResponse.json(submission, { status: 201 });
    } catch (error) {
      console.error("Error submitting assignment:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }

  static async getAssignments(request: NextRequest): Promise<NextResponse> {
    try {
     

      const classSectionId =
        request.nextUrl.searchParams.get("classSectionId") || undefined;

   

      const assignments = await AssignmentService.getAssignments(
        classSectionId
      );
      return NextResponse.json(assignments, { status: 200 });
    } catch (error) {
      console.error("Error fetching assignments:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }

  static async getAssignmentById(
    request: NextRequest,
    id: string
  ): Promise<NextResponse> {
    try {
     
      const assignment = await AssignmentService.getAssignmentById(id);
      if (!assignment) {
        return NextResponse.json(
          { error: "Assignment not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(assignment, { status: 200 });
    } catch (error) {
      console.error("Error fetching assignment:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }

  static async deleteAssignment(
    request: NextRequest,
    id: string
  ): Promise<NextResponse> {
    try {
      const user = await AuthUtils.getCurrentUser(request);
      if (!user || user.role !== Role.TEACHER || !user.teacher) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const assignment = await AssignmentService.getAssignmentById(id);
      if (!assignment) {
        return NextResponse.json(
          { error: "Assignment not found" },
          { status: 404 }
        );
      }

      const isAssigned = await AuthUtils.isTeacherAssignedToClassSection(
        user.teacher.id,
        assignment.classSectionId
      );
      if (!isAssigned) {
        return NextResponse.json(
          { error: "Not assigned to this class" },
          { status: 403 }
        );
      }

      await AssignmentService.deleteAssignment(id);
      return NextResponse.json(
        { message: "Assignment deleted successfully" },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error deleting assignment:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }

  static async getMyAssignments(request: NextRequest): Promise<NextResponse> {
    try {
      const user = await AuthUtils.getCurrentUser(request);
      if (!user || user.role !== Role.STUDENT || !user.student) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Get classSectionId from query parameter
      const classSectionId = request.nextUrl.searchParams.get("classSectionId");

      if (!classSectionId) {
        return NextResponse.json(
          { error: "Missing classSectionId" },
          { status: 400 }
        );
      }

      // Check if student is enrolled in this class section
      const isEnrolled = await AuthUtils.isStudentEnrolledInClassSection(
        user.student.id,
        classSectionId
      );

      if (!isEnrolled) {
        return NextResponse.json(
          { error: "Not enrolled in this class section" },
          { status: 403 }
        );
      }

      // Get assignments for this class section
      const assignments = await AssignmentService.getAssignmentsByClassSection(
        classSectionId,
        user.student.id
      );

      return NextResponse.json(assignments, { status: 200 });
    } catch (error) {
      console.error("Error fetching student assignments:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }
}
