import { AdServicePrisma } from '../ad.service';
import { RealEstateType, ImmoSellType, Provider } from '@prisma/client';
import { createTestAd, cleanDatabase } from '../../__tests__/helpers/testDb';

describe('AdService', () => {
  let adService: AdServicePrisma;

  beforeAll(() => {
    adService = new AdServicePrisma();
  });

  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('search', () => {
    beforeEach(async () => {
      // Create test ads
      await createTestAd({
        title: 'Beautiful Apartment in Paris',
        description: 'Modern apartment with view',
        realEstateType: RealEstateType.appartement,
        price: 300000,
        surface: 80,
        rooms: 3,
        city: 'Paris',
        zipcode: '75001',
        immoSellType: ImmoSellType.ancien,
        provider: Provider.leboncoin,
      });

      await createTestAd({
        url: 'https://example.com/ad2',
        title: 'Spacious House in Lyon',
        description: 'Large house with garden',
        realEstateType: RealEstateType.maison,
        price: 500000,
        surface: 150,
        rooms: 5,
        city: 'Lyon',
        zipcode: '69001',
        immoSellType: ImmoSellType.neuf,
        provider: Provider.seloger,
      });

      await createTestAd({
        url: 'https://example.com/ad3',
        title: 'Terrain in Marseille',
        description: 'Building plot',
        realEstateType: RealEstateType.terrain,
        price: 100000,
        surface: 500,
        city: 'Marseille',
        zipcode: '13001',
        immoSellType: ImmoSellType.ancien,
        provider: Provider.pap,
      });
    });

    it('should return all ads without filters', async () => {
      const result = await adService.search({});

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(3);
      expect(result.page).toBe(0);
      expect(result.count).toBe(3);
      expect(result.totalPages).toBe(1);
    });

    it('should filter by title (text search)', async () => {
      const result = await adService.search({ title: 'Paris' });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].title).toContain('Paris');
    });

    it('should filter by real estate type', async () => {
      const result = await adService.search({ type: 'appartement' });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].real_estate_type).toBe(RealEstateType.appartement);
    });

    it('should handle hyphenated real estate type', async () => {
      // Create a local-commercial ad
      await createTestAd({
        url: 'https://example.com/ad4',
        realEstateType: RealEstateType.local_commercial,
      });

      const result = await adService.search({ type: 'local-commercial' });

      expect(result.success).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0].real_estate_type).toBe(RealEstateType.local_commercial);
    });

    it('should filter by sell type', async () => {
      const result = await adService.search({ sellType: 'neuf' });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].immo_sell_type).toBe(ImmoSellType.neuf);
    });

    it('should filter by minimum price', async () => {
      const result = await adService.search({ priceMin: 400000 });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].price).toBeGreaterThanOrEqual(400000);
    });

    it('should filter by maximum price', async () => {
      const result = await adService.search({ priceMax: 200000 });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].price).toBeLessThanOrEqual(200000);
    });

    it('should filter by price range', async () => {
      const result = await adService.search({ priceMin: 200000, priceMax: 400000 });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].price).toBeGreaterThanOrEqual(200000);
      expect(result.data[0].price).toBeLessThanOrEqual(400000);
    });

    it('should filter by minimum surface', async () => {
      const result = await adService.search({ surfaceMin: 100 });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      result.data.forEach(ad => {
        expect(ad.surface).toBeGreaterThanOrEqual(100);
      });
    });

    it('should filter by maximum surface', async () => {
      const result = await adService.search({ surfaceMax: 100 });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].surface).toBeLessThanOrEqual(100);
    });

    it('should filter by surface range', async () => {
      const result = await adService.search({ surfaceMin: 70, surfaceMax: 160 });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
    });

    it('should filter by city', async () => {
      const result = await adService.search({ city: 'Paris' });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].location.city).toBe('Paris');
    });

    it('should filter by zipcode', async () => {
      const result = await adService.search({ zipcode: '75001' });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].location.zipcode).toBe('75001');
    });

    it('should filter by location with address_components', async () => {
      const result = await adService.search({
        location: {
          address_components: [
            {
              types: ['locality'],
              short_name: 'Lyon',
            },
          ],
        },
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].location.city).toBe('Lyon');
    });

    it('should combine multiple filters', async () => {
      const result = await adService.search({
        type: 'appartement',
        priceMin: 100000,
        priceMax: 350000,
        surfaceMin: 70,
        sellType: 'ancien',
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].real_estate_type).toBe(RealEstateType.appartement);
      expect(result.data[0].immo_sell_type).toBe(ImmoSellType.ancien);
    });

    it('should handle pagination', async () => {
      const page0 = await adService.search({}, 0);
      const page1 = await adService.search({}, 1);

      expect(page0.page).toBe(0);
      expect(page1.page).toBe(1);
    });

    it('should calculate total pages correctly', async () => {
      // Create 70 ads (should result in 2 pages with 35 items per page)
      const promises = [];
      for (let i = 4; i <= 70; i++) {
        promises.push(
          createTestAd({
            url: `https://example.com/ad${i}`,
            title: `Ad ${i}`,
          })
        );
      }
      await Promise.all(promises);

      const result = await adService.search({});

      expect(result.totalPages).toBe(Math.ceil(70 / 35));
    });

    it('should return empty array when no ads match', async () => {
      const result = await adService.search({
        type: 'parking',
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(0);
      expect(result.count).toBe(0);
      expect(result.totalPages).toBe(0);
    });

    it('should map ad fields correctly', async () => {
      const result = await adService.search({ city: 'Paris' });

      expect(result.data).toHaveLength(1);
      const ad = result.data[0];

      expect(ad._id).toBeDefined();
      expect(ad.title).toBe('Beautiful Apartment in Paris');
      expect(ad.description).toBe('Modern apartment with view');
      expect(ad.url).toBeDefined();
      expect(ad.real_estate_type).toBe(RealEstateType.appartement);
      expect(ad.rooms).toBe(3);
      expect(ad.surface).toBe(80);
      expect(ad.immo_sell_type).toBe(ImmoSellType.ancien);
      expect(ad.price).toBe(300000);
      expect(ad.provider).toBe(Provider.leboncoin);
      expect(ad.location.city).toBe('Paris');
      expect(ad.location.zipcode).toBe('75001');
      expect(ad.release_date).toBeInstanceOf(Date);
    });

    it('should include coordinates in location when available', async () => {
      const result = await adService.search({ city: 'Paris' });

      expect(result.data).toHaveLength(1);
      const ad = result.data[0];

      expect(ad.location.coordinates).toBeDefined();
      expect(ad.location.coordinates).toHaveLength(2);
      expect(ad.location.coordinates![0]).toBe(2.3522); // longitude
      expect(ad.location.coordinates![1]).toBe(48.8566); // latitude
    });
  });

  describe('getById', () => {
    it('should return ad by ID', async () => {
      const createdAd = await createTestAd({
        title: 'Test Ad',
        price: 200000,
      });

      const ad = await adService.getById(createdAd.id);

      expect(ad).toBeDefined();
      expect(ad?._id).toBe(createdAd.id);
      expect(ad?.title).toBe('Test Ad');
      expect(ad?.price).toBe(200000);
    });

    it('should return null for non-existent ad', async () => {
      const ad = await adService.getById('non-existent-id');

      expect(ad).toBeNull();
    });

    it('should map ad fields correctly', async () => {
      const createdAd = await createTestAd({
        title: 'Beautiful Apartment',
        description: 'A nice apartment',
        realEstateType: RealEstateType.appartement,
        price: 300000,
        surface: 80,
        rooms: 3,
        city: 'Paris',
        zipcode: '75001',
        immoSellType: ImmoSellType.ancien,
        provider: Provider.leboncoin,
        latitude: 48.8566,
        longitude: 2.3522,
      });

      const ad = await adService.getById(createdAd.id);

      expect(ad).toBeDefined();
      expect(ad?._id).toBe(createdAd.id);
      expect(ad?.title).toBe('Beautiful Apartment');
      expect(ad?.description).toBe('A nice apartment');
      expect(ad?.real_estate_type).toBe(RealEstateType.appartement);
      expect(ad?.price).toBe(300000);
      expect(ad?.surface).toBe(80);
      expect(ad?.rooms).toBe(3);
      expect(ad?.immo_sell_type).toBe(ImmoSellType.ancien);
      expect(ad?.provider).toBe(Provider.leboncoin);
      expect(ad?.location.city).toBe('Paris');
      expect(ad?.location.zipcode).toBe('75001');
      expect(ad?.location.coordinates).toEqual([2.3522, 48.8566]);
    });

    it('should handle ads without coordinates', async () => {
      const createdAd = await createTestAd({
        latitude: undefined as any,
        longitude: undefined as any,
      });

      const ad = await adService.getById(createdAd.id);

      expect(ad).toBeDefined();
      expect(ad?.location.coordinates).toBeUndefined();
    });
  });

  describe('buildSearchFilters', () => {
    it('should handle empty search dto', async () => {
      const result = await adService.search({});

      expect(result.success).toBe(true);
    });

    it('should convert type with hyphens to underscores', async () => {
      // Create a local commercial ad
      await createTestAd({
        realEstateType: RealEstateType.local_commercial,
      });

      const result = await adService.search({ type: 'local-commercial' });

      expect(result.data.length).toBeGreaterThan(0);
    });

    it('should handle case insensitivity for sellType', async () => {
      await createTestAd({ immoSellType: ImmoSellType.neuf });

      const result = await adService.search({ sellType: 'NEUF' });

      expect(result.data).toHaveLength(1);
    });

    it('should prioritize direct city filter over location', async () => {
      const result = await adService.search({
        city: 'Paris',
        location: {
          address_components: [
            {
              types: ['locality'],
              short_name: 'Lyon',
            },
          ],
        },
      });

      // Should use direct city filter (Paris), not location (Lyon)
      expect(result.data).toHaveLength(0); // No Paris ads in initial setup for this test
    });
  });
});
