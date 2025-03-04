import {
  Body,
  Controller,
  Get,
  Patch,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '@shared/guard/auth.guard';
import response from '@shared/response';
import { MESSAGE } from '@shared/constants/constant';
import { Request, Response } from 'express';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @UseGuards(AuthGuard)
  async profile(@Req() req: Request, @Res() res: Response) {
    const user = req['user']['id'];
    const data = await this.userService.findOne(user.id);
    return response.successResponse(
      {
        message: data
          ? MESSAGE.RECORD_FOUND('Profile')
          : MESSAGE.RECORD_NOT_FOUND('Profile'),
        data,
      },
      res,
    );
  }

  @Patch('profile')
  @UseGuards(AuthGuard)
  async updateProfile(
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = req['user']['id'];
    const data = await this.userService.update(user, updateUserDto);
    return response.successResponse(
      {
        message: data.affected
          ? MESSAGE.RECORD_UPDATED('Profile')
          : MESSAGE.RECORD_NOT_FOUND('Profile'),
        data: {},
      },
      res,
    );
  }
}
