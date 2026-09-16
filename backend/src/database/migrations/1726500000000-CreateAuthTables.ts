import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAuthTables1726500000000 implements MigrationInterface {
  name = 'CreateAuthTables1726500000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);
    await queryRunner.query(`CREATE TABLE "roles" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "name" character varying NOT NULL, "description" character varying, CONSTRAINT "UQ_roles_name" UNIQUE ("name"), CONSTRAINT "PK_roles_id" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "email" character varying NOT NULL, "phone" character varying, "password_hash" character varying NOT NULL, "first_name" character varying, "last_name" character varying, "status" character varying NOT NULL DEFAULT 'ACTIVE', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_users_email" UNIQUE ("email"), CONSTRAINT "UQ_users_phone" UNIQUE ("phone"), CONSTRAINT "PK_users_id" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "user_roles" ("usersId" uuid NOT NULL, "rolesId" uuid NOT NULL, CONSTRAINT "PK_user_roles" PRIMARY KEY ("usersId", "rolesId"))`);
    await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "FK_user_roles_user" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "FK_user_roles_role" FOREIGN KEY ("rolesId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    await queryRunner.query(`INSERT INTO "roles" ("name", "description") VALUES ('CUSTOMER', 'Customer account'), ('ADMIN', 'Platform administrator'), ('TEAM_LEADER', 'Delivery operations supervisor')`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user_roles"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "roles"`);
  }
}
