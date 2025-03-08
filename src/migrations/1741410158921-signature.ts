import { MigrationInterface, QueryRunner } from 'typeorm';

export class Signature1741410158921 implements MigrationInterface {
  name = 'Signature1741410158921';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_document" DROP COLUMN "signature_box"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_document" ADD "base_url" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_document" ADD "root" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_document" ADD "folder" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_document" ADD "name" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_document" DROP COLUMN "name"`);
    await queryRunner.query(`ALTER TABLE "user_document" DROP COLUMN "folder"`);
    await queryRunner.query(`ALTER TABLE "user_document" DROP COLUMN "root"`);
    await queryRunner.query(
      `ALTER TABLE "user_document" DROP COLUMN "base_url"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_document" ADD "signature_box" jsonb`,
    );
  }
}
