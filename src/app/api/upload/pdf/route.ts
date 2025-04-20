import { NextRequest, NextResponse } from "next/server";
import { S3Utils } from "@/utils/s3Utils";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  try {
    if (!req.body) {
      return NextResponse.json(
        { success: false, message: "No file provided" },
        { status: 400 }
      );
    }

    // Parse the form data
    const formData = await req.formData();
    const file = formData.get("pdf") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file found in request" },
        { status: 400 }
      );
    }

    // Validate file is a PDF
    if (!file.type.includes("pdf")) {
      return NextResponse.json(
        { success: false, message: "File must be a PDF" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to S3
    const fileName = `note_${Date.now()}_${file.name}`;
    const key = await S3Utils.uploadFile(buffer, fileName, file.type);

    // Get the file URL
    const fileUrl = await S3Utils.getFileUrl(key);

    return NextResponse.json({
      success: true,
      message: "File uploaded successfully",
      fileUrl,
      key,
    });
  } catch (error: any) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to upload file" },
      { status: 500 }
    );
  }
}
