/*
  Warnings:

  - You are about to drop the column `bid_price` on the `bids` table. All the data in the column will be lost.
  - You are about to drop the column `is_winner` on the `bids` table. All the data in the column will be lost.
  - You are about to drop the column `product_id` on the `bids` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `bids` table. All the data in the column will be lost.
  - You are about to drop the `products` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[order_no]` on the table `orders` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `auction_id` to the `bids` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bid_amount` to the `bids` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "bids" DROP CONSTRAINT "bids_product_id_fkey";

-- DropForeignKey
ALTER TABLE "order_has_items" DROP CONSTRAINT "order_has_items_product_id_fkey";

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_bid_id_fkey";

-- DropForeignKey
ALTER TABLE "product_images" DROP CONSTRAINT "product_images_product_id_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_category_id_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "purchases" DROP CONSTRAINT "purchases_product_id_fkey";

-- DropForeignKey
ALTER TABLE "sales" DROP CONSTRAINT "sales_product_id_fkey";

-- DropIndex
DROP INDEX "bids_product_id_key";

-- AlterTable
ALTER TABLE "bids" DROP COLUMN "bid_price",
DROP COLUMN "is_winner",
DROP COLUMN "product_id",
DROP COLUMN "updatedAt",
ADD COLUMN     "auction_id" INTEGER NOT NULL,
ADD COLUMN     "bid_amount" DECIMAL(10,2) NOT NULL;

-- AlterTable
ALTER TABLE "orders" ALTER COLUMN "order_no" SET DATA TYPE TEXT,
ALTER COLUMN "total_amount" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "bid_id" DROP NOT NULL;

-- DropTable
DROP TABLE "products";

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "product_name" VARCHAR(191) NOT NULL,
    "description" VARCHAR(191),
    "stock" INTEGER NOT NULL DEFAULT 0,
    "category_id" INTEGER NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "fixed_price" DECIMAL(10,2),
    "base_price" DECIMAL(10,2),
    "is_auction" BOOLEAN NOT NULL DEFAULT false,
    "auction_end_time" TIMESTAMP(3),

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Auction" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_time" TIMESTAMP(3) NOT NULL,
    "starting_price" DECIMAL(10,2) NOT NULL,
    "current_price" DECIMAL(10,2),
    "winner_id" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Auction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Product_is_auction_idx" ON "Product"("is_auction");

-- CreateIndex
CREATE INDEX "Product_auction_end_time_idx" ON "Product"("auction_end_time");

-- CreateIndex
CREATE INDEX "Product_category_id_idx" ON "Product"("category_id");

-- CreateIndex
CREATE INDEX "Product_organization_id_idx" ON "Product"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "Auction_product_id_key" ON "Auction"("product_id");

-- CreateIndex
CREATE INDEX "Auction_end_time_idx" ON "Auction"("end_time");

-- CreateIndex
CREATE INDEX "Auction_is_active_idx" ON "Auction"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "orders_order_no_key" ON "orders"("order_no");

-- AddForeignKey
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Auction" ADD CONSTRAINT "Auction_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Auction" ADD CONSTRAINT "Auction_winner_id_fkey" FOREIGN KEY ("winner_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bids" ADD CONSTRAINT "bids_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "Auction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_bid_id_fkey" FOREIGN KEY ("bid_id") REFERENCES "bids"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_has_items" ADD CONSTRAINT "order_has_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
