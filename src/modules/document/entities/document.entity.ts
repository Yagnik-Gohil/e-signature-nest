import { UserDocument } from '@modules/user-document/entities/user-document.entity';
import { DefaultStatus, DocumentStatus } from '@shared/constants/enum';
import { DefaultEntity } from '@shared/entities/default.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity()
export class Document extends DefaultEntity {
  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.DRAFT,
  })
  status: DocumentStatus;

  @Column('character varying')
  title: string;

  @Column('character varying')
  base_url: string;

  @Column('character varying')
  root: string;

  @Column('character varying')
  folder: string;

  @Column('character varying')
  name: string;

  @OneToMany(() => UserDocument, (user_document) => user_document.document)
  user_document: UserDocument[];
}
