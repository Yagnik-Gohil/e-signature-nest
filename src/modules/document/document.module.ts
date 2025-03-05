import { Module } from '@nestjs/common';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from './entities/document.entity';
import { Token } from '@modules/token/entities/token.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Document, Token])],
  controllers: [DocumentController],
  providers: [DocumentService],
})
export class DocumentModule {}
