/*
  Warnings:

  - A unique constraint covering the columns `[product_id]` on the table `bids` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "bids_product_id_key" ON "bids"("product_id");
