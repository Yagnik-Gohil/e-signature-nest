import { Module } from '@nestjs/common';
import { UserDocumentService } from './user-document.service';
import { UserDocumentController } from './user-document.controller';

@Module({
  controllers: [UserDocumentController],
  providers: [UserDocumentService],
})
export class UserDocumentModule {}
