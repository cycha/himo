import { prisma } from '../lib/prisma';
import { Provider, Prisma, RealEstateType, ImmoSellType } from '@prisma/client';
import { BotAdData } from './base-scraper';
import { Logger } from '../utils/logger';

export async function getLatestAdInDb(provider: string): Promise<{ date: Date; title: string }> {
  const latestAd = await prisma.ad.findFirst({
    where: { provider: provider as Provider },
    orderBy: { releaseDate: 'desc' },
  });

  return {
    date: latestAd?.releaseDate || new Date(0),
    title: latestAd?.title || '',
  };
}

export async function saveAds(ads: Partial<BotAdData>[], logger: Logger): Promise<number> {
  if (ads.length === 0) {
    logger.info('No ads to save');
    return 0;
  }

  try {
    logger.info(`Saving ${ads.length} ads...`);

    const prismaAds: Prisma.AdCreateManyInput[] = ads.map((ad) => ({
      title: ad.title!,
      description: ad.description || '',
      thumbUrls: ad.thumb_urls || [],
      url: ad.url!,
      realEstateType: ad.real_estate_type as RealEstateType | undefined,
      rooms: ad.rooms,
      surface: ad.surface,
      immoSellType: ad.immo_sell_type as ImmoSellType | undefined,
      price: ad.price!,
      provider: ad.provider as Provider,
      releaseDate: ad.release_date!,
      regionName: ad.location?.region_name,
      departmentId: ad.location?.department_id,
      departmentName: ad.location?.department_name,
      city: ad.location?.city,
      zipcode: ad.location?.zipcode || 'unknown',
      latitude: ad.location?.coordinates?.[1],
      longitude: ad.location?.coordinates?.[0],
    }));

    const result = await prisma.ad.createMany({
      data: prismaAds,
      skipDuplicates: true,
    });

    logger.info(`${result.count} ads saved successfully`);
    return result.count;
  } catch (error: unknown) {
    logger.error('Error saving ads:', error);
    throw error;
  }
}
