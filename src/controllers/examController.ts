import {NextRequest, NextResponse} from "next/server";
import {ExamService} from "@/services/examService";
import {AuthUtils} from "@/utils/authUtils";
import {Role} from "@prisma/client";

// Create a shared instance
const examService = new ExamService();

export class ExamController {
  async getAllExams(req: NextRequest) {
    try {
      const exams = await examService.getAllExams();
      return NextResponse.json(exams);
    } catch (error: any) {
      return NextResponse.json({error: error.message}, {status: 500});
    }
  }

  async getAllExamsByCreatedBy(req: NextRequest, createdBy: string) {
    try {

      const exams = await examService.getExamByCreatedById(createdBy);
      return NextResponse.json(exams);
    } catch (error: any) {
      return NextResponse.json({error: error.message}, {status: 500});
    }
  }

  async getMyExams(req: NextRequest) {
    try {
      console.log("getMyExams method called");

      // Create a local instance for testing
      const localExamService = new ExamService();
      console.log("Local ExamService instance created");


      // Get classSectionId from query parameter
      const classSectionId = req.nextUrl.searchParams.get("classSectionId");
      console.log("ClassSectionId:", classSectionId);
      const studentId = req.nextUrl.searchParams.get("studentID");

      // Check for null values
      if (!classSectionId || !studentId) {
        return NextResponse.json(
          {error: "Missing classSectionId or studentID in query parameters"},
          {status: 400}
        );
      }

      console.log("About to call getExamsByClassSection with:", {
        classSectionId,
        studentId: studentId,
      });

      // Get exams for this class section
      // Try both the shared instance and local instance for debugging
      let exams;
      try {
        exams = await localExamService.getExamsByClassSection(
          classSectionId,
          studentId
        );
        console.log("Successfully retrieved exams with local instance");
      } catch (localError) {
        console.error("Error with local instance:", localError);

        // Try with the shared instance as fallback
        exams = await examService.getExamsByClassSection(
          classSectionId,
          studentId
        );
        console.log("Successfully retrieved exams with shared instance");
      }

      console.log(`Retrieved ${exams.length} exams`);
      return NextResponse.json(exams, {status: 200});
    } catch (error: any) {
      console.error("Error fetching student exams:", error);
      return NextResponse.json(
        {error: "Internal server error", details: error.message},
        {status: 500}
      );
    }
  }

  async createExam(req: NextRequest) {
    try {
      const data = await req.json();
      const exam = await examService.createExam(data);
      return NextResponse.json(exam, {status: 201});
    } catch (error: any) {
      return NextResponse.json({error: error.message}, {status: 500});
    }
  }

  async getExamById(id: string) {
    try {
      const exam = await examService.getExamById(id);
      if (!exam) {
        return NextResponse.json({error: "Exam not found"}, {status: 404});
      }
      return NextResponse.json(exam);
    } catch (error: any) {
      return NextResponse.json({error: error.message}, {status: 500});
    }
  }

  async updateExam(id: string, req: NextRequest) {
    try {
      const data = await req.json();

      return NextResponse.json(exam);
    } catch (error: any) {
      return NextResponse.json({error: error.message}, {status: 500});
    }
  }

  async deleteExam(id: string) {
    try {
      await examService.deleteExam(id);
      return NextResponse.json({message: "Exam deleted successfully"});
    } catch (error: any) {
      return NextResponse.json({error: error.message}, {status: 500});
    }
  }
}
