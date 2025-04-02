import { NextRequest, NextResponse } from "next/server";
import { CourseController } from "@/controllers/courseController";

const courseController = new CourseController();

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const courses = await courseController.getCoursesByDepartment(id);
        return NextResponse.json(courses, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
