import {NextRequest, NextResponse} from "next/server";
import prisma from "@/lib/prisma";
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log("Received request body:", body);

    const {message, teacherId, studentId} = body;

    if (!message || !teacherId || !studentId) {
      console.log("Missing required fields:", {message, teacherId, studentId});
      return NextResponse.json(
        {error: "Message and teacher ID are required"},
        {status: 400}
      );
    }

    // Verify that the teacher exists
    const teacher = await prisma.teacher.findUnique({
      where: {id: teacherId},
      include: {user: true}
    });

    if (!teacher) {
      console.log("Teacher not found with ID:", teacherId);
      return NextResponse.json(
        {error: "Teacher not found"},
        {status: 404}
      );
    }

    console.log("Found teacher:", {
      id: teacher.id,
      userId: teacher.userId,
      name: teacher.user.name
    });

    // Get student data
    const student = await prisma.student.findUnique({
      where: {id: studentId},
      include: {user: true}
    });

    if (!student) {
      console.log("Student not found for userId:", studentId);
      return NextResponse.json(
        {error: "Student not found"},
        {status: 404}
      );
    }

    console.log("Found student:", {
      id: student.id,
      userId: student.userId,
      name: student.user.name
    });

    console.log("Creating notification for teacher:", teacher.id);

    // Create notification for the teacher
    const notification = await prisma.notification.create({
      data: {
        teacherId: teacher.id,
        studentId: student.id,
        title: `Message from ${student.user.name}`,
        message: message,
        notificationType: 'message',
        actionUrl: `/t/chat/${student.id}`,
        channel: 'chat'
      }
    });

    console.log('Created notification:', {
      id: notification.id,
      teacherId: notification.teacherId,
      title: notification.title,
      message: notification.message
    });

    return NextResponse.json({
      success: true,
      notification
    });
  } catch (error) {
    console.error("Detailed error in send-message:", error);
    // Return more detailed error information
    return NextResponse.json(
      {
        error: "Failed to send message",
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      },
      {status: 500}
    );
  }
}
