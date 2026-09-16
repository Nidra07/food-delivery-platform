import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRestaurantMenu1726500200000 implements MigrationInterface {
  name = 'AddRestaurantMenu1726500200000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "roles" ADD CONSTRAINT "UQ_roles_name" UNIQUE ("name")`);
    await queryRunner.query(`INSERT INTO "roles" ("name", "description") VALUES ('RESTAURANT_OWNER', 'Restaurant owner') ON CONFLICT ("name") DO NOTHING`);
    await queryRunner.query(`CREATE TABLE "restaurants" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "owner_id" uuid NOT NULL, "name" character varying(160) NOT NULL, "description" text, "phone" character varying(30), "address_line1" character varying(255) NOT NULL, "city" character varying(100) NOT NULL, "postal_code" character varying(20), "latitude" numeric(10,7), "longitude" numeric(10,7), "status" character varying(20) NOT NULL DEFAULT 'PENDING', "is_open" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_restaurants_id" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "menu_categories" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "restaurant_id" uuid NOT NULL, "name" character varying(120) NOT NULL, "display_order" integer NOT NULL DEFAULT 0, "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_menu_categories_id" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "menu_items" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "restaurant_id" uuid NOT NULL, "category_id" uuid NOT NULL, "name" character varying(160) NOT NULL, "description" text, "price" numeric(10,2) NOT NULL, "is_vegetarian" boolean NOT NULL DEFAULT false, "is_available" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_menu_items_id" PRIMARY KEY ("id"))`);
    await queryRunner.query(`ALTER TABLE "restaurants" ADD CONSTRAINT "FK_restaurants_owner" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE`);
    await queryRunner.query(`ALTER TABLE "menu_categories" ADD CONSTRAINT "FK_categories_restaurant" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    await queryRunner.query(`ALTER TABLE "menu_items" ADD CONSTRAINT "FK_items_restaurant" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    await queryRunner.query(`ALTER TABLE "menu_items" ADD CONSTRAINT "FK_items_category" FOREIGN KEY ("category_id") REFERENCES "menu_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "menu_items"`);
    await queryRunner.query(`DROP TABLE "menu_categories"`);
    await queryRunner.query(`DROP TABLE "restaurants"`);
  }
}
