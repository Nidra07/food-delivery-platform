import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPermissions1726500100000 implements MigrationInterface {
  name = 'AddPermissions1726500100000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "permissions" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "code" character varying NOT NULL, "description" character varying, CONSTRAINT "UQ_permissions_code" UNIQUE ("code"), CONSTRAINT "PK_permissions_id" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "role_permissions" ("rolesId" uuid NOT NULL, "permissionsId" uuid NOT NULL, CONSTRAINT "PK_role_permissions" PRIMARY KEY ("rolesId", "permissionsId"))`);
    await queryRunner.query(`ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_role_permissions_role" FOREIGN KEY ("rolesId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    await queryRunner.query(`ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_role_permissions_permission" FOREIGN KEY ("permissionsId") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    await queryRunner.query(`INSERT INTO "permissions" ("code", "description") VALUES ('view_assigned_partners', 'View assigned delivery partners'), ('view_active_deliveries', 'View active deliveries'), ('view_delivery_status', 'View delivery status'), ('contact_delivery_partner', 'Contact delivery partners'), ('create_support_ticket', 'Create support tickets'), ('manage_assigned_delivery_issues', 'Manage assigned delivery issues'), ('request_delivery_reassignment', 'Request delivery reassignment'), ('approve_delivery_reassignment', 'Approve delivery reassignment'), ('view_partner_performance', 'View partner performance'), ('view_partner_earnings', 'View permitted partner earnings'), ('escalate_to_admin', 'Escalate issues to administrators')`);
    await queryRunner.query(`INSERT INTO "role_permissions" ("rolesId", "permissionsId") SELECT r."id", p."id" FROM "roles" r CROSS JOIN "permissions" p WHERE r."name" = 'TEAM_LEADER' AND p."code" IN ('view_assigned_partners', 'view_active_deliveries', 'view_delivery_status', 'contact_delivery_partner', 'create_support_ticket', 'manage_assigned_delivery_issues', 'request_delivery_reassignment', 'view_partner_performance', 'view_partner_earnings', 'escalate_to_admin')`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "role_permissions"`);
    await queryRunner.query(`DROP TABLE "permissions"`);
  }
}
