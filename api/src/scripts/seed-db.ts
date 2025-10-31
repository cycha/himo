import { connect, close, Ad } from '@himo/commons';

const mockAds = [
  {
    title: 'Bel appartement T3 lumineux',
    description: 'Magnifique appartement de 75m² en plein centre-ville, proche de toutes commodités. Cuisine équipée, balcon, parking.',
    thumb_urls: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400'],
    url: 'https://www.leboncoin.fr/ad/12345',
    real_estate_type: 'appartement',
    rooms: 3,
    surface: 75,
    immo_sell_type: 'ancien',
    price: 245000,
    provider: 'leboncoin',
    location: {
      region_name: 'Grand Est',
      department_id: '67',
      department_name: 'Bas-Rhin',
      city: 'Strasbourg',
      zipcode: '67000',
      coordinates: [7.7521, 48.5734],
    },
    release_date: new Date('2024-10-25'),
  },
  {
    title: 'Maison familiale avec jardin',
    description: 'Belle maison de 120m² avec grand jardin de 500m². 4 chambres, garage, cave. Quartier calme et résidentiel.',
    thumb_urls: ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400'],
    url: 'https://www.leboncoin.fr/ad/12346',
    real_estate_type: 'maison',
    rooms: 5,
    surface: 120,
    immo_sell_type: 'ancien',
    price: 385000,
    provider: 'leboncoin',
    location: {
      region_name: 'Grand Est',
      department_id: '67',
      department_name: 'Bas-Rhin',
      city: 'Schiltigheim',
      zipcode: '67300',
      coordinates: [7.7337, 48.6055],
    },
    release_date: new Date('2024-10-28'),
  },
  {
    title: 'Studio moderne proche université',
    description: 'Studio de 25m² idéal étudiant. Meublé, cuisine équipée, salle de bain. Transport en commun à proximité.',
    thumb_urls: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400'],
    url: 'https://www.leboncoin.fr/ad/12347',
    real_estate_type: 'appartement',
    rooms: 1,
    surface: 25,
    immo_sell_type: 'ancien',
    price: 95000,
    provider: 'leboncoin',
    location: {
      region_name: 'Grand Est',
      department_id: '67',
      department_name: 'Bas-Rhin',
      city: 'Strasbourg',
      zipcode: '67000',
      coordinates: [7.7521, 48.5734],
    },
    release_date: new Date('2024-10-30'),
  },
  {
    title: 'Appartement T4 avec terrasse',
    description: 'Spacieux T4 de 95m² avec grande terrasse de 30m². 3 chambres, parking sécurisé, ascenseur. Vue dégagée.',
    thumb_urls: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400'],
    url: 'https://www.leboncoin.fr/ad/12348',
    real_estate_type: 'appartement',
    rooms: 4,
    surface: 95,
    immo_sell_type: 'neuf',
    price: 320000,
    provider: 'leboncoin',
    location: {
      region_name: 'Grand Est',
      department_id: '67',
      department_name: 'Bas-Rhin',
      city: 'Illkirch-Graffenstaden',
      zipcode: '67400',
      coordinates: [7.7183, 48.5297],
    },
    release_date: new Date('2024-10-29'),
  },
  {
    title: 'Maison neuve avec piscine',
    description: 'Magnifique maison contemporaine de 150m² avec piscine chauffée. 4 chambres, bureau, garage double. Construction 2023.',
    thumb_urls: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400'],
    url: 'https://www.leboncoin.fr/ad/12349',
    real_estate_type: 'maison',
    rooms: 5,
    surface: 150,
    immo_sell_type: 'neuf',
    price: 495000,
    provider: 'leboncoin',
    location: {
      region_name: 'Grand Est',
      department_id: '67',
      department_name: 'Bas-Rhin',
      city: 'Oberhausbergen',
      zipcode: '67205',
      coordinates: [7.6846, 48.6073],
    },
    release_date: new Date('2024-10-27'),
  },
  {
    title: 'Duplex centre historique',
    description: 'Superbe duplex de 85m² dans immeuble ancien rénové. Poutres apparentes, cheminée, 2 chambres. Charme authentique.',
    thumb_urls: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400'],
    url: 'https://www.leboncoin.fr/ad/12350',
    real_estate_type: 'appartement',
    rooms: 3,
    surface: 85,
    immo_sell_type: 'ancien',
    price: 275000,
    provider: 'leboncoin',
    location: {
      region_name: 'Grand Est',
      department_id: '67',
      department_name: 'Bas-Rhin',
      city: 'Strasbourg',
      zipcode: '67000',
      coordinates: [7.7521, 48.5734],
    },
    release_date: new Date('2024-10-26'),
  },
  {
    title: 'Grand T2 avec parking',
    description: 'Appartement T2 de 55m² en excellent état. Cuisine aménagée, balcon, cave et parking privatif. Résidence récente.',
    thumb_urls: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400'],
    url: 'https://www.leboncoin.fr/ad/12351',
    real_estate_type: 'appartement',
    rooms: 2,
    surface: 55,
    immo_sell_type: 'ancien',
    price: 175000,
    provider: 'leboncoin',
    location: {
      region_name: 'Grand Est',
      department_id: '67',
      department_name: 'Bas-Rhin',
      city: 'Hoenheim',
      zipcode: '67800',
      coordinates: [7.7580, 48.6244],
    },
    release_date: new Date('2024-10-31'),
  },
  {
    title: 'Villa d\'architecte avec vue',
    description: 'Exceptionnelle villa de 200m² sur terrain de 1000m². Architecture contemporaine, vue panoramique, prestations haut de gamme.',
    thumb_urls: ['https://images.unsplash.com/photo-1613977257363-707ba9348227?w=400'],
    url: 'https://www.leboncoin.fr/ad/12352',
    real_estate_type: 'maison',
    rooms: 6,
    surface: 200,
    immo_sell_type: 'neuf',
    price: 650000,
    provider: 'leboncoin',
    location: {
      region_name: 'Grand Est',
      department_id: '67',
      department_name: 'Bas-Rhin',
      city: 'Ostwald',
      zipcode: '67540',
      coordinates: [7.7087, 48.5432],
    },
    release_date: new Date('2024-10-24'),
  },
  {
    title: 'Loft industriel rénové',
    description: 'Loft de 110m² dans ancienne usine. Volumes exceptionnels, hauteur sous plafond 4m, verrière. Design industriel.',
    thumb_urls: ['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400'],
    url: 'https://www.leboncoin.fr/ad/12353',
    real_estate_type: 'appartement',
    rooms: 3,
    surface: 110,
    immo_sell_type: 'ancien',
    price: 410000,
    provider: 'leboncoin',
    location: {
      region_name: 'Grand Est',
      department_id: '67',
      department_name: 'Bas-Rhin',
      city: 'Strasbourg',
      zipcode: '67100',
      coordinates: [7.7521, 48.5734],
    },
    release_date: new Date('2024-10-23'),
  },
  {
    title: 'Appartement T1 investissement',
    description: 'Studio de 30m² loué. Rentabilité 5%. Bail en cours, bon état général. Idéal investisseur.',
    thumb_urls: ['https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=400'],
    url: 'https://www.leboncoin.fr/ad/12354',
    real_estate_type: 'appartement',
    rooms: 1,
    surface: 30,
    immo_sell_type: 'ancien',
    price: 110000,
    provider: 'leboncoin',
    location: {
      region_name: 'Grand Est',
      department_id: '67',
      department_name: 'Bas-Rhin',
      city: 'Strasbourg',
      zipcode: '67000',
      coordinates: [7.7521, 48.5734],
    },
    release_date: new Date('2024-10-22'),
  },
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to database
    await connect();
    
    // Clear existing ads
    const deleteResult = await Ad.deleteMany({});
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} existing ads`);
    
    // Insert mock ads
    const insertedAds = await Ad.insertMany(mockAds);
    console.log(`✅ Inserted ${insertedAds.length} mock ads`);
    
    // Show summary
    console.log('\n📊 Summary:');
    console.log(`   - Apartments: ${mockAds.filter(a => a.real_estate_type === 'appartement').length}`);
    console.log(`   - Houses: ${mockAds.filter(a => a.real_estate_type === 'maison').length}`);
    console.log(`   - Price range: €${Math.min(...mockAds.map(a => a.price))} - €${Math.max(...mockAds.map(a => a.price))}`);
    console.log(`   - Surface range: ${Math.min(...mockAds.map(a => a.surface))}m² - ${Math.max(...mockAds.map(a => a.surface))}m²`);
    
    // Close connection
    await close();
    
    console.log('\n✨ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeder
seedDatabase();
