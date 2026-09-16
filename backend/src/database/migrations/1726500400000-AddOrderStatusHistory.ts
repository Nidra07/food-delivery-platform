import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrderStatusHistory1726500400000 implements MigrationInterface {
  name = 'AddOrderStatusHistory1726500400000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "order_status_history" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "order_id" uuid NOT NULL, "from_status" character varying(30), "to_status" character varying(30) NOT NULL, "changed_by_id" uuid, "note" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_order_status_history_id" PRIMARY KEY ("id"))`);
    await queryRunner.query(`ALTER TABLE "order_status_history" ADD CONSTRAINT "FK_order_status_history_order" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    await queryRunner.query(`ALTER TABLE "order_status_history" ADD CONSTRAINT "FK_order_status_history_user" FOREIGN KEY ("changed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
    await queryRunner.query(`CREATE INDEX "IDX_order_status_history_order_created" ON "order_status_history" ("order_id", "created_at")`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_order_status_history_order_created"`);
    await queryRunner.query(`DROP TABLE "order_status_history"`);
  }
}
