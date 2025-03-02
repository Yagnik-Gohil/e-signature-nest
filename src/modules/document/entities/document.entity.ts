import { DefaultStatus } from '@shared/constants/enum';
import { DefaultEntity } from '@shared/entities/default.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class Document extends DefaultEntity {
  @Column('character varying')
  base_url: string;

  @Column('character varying')
  root: string;

  @Column('character varying')
  folder: string;

  @Column('character varying')
  name: string;
}
