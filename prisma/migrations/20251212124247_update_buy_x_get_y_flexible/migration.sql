/*
  Warnings:

  - You are about to drop the column `buyX` on the `coupons` table. All the data in the column will be lost.
  - You are about to drop the column `getY` on the `coupons` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "coupons" DROP COLUMN "buyX",
DROP COLUMN "getY",
ADD COLUMN     "buyMode" TEXT,
ADD COLUMN     "buyQuantity" INTEGER,
ADD COLUMN     "buyTargetId" TEXT,
ADD COLUMN     "getQuantity" INTEGER,
ADD COLUMN     "getTargetId" TEXT;
