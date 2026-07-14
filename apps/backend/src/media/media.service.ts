import { Injectable, BadRequestException } from "@nestjs/common";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

@Injectable()
export class MediaService {
  private s3Client: S3Client;
  private bucket: string;

  constructor() {
    this.s3Client = new S3Client({
      endpoint: process.env.S3_ENDPOINT || "http://localhost:9000",
      region: "us-east-1",
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY || "minioadmin",
        secretAccessKey: process.env.S3_SECRET_KEY || "minioadmin",
      },
      forcePathStyle: true,
    });
    this.bucket = process.env.S3_BUCKET || "kanan-media";
  }

  async uploadFile(projectId: string, file: any): Promise<string> {
    if (!file) {
      throw new BadRequestException("لم يتم تقديم ملف للرفع");
    }

    const fileExtension = file.originalname.split(".").pop();
    const uniqueFileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${fileExtension}`;
    const key = `projects/${projectId}/${uniqueFileName}`; // Categorized by project

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        })
      );

      // Return the access URL (assuming MinIO or S3 path style)
      const endpointUrl = process.env.S3_ENDPOINT || "http://localhost:9000";
      return `${endpointUrl}/${this.bucket}/${key}`;
    } catch (error) {
      console.error("Failed S3 upload:", error);
      throw new BadRequestException("حدث خطأ أثناء رفع الملف إلى المخزن السحابي: " + (error as Error).message);
    }
  }
}
