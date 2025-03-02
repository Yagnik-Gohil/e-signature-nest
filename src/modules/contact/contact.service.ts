import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@modules/user/entities/user.entity';
import { FindManyOptions, IsNull, Not, Repository } from 'typeorm';
import { UserType } from '@shared/constants/enum';
import { Contact } from './entities/contact.entity';
import { plainToInstance } from 'class-transformer';
import { MESSAGE } from '@shared/constants/constant';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
  ) {}

  async create(createContactDto: CreateContactDto, owner: string) {
    let recipient = await this.userRepository.findOne({
      where: { email: createContactDto.email },
    });

    if (!recipient) {
      recipient = await this.userRepository.save({
        name: createContactDto.recipient_name,
        email: createContactDto.email,
        type: UserType.PUBLIC,
      });
    }

    const isExists = await this.contactRepository.findOne({
      where: {
        owner: { id: owner },
        recipient: { id: recipient.id },
      },
    });

    if (isExists) {
      throw new BadRequestException(MESSAGE.ALREADY_EXISTS('Contact'));
    }

    const result = await this.contactRepository.save({
      owner: { id: owner },
      recipient: { id: recipient.id },
      recipient_name: createContactDto.recipient_name,
    });

    return plainToInstance(Contact, result);
  }

  async findAll(where: FindManyOptions<Contact>): Promise<[Contact[], number]> {
    const [list, count] = await this.contactRepository.findAndCount(where);
    return [plainToInstance(Contact, list), count];
  }

  async update(id: string, updateContactDto: UpdateContactDto, owner: string) {
    const contact = await this.contactRepository.findOne({
      where: {
        id: Not(id),
        owner: { id: owner },
        recipient: { email: updateContactDto.email },
      },
    });

    if (contact) {
      throw new BadRequestException(MESSAGE.ALREADY_EXISTS('Contact'));
    }

    let recipient = await this.userRepository.findOne({
      where: { email: updateContactDto.email },
    });

    if (!recipient) {
      recipient = await this.userRepository.save({
        name: updateContactDto.recipient_name,
        email: updateContactDto.email,
        type: UserType.PUBLIC,
      });
    }

    const result = await this.contactRepository.update(
      { id: id, owner: { id: owner } },
      {
        recipient_name: updateContactDto.recipient_name,
        recipient: { id: recipient.id },
      },
    );
    return result;
  }

  async remove(id: string, owner: string) {
    const result = await this.contactRepository.softDelete({
      id: id,
      owner: { id: owner },
      deleted_at: IsNull(),
    });

    return result;
  }
}
