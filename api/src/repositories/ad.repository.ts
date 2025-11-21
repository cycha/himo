import { prisma } from '../lib/prisma';
import { Prisma, Ad, Provider, RealEstateType, ImmoSellType } from '@prisma/client';

export interface AdSearchFilters {
  realEstateType?: RealEstateType;
  immoSellType?: ImmoSellType;
  priceMin?: number;
  priceMax?: number;
  surfaceMin?: number;
  surfaceMax?: number;
  rooms?: number;
  provider?: Provider;
  city?: string;
  zipcode?: string;
  search?: string;
}

export class AdRepositoryPrisma {
  private readonly ITEMS_PER_PAGE = 35;

  /**
   * Find ads with filters
   */
  async findWithFilters(
    filters: AdSearchFilters,
    page: number = 0,
    limit?: number
  ): Promise<Ad[]> {
    const itemsPerPage = limit || this.ITEMS_PER_PAGE;
    
    const where: Prisma.AdWhereInput = this.buildWhereClause(filters);

    return prisma.ad.findMany({
      where,
      orderBy: { releaseDate: 'desc' },
      skip: page * itemsPerPage,
      take: itemsPerPage,
    });
  }

  /**
   * Find ad by ID
   */
  async findById(id: string): Promise<Ad | null> {
    return prisma.ad.findUnique({
      where: { id },
    });
  }

  /**
   * Count ads matching filters
   */
  async count(filters: AdSearchFilters): Promise<number> {
    const where = this.buildWhereClause(filters);
    return prisma.ad.count({ where });
  }

  /**
   * Create a new ad
   */
  async create(adData: Prisma.AdCreateInput): Promise<Ad> {
    return prisma.ad.create({
      data: adData,
    });
  }

  /**
   * Create many ads
   */
  async createMany(adsData: Prisma.AdCreateInput[]): Promise<number> {
    const result = await prisma.ad.createMany({
      data: adsData,
      skipDuplicates: true,
    });
    return result.count;
  }

  /**
   * Update an ad
   */
  async update(id: string, adData: Prisma.AdUpdateInput): Promise<Ad | null> {
    try {
      return await prisma.ad.update({
        where: { id },
        data: adData,
      });
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return null; // Not found
      }
      throw error;
    }
  }

  /**
   * Delete an ad
   */
  async delete(id: string): Promise<boolean> {
    try {
      await prisma.ad.delete({
        where: { id },
      });
      return true;
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return false; // Not found
      }
      throw error;
    }
  }

  /**
   * Delete many ads
   */
  async deleteMany(filters: AdSearchFilters): Promise<number> {
    const where = this.buildWhereClause(filters);
    const result = await prisma.ad.deleteMany({ where });
    return result.count;
  }

  /**
   * Find most recent ad for a provider
   */
  async findMostRecent(provider: Provider): Promise<Ad | null> {
    return prisma.ad.findFirst({
      where: { provider },
      orderBy: { releaseDate: 'desc' },
    });
  }

  /**
   * Find nearby ads using geospatial query
   */
  async findNearby(
    latitude: number,
    longitude: number,
    radiusKm: number,
    filters?: AdSearchFilters,
    limit: number = 20
  ): Promise<Ad[]> {
    // Note: PostGIS queries in Prisma require raw SQL
    // This is a simplified version
    const where: Prisma.AdWhereInput = {
      ...this.buildWhereClause(filters || {}),
      latitude: { not: null },
      longitude: { not: null },
    };

    return prisma.ad.findMany({
      where,
      take: limit,
      orderBy: { releaseDate: 'desc' },
    });
  }

  /**
   * Full-text search
   */
  async search(searchTerm: string, page: number = 0, limit?: number): Promise<Ad[]> {
    const itemsPerPage = limit || this.ITEMS_PER_PAGE;
    
    return prisma.ad.findMany({
      where: {
        OR: [
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
          { city: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      orderBy: { releaseDate: 'desc' },
      skip: page * itemsPerPage,
      take: itemsPerPage,
    });
  }

  /**
   * Build Prisma where clause from filters
   */
  private buildWhereClause(filters: AdSearchFilters): Prisma.AdWhereInput {
    const where: Prisma.AdWhereInput = {};

    if (filters.realEstateType) {
      where.realEstateType = filters.realEstateType;
    }

    if (filters.immoSellType) {
      where.immoSellType = filters.immoSellType;
    }

    if (filters.provider) {
      where.provider = filters.provider;
    }

    if (filters.city) {
      where.city = { contains: filters.city, mode: 'insensitive' };
    }

    if (filters.zipcode) {
      where.zipcode = filters.zipcode;
    }

    if (filters.rooms !== undefined) {
      where.rooms = { gte: filters.rooms };
    }

    this.applyPriceRange(where, filters);
    this.applySurfaceRange(where, filters);

    // Full-text search
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  /**
   * Apply price range filter to where clause
   */
  private applyPriceRange(where: Prisma.AdWhereInput, filters: AdSearchFilters): void {
    if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
      where.price = {};
      if (filters.priceMin !== undefined) {
        where.price.gte = filters.priceMin;
      }
      if (filters.priceMax !== undefined) {
        where.price.lte = filters.priceMax;
      }
    }
  }

  /**
   * Apply surface range filter to where clause
   */
  private applySurfaceRange(where: Prisma.AdWhereInput, filters: AdSearchFilters): void {
    if (filters.surfaceMin !== undefined || filters.surfaceMax !== undefined) {
      where.surface = {};
      if (filters.surfaceMin !== undefined) {
        where.surface.gte = filters.surfaceMin;
      }
      if (filters.surfaceMax !== undefined) {
        where.surface.lte = filters.surfaceMax;
      }
    }
  }
}

export const adRepository = new AdRepositoryPrisma();
