import { Token } from '@modules/token/entities/token.entity';
import { User } from '@modules/user/entities/user.entity';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import generateToken from '@shared/function/generate-token';
import isTokenExpired from '@shared/function/is-token-expired';
import { IsNull, Repository } from 'typeorm';
import { SignUpDto } from './dto/signup.dto';
import { MESSAGE } from '@shared/constants/constant';
import hashPassword from '@shared/function/hash-password';
import { LoginDto } from './dto/login.dto';
import comparePassword from '@shared/function/compare-password';
import { DefaultStatus } from '@shared/constants/enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getToken(user: User, deviceId: string, ip: string): Promise<string> {
    const token = await this.tokenRepository.findOne({
      where: {
        user: { id: user.id },
        device_id: deviceId,
      },
    });

    // generate token
    const newToken = await generateToken({ id: user.id });

    if (token) {
      const isExpired = await isTokenExpired(token.jwt);

      if (isExpired) {
        // Update with new token
        await this.tokenRepository.save({
          id: token.id,
          token: newToken,
          ip: ip,
          login_time: new Date().toISOString(),
        });
        // New Token
        return newToken;
      }

      // Update Login Time
      await this.tokenRepository.save({
        id: token.id,
        ip: ip,
        login_time: new Date().toISOString(),
      });
      // Old token which is not expired
      return token.jwt;
    }

    // Create new token
    const result = await this.tokenRepository.save({
      user: { id: user.id },
      jwt: newToken,
      device_id: deviceId,
      ip: ip,
      login_time: new Date().toISOString(),
    });
    return result.jwt;
  }

  async signUp(signUpDto: SignUpDto, ip: string) {
    const isExists = await this.userRepository.findOne({
      where: {
        email: signUpDto.email,
      },
    });

    if (isExists) {
      throw new BadRequestException(MESSAGE.ALREADY_EXISTS('User'));
    }

    const hashedPassword = await hashPassword(signUpDto.password);

    const user = await this.userRepository.save({
      name: signUpDto.name,
      email: signUpDto.email,
      password: hashedPassword,
    });

    const loginResponse = await this.getLoginResponse(
      user,
      signUpDto.device_id,
      ip,
    );
    return { message: MESSAGE.SIGN_UP, data: loginResponse };
  }

  async login(loginDto: LoginDto, ip: string) {
    const user = await this.userRepository.findOne({
      where: {
        email: loginDto.email,
        status: DefaultStatus.ACTIVE,
      },
    });

    // User not exists
    if (!user) {
      throw new BadRequestException(MESSAGE.WRONG_CREDENTIALS);
    }

    const isCorrectPassword = await comparePassword(
      loginDto.password,
      user.password,
    );

    // Wrong Password
    if (!isCorrectPassword) {
      throw new BadRequestException(MESSAGE.WRONG_CREDENTIALS);
    }

    const loginResponse = await this.getLoginResponse(
      user,
      loginDto.device_id,
      ip,
    );
    return { message: MESSAGE.LOGIN, data: loginResponse };
  }

  async getLoginResponse(user: User, deviceId: string, ip: string) {
    const jwt = await this.getToken(user, deviceId, ip);
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
      },
      jwt,
    };
  }

  async logout(user: User, ip: string) {
    const time = new Date().toISOString();
    const result = await this.tokenRepository.update(
      { user: { id: user.id }, deleted_at: IsNull() },
      {
        jwt: 'logged out',
        logout_time: time,
        ip: ip,
        deleted_at: time,
      },
    );
    return result.affected ? MESSAGE.LOGOUT : MESSAGE.METHOD_NOT_ALLOWED;
  }
}
