import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCustomerOrdering1726500300000 implements MigrationInterface {
  name = 'AddCustomerOrdering1726500300000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "addresses" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "user_id" uuid NOT NULL, "label" character varying(40) NOT NULL, "address_line1" character varying(255) NOT NULL, "city" character varying(100) NOT NULL, "postal_code" character varying(20), "latitude" numeric(10,7), "longitude" numeric(10,7), "is_default" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_addresses_id" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "cart_items" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "user_id" uuid NOT NULL, "restaurant_id" uuid NOT NULL, "menu_item_id" uuid NOT NULL, "quantity" integer NOT NULL, "unit_price" numeric(10,2) NOT NULL, "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_cart_items_id" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "orders" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "order_number" character varying(40) NOT NULL, "customer_id" uuid NOT NULL, "restaurant_id" uuid NOT NULL, "delivery_address_id" uuid NOT NULL, "status" character varying(30) NOT NULL DEFAULT 'PLACED', "subtotal" numeric(10,2) NOT NULL, "delivery_fee" numeric(10,2) NOT NULL DEFAULT 0, "tax_amount" numeric(10,2) NOT NULL DEFAULT 0, "total_amount" numeric(10,2) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_orders_number" UNIQUE ("order_number"), CONSTRAINT "PK_orders_id" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "order_items" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "order_id" uuid NOT NULL, "menu_item_id" uuid NOT NULL, "item_name" character varying(160) NOT NULL, "quantity" integer NOT NULL, "unit_price" numeric(10,2) NOT NULL, "line_total" numeric(10,2) NOT NULL, CONSTRAINT "PK_order_items_id" PRIMARY KEY ("id"))`);
    await queryRunner.query(`ALTER TABLE "addresses" ADD CONSTRAINT "FK_addresses_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    await queryRunner.query(`ALTER TABLE "cart_items" ADD CONSTRAINT "FK_cart_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    await queryRunner.query(`ALTER TABLE "cart_items" ADD CONSTRAINT "FK_cart_restaurant" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    await queryRunner.query(`ALTER TABLE "cart_items" ADD CONSTRAINT "FK_cart_item" FOREIGN KEY ("menu_item_id") REFERENCES "menu_items"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_order_customer" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE`);
    await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_order_restaurant" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE RESTRICT ON UPDATE CASCADE`);
    await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_order_address" FOREIGN KEY ("delivery_address_id") REFERENCES "addresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE`);
    await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_order_items_order" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_order_items_menu" FOREIGN KEY ("menu_item_id") REFERENCES "menu_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "order_items"`);
    await queryRunner.query(`DROP TABLE "orders"`);
    await queryRunner.query(`DROP TABLE "cart_items"`);
    await queryRunner.query(`DROP TABLE "addresses"`);
  }
}
