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
import { MESSAGE, SIGNATURE_POSITIONS } from '@shared/constants/constant';
import { User } from '@modules/user/entities/user.entity';
import { PDFDocument } from 'pdf-lib';
import { UserDocument } from '@modules/user-document/entities/user-document.entity';
import { UserDocumentService } from '@modules/user-document/user-document.service';
import { DocumentStatus } from '@shared/constants/enum';

@Controller('upload')
export class UploadController {
  constructor(
    private readonly uploadService: UploadService,
    private readonly userDocumentService: UserDocumentService,
  ) {}

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
          return cb(
            new BadRequestException('Only PDF files are allowed'),
            false,
          );
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
        user.id,
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

  @Post('signature')
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor('signature', {
      storage: diskStorage({
        destination: 'public/signature',
        filename: (req, file, cb) => {
          const fileName = `${uuid()}${path.extname(file.originalname)}`;
          cb(null, fileName);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB size limit
      },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/^image\/(jpeg|jpg|png)$/)) {
          return cb(new BadRequestException('InvalidType'), false);
        }
        cb(null, true);
      },
    }),
  )
  async signature(
    @UploadedFile() file: Express.Multer.File,
    @Body('document') document: string,
    @Body('next_user') next_user: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const filePath = path.resolve('public/signature', file.filename);

    try {
      const user: User = req['user'];
      const userDocument = await this.uploadService.uploadSignatureFromDisk(
        document,
        filePath,
        file.mimetype,
        'signature',
        user.id,
      );

      // Delete the temporary file after successful upload
      await fs.unlink(filePath);

      // 1. Merge signature with original document on s3
      await this.mergeSignature(userDocument);

      // 2. Add new user document record with the next user and role if sequence is not the last
      if (userDocument.sequence < 3) {
        // 1. Create new user document record
        await this.userDocumentService.create({
          user: next_user,
          document: document,
          role: `Role ${userDocument.sequence + 1}`,
          sequence: userDocument.sequence + 1,
        });
        // 2. Send email to the next user
        await this.userDocumentService.sendMailToNextUser(document, next_user)
      }

      if (userDocument.sequence === 3) {
        // 1. Update the document status to completed
        await this.userDocumentService.updateDocumentStatus(
          document,
          DocumentStatus.COMPLETED,
        );
        // 2. Send email to the first user that the document is signed
        await this.userDocumentService.sendMailToOwner(document);
      }

      return response.successCreate(
        {
          message: MESSAGE.RECORD_UPLOAD('Signature'),
          data: {},
        },
        res,
      );
    } catch (error) {
      await fs.unlink(filePath).catch(() => null);
      throw new BadRequestException(`Failed to upload file: ${error.message}`);
    }
  }

  async mergeSignature(userDocument: UserDocument) {
    const position = SIGNATURE_POSITIONS[userDocument.sequence - 1];

    const pdfUrl =
      userDocument.document.base_url +
      userDocument.document.root +
      userDocument.document.folder +
      userDocument.document.name;

    const signatureUrl =
      userDocument.base_url +
      userDocument.root +
      userDocument.folder +
      userDocument.name;

    try {
      // 1. Download the PDF file from S3
      const pdfResponse = await fetch(pdfUrl);
      if (!pdfResponse.ok) {
        throw new Error(`Failed to fetch PDF: ${pdfResponse.statusText}`);
      }
      const pdfBytes = await pdfResponse.arrayBuffer();

      // 2. Download the signature file from S3
      const signatureResponse = await fetch(signatureUrl);
      if (!signatureResponse.ok) {
        throw new Error(
          `Failed to fetch signature: ${signatureResponse.statusText}`,
        );
      }
      const signatureBytes = await signatureResponse.arrayBuffer();

      // 3. Load the PDF and signature
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const signatureImage = await pdfDoc.embedPng(signatureBytes);

      // 4. Get the first page of the PDF
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];

      // 5. Draw the signature on the PDF
      firstPage.drawImage(signatureImage, {
        x: position.x,
        y: position.y,
        width: position.width,
        height: position.height,
      });

      // 6. Serialize the PDF to bytes
      const mergedPdfBytes = await pdfDoc.save();

      const newFileName = `${uuid()}${path.extname(userDocument.document.name)}`;

      // 7. Upload the merged PDF back to S3
      await this.uploadService.mergeSignature(
        userDocument,
        mergedPdfBytes,
        newFileName,
      );
    } catch (error) {
      console.error(`Error merging signature: ${error.message}`);
      throw new BadRequestException(
        `Failed to merge signature: ${error.message}`,
      );
    }
  }
}
