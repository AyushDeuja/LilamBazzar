/*
  Warnings:

  - You are about to drop the column `product_img` on the `products` table. All the data in the column will be lost.
  - You are about to drop the `carts` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `commission` to the `sales` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tax` to the `sales` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "carts" DROP CONSTRAINT "carts_product_id_fkey";

-- DropForeignKey
ALTER TABLE "carts" DROP CONSTRAINT "carts_user_id_fkey";

-- AlterTable
ALTER TABLE "products" DROP COLUMN "product_img";

-- AlterTable
ALTER TABLE "sales" ADD COLUMN     "commission" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "tax" DECIMAL(10,2) NOT NULL;

-- DropTable
DROP TABLE "carts";

-- CreateTable
CREATE TABLE "product_images" (
    "id" SERIAL NOT NULL,
    "img" VARCHAR(191) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "product_id" INTEGER NOT NULL,

    CONSTRAINT "product_images_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
