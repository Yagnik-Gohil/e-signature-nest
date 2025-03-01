import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { MESSAGE } from '../constants/constant';
import { IJwtPayload } from '../constants/types';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Token } from '@modules/token/entities/token.entity';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException(MESSAGE.UNAUTHENTICATED);
    }
    try {
      const payload: IJwtPayload = await jwt.verify(
        token,
        process.env.JWT_SECRET,
      );
      if (payload) {
        const isExists = await this.tokenRepository.findOne({
          where: {
            user: { id: payload.id },
            jwt: token,
          },
          relations: {
            user: true,
          },
        });

        if (!isExists) {
          throw new UnauthorizedException(MESSAGE.UNAUTHENTICATED);
        }

        request['user'] = isExists.user;
      } else {
        throw new UnauthorizedException(MESSAGE.UNAUTHENTICATED);
      }
    } catch {
      throw new UnauthorizedException(MESSAGE.UNAUTHENTICATED);
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
