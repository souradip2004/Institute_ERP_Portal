import {NextRequest, NextResponse} from "next/server";
import prisma from "@/lib/prisma";
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {

  try {
    // Get auth token from cookie

    // Get teacherId from query parameters
    const {searchParams} = new URL(request.url);
    const teacherId = searchParams.get('teacherId') as string;
    console.log('Fetching notifications for userId:', teacherId);

    if (!teacherId) {
      console.log('No userId provided in query params');
      return NextResponse.json({error: 'User ID is required'}, {status: 400});
    }
    const teacherExists = await prisma.teacher.findUnique({
      where: {
        id: teacherId
      }
    })

    console.log('Found teacher:', teacherExists);

    if (!teacherExists) {
      return NextResponse.json({error: "No teacher found"}, {status: 404});
    }

    // Get notifications for the specific teacher
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

    console.log('Found notifications:', notifications);
    console.log('Number of notifications found:', notifications.length);

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      {error: "Failed to fetch notifications"},
      {status: 500}
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get auth token from cookie
    /*   const token = request.cookies.get('auth_token')?.value;

       if (!token) {
         return NextResponse.json({error: "Not authenticated"}, {status: 401});
       }

       // Verify token
       const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;

       console.log('Decoded token:', decoded);
       if (!decoded || !decoded.id) {
         return NextResponse.json({error: "Invalid token"}, {status: 401});
       }*/

    const body = await request.json();
    const {notificationIds, teacherId} = body;

    if (!notificationIds || !Array.isArray(notificationIds)) {
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

    console.log("All notifications ", notificationIds, teacherId);

    // Mark notifications as read
    await prisma.notification.updateMany({
      where: {
        id: {
          in: notificationIds
        },
        userId: teacherExists.userId
      },
      data: {
        isRead: true,
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