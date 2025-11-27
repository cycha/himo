-- Manual migration to fix local_commercial enum value
ALTER TYPE "RealEstateType" RENAME VALUE 'local-commercial' TO 'local_commercial';
