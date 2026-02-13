import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { R2Service } from '../../core/r2/r2.provider';

@Controller('media')
export class MediaController {
  constructor(private readonly r2Service: R2Service) {}

  @Post('upload/logo')
  @UseInterceptors(FileInterceptor('file'))
  async uploadLogo(@UploadedFile() file: Express.Multer.File) {
    // Logos might need to be even smaller or cropped specifically
    return await this.r2Service.uploadImage(file, 'logos');
  }

  @Post('upload/document')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDoc(@UploadedFile() file: Express.Multer.File) {
    // For PDFs/Docs, we skip Sharp processing and do a raw upload
    // (You would add a rawUpload method to your R2Service)
    return await this.r2Service.uploadRawFile(file, 'documents');
  }
}
