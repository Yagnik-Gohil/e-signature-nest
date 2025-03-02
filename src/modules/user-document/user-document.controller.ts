import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserDocumentService } from './user-document.service';
import { CreateUserDocumentDto } from './dto/create-user-document.dto';
import { UpdateUserDocumentDto } from './dto/update-user-document.dto';

@Controller('user-document')
export class UserDocumentController {
  constructor(private readonly userDocumentService: UserDocumentService) {}

  @Post()
  create(@Body() createUserDocumentDto: CreateUserDocumentDto) {
    return this.userDocumentService.create(createUserDocumentDto);
  }

  @Get()
  findAll() {
    return this.userDocumentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userDocumentService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDocumentDto: UpdateUserDocumentDto) {
    return this.userDocumentService.update(+id, updateUserDocumentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userDocumentService.remove(+id);
  }
}
