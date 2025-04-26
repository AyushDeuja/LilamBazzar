/*
  Warnings:

  - A unique constraint covering the columns `[bidder_id]` on the table `bids` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "bids_bidder_id_key" ON "bids"("bidder_id");
