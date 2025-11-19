import request from 'supertest';
import { createTestApp } from '../__tests__/helpers/testApp';
import { createTestAd, cleanDatabase } from '../__tests__/helpers/testDb';
import { RealEstateType, ImmoSellType, Provider } from '@prisma/client';

describe('Ad Routes Integration Tests', () => {
  const app = createTestApp();

  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('POST /api/ads/search', () => {
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
      const response = await request(app)
        .post('/api/ads/search')
        .send({})
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
      expect(response.body.page).toBe(0);
      expect(response.body.count).toBe(3);
      expect(response.body.totalPages).toBe(1);
    });

    it('should filter by title (text search)', async () => {
      const response = await request(app)
        .post('/api/ads/search')
        .send({ title: 'Paris' })
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].title).toContain('Paris');
    });

    it('should filter by real estate type', async () => {
      const response = await request(app)
        .post('/api/ads/search')
        .send({ type: 'appartement' })
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].real_estate_type).toBe(RealEstateType.appartement);
    });

    it('should filter by sell type', async () => {
      const response = await request(app)
        .post('/api/ads/search')
        .send({ sellType: 'neuf' })
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].immo_sell_type).toBe(ImmoSellType.neuf);
    });

    it('should filter by city', async () => {
      const response = await request(app)
        .post('/api/ads/search')
        .send({ city: 'Paris' })
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].location.city).toBe('Paris');
    });

    it('should filter by zipcode', async () => {
      const response = await request(app)
        .post('/api/ads/search')
        .send({ zipcode: '75001' })
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].location.zipcode).toBe('75001');
    });

    it('should filter by minimum price', async () => {
      const response = await request(app)
        .post('/api/ads/search')
        .send({ priceMin: 400000 })
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].price).toBeGreaterThanOrEqual(400000);
    });

    it('should filter by maximum price', async () => {
      const response = await request(app)
        .post('/api/ads/search')
        .send({ priceMax: 200000 })
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].price).toBeLessThanOrEqual(200000);
    });

    it('should filter by price range', async () => {
      const response = await request(app)
        .post('/api/ads/search')
        .send({ priceMin: 200000, priceMax: 400000 })
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].price).toBeGreaterThanOrEqual(200000);
      expect(response.body.data[0].price).toBeLessThanOrEqual(400000);
    });

    it('should filter by minimum surface', async () => {
      const response = await request(app)
        .post('/api/ads/search')
        .send({ surfaceMin: 100 })
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      response.body.data.forEach((ad: any) => {
        expect(ad.surface).toBeGreaterThanOrEqual(100);
      });
    });

    it('should filter by maximum surface', async () => {
      const response = await request(app)
        .post('/api/ads/search')
        .send({ surfaceMax: 100 })
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].surface).toBeLessThanOrEqual(100);
    });

    it('should combine multiple filters', async () => {
      const response = await request(app)
        .post('/api/ads/search')
        .send({
          type: 'appartement',
          priceMin: 100000,
          priceMax: 350000,
          surfaceMin: 70,
        })
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].real_estate_type).toBe(RealEstateType.appartement);
    });

    it('should return empty array when no ads match', async () => {
      const response = await request(app)
        .post('/api/ads/search')
        .send({ type: 'parking' })
        .expect(200);

      expect(response.body.data).toHaveLength(0);
      expect(response.body.count).toBe(0);
    });

    it('should return 400 for invalid priceMin', async () => {
      const response = await request(app)
        .post('/api/ads/search')
        .send({ priceMin: -100 })
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });

    it('should return 400 for invalid surfaceMin', async () => {
      const response = await request(app)
        .post('/api/ads/search')
        .send({ surfaceMin: 'invalid' })
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });

    it('should return 400 for invalid page number', async () => {
      const response = await request(app)
        .post('/api/ads/search')
        .send({ page: -1 })
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });

    it('should include all required fields in response', async () => {
      const response = await request(app)
        .post('/api/ads/search')
        .send({ city: 'Paris' })
        .expect(200);

      const ad = response.body.data[0];
      expect(ad._id).toBeDefined();
      expect(ad.title).toBeDefined();
      expect(ad.description).toBeDefined();
      expect(ad.url).toBeDefined();
      expect(ad.price).toBeDefined();
      expect(ad.provider).toBeDefined();
      expect(ad.location).toBeDefined();
      expect(ad.location.zipcode).toBeDefined();
      expect(ad.release_date).toBeDefined();
    });

    it('should include coordinates when available', async () => {
      const response = await request(app)
        .post('/api/ads/search')
        .send({ city: 'Paris' })
        .expect(200);

      const ad = response.body.data[0];
      expect(ad.location.coordinates).toBeDefined();
      expect(ad.location.coordinates).toHaveLength(2);
      expect(typeof ad.location.coordinates[0]).toBe('number'); // longitude
      expect(typeof ad.location.coordinates[1]).toBe('number'); // latitude
    });

    it('should filter by location with address_components', async () => {
      const response = await request(app)
        .post('/api/ads/search')
        .send({
          location: {
            address_components: [
              {
                types: ['locality'],
                short_name: 'Lyon',
              },
            ],
          },
        })
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].location.city).toBe('Lyon');
    });

    it('should handle pagination', async () => {
      // Create 40 more ads to test pagination
      const promises = [];
      for (let i = 4; i <= 40; i++) {
        promises.push(
          createTestAd({
            url: `https://example.com/ad${i}`,
            title: `Ad ${i}`,
          })
        );
      }
      await Promise.all(promises);

      const page0 = await request(app)
        .post('/api/ads/search')
        .send({ page: 0 })
        .expect(200);

      const page1 = await request(app)
        .post('/api/ads/search')
        .send({ page: 1 })
        .expect(200);

      expect(page0.body.page).toBe(0);
      expect(page0.body.data).toHaveLength(35); // Default page size
      expect(page1.body.page).toBe(1);
      expect(page1.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/ads/:id', () => {
    let adId: string;

    beforeEach(async () => {
      const ad = await createTestAd({
        title: 'Test Ad',
        description: 'Test Description',
        price: 200000,
      });
      adId = ad.id;
    });

    it('should return ad by ID', async () => {
      const response = await request(app)
        .get(`/api/ads/${adId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(adId);
      expect(response.body.data.title).toBe('Test Ad');
      expect(response.body.data.price).toBe(200000);
    });

    it('should return 404 for non-existent ID', async () => {
      const response = await request(app)
        .get('/api/ads/non-existent-id')
        .expect(404);

      expect(response.body.error).toBe('Ad not found');
    });

    it('should include all required fields', async () => {
      const response = await request(app)
        .get(`/api/ads/${adId}`)
        .expect(200);

      const ad = response.body.data;
      expect(ad._id).toBeDefined();
      expect(ad.title).toBeDefined();
      expect(ad.description).toBeDefined();
      expect(ad.url).toBeDefined();
      expect(ad.price).toBeDefined();
      expect(ad.provider).toBeDefined();
      expect(ad.location).toBeDefined();
      expect(ad.location.zipcode).toBeDefined();
      expect(ad.release_date).toBeDefined();
    });

    it('should include optional fields when available', async () => {
      const adWithOptionals = await createTestAd({
        url: 'https://example.com/ad-with-optionals',
        title: 'Full Ad',
        realEstateType: RealEstateType.appartement,
        rooms: 3,
        surface: 80,
        immoSellType: ImmoSellType.ancien,
      });

      const response = await request(app)
        .get(`/api/ads/${adWithOptionals.id}`)
        .expect(200);

      const ad = response.body.data;
      expect(ad.real_estate_type).toBe(RealEstateType.appartement);
      expect(ad.rooms).toBe(3);
      expect(ad.surface).toBe(80);
      expect(ad.immo_sell_type).toBe(ImmoSellType.ancien);
    });
  });

  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.status).toBe('ok');
    });
  });
});
