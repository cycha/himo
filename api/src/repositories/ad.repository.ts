import { Ad, IAd } from '@himo/commons';
import { FilterQuery } from 'mongoose';

export interface AdSearchQuery {
  title?: string;
  real_estate_type?: string;
  immo_sell_type?: string;
  price?: { $gte?: number; $lte?: number };
  surface?: { $gte?: number; $lte?: number };
  $or?: Array<Record<string, any>>;
  $text?: { $search: string };
}

export class AdRepository {
  private readonly ITEMS_PER_PAGE = 35;

  async findWithFilters(
    query: FilterQuery<IAd>,
    page: number = 0,
    limit?: number
  ): Promise<any[]> {
    const itemsPerPage = limit || this.ITEMS_PER_PAGE;
    
    return Ad.find(query)
      .collation({ locale: 'fr', strength: 1 })
      .sort('-release_date')
      .skip(page * itemsPerPage)
      .limit(itemsPerPage)
      .lean()
      .exec();
  }

  async findById(id: string): Promise<any | null> {
    return Ad.findById(id).lean().exec();
  }

  async count(query: FilterQuery<IAd>): Promise<number> {
    return Ad.countDocuments(query).exec();
  }

  async create(adData: Partial<IAd>): Promise<IAd> {
    const ad = new Ad(adData);
    return ad.save();
  }

  async createMany(adsData: Partial<IAd>[]): Promise<IAd[]> {
    return Ad.insertMany(adsData, { ordered: false });
  }

  async update(id: string, adData: Partial<IAd>): Promise<any | null> {
    return Ad.findByIdAndUpdate(id, adData, { new: true }).exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await Ad.findByIdAndDelete(id).exec();
    return result !== null;
  }

  async deleteMany(query: FilterQuery<IAd>): Promise<number> {
    const result = await Ad.deleteMany(query).exec();
    return result.deletedCount || 0;
  }

  async findMostRecent(provider: string): Promise<any | null> {
    return Ad.findOne({ provider })
      .sort('-release_date')
      .lean()
      .exec();
  }
}

export const adRepository = new AdRepository();
