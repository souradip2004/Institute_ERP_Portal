import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION!,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
  },
});

export class S3Utils {

  static async uploadFile(
    file: File,
    fileName: string,
    contentType: string
  ): Promise<string> {
    const key = `${Date.now()}_${fileName}`;
    const arrayBuffer = await file.arrayBuffer();

    const command = new PutObjectCommand({
      Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME!,
      Key: key,
      Body: new Uint8Array(arrayBuffer),
      ContentType: contentType
    });

    console.log('try to upload file on s3');
    console.log('key: ', key);
    console.log("region: ", process.env.NEXT_PUBLIC_AWS_REGION);
    const res = await s3Client.send(command);
    console.log('res: ', res);
    return key;
  }

  static async getFileUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME!,
      Key: key,
    });

    return await getSignedUrl(s3Client, command, {expiresIn: 3600});
  }

  static getPublicUrl(key: string): string {
    return `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${key}`;
  }

  static async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME!,
      Key: key,
    });

    await s3Client.send(command);
  }
}
