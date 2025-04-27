// app/api/teacher/[id]/answerSheet/uploadAnswerSheet/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { S3Utils } from '@/utils/s3Utils';
import { PrismaClient } from '@prisma/client';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`[UPLOAD] Incoming request to upload answer sheet `);

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      console.warn('[UPLOAD] No file found in request');
      return NextResponse.json(
        { success: false, message: 'No file uploaded' },
        { status: 400 }
      );
    }

    console.log(`[UPLOAD] Received file: ${file.name}, type: ${file.type}`);

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    console.log('[UPLOAD] Converted file to buffer');

    // Upload to S3
    const s3Key = await S3Utils.uploadFile(buffer, file.name, file.type);
    console.log(`[UPLOAD] File uploaded to S3 at key: ${s3Key}`);

    // Create a new teacher answer sheet record
    const newAnswerSheet = await prisma.teacherAnswerSheet.create({
      data: {
        ansSheetS3URL: s3Key,
        examId: 'exam-123', // Hardcoded for now
        config1: {}, // Empty JSON for now update when teacher save answer configuration
        config2: {}, // Empty JSON for now
        config3: {}, // Empty JSON for now
        pythonParsedResponse: [],
      },
    });

    console.log(`[UPLOAD] Answer sheet record created in DB with ID: ${newAnswerSheet.id}  and url: ${s3Key}  `);

    return NextResponse.json({
      success: true,
      id: newAnswerSheet.id,
      ansSheetS3URL: s3Key,
    });
  } catch (error) {
    console.error('❌ [UPLOAD] Error uploading answer sheet:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to upload answer sheet' },
      { status: 500 }
    );
  }
}
