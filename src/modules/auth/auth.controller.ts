import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import response from '@shared/response';
import getIp from '@shared/function/get-ip';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@shared/guard/auth.guard';
import { JoiValidationPipe } from '@shared/pipes/joi-validation.pipe';
import { signupSchema } from './schema/signup.schema';
import { loginSchema } from './schema/login.schema';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @UsePipes(new JoiValidationPipe(signupSchema))
  async signUp(
    @Body()
    signUpDto: SignUpDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const ip = getIp(req);
    const data = await this.authService.signUp(signUpDto, ip);
    return response.successCreate(
      {
        message: data.message,
        data: data.data,
      },
      res,
    );
  }

  @Post('login')
  @UsePipes(new JoiValidationPipe(loginSchema))
  async login(
    @Body()
    loginDto: LoginDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const ip = getIp(req);
    const data = await this.authService.login(loginDto, ip);
    return response.successResponse(
      {
        message: data.message,
        data: data.data,
      },
      res,
    );
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  async logout(@Req() req: Request, @Res() res: Response) {
    const ip = getIp(req);
    const user = req['user'];
    const message = await this.authService.logout(user, ip);
    return response.successResponse(
      {
        message: message,
        data: {},
      },
      res,
    );
  }
}
