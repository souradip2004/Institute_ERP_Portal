import {S3Utils} from "@/utils/s3Utils";

export const uploadImageToS3 = (async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload using your S3 utility
    const key = await S3Utils.uploadFile(buffer, file.name, file.type);
    const publicUrl = S3Utils.getPublicUrl(key);

    console.log(publicUrl);
    return publicUrl; // Return the public URL string
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    throw new Error("Image upload failed. Please try again.");
  }
});