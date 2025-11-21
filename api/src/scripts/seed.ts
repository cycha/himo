import { PrismaClient, RealEstateType, ImmoSellType, Provider } from '@prisma/client';

const prisma = new PrismaClient();

const mockAds = [
  {
    title: 'Grand T2 avec parking',
    description:
      'Bel appartement T2 de 45m² avec parking, proche commerces et transports. Cuisine équipée, salle de bain rénovée.',
    thumbUrls: ['https://picsum.photos/400/300?random=1'],
    url: 'https://example.com/ad/1',
    realEstateType: RealEstateType.appartement,
    rooms: 2,
    surface: 45,
    immoSellType: ImmoSellType.ancien,
    price: 180000,
    provider: Provider.leboncoin,
    releaseDate: new Date('2024-11-28'),
    city: 'Paris',
    zipcode: '75015',
    latitude: 48.8566,
    longitude: 2.3522,
  },
  {
    title: 'Maison familiale avec jardin',
    description:
      'Belle maison de 120m² avec jardin de 300m². 4 chambres, 2 salles de bain, garage double. Calme et résidentiel.',
    thumbUrls: ['https://picsum.photos/400/300?random=2'],
    url: 'https://example.com/ad/2',
    realEstateType: RealEstateType.maison,
    rooms: 5,
    surface: 120,
    immoSellType: ImmoSellType.ancien,
    price: 450000,
    provider: Provider.seloger,
    releaseDate: new Date('2024-11-27'),
    city: 'Lyon',
    zipcode: '69003',
    latitude: 45.764,
    longitude: 4.8357,
  },
  {
    title: 'Studio centre-ville',
    description:
      'Studio cosy de 25m² en plein centre-ville. Idéal étudiant ou premier achat. Charges faibles.',
    thumbUrls: ['https://picsum.photos/400/300?random=3'],
    url: 'https://example.com/ad/3',
    realEstateType: RealEstateType.appartement,
    rooms: 1,
    surface: 25,
    immoSellType: ImmoSellType.ancien,
    price: 95000,
    provider: Provider.pap,
    releaseDate: new Date('2024-11-26'),
    city: 'Toulouse',
    zipcode: '31000',
    latitude: 43.6047,
    longitude: 1.4442,
  },
  {
    title: 'Appartement neuf T3',
    description:
      'Programme neuf, T3 de 65m² avec balcon. Livraison 2025. Normes RT2020, parking inclus.',
    thumbUrls: ['https://picsum.photos/400/300?random=4'],
    url: 'https://example.com/ad/4',
    realEstateType: RealEstateType.appartement,
    rooms: 3,
    surface: 65,
    immoSellType: ImmoSellType.neuf,
    price: 280000,
    provider: Provider.bienici,
    releaseDate: new Date('2024-11-25'),
    city: 'Bordeaux',
    zipcode: '33000',
    latitude: 44.8378,
    longitude: -0.5792,
  },
  {
    title: 'Villa avec piscine',
    description:
      'Magnifique villa de 200m² avec piscine chauffée. Exposition sud, 5 chambres, dressing, bureau.',
    thumbUrls: ['https://picsum.photos/400/300?random=5'],
    url: 'https://example.com/ad/5',
    realEstateType: RealEstateType.maison,
    rooms: 6,
    surface: 200,
    immoSellType: ImmoSellType.ancien,
    price: 650000,
    provider: Provider.leboncoin,
    releaseDate: new Date('2024-11-24'),
    city: 'Nice',
    zipcode: '06000',
    latitude: 43.7102,
    longitude: 7.262,
  },
  {
    title: 'T4 avec terrasse',
    description:
      'Spacieux T4 de 85m² avec grande terrasse de 30m². Vue dégagée, calme absolu, cave et parking.',
    thumbUrls: ['https://picsum.photos/400/300?random=6'],
    url: 'https://example.com/ad/6',
    realEstateType: RealEstateType.appartement,
    rooms: 4,
    surface: 85,
    immoSellType: ImmoSellType.ancien,
    price: 320000,
    provider: Provider.seloger,
    releaseDate: new Date('2024-11-23'),
    city: 'Marseille',
    zipcode: '13008',
    latitude: 43.2965,
    longitude: 5.3698,
  },
  {
    title: 'Charmante maison de village',
    description:
      'Maison de caractère de 90m² entièrement rénovée. Poutres apparentes, cheminée, petite cour.',
    thumbUrls: ['https://picsum.photos/400/300?random=7'],
    url: 'https://example.com/ad/7',
    realEstateType: RealEstateType.maison,
    rooms: 4,
    surface: 90,
    immoSellType: ImmoSellType.ancien,
    price: 250000,
    provider: Provider.pap,
    releaseDate: new Date('2024-11-22'),
    city: 'Nantes',
    zipcode: '44000',
    latitude: 47.2184,
    longitude: -1.5536,
  },
  {
    title: 'Appartement T2 rénové',
    description:
      'T2 de 50m² entièrement rénové avec goût. Cuisine ouverte, salle de bain moderne, parquet.',
    thumbUrls: ['https://picsum.photos/400/300?random=8'],
    url: 'https://example.com/ad/8',
    realEstateType: RealEstateType.appartement,
    rooms: 2,
    surface: 50,
    immoSellType: ImmoSellType.ancien,
    price: 195000,
    provider: Provider.bienici,
    releaseDate: new Date('2024-11-21'),
    city: 'Strasbourg',
    zipcode: '67000',
    latitude: 48.5734,
    longitude: 7.7521,
  },
  {
    title: 'Duplex avec vue',
    description:
      'Superbe duplex de 110m² avec vue panoramique. 3 chambres, 2 SDB, terrasse de 40m².',
    thumbUrls: ['https://picsum.photos/400/300?random=9'],
    url: 'https://example.com/ad/9',
    realEstateType: RealEstateType.appartement,
    rooms: 4,
    surface: 110,
    immoSellType: ImmoSellType.ancien,
    price: 420000,
    provider: Provider.leboncoin,
    releaseDate: new Date('2024-11-20'),
    city: 'Lille',
    zipcode: '59000',
    latitude: 50.6292,
    longitude: 3.0573,
  },
  {
    title: 'Pavillon contemporain',
    description:
      'Pavillon moderne de 140m² de 2019. Plain-pied, 4 chambres, garage, jardin paysager de 500m².',
    thumbUrls: ['https://picsum.photos/400/300?random=10'],
    url: 'https://example.com/ad/10',
    realEstateType: RealEstateType.maison,
    rooms: 5,
    surface: 140,
    immoSellType: ImmoSellType.neuf,
    price: 380000,
    provider: Provider.seloger,
    releaseDate: new Date('2024-11-19'),
    city: 'Rennes',
    zipcode: '35000',
    latitude: 48.1173,
    longitude: -1.6778,
  },
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing ads
    const deleteResult = await prisma.ad.deleteMany({});
    console.log(`🗑️  Deleted ${deleteResult.count} existing ads`);

    // Insert mock ads
    const insertedCount = await prisma.ad.createMany({
      data: mockAds,
      skipDuplicates: true,
    });
    console.log(`✅ Inserted ${insertedCount.count} mock ads`);

    // Show summary
    const apartments = await prisma.ad.count({
      where: { realEstateType: RealEstateType.appartement },
    });
    const houses = await prisma.ad.count({ where: { realEstateType: RealEstateType.maison } });
    const minPrice = await prisma.ad.aggregate({ _min: { price: true } });
    const maxPrice = await prisma.ad.aggregate({ _max: { price: true } });
    const minSurface = await prisma.ad.aggregate({ _min: { surface: true } });
    const maxSurface = await prisma.ad.aggregate({ _max: { surface: true } });

    console.log('\n📊 Summary:');
    console.log(`   - Apartments: ${apartments}`);
    console.log(`   - Houses: ${houses}`);
    console.log(`   - Price range: €${minPrice._min.price} - €${maxPrice._max.price}`);
    console.log(`   - Surface range: ${minSurface._min.surface}m² - ${maxSurface._max.surface}m²`);

    console.log('\n✨ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
