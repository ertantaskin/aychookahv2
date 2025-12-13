-- CreateTable
CREATE TABLE "menu_items" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "href" TEXT,
    "location" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isSectionTitle" BOOLEAN NOT NULL DEFAULT false,
    "icon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menu_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hero_slides" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "ctaText" TEXT NOT NULL,
    "ctaLink" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hero_slides_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "menu_items_location_idx" ON "menu_items"("location");

-- CreateIndex
CREATE INDEX "menu_items_order_idx" ON "menu_items"("order");

-- CreateIndex
CREATE INDEX "menu_items_isSectionTitle_idx" ON "menu_items"("isSectionTitle");

-- CreateIndex
CREATE INDEX "hero_slides_order_idx" ON "hero_slides"("order");

-- CreateIndex
CREATE INDEX "hero_slides_isActive_idx" ON "hero_slides"("isActive");
