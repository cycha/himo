import { adRepository, AdSearchFilters } from '../repositories/ad.repository';
import { SearchAdDto, AdResponseDto, SearchResultDto } from '../dtos/ad.dto';
import { RealEstateType, ImmoSellType } from '@prisma/client';

export interface IAdService {
  search(searchDto: SearchAdDto, page?: number): Promise<SearchResultDto>;
  getById(id: string): Promise<AdResponseDto | null>;
}

export class AdServicePrisma implements IAdService {
  constructor(private readonly repository = adRepository) {}

  async search(searchDto: SearchAdDto, page: number = 0): Promise<SearchResultDto> {
    const filters = this.buildSearchFilters(searchDto);
    
    const [ads, totalCount] = await Promise.all([
      this.repository.findWithFilters(filters, page),
      this.repository.count(filters),
    ]);

    return {
      success: true,
      data: ads.map(ad => this.mapToResponseDto(ad)),
      page,
      count: ads.length,
      totalPages: Math.ceil(totalCount / 35),
    };
  }

  async getById(id: string): Promise<AdResponseDto | null> {
    const ad = await this.repository.findById(id);
    if (!ad) return null;
    return this.mapToResponseDto(ad);
  }

  private buildSearchFilters(searchDto: SearchAdDto): AdSearchFilters {
    const filters: AdSearchFilters = {};

    // Text search
    if (searchDto.title) {
      filters.search = searchDto.title;
    }

    // Real estate type filter
    if (searchDto.type) {
      const type = searchDto.type.toLowerCase().replace('-', '_');
      filters.realEstateType = type as RealEstateType;
    }

    // Sell type filter
    if (searchDto.sellType) {
      filters.immoSellType = searchDto.sellType.toLowerCase() as ImmoSellType;
    }

    // Price range filter
    if (searchDto.priceMin !== undefined) {
      filters.priceMin = searchDto.priceMin;
    }
    if (searchDto.priceMax !== undefined) {
      filters.priceMax = searchDto.priceMax;
    }

    // Surface range filter
    if (searchDto.surfaceMin !== undefined) {
      filters.surfaceMin = searchDto.surfaceMin;
    }
    if (searchDto.surfaceMax !== undefined) {
      filters.surfaceMax = searchDto.surfaceMax;
    }

    // Direct city filter
    if (searchDto.city) {
      filters.city = searchDto.city;
    }

    // Direct zipcode filter
    if (searchDto.zipcode) {
      filters.zipcode = searchDto.zipcode;
    }

    // Location filter (backward compatibility with address_components)
    if (searchDto.location) {
      if (searchDto.location.address_components && !searchDto.city) {
        const city = searchDto.location.address_components.find((component) =>
          component.types.includes('locality')
        );
        if (city) {
          filters.city = city.short_name;
        }
      }
    }

    return filters;
  }

  private mapToResponseDto(ad: any): AdResponseDto {
    return {
      _id: ad.id,
      title: ad.title,
      description: ad.description,
      thumb_urls: ad.thumbUrls,
      url: ad.url,
      real_estate_type: ad.realEstateType,
      rooms: ad.rooms,
      surface: ad.surface,
      immo_sell_type: ad.immoSellType,
      price: ad.price,
      provider: ad.provider,
      release_date: ad.releaseDate,
      created_at: ad.createdAt,
      location: {
        region_name: ad.regionName,
        department_id: ad.departmentId,
        department_name: ad.departmentName,
        city: ad.city,
        zipcode: ad.zipcode,
        coordinates: ad.latitude && ad.longitude ? [ad.longitude, ad.latitude] : undefined,
      },
    };
  }
}

export const adService = new AdServicePrisma();
