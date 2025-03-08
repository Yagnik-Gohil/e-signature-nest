import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from '@modules/token/entities/token.entity';
import { Document } from '@modules/document/entities/document.entity';
import { UserDocument } from '@modules/user-document/entities/user-document.entity';
import { UserDocumentService } from '@modules/user-document/user-document.service';
import { EmailService } from '@shared/email-service';

@Module({
  imports: [TypeOrmModule.forFeature([Token, Document, UserDocument])],
  controllers: [UploadController],
  providers: [UploadService, UserDocumentService, EmailService],
})
export class UploadModule {}
