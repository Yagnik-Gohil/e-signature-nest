import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Res,
  Query,
} from '@nestjs/common';
import { UserDocumentService } from './user-document.service';
import { CreateUserDocumentDto } from './dto/create-user-document.dto';
import { UpdateUserDocumentDto } from './dto/update-user-document.dto';
import { AuthGuard } from '@shared/guard/auth.guard';
import { Request, Response } from 'express';
import { JoiValidationPipe } from '@shared/pipes/joi-validation.pipe';
import {
  createUserDocumentSchema,
  updateSequenceSchema,
  updateUserDocumentSchema,
} from './dto/user-document.schema';
import { User } from '@modules/user/entities/user.entity';
import response from '@shared/response';
import { MESSAGE, VALUE } from '@shared/constants/constant';
import { UserDocumentType } from '@shared/constants/enum';

@UseGuards(AuthGuard)
@Controller('user-document')
export class UserDocumentController {
  constructor(private readonly userDocumentService: UserDocumentService) {}

  @Post()
  async create(
    @Body(new JoiValidationPipe(createUserDocumentSchema))
    createUserDocumentDto: CreateUserDocumentDto,
    @Res() res: Response,
  ) {
    const data = await this.userDocumentService.create(createUserDocumentDto);
    return response.successCreate(
      {
        message: MESSAGE.RECORD_CREATED('Recipient'),
        data,
      },
      res,
    );
  }

  @Get()
  async findAll(
    @Query('limit') limit: number = VALUE.limit,
    @Query('offset') offset: number = VALUE.offset,
    @Query('document') document: string,
    @Res() res: Response,
  ) {
    const [list, count] = await this.userDocumentService.findAll(
      +limit,
      +offset,
      document,
    );
    return response.successResponseWithPagination(
      {
        message: MESSAGE.RECORD_FOUND('Recipient'),
        total: count,
        limit: +limit,
        offset: +offset,
        data: list,
      },
      res,
    );
  }

  @Patch('role/:id')
  async updateRole(
    @Param('id') id: string,
    @Body(new JoiValidationPipe(updateUserDocumentSchema))
    updateUserDocumentDto: UpdateUserDocumentDto,
    @Res() res: Response,
  ) {
    const data = await this.userDocumentService.update(
      id,
      updateUserDocumentDto,
    );
    return response.successResponse(
      {
        message: data.affected
          ? MESSAGE.RECORD_UPDATED('Role')
          : MESSAGE.RECORD_NOT_FOUND('Role'),
        data: {},
      },
      res,
    );
  }

  @Patch('sequence/:id')
  async updateSequence(
    @Param('id') id: string,
    @Body(new JoiValidationPipe(updateSequenceSchema))
    updateUserDocumentDto: UpdateUserDocumentDto,
    @Res() res: Response,
  ) {
    const data = await this.userDocumentService.updateSequence(
      id,
      updateUserDocumentDto,
    );
    return response.successResponse(
      {
        message: data.affected
          ? MESSAGE.RECORD_UPDATED('Sequence')
          : MESSAGE.RECORD_NOT_FOUND('Sequence'),
        data: {},
      },
      res,
    );
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const data = await this.userDocumentService.remove(id);
    return response.successResponse(
      {
        message: data.affected
          ? MESSAGE.RECORD_DELETED('Recipient')
          : MESSAGE.RECORD_NOT_FOUND('Recipient'),
        data: {},
      },
      res,
    );
  }
}
