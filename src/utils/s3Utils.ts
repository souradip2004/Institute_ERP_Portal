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
    accessKeyId: "AKIAXFZ5FAAT747U6IN6",
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
      Bucket: "aiclassroomin",
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
      Bucket: "aiclassroomin",
      Key: key,
    });

    return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  }

  static getPublicUrl(key: string): string {
    return `https://aiclassroomin.s3.eu-north-1.amazonaws.com/${key}`;
  }

  static async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: "aiclassroomin",
      Key: key,
    });

    await s3Client.send(command);
  }
}
