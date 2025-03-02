import { Token } from '@modules/token/entities/token.entity';
import { DefaultStatus, UserType } from '@shared/constants/enum';
import { DefaultEntity } from '@shared/entities/default.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity()
export class User extends DefaultEntity {
  @Column({
    type: 'enum',
    enum: DefaultStatus,
    default: DefaultStatus.ACTIVE,
  })
  status: DefaultStatus;

  @Column({
    type: 'character varying',
  })
  name: string;

  @Column({
    type: 'character varying',
    unique: true,
  })
  email: string;

  @Column({
    type: 'character varying',
    nullable: true,
  })
  password: string;

  @Column({
    type: 'enum',
    enum: UserType,
    default: UserType.PUBLIC,
  })
  type: UserType;

  @OneToMany(() => Token, (token) => token.user)
  token: Token[];
}
