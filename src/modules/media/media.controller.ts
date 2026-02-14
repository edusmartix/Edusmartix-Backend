import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FileInterceptor } from '@nestjs/platform-express';
import { R2Service } from '../../core/r2/r2.provider';

const UPLOAD_CONFIG = {
  logo: { folder: 'schools/logos', limit: 1 },
  profile: { folder: 'users/profiles', limit: 1 },
  gallery: { folder: 'schools/gallery', limit: 5 },
  document: { folder: 'legal/docs', limit: 3 },
};
@Controller('media')
export class MediaController {
  constructor(private readonly r2Service: R2Service) {}

  @Post('upload/:type')
  @UseInterceptors(FilesInterceptor('files')) // Note: frontend must use key 'files'
  async uploadDynamic(
    @Param('type') type: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    // 1. Validate the type
    const config = UPLOAD_CONFIG[type as keyof typeof UPLOAD_CONFIG];
    if (!config) {
      throw new BadRequestException(
        `Invalid upload type: ${type}. Allowed: ${Object.keys(UPLOAD_CONFIG).join(', ')}`,
      );
    }

    // 2. Validate file existence and limits
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }
    if (files.length > config.limit) {
      throw new BadRequestException(
        `Too many files. Maximum allowed for ${type} is ${config.limit}`,
      );
    }

    // 3. Process all files concurrently
    const uploadPromises = files.map((file) => {
      // Logic split: Images get optimized, others get raw upload
      if (file.mimetype.startsWith('image/') && type !== 'document') {
        return this.r2Service.uploadImage(file, config.folder);
      }
      return this.r2Service.uploadRawFile(file, config.folder);
    });

    const results = await Promise.all(uploadPromises);

    return {
      success: true,
      count: results.length,
      data: results,
    };
  }

  @Post('upload/document')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDoc(@UploadedFile() file: Express.Multer.File) {
    // For PDFs/Docs, we skip Sharp processing and do a raw upload
    // (You would add a rawUpload method to your R2Service)
    return await this.r2Service.uploadRawFile(file, 'documents');
  }
}
