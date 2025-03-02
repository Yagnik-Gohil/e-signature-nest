import { User } from '@modules/user/entities/user.entity';
import { DefaultEntity } from '@shared/entities/default.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class Contact extends DefaultEntity {
  @ManyToOne(() => User, (user) => user.contact, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @ManyToOne(() => User, (user) => user.recipient, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recipient_id' })
  recipient: User;

  @Column({
    type: 'character varying',
  })
  recipient_name: string;
}
