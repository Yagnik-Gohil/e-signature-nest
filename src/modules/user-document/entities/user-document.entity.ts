import { Document } from '@modules/document/entities/document.entity';
import { User } from '@modules/user/entities/user.entity';
import { SignatureStatus, UserDocumentType } from '@shared/constants/enum';
import { DefaultEntity } from '@shared/entities/default.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class UserDocument extends DefaultEntity {
  @Column({
    type: 'enum',
    enum: SignatureStatus,
    default: SignatureStatus.DRAFT,
  })
  status: SignatureStatus;

  @Column('character varying')
  role: string;

  @ManyToOne(() => User, (user) => user.user_document, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Document, (document) => document.user_document, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'document_id' })
  document: Document;

  @Column({
    type: 'enum',
    enum: UserDocumentType,
  })
  type: UserDocumentType;

  @Column('integer')
  sequence: number;
}
