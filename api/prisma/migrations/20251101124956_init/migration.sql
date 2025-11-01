-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis" WITH SCHEMA "public";

-- CreateEnum
CREATE TYPE "RealEstateType" AS ENUM ('appartement', 'maison', 'terrain', 'parking', 'local-commercial');

-- CreateEnum
CREATE TYPE "ImmoSellType" AS ENUM ('neuf', 'ancien');

-- CreateEnum
CREATE TYPE "Provider" AS ENUM ('leboncoin', 'seloger', 'pap', 'bienici');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ads" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "thumb_urls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "url" VARCHAR(500) NOT NULL,
    "real_estate_type" "RealEstateType",
    "rooms" SMALLINT,
    "surface" SMALLINT,
    "immo_sell_type" "ImmoSellType",
    "price" INTEGER NOT NULL,
    "provider" "Provider" NOT NULL,
    "release_date" TIMESTAMPTZ NOT NULL,
    "region_name" VARCHAR(100),
    "department_id" VARCHAR(10),
    "department_name" VARCHAR(100),
    "city" VARCHAR(100),
    "zipcode" VARCHAR(10) NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ads_url_key" ON "ads"("url");

-- CreateIndex
CREATE INDEX "ads_provider_release_date_idx" ON "ads"("provider", "release_date" DESC);

-- CreateIndex
CREATE INDEX "ads_price_idx" ON "ads"("price");

-- CreateIndex
CREATE INDEX "ads_surface_idx" ON "ads"("surface");

-- CreateIndex
CREATE INDEX "ads_real_estate_type_idx" ON "ads"("real_estate_type");

-- CreateIndex
CREATE INDEX "ads_zipcode_idx" ON "ads"("zipcode");

-- CreateIndex
CREATE INDEX "ads_latitude_longitude_idx" ON "ads"("latitude", "longitude");
