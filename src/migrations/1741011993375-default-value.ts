import { MigrationInterface, QueryRunner } from 'typeorm';

export class DefaultValue1741011993375 implements MigrationInterface {
  name = 'DefaultValue1741011993375';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_document" ALTER COLUMN "status" SET DEFAULT 'draft'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_document" ALTER COLUMN "status" SET DEFAULT 'pending'`,
    );
  }
}
