import { MigrationInterface, QueryRunner } from 'typeorm';

export class SignatureBox1741182878220 implements MigrationInterface {
  name = 'SignatureBox1741182878220';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_document" ADD "signature_box" jsonb`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_document" DROP COLUMN "signature_box"`,
    );
  }
}
