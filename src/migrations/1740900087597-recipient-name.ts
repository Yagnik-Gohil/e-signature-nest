import { MigrationInterface, QueryRunner } from 'typeorm';

export class RecipientName1740900087597 implements MigrationInterface {
  name = 'RecipientName1740900087597';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "contact" ADD "recipient_name" character varying NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "contact" DROP COLUMN "recipient_name"`,
    );
  }
}
