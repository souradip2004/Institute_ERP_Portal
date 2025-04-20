import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    // Get auth token from cookie
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    console.log("Received request body:", body);

    const { message, teacherId } = body;

    if (!message || !teacherId) {
      console.log("Missing required fields:", { message, teacherId });
      return NextResponse.json(
        { error: "Message and teacher ID are required" },
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

    // Get student data
    const student = await prisma.student.findFirst({
      where: { userId: decoded.id },
      include: { user: true }
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    console.log("Creating notification for teacher:", teacherId);

    // Create a notification for the teacher
    const notification = await prisma.notification.create({
      data: {
        userId: teacherId,
        title: "New Message from Student",
        message: `${student.user.name}: ${message}`,
        notificationType: "CHAT_MESSAGE",
        isRead: false,
        channel: "web",
        actionUrl: "/t/notifications",
        createdAt: new Date(),
        readAt: null,
        templateId: null
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
