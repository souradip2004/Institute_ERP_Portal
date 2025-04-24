// app/api/uploadFigure/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { S3Utils } from '@/utils/s3Utils';

export async function POST(request: NextRequest) {
  try {
    console.log('route hit for uploading figure');
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Upload to S3
    const s3Key = await S3Utils.uploadFile(
      buffer,
      file.name,
      file.type
    );

    console.log('diagram uploaded to S3: ', s3Key);
    const filePublicUrl = S3Utils.getPublicUrl(s3Key);
    console.log('public url for diagram: ', filePublicUrl);
    return NextResponse.json({
      success: true,
      url: filePublicUrl,
    });
  } catch (error) {
    console.error('Error uploading figure:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to upload figure' },
      { status: 500 }
    );
  }
}