import { IAd } from '@himo/commons';
import { FilterQuery } from 'mongoose';
import { adRepository } from '../repositories/ad.repository';
import { SearchAdDto, AdResponseDto, SearchResultDto } from '../dtos/ad.dto';

export interface IAdService {
  search(searchDto: SearchAdDto, page?: number): Promise<SearchResultDto>;
  getById(id: string): Promise<AdResponseDto | null>;
}

export class AdService implements IAdService {
  constructor(private readonly repository = adRepository) {}

  async search(searchDto: SearchAdDto, page: number = 0): Promise<SearchResultDto> {
    const query = this.buildSearchQuery(searchDto);
    
    const [ads, totalCount] = await Promise.all([
      this.repository.findWithFilters(query, page),
      this.repository.count(query),
    ]);

    return {
      success: true,
      data: ads as AdResponseDto[],
      page,
      count: ads.length,
      totalPages: Math.ceil(totalCount / 35),
    };
  }

  async getById(id: string): Promise<AdResponseDto | null> {
    const ad = await this.repository.findById(id);
    return ad as AdResponseDto | null;
  }

  private buildSearchQuery(searchDto: SearchAdDto): FilterQuery<IAd> {
    const query: FilterQuery<IAd> = {};

    // Text search
    if (searchDto.title) {
      query.$text = { $search: searchDto.title };
    }

    // Real estate type filter
    if (searchDto.type) {
      query.real_estate_type = searchDto.type.toLowerCase();
    }

    // Sell type filter
    if (searchDto.sellType) {
      query.immo_sell_type = searchDto.sellType.toLowerCase();
    }

    // Price range filter
    if (searchDto.priceMin || searchDto.priceMax) {
      query.price = {};
      if (searchDto.priceMin) {
        query.price.$gte = searchDto.priceMin;
      }
      if (searchDto.priceMax) {
        query.price.$lte = searchDto.priceMax;
      }
    }

    // Surface range filter
    if (searchDto.surfaceMin || searchDto.surfaceMax) {
      query.surface = {};
      if (searchDto.surfaceMin) {
        query.surface.$gte = searchDto.surfaceMin;
      }
      if (searchDto.surfaceMax) {
        query.surface.$lte = searchDto.surfaceMax;
      }
    }

    // Location filter
    if (searchDto.location) {
      const orArray: FilterQuery<IAd>[] = [];

      // Geographic coordinates search (5km radius)
      if (searchDto.location.coordinates) {
        orArray.push({
          'location.coordinates': {
            $geoWithin: {
              $centerSphere: [searchDto.location.coordinates, 5 / 6378],
            },
          },
        });
      }

      // City/Department/Region search
      if (searchDto.location.address_components) {
        const city = searchDto.location.address_components.find((component) =>
          component.types.includes('locality')
        );

        const political = searchDto.location.address_components.find((component) =>
          component.types.includes('political')
        );

        if (city) {
          orArray.push({ 'location.city': city.short_name });
        } else if (political) {
          orArray.push(
            { 'location.department_name': political.short_name },
            { 'location.region_name': political.short_name }
          );
        }
      }

      if (orArray.length > 0) {
        query.$or = orArray;
      }
    }

    return query;
  }
}

export const adService = new AdService();
