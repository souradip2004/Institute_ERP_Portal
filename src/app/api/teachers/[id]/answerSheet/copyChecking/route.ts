// app/api/teacher/[id]/answerSheet/savePythonResponse/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { pythonParsedResponse, examId } = await request.json();
    
    if (!pythonParsedResponse || !examId) {
      return NextResponse.json(
        { success: false, message: 'Missing required data' },
        { status: 400 }
      );
    }

    // Find the most recent answer sheet for this exam
    const answerSheet = await prisma.teacherAnswerSheet.findFirst({
      where: {
        examId: examId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!answerSheet) {
      return NextResponse.json(
        { success: false, message: 'No answer sheet found for this exam' },
        { status: 404 }
      );
    }

    // Update the answer sheet with the Python response
    const updatedAnswerSheet = await prisma.teacherAnswerSheet.update({
      where: {
        id: answerSheet.id,
      },
      data: {
        pythonParsedResponse: [pythonParsedResponse],
      },
    });

    return NextResponse.json({
      success: true,
      id: updatedAnswerSheet.id,
    });
  } catch (error) {
    console.error('Error saving Python response:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save Python response' },
      { status: 500 }
    );
  }
}