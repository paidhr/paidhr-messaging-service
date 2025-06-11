import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { FileInterceptor } from '@nestjs/platform-express';
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    // Basic file upload endpoint - in production, use cloud storage
    return {
      message: 'File uploaded successfully',
      data: {
        fileName: file.originalname,
        fileSize: file.size,
        fileType: file.mimetype,
        fileUrl: `/uploads/${file.filename}`,
      },
    };
  }
}
