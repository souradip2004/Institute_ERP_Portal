// app/api/teacher/[id]/answerSheet/saveConfiguration/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { 
      pythonParsedResponse, 
      examId,
      config1,
      config2,
      config3
    } = await request.json();
    
    // Find the most recent answer sheet for this exam
    let answerSheet = await prisma.teacherAnswerSheet.findFirst({
      where: {
        examId: examId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!answerSheet) {
      // If no answer sheet exists yet, create a new one
      answerSheet = await prisma.teacherAnswerSheet.create({
        data: {
          ansSheetS3URL: "", // This would normally be set during the PDF upload
          examId: examId,
          config1: {},
          config2: {},
          config3: {},
          pythonParsedResponse: [],
        },
      });
      console.log('No existing answer sheet found, created new one:', answerSheet.id);
    }

    // Update the answer sheet with configurations and Python response
    const updatedAnswerSheet = await prisma.teacherAnswerSheet.updateMany({
      where: {
        examId: examId,
      },
      data: {
        config1: config1,
        config2: config2,
        config3: config3,
        pythonParsedResponse: [pythonParsedResponse],
      },
    });
      console.log(examId)
      console.log(pythonParsedResponse)
      console.log('answer sheet saved successfully: ', updatedAnswerSheet);

    return NextResponse.json({
      success: true,
      id: updatedAnswerSheet,
    });
  } catch (error) {
    console.error('Error saving configuration:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save configuration' },
      { status: 500 }
    );
  }
}