-- AlterTable
ALTER TABLE "coupons" ADD COLUMN     "applicableCategories" JSONB,
ADD COLUMN     "buyX" INTEGER,
ADD COLUMN     "getY" INTEGER;
