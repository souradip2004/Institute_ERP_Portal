import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = jwt.verify(token, SECRET_KEY) as any;
    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Get teacher's class sections
    const teacher = await prisma.teacher.findFirst({
      where: { userId: decoded.id },
      include: {
        classSections: {
          include: {
            batch: true,
            semester: true
          }
        }
      }
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher record not found" }, { status: 403 });
    }

    return NextResponse.json({ classSections: teacher.classSections });
  } catch (error: any) {
    console.error("Error fetching class sections:", error);
    return NextResponse.json(
      { error: "Failed to fetch class sections", details: error.message },
      { status: 500 }
    );
  }
}
