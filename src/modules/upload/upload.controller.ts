import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuid } from 'uuid';
import * as path from 'path';
import * as fs from 'fs/promises';
import response from '@shared/response';
import { Request, Response } from 'express';
import { AuthGuard } from '@shared/guard/auth.guard';
import { MESSAGE } from '@shared/constants/constant';
import { User } from '@modules/user/entities/user.entity';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('document')
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor('document', {
      storage: diskStorage({
        destination: 'public/document',
        filename: (req, file, cb) => {
          const fileName = `${uuid()}${path.extname(file.originalname)}`;
          cb(null, fileName);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB size limit
      },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.includes('pdf')) {
          return cb(new BadRequestException('Only PDF files are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body('folder') folder: string,
    @Body('title') title: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (!file) {
      throw new BadRequestException(MESSAGE.FILE_REQUIRED);
    }

    if (!folder) {
      throw new BadRequestException('Folder name is required.');
    }

    if (!title) {
      throw new BadRequestException('Title is required.');
    }

    const filePath = path.resolve('public/document', file.filename);

    try {
      const user: User = req['user'];
      const document = await this.uploadService.uploadFileFromDisk(
        filePath,
        file.mimetype,
        folder,
        title,
        user.id
      );

      // Delete the temporary file after successful upload
      await fs.unlink(filePath);

      return response.successCreate(
        {
          message: MESSAGE.RECORD_UPLOAD('File'),
          data: document,
        },
        res,
      );
    } catch (error) {
      await fs.unlink(filePath).catch(() => null);
      throw new BadRequestException(`Failed to upload file: ${error.message}`);
    }
  }
}
