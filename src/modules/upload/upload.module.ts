import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from '@modules/token/entities/token.entity';
import { Document } from '@modules/document/entities/document.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Token, Document])],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
