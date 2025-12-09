-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "metaKeywords" TEXT,
ADD COLUMN     "ogImage" TEXT,
ADD COLUMN     "seoDescription" TEXT,
ADD COLUMN     "seoTitle" TEXT;

-- CreateTable
CREATE TABLE "site_seo" (
    "id" TEXT NOT NULL,
    "siteName" TEXT NOT NULL,
    "siteDescription" TEXT NOT NULL,
    "siteUrl" TEXT NOT NULL,
    "defaultTitle" TEXT NOT NULL,
    "defaultDescription" TEXT NOT NULL,
    "defaultKeywords" TEXT,
    "ogImage" TEXT,
    "twitterHandle" TEXT,
    "facebookAppId" TEXT,
    "googleSiteVerification" TEXT,
    "bingVerification" TEXT,
    "robotsTxt" TEXT,
    "analyticsId" TEXT,
    "structuredData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_seo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_seo" (
    "id" TEXT NOT NULL,
    "pagePath" TEXT NOT NULL,
    "pageName" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "keywords" TEXT,
    "ogTitle" TEXT,
    "ogDescription" TEXT,
    "ogImage" TEXT,
    "ogType" TEXT DEFAULT 'website',
    "noindex" BOOLEAN NOT NULL DEFAULT false,
    "nofollow" BOOLEAN NOT NULL DEFAULT false,
    "canonical" TEXT,
    "structuredData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "page_seo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "page_seo_pagePath_key" ON "page_seo"("pagePath");

-- CreateIndex
CREATE INDEX "page_seo_pagePath_idx" ON "page_seo"("pagePath");
