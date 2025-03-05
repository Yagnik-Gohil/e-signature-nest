import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Document } from './entities/document.entity';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class DocumentService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
  ) {}
  async findOne(id: string) {
    const result = await this.documentRepository.findOne({
      where: { id },
      relations: { user_document: { user: true } },
      select: {
        user_document: {
          id: true,
          status: true,
          role: true,
          type: true,
          sequence: true,
          signature_box: {
            x: true,
            y: true,
            width: true,
            height: true,
          },
          user: { id: true, name: true, email: true },
        },
      },
      order: {
        user_document: {
          sequence: 'ASC',
        },
      },
    });
    return plainToInstance(Document, result);
  }
}
