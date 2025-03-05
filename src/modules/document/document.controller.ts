import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { DocumentService } from './document.service';
import { Response } from 'express';
import response from '@shared/response';
import { MESSAGE } from '@shared/constants/constant';
import { AuthGuard } from '@shared/guard/auth.guard';

@UseGuards(AuthGuard)
@Controller('document')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Get(':id')
  async documents(@Param('id') id: string, @Res() res: Response) {
    const data = await this.documentService.findOne(id);
    return response.successResponse(
      {
        message: data
          ? MESSAGE.RECORD_FOUND('Document')
          : MESSAGE.RECORD_NOT_FOUND('Document'),
        data: data,
      },
      res,
    );
  }
}
