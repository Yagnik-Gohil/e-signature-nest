import { MigrationInterface, QueryRunner } from 'typeorm';

export class Document1740890199136 implements MigrationInterface {
  name = 'Document1740890199136';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "document" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "base_url" character varying NOT NULL, "root" character varying NOT NULL, "folder" character varying NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_e57d3357f83f3cdc0acffc3d777" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_type_enum" AS ENUM('registered', 'public')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "type" "public"."user_type_enum" NOT NULL DEFAULT 'public'`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "password" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "password" SET NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "type"`);
    await queryRunner.query(`DROP TYPE "public"."user_type_enum"`);
    await queryRunner.query(`DROP TABLE "document"`);
  }
}
