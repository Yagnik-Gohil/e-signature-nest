import { MigrationInterface, QueryRunner } from 'typeorm';

export class Status1741010956335 implements MigrationInterface {
  name = 'Status1741010956335';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."user_document_status_enum" RENAME TO "user_document_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_document_status_enum" AS ENUM('draft', 'pending', 'signed')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_document" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_document" ALTER COLUMN "status" TYPE "public"."user_document_status_enum" USING "status"::"text"::"public"."user_document_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_document" ALTER COLUMN "status" SET DEFAULT 'pending'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."user_document_status_enum_old"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."user_document_status_enum_old" AS ENUM('pending', 'signed')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_document" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_document" ALTER COLUMN "status" TYPE "public"."user_document_status_enum_old" USING "status"::"text"::"public"."user_document_status_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_document" ALTER COLUMN "status" SET DEFAULT 'pending'`,
    );
    await queryRunner.query(`DROP TYPE "public"."user_document_status_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."user_document_status_enum_old" RENAME TO "user_document_status_enum"`,
    );
  }
}
