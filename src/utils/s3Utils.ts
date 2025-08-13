import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: "eu-north-1",
  credentials: {
    accessKeyId: "AKIA3ISJV5CFV32HVXFR",
    secretAccessKey:"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",
  },
});

export class S3Utils {
  static async uploadFile(
    file: Buffer,
    fileName: string,
    contentType: string
  ): Promise<string> {
    const key = `assignments/${Date.now()}_${fileName}`;
    const command = new PutObjectCommand({
      Bucket: "classroomaiin",
      Key: key,
      Body: file,
      ContentType: contentType,
    });

console.log('try to upload file on s3');
console.log('key: ', key);
console.log("region: ", process.env.AWS_REGION);
    const res = await s3Client.send(command);
    console.log('res: ', res);
    return key;
  }

  static async getFileUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: "classroomaiin",
      Key: key,
    });

    return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  }

  static getPublicUrl(key: string): string {
    return `https://classroomaiin.s3.eu-north-1.amazonaws.com/${key}`;
  }

  static async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: "classroomaiin",
      Key: key,
    });

    await s3Client.send(command);
  }
}
