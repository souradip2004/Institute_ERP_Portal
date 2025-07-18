import {NextRequest, NextResponse} from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(request: NextRequest) {
  try {

    const body = await request.json();
    const {notificationId, replyText, teacherId} = body;

    if (!notificationId || !replyText.trim()|| !teacherId) {
      return NextResponse.json(
        {error: "Invalid notification IDs"},
        {status: 400}
      );
    }

    const teacherExists = await prisma.teacher.findUnique({
      where: {
        id: teacherId
      }
    })

    if (!teacherExists) {
      return NextResponse.json({error: "Teacher doesn't exist"}, {status: 404})
    }

    console.log("All notifications ", notificationId, teacherId, replyText);

    // Mark notifications as read
    await prisma.notification.update({
      where: {
        id: notificationId,
        userId: teacherExists.userId
      },
      data: {
        isRead: true,
        replyText,
        readAt: new Date()
      }
    });

    const notifications = await prisma.notification.findMany({
      where: {
        userId: teacherExists.userId,
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    console.log("Updated notifications:", notifications);
    return NextResponse.json({notifications, success: true});
  } catch (error) {
    console.error("Error updating notifications:", error);
    return NextResponse.json(
      {error: "Failed to update notifications"},
      {status: 500}
    );
  }
}