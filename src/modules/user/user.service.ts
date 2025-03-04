import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  async findOne(id: string) {
    const result = await this.userRepository.findOne({
      where: { id },
    });
    return plainToInstance(User, result);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const result = await this.userRepository.update(id, updateUserDto);
    return result;
  }
}
