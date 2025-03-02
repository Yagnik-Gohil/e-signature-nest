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
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { AuthGuard } from '@shared/guard/auth.guard';
import { JoiValidationPipe } from '@shared/pipes/joi-validation.pipe';
import { Request, Response } from 'express';
import { contactSchema } from './dto/contact.schema';
import { User } from '@modules/user/entities/user.entity';
import response from '@shared/response';
import { MESSAGE, VALUE } from '@shared/constants/constant';

@UseGuards(AuthGuard)
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  async create(
    @Body(new JoiValidationPipe(contactSchema)) createContactDto: CreateContactDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user: User = req['user'];
    const data = await this.contactService.create(createContactDto, user.id);
    return response.successCreate(
      {
        message: MESSAGE.RECORD_CREATED('Contact'),
        data,
      },
      res,
    );
  }

  @Get()
  async findAll(
    @Query('limit') limit: number = VALUE.limit,
    @Query('offset') offset: number = VALUE.offset,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const [list, count] = await this.contactService.findAll({
      relations: { recipient: true },
      where: { owner: { id: req['user']['id'] } },
      select: { recipient: { id: true, email: true } },
      take: +limit,
      skip: +offset,
    });
    return response.successResponseWithPagination(
      {
        message: MESSAGE.RECORD_FOUND('Contact'),
        total: count,
        limit: +limit,
        offset: +offset,
        data: list,
      },
      res,
    );
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(new JoiValidationPipe(contactSchema)) updateContactDto: UpdateContactDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user: User = req['user'];
    const data = await this.contactService.update(
      id,
      updateContactDto,
      user.id,
    );
    return response.successResponse(
      {
        message: data.affected
          ? MESSAGE.RECORD_UPDATED('Contact')
          : MESSAGE.RECORD_NOT_FOUND('Contact'),
        data: {},
      },
      res,
    );
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user: User = req['user'];
    const data = await this.contactService.remove(id, user.id);
    return response.successResponse(
      {
        message: data.affected
          ? MESSAGE.RECORD_DELETED('Contact')
          : MESSAGE.RECORD_NOT_FOUND('Contact'),
        data: {},
      },
      res,
    );
  }
}
