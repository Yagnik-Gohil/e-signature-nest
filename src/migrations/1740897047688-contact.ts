import { MigrationInterface, QueryRunner } from 'typeorm';

export class Contact1740897047688 implements MigrationInterface {
  name = 'Contact1740897047688';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "contact" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "owner_id" uuid, "recipient_id" uuid, CONSTRAINT "PK_2cbbe00f59ab6b3bb5b8d19f989" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_document_status_enum" AS ENUM('pending', 'signed')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_document_type_enum" AS ENUM('owner', 'signer')`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_document" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "status" "public"."user_document_status_enum" NOT NULL DEFAULT 'pending', "role" character varying NOT NULL, "type" "public"."user_document_type_enum" NOT NULL, "sequence" integer NOT NULL, "user_id" uuid, "document_id" uuid, CONSTRAINT "PK_18a41ed5aafb9732cfa62c8debd" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."document_status_enum" AS ENUM('draft', 'in_process', 'completed')`,
    );
    await queryRunner.query(
      `ALTER TABLE "document" ADD "status" "public"."document_status_enum" NOT NULL DEFAULT 'draft'`,
    );
    await queryRunner.query(
      `ALTER TABLE "document" ADD "title" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "contact" ADD CONSTRAINT "FK_4b5a10d41009acc018c15447f32" FOREIGN KEY ("owner_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "contact" ADD CONSTRAINT "FK_328f38e58b490932d0997603052" FOREIGN KEY ("recipient_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_document" ADD CONSTRAINT "FK_c7ee6a7900de7fe17eb56dd46ec" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_document" ADD CONSTRAINT "FK_44653bbe57aa39e7b0bf8ed16a4" FOREIGN KEY ("document_id") REFERENCES "document"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_document" DROP CONSTRAINT "FK_44653bbe57aa39e7b0bf8ed16a4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_document" DROP CONSTRAINT "FK_c7ee6a7900de7fe17eb56dd46ec"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contact" DROP CONSTRAINT "FK_328f38e58b490932d0997603052"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contact" DROP CONSTRAINT "FK_4b5a10d41009acc018c15447f32"`,
    );
    await queryRunner.query(`ALTER TABLE "document" DROP COLUMN "title"`);
    await queryRunner.query(`ALTER TABLE "document" DROP COLUMN "status"`);
    await queryRunner.query(`DROP TYPE "public"."document_status_enum"`);
    await queryRunner.query(`DROP TABLE "user_document"`);
    await queryRunner.query(`DROP TYPE "public"."user_document_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."user_document_status_enum"`);
    await queryRunner.query(`DROP TABLE "contact"`);
  }
}
