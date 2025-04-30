/*
  Warnings:

  - You are about to drop the column `img` on the `product_images` table. All the data in the column will be lost.
  - Added the required column `product_img` to the `product_images` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "product_images" DROP COLUMN "img",
ADD COLUMN     "product_img" VARCHAR(191) NOT NULL;
