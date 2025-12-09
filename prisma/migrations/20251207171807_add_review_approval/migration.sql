-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "isApproved" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "reviews_isApproved_idx" ON "reviews"("isApproved");
