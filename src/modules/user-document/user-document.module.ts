import { Module } from '@nestjs/common';
import { UserDocumentService } from './user-document.service';
import { UserDocumentController } from './user-document.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserDocument } from './entities/user-document.entity';
import { Token } from '@modules/token/entities/token.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserDocument, Token])],
  controllers: [UserDocumentController],
  providers: [UserDocumentService],
})
export class UserDocumentModule {}
