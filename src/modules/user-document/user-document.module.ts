import { Module } from '@nestjs/common';
import { UserDocumentService } from './user-document.service';
import { UserDocumentController } from './user-document.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserDocument } from './entities/user-document.entity';
import { Token } from '@modules/token/entities/token.entity';
import { Document } from '@modules/document/entities/document.entity';
import { EmailService } from '@shared/email-service';

@Module({
  imports: [TypeOrmModule.forFeature([UserDocument, Token, Document])],
  controllers: [UserDocumentController],
  providers: [UserDocumentService, EmailService],
})
export class UserDocumentModule {}
