/*
  Warnings:

  - The values [admin,vendor,customer] on the enum `roleType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `price` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `organization_id` on the `purchases` table. All the data in the column will be lost.
  - You are about to drop the column `organization_id` on the `sales` table. All the data in the column will be lost.
  - You are about to drop the column `role_id` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `organizations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `roles` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[pan_no]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `base_price` to the `products` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "roleType_new" AS ENUM ('0', '1', '2');
ALTER TABLE "users" ALTER COLUMN "user_role" TYPE "roleType_new" USING ("user_role"::text::"roleType_new");
ALTER TYPE "roleType" RENAME TO "roleType_old";
ALTER TYPE "roleType_new" RENAME TO "roleType";
DROP TYPE "roleType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "organizations" DROP CONSTRAINT "organizations_user_id_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "purchases" DROP CONSTRAINT "purchases_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "sales" DROP CONSTRAINT "sales_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_role_id_fkey";

-- DropIndex
DROP INDEX "users_role_id_key";

-- AlterTable
ALTER TABLE "products" DROP COLUMN "price",
ADD COLUMN     "base_price" DECIMAL(10,2) NOT NULL;

-- AlterTable
ALTER TABLE "purchases" DROP COLUMN "organization_id";

-- AlterTable
ALTER TABLE "sales" DROP COLUMN "organization_id";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "role_id",
ADD COLUMN     "organization_name" VARCHAR(191),
ADD COLUMN     "pan_no" VARCHAR(191),
ADD COLUMN     "user_role" "roleType" NOT NULL DEFAULT '2';

-- DropTable
DROP TABLE "organizations";

-- DropTable
DROP TABLE "roles";

-- CreateTable
CREATE TABLE "bids" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "bidder_id" INTEGER NOT NULL,
    "bid_price" DECIMAL(10,2) NOT NULL,
    "is_winner" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bids_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" SERIAL NOT NULL,
    "order_no" INTEGER NOT NULL,
    "total_amount" INTEGER NOT NULL,
    "is_delivered" BOOLEAN NOT NULL DEFAULT false,
    "has_confirmed" BOOLEAN NOT NULL DEFAULT false,
    "is_paid" BOOLEAN NOT NULL DEFAULT false,
    "order_by" INTEGER NOT NULL,
    "bid_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_has_items" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "order_id" INTEGER NOT NULL,
    "product_price" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_has_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_pan_no_key" ON "users"("pan_no");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bids" ADD CONSTRAINT "bids_bidder_id_fkey" FOREIGN KEY ("bidder_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bids" ADD CONSTRAINT "bids_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_order_by_fkey" FOREIGN KEY ("order_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_bid_id_fkey" FOREIGN KEY ("bid_id") REFERENCES "bids"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_has_items" ADD CONSTRAINT "order_has_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_has_items" ADD CONSTRAINT "order_has_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
