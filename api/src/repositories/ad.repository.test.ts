import { adRepository, AdRepositoryPrisma } from './ad.repository';
import { RealEstateType, ImmoSellType, Provider } from '@prisma/client';
import { createTestAd, cleanDatabase } from '../__tests__/helpers/testDb';

describe('AdRepository', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('create', () => {
    it('should create a new ad', async () => {
      const adData = {
        title: 'Beautiful Apartment',
        description: 'A nice apartment in Paris',
        url: 'https://example.com/ad1',
        realEstateType: RealEstateType.appartement,
        price: 300000,
        surface: 80,
        rooms: 3,
        city: 'Paris',
        zipcode: '75001',
        departmentId: '75',
        departmentName: 'Paris',
        regionName: 'Île-de-France',
        latitude: 48.8566,
        longitude: 2.3522,
        provider: Provider.leboncoin,
        releaseDate: new Date(),
        immoSellType: ImmoSellType.ancien,
      };

      const ad = await adRepository.create(adData);

      expect(ad).toBeDefined();
      expect(ad.id).toBeDefined();
      expect(ad.title).toBe('Beautiful Apartment');
      expect(ad.price).toBe(300000);
      expect(ad.realEstateType).toBe(RealEstateType.appartement);
    });

    it('should throw error when creating duplicate URL', async () => {
      const adData = {
        title: 'Test Ad',
        description: 'Description',
        url: 'https://example.com/ad1',
        realEstateType: RealEstateType.appartement,
        price: 200000,
        surface: 75,
        city: 'Paris',
        zipcode: '75001',
        departmentId: '75',
        departmentName: 'Paris',
        regionName: 'Île-de-France',
        provider: Provider.leboncoin,
        releaseDate: new Date(),
        immoSellType: ImmoSellType.ancien,
      };

      await adRepository.create(adData);
      await expect(adRepository.create(adData)).rejects.toThrow();
    });
  });

  describe('createMany', () => {
    it('should create multiple ads', async () => {
      const adsData = [
        {
          title: 'Ad 1',
          description: 'Description 1',
          url: 'https://example.com/ad1',
          realEstateType: RealEstateType.appartement,
          price: 200000,
          surface: 75,
          city: 'Paris',
          zipcode: '75001',
          departmentId: '75',
          departmentName: 'Paris',
          regionName: 'Île-de-France',
          provider: Provider.leboncoin,
          releaseDate: new Date(),
          immoSellType: ImmoSellType.ancien,
        },
        {
          title: 'Ad 2',
          description: 'Description 2',
          url: 'https://example.com/ad2',
          realEstateType: RealEstateType.maison,
          price: 400000,
          surface: 150,
          city: 'Lyon',
          zipcode: '69001',
          departmentId: '69',
          departmentName: 'Rhône',
          regionName: 'Auvergne-Rhône-Alpes',
          provider: Provider.seloger,
          releaseDate: new Date(),
          immoSellType: ImmoSellType.neuf,
        },
      ];

      const count = await adRepository.createMany(adsData);

      expect(count).toBe(2);

      // Verify ads were created
      const allAds = await adRepository.findWithFilters({});
      expect(allAds).toHaveLength(2);
    });

    it('should skip duplicates when creating multiple ads', async () => {
      const adData = {
        title: 'Test Ad',
        description: 'Description',
        url: 'https://example.com/ad1',
        realEstateType: RealEstateType.appartement,
        price: 200000,
        surface: 75,
        city: 'Paris',
        zipcode: '75001',
        departmentId: '75',
        departmentName: 'Paris',
        regionName: 'Île-de-France',
        provider: Provider.leboncoin,
        releaseDate: new Date(),
        immoSellType: ImmoSellType.ancien,
      };

      // Create first ad
      await adRepository.create(adData);

      // Try to create multiple including duplicate
      const count = await adRepository.createMany([
        adData,
        { ...adData, url: 'https://example.com/ad2' },
      ]);

      expect(count).toBe(1); // Only non-duplicate should be created
    });
  });

  describe('findById', () => {
    it('should find ad by ID', async () => {
      const createdAd = await createTestAd({ title: 'Test Ad' });

      const ad = await adRepository.findById(createdAd.id);

      expect(ad).toBeDefined();
      expect(ad?.id).toBe(createdAd.id);
      expect(ad?.title).toBe('Test Ad');
    });

    it('should return null for non-existent ad', async () => {
      const ad = await adRepository.findById('non-existent-id');

      expect(ad).toBeNull();
    });
  });

  describe('findWithFilters', () => {
    beforeEach(async () => {
      // Create test ads with different properties
      await createTestAd({
        title: 'Paris Apartment',
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
        title: 'Lyon House',
        url: 'https://example.com/ad-lyon',
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
        title: 'Marseille Terrain',
        url: 'https://example.com/ad-marseille',
        realEstateType: RealEstateType.terrain,
        price: 100000,
        surface: 500,
        city: 'Marseille',
        zipcode: '13001',
        immoSellType: ImmoSellType.ancien,
        provider: Provider.pap,
      });
    });

    it('should find all ads without filters', async () => {
      const ads = await adRepository.findWithFilters({});

      expect(ads).toHaveLength(3);
    });

    it('should filter by realEstateType', async () => {
      const ads = await adRepository.findWithFilters({
        realEstateType: RealEstateType.appartement,
      });

      expect(ads).toHaveLength(1);
      expect(ads[0].realEstateType).toBe(RealEstateType.appartement);
    });

    it('should filter by immoSellType', async () => {
      const ads = await adRepository.findWithFilters({
        immoSellType: ImmoSellType.neuf,
      });

      expect(ads).toHaveLength(1);
      expect(ads[0].immoSellType).toBe(ImmoSellType.neuf);
    });

    it('should filter by provider', async () => {
      const ads = await adRepository.findWithFilters({
        provider: Provider.leboncoin,
      });

      expect(ads).toHaveLength(1);
      expect(ads[0].provider).toBe(Provider.leboncoin);
    });

    it('should filter by city (case-insensitive)', async () => {
      const ads = await adRepository.findWithFilters({
        city: 'paris',
      });

      expect(ads).toHaveLength(1);
      expect(ads[0].city).toBe('Paris');
    });

    it('should filter by zipcode', async () => {
      const ads = await adRepository.findWithFilters({
        zipcode: '75001',
      });

      expect(ads).toHaveLength(1);
      expect(ads[0].zipcode).toBe('75001');
    });

    it('should filter by minimum price', async () => {
      const ads = await adRepository.findWithFilters({
        priceMin: 400000,
      });

      expect(ads).toHaveLength(1);
      expect(ads[0].price).toBeGreaterThanOrEqual(400000);
    });

    it('should filter by maximum price', async () => {
      const ads = await adRepository.findWithFilters({
        priceMax: 200000,
      });

      expect(ads).toHaveLength(1);
      expect(ads[0].price).toBeLessThanOrEqual(200000);
    });

    it('should filter by price range', async () => {
      const ads = await adRepository.findWithFilters({
        priceMin: 200000,
        priceMax: 400000,
      });

      expect(ads).toHaveLength(1);
      expect(ads[0].price).toBeGreaterThanOrEqual(200000);
      expect(ads[0].price).toBeLessThanOrEqual(400000);
    });

    it('should filter by minimum surface', async () => {
      const ads = await adRepository.findWithFilters({
        surfaceMin: 100,
      });

      expect(ads).toHaveLength(2);
      ads.forEach((ad) => {
        expect(ad.surface).toBeGreaterThanOrEqual(100);
      });
    });

    it('should filter by maximum surface', async () => {
      const ads = await adRepository.findWithFilters({
        surfaceMax: 100,
      });

      expect(ads).toHaveLength(1);
      expect(ads[0].surface).toBeLessThanOrEqual(100);
    });

    it('should filter by surface range', async () => {
      const ads = await adRepository.findWithFilters({
        surfaceMin: 70,
        surfaceMax: 160,
      });

      expect(ads).toHaveLength(2);
    });

    it('should filter by minimum rooms', async () => {
      const ads = await adRepository.findWithFilters({
        rooms: 4,
      });

      expect(ads).toHaveLength(1);
      expect(ads[0].rooms).toBeGreaterThanOrEqual(4);
    });

    it('should filter by text search in title', async () => {
      const ads = await adRepository.findWithFilters({
        search: 'Paris',
      });

      expect(ads).toHaveLength(1);
      expect(ads[0].title).toContain('Paris');
    });

    it('should filter by text search (case-insensitive)', async () => {
      const ads = await adRepository.findWithFilters({
        search: 'house',
      });

      expect(ads).toHaveLength(1);
      expect(ads[0].title.toLowerCase()).toContain('house');
    });

    it('should combine multiple filters', async () => {
      const ads = await adRepository.findWithFilters({
        realEstateType: RealEstateType.appartement,
        priceMin: 100000,
        priceMax: 350000,
        surfaceMin: 70,
      });

      expect(ads).toHaveLength(1);
      expect(ads[0].realEstateType).toBe(RealEstateType.appartement);
      expect(ads[0].price).toBeLessThanOrEqual(350000);
      expect(ads[0].surface).toBeGreaterThanOrEqual(70);
    });

    it('should paginate results', async () => {
      const page0 = await adRepository.findWithFilters({}, 0, 2);
      const page1 = await adRepository.findWithFilters({}, 1, 2);

      expect(page0).toHaveLength(2);
      expect(page1).toHaveLength(1);
      expect(page0[0].id).not.toBe(page1[0].id);
    });

    it('should return empty array when no ads match filters', async () => {
      const ads = await adRepository.findWithFilters({
        realEstateType: RealEstateType.parking,
      });

      expect(ads).toHaveLength(0);
    });
  });

  describe('count', () => {
    beforeEach(async () => {
      await createTestAd({ realEstateType: RealEstateType.appartement });
      await createTestAd({
        url: 'https://example.com/ad2',
        realEstateType: RealEstateType.maison,
      });
      await createTestAd({
        url: 'https://example.com/ad3',
        realEstateType: RealEstateType.appartement,
      });
    });

    it('should count all ads without filters', async () => {
      const count = await adRepository.count({});

      expect(count).toBe(3);
    });

    it('should count ads with filters', async () => {
      const count = await adRepository.count({
        realEstateType: RealEstateType.appartement,
      });

      expect(count).toBe(2);
    });

    it('should return 0 when no ads match', async () => {
      const count = await adRepository.count({
        realEstateType: RealEstateType.parking,
      });

      expect(count).toBe(0);
    });
  });

  describe('update', () => {
    it('should update an ad', async () => {
      const createdAd = await createTestAd({ title: 'Original Title', price: 200000 });

      const updatedAd = await adRepository.update(createdAd.id, {
        title: 'Updated Title',
        price: 250000,
      });

      expect(updatedAd).toBeDefined();
      expect(updatedAd?.title).toBe('Updated Title');
      expect(updatedAd?.price).toBe(250000);
    });

    it('should return null for non-existent ad', async () => {
      const updatedAd = await adRepository.update('non-existent-id', {
        title: 'Updated',
      });

      expect(updatedAd).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete an ad', async () => {
      const createdAd = await createTestAd();

      const result = await adRepository.delete(createdAd.id);

      expect(result).toBe(true);

      // Verify ad was deleted
      const ad = await adRepository.findById(createdAd.id);
      expect(ad).toBeNull();
    });

    it('should return false for non-existent ad', async () => {
      const result = await adRepository.delete('non-existent-id');

      expect(result).toBe(false);
    });
  });

  describe('deleteMany', () => {
    beforeEach(async () => {
      await createTestAd({ realEstateType: RealEstateType.appartement });
      await createTestAd({
        url: 'https://example.com/ad2',
        realEstateType: RealEstateType.appartement,
      });
      await createTestAd({
        url: 'https://example.com/ad3',
        realEstateType: RealEstateType.maison,
      });
    });

    it('should delete ads matching filters', async () => {
      const count = await adRepository.deleteMany({
        realEstateType: RealEstateType.appartement,
      });

      expect(count).toBe(2);

      // Verify only maison remains
      const remainingAds = await adRepository.findWithFilters({});
      expect(remainingAds).toHaveLength(1);
      expect(remainingAds[0].realEstateType).toBe(RealEstateType.maison);
    });

    it('should return 0 when no ads match', async () => {
      const count = await adRepository.deleteMany({
        realEstateType: RealEstateType.parking,
      });

      expect(count).toBe(0);
    });
  });

  describe('findMostRecent', () => {
    it('should find most recent ad for provider', async () => {
      const oldDate = new Date('2024-01-01');
      const newDate = new Date('2024-12-01');

      await createTestAd({
        provider: Provider.leboncoin,
        releaseDate: oldDate,
      });

      const mostRecent = await createTestAd({
        url: 'https://example.com/ad2',
        provider: Provider.leboncoin,
        releaseDate: newDate,
      });

      const found = await adRepository.findMostRecent(Provider.leboncoin);

      expect(found).toBeDefined();
      expect(found?.id).toBe(mostRecent.id);
    });

    it('should return null when no ads for provider', async () => {
      const found = await adRepository.findMostRecent(Provider.bienici);

      expect(found).toBeNull();
    });
  });

  describe('search', () => {
    beforeEach(async () => {
      await createTestAd({
        title: 'Beautiful apartment in Paris',
        description: 'Modern apartment with view',
        city: 'Paris',
      });

      await createTestAd({
        url: 'https://example.com/ad2',
        title: 'House in Lyon',
        description: 'Large house with garden',
        city: 'Lyon',
      });
    });

    it('should search in title', async () => {
      const ads = await adRepository.search('Paris');

      expect(ads).toHaveLength(1);
      expect(ads[0].title).toContain('Paris');
    });

    it('should search in description', async () => {
      const ads = await adRepository.search('garden');

      expect(ads).toHaveLength(1);
      expect(ads[0].description).toContain('garden');
    });

    it('should search in city', async () => {
      const ads = await adRepository.search('Lyon');

      expect(ads).toHaveLength(1);
      expect(ads[0].city).toBe('Lyon');
    });

    it('should be case-insensitive', async () => {
      const ads = await adRepository.search('PARIS');

      expect(ads).toHaveLength(1);
    });

    it('should paginate search results', async () => {
      const page0 = await adRepository.search('', 0, 1);
      const page1 = await adRepository.search('', 1, 1);

      expect(page0).toHaveLength(1);
      expect(page1).toHaveLength(1);
      expect(page0[0].id).not.toBe(page1[0].id);
    });
  });

  describe('findNearby', () => {
    beforeEach(async () => {
      await createTestAd({
        latitude: 48.8566,
        longitude: 2.3522,
        city: 'Paris',
      });

      await createTestAd({
        url: 'https://example.com/ad2',
        latitude: 45.764,
        longitude: 4.8357,
        city: 'Lyon',
      });
    });

    it('should find ads with coordinates', async () => {
      const ads = await adRepository.findNearby(48.8566, 2.3522, 10);

      expect(ads.length).toBeGreaterThan(0);
      ads.forEach((ad) => {
        expect(ad.latitude).not.toBeNull();
        expect(ad.longitude).not.toBeNull();
      });
    });

    it('should respect limit parameter', async () => {
      const ads = await adRepository.findNearby(48.8566, 2.3522, 100, {}, 1);

      expect(ads).toHaveLength(1);
    });

    it('should apply additional filters', async () => {
      const ads = await adRepository.findNearby(48.8566, 2.3522, 100, {
        city: 'Paris',
      });

      expect(ads).toHaveLength(1);
      expect(ads[0].city).toBe('Paris');
    });
  });
});
