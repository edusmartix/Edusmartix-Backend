import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import sharp from 'sharp';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class R2Service {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(
    private configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.bucketName = this.configService.get('R2_BUCKET_NAME') || '';
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: this.configService.get<string>('R2_ENDPOINT'),
      credentials: {
        accessKeyId: this.configService.get<string>('R2_ACCESS_KEY_ID') || '',
        secretAccessKey:
          this.configService.get<string>('R2_SECRET_ACCESS_KEY') || '',
      },
    });
  }

  async uploadImage(file: Express.Multer.File, folder: string = 'images') {
    // 1. Optimize image: Resize to max 800px width, convert to WebP, compress
    const optimizedBuffer = await sharp(file.buffer)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    const fileKey = `${folder}/${Date.now()}-${file.originalname.split('.')[0]}.webp`;

    // 2. Upload to R2
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.configService.get('R2_BUCKET_NAME'),
        Key: fileKey,
        Body: optimizedBuffer,
        ContentType: 'image/webp',
      }),
    );

    const url = `${this.configService.get('R2_PUBLIC_DOMAIN')}/${fileKey}`;

    // Track the upload in the DB
    await this.prisma.media.create({
      data: { url, fileKey, isUsed: false },
    });

    return { url, fileKey };
  }

  /**
   * Uploads a file without image processing (PDFs, CSVs, etc.)
   */
  async uploadRawFile(file: Express.Multer.File, folder: string = 'documents') {
    const fileKey = `${folder}/${Date.now()}-${file.originalname}`;

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    const url = `${this.configService.get('R2_PUBLIC_DOMAIN')}/${fileKey}`;

    // Track in DB for the cleanup job
    await this.prisma.media.create({
      data: { url, fileKey, isUsed: false },
    });

    return { url, fileKey };
  }

  /**
   * Deletes a file from R2 bucket
   */
  async deleteFile(fileKey: string) {
    return this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
      }),
    );
  }
}
