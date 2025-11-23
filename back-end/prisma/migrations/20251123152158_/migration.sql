/*
  Warnings:

  - You are about to drop the column `createdAt` on the `order_has_items` table. All the data in the column will be lost.
  - You are about to drop the column `product_price` on the `order_has_items` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `order_has_items` table. All the data in the column will be lost.
  - You are about to drop the column `has_confirmed` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `is_paid` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `order_by` on the `orders` table. All the data in the column will be lost.
  - Added the required column `quantity` to the `order_has_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_price` to the `order_has_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unit_price` to the `order_has_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_order_by_fkey";

-- AlterTable
ALTER TABLE "order_has_items" DROP COLUMN "createdAt",
DROP COLUMN "product_price",
DROP COLUMN "updatedAt",
ADD COLUMN     "quantity" INTEGER NOT NULL,
ADD COLUMN     "total_price" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "unit_price" DECIMAL(12,2) NOT NULL;

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "has_confirmed",
DROP COLUMN "is_paid",
DROP COLUMN "order_by",
ADD COLUMN     "delivered_at" TIMESTAMP(3),
ADD COLUMN     "payment_method" TEXT,
ADD COLUMN     "payment_status" TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN     "transaction_id" TEXT,
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
