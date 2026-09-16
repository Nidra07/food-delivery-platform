import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDeliveryPartners1726500500000 implements MigrationInterface {
  name = 'AddDeliveryPartners1726500500000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`INSERT INTO "roles" ("name", "description") VALUES ('DELIVERY_PARTNER', 'Delivery partner'), ('RESTAURANT_STAFF', 'Restaurant staff') ON CONFLICT ("name") DO NOTHING`);
    await queryRunner.query(`CREATE TABLE "delivery_partners" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "user_id" uuid NOT NULL, "phone" character varying(30), "vehicle_type" character varying(30), "vehicle_number" character varying(40), "availability" character varying(20) NOT NULL DEFAULT 'OFFLINE', "verification_status" character varying(20) NOT NULL DEFAULT 'PENDING', "latitude" numeric(10,7), "longitude" numeric(10,7), "last_location_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_delivery_partners_user" UNIQUE ("user_id"), CONSTRAINT "PK_delivery_partners_id" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "delivery_assignments" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "order_id" uuid NOT NULL, "delivery_partner_id" uuid NOT NULL, "status" character varying(20) NOT NULL DEFAULT 'OFFERED', "rejection_reason" text, "offered_at" TIMESTAMP NOT NULL DEFAULT now(), "accepted_at" TIMESTAMP, "completed_at" TIMESTAMP, "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_delivery_assignment_order" UNIQUE ("order_id"), CONSTRAINT "PK_delivery_assignments_id" PRIMARY KEY ("id"))`);
    await queryRunner.query(`ALTER TABLE "delivery_partners" ADD CONSTRAINT "FK_delivery_partners_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    await queryRunner.query(`ALTER TABLE "delivery_assignments" ADD CONSTRAINT "FK_delivery_assignments_order" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    await queryRunner.query(`ALTER TABLE "delivery_assignments" ADD CONSTRAINT "FK_delivery_assignments_partner" FOREIGN KEY ("delivery_partner_id") REFERENCES "delivery_partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE`);
    await queryRunner.query(`CREATE INDEX "IDX_delivery_partners_availability" ON "delivery_partners" ("availability", "verification_status")`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_delivery_partners_availability"`);
    await queryRunner.query(`DROP TABLE "delivery_assignments"`);
    await queryRunner.query(`DROP TABLE "delivery_partners"`);
  }
}
