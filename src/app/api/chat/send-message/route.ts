import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Received request body:", body);

    const { message, teacherId, studentId } = body;

    if (!message || !teacherId || !studentId) {
      console.log("Missing required fields:", { message, teacherId, studentId });
      return NextResponse.json(
        { error: "Message, teacher ID, and student ID are required" },
        { status: 400 }
      );
    }

    // Verify that the teacher exists
    const teacher = await prisma.user.findUnique({
      where: { id: teacherId }
    });

    if (!teacher) {
      console.log("Teacher not found with ID:", teacherId);
      return NextResponse.json(
        { error: "Teacher not found" },
        { status: 404 }
      );
    }

    console.log("Creating notification for teacher:", teacherId);

    // Create a notification for the teacher
    const notification = await prisma.notification.create({
      data: {
        userId: teacherId,
        title: "New Student Message",
        message: message,
        notificationType: "CHAT_MESSAGE",
        isRead: false,
        channel: "web",
        actionUrl: "/t/notifications",
        createdAt: new Date(),
      },
    });

    console.log("Notification created successfully:", notification);

    return NextResponse.json({
      success: true,
      notification
    });
  } catch (error) {
    console.error("Detailed error in send-message:", error);
    return NextResponse.json(
      { error: "Failed to send message", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
