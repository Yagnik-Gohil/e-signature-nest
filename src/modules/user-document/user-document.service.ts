import { Injectable } from '@nestjs/common';
import { CreateUserDocumentDto } from './dto/create-user-document.dto';
import { UpdateUserDocumentDto } from './dto/update-user-document.dto';

@Injectable()
export class UserDocumentService {
  create(createUserDocumentDto: CreateUserDocumentDto) {
    return 'This action adds a new userDocument';
  }

  findAll() {
    return `This action returns all userDocument`;
  }

  findOne(id: number) {
    return `This action returns a #${id} userDocument`;
  }

  update(id: number, updateUserDocumentDto: UpdateUserDocumentDto) {
    return `This action updates a #${id} userDocument`;
  }

  remove(id: number) {
    return `This action removes a #${id} userDocument`;
  }
}
