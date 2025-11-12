/**
 * Mock LeBonCoin data for testing scraper without calling the actual website
 * Based on real LeBonCoin ad structure
 */

export const mockLeBonCoinAds = [
  {
    subject: "Appartement T3 - 65m² - Proche métro",
    body: "Bel appartement T3 de 65m² situé au 2ème étage sans ascenseur. Comprend 2 chambres, séjour, cuisine équipée, salle de bain. Chauffage individuel gaz. Proximité immédiate métro ligne 7.",
    url: "/annonces/offres/ile_de_france/occasions/2456789012",
    price: 285000,
    first_publication_date: "2025-11-02T14:30:00.000Z",
    index_date: "2025-11-02T14:30:00.000Z",
    images: {
      urls: [
        "https://img.leboncoin.fr/image1.jpg",
        "https://img.leboncoin.fr/image2.jpg"
      ]
    },
    location: {
      region_name: "Île-de-France",
      department_id: "75",
      department_name: "Paris",
      city: "Paris",
      zipcode: "75013",
      lat: 48.8323,
      lng: 2.3574
    },
    attributes: [
      { key: "real_estate_type", value: "1", value_label: "Appartement" },
      { key: "rooms", value: "3" },
      { key: "square", value: "65" },
      { key: "immo_sell_type", value: "old", value_label: "Ancien" }
    ]
  },
  {
    subject: "Maison 4 pièces avec jardin - 95m²",
    body: "Belle maison individuelle de 95m² avec jardin de 200m². Rez-de-chaussée: séjour, cuisine américaine, WC. Étage: 3 chambres, salle de bain. Garage. Proche commerces et écoles.",
    url: "/annonces/offres/ile_de_france/occasions/2456789013",
    price: 420000,
    first_publication_date: "2025-11-02T15:45:00.000Z",
    index_date: "2025-11-02T15:45:00.000Z",
    images: {
      urls: [
        "https://img.leboncoin.fr/image3.jpg",
        "https://img.leboncoin.fr/image4.jpg",
        "https://img.leboncoin.fr/image5.jpg"
      ]
    },
    location: {
      region_name: "Île-de-France",
      department_id: "94",
      department_name: "Val-de-Marne",
      city: "Créteil",
      zipcode: "94000",
      lat: 48.7905,
      lng: 2.4548
    },
    attributes: [
      { key: "real_estate_type", value: "2", value_label: "Maison" },
      { key: "rooms", value: "4" },
      { key: "square", value: "95" },
      { key: "immo_sell_type", value: "old", value_label: "Ancien" }
    ]
  },
  {
    subject: "Studio 28m² - Idéal investissement",
    body: "Studio de 28m² au 3ème étage avec ascenseur. Cuisine ouverte, salle d'eau avec WC. Immeuble récent, bien entretenu. Charges: 50€/mois. Idéal premier achat ou investissement locatif.",
    url: "/annonces/offres/ile_de_france/occasions/2456789014",
    price: 165000,
    first_publication_date: "2025-11-02T16:20:00.000Z",
    index_date: "2025-11-02T16:20:00.000Z",
    images: {
      urls: [
        "https://img.leboncoin.fr/image6.jpg"
      ]
    },
    location: {
      region_name: "Île-de-France",
      department_id: "93",
      department_name: "Seine-Saint-Denis",
      city: "Montreuil",
      zipcode: "93100",
      lat: 48.8634,
      lng: 2.4411
    },
    attributes: [
      { key: "real_estate_type", value: "1", value_label: "Appartement" },
      { key: "rooms", value: "1" },
      { key: "square", value: "28" },
      { key: "immo_sell_type", value: "old", value_label: "Ancien" }
    ]
  },
  {
    subject: "Appartement T4 neuf - 85m² - Terrasse 15m²",
    body: "Programme neuf livraison 2025. Superbe T4 de 85m² avec terrasse de 15m². Prestations haut de gamme: parquet, cuisine équipée, double vitrage, chauffage collectif. 2 parkings inclus.",
    url: "/annonces/offres/ile_de_france/occasions/2456789015",
    price: 495000,
    first_publication_date: "2025-11-02T17:10:00.000Z",
    index_date: "2025-11-02T17:10:00.000Z",
    images: {
      urls: [
        "https://img.leboncoin.fr/image7.jpg",
        "https://img.leboncoin.fr/image8.jpg",
        "https://img.leboncoin.fr/image9.jpg",
        "https://img.leboncoin.fr/image10.jpg"
      ]
    },
    location: {
      region_name: "Île-de-France",
      department_id: "92",
      department_name: "Hauts-de-Seine",
      city: "Boulogne-Billancourt",
      zipcode: "92100",
      lat: 48.8347,
      lng: 2.2411
    },
    attributes: [
      { key: "real_estate_type", value: "1", value_label: "Appartement" },
      { key: "rooms", value: "4" },
      { key: "square", value: "85" },
      { key: "immo_sell_type", value: "new", value_label: "Neuf" }
    ]
  },
  {
    subject: "Parking couvert centre-ville",
    body: "Place de parking couverte sécurisée en centre-ville. Accès par badge. Dimensions: 5m x 2.5m. Idéal pour berline ou SUV.",
    url: "/annonces/offres/ile_de_france/occasions/2456789016",
    price: 25000,
    first_publication_date: "2025-11-02T18:00:00.000Z",
    index_date: "2025-11-02T18:00:00.000Z",
    images: {
      urls: []
    },
    location: {
      region_name: "Île-de-France",
      department_id: "75",
      department_name: "Paris",
      city: "Paris",
      zipcode: "75015",
      lat: 48.8422,
      lng: 2.2989
    },
    attributes: [
      { key: "real_estate_type", value: "4", value_label: "Parking" }
    ]
  }
];

/**
 * Generate HTML page with embedded JSON (simulates LeBonCoin page structure)
 */
export function generateMockLeBonCoinHTML(ads: typeof mockLeBonCoinAds): string {
  const adsJson = JSON.stringify(ads);
  
  // LeBonCoin embeds data in window.FLUX_STATE as a JSON string
  return `<!DOCTYPE html>
<html lang="fr">
<head>
    <title>Immobilier - Nos Annonces Leboncoin - Leboncoin</title>
    <meta charset="utf-8">
</head>
<body>
    <div id="root"></div>
    <script>
        window.FLUX_STATE = {"ads":${adsJson},"ads_alu":[],"parameters":{}};
    </script>
</body>
</html>`;
}

/**
 * Expected Prisma-formatted output
 */
export const expectedPrismaAds = [
  {
    title: "Appartement T3 - 65m² - Proche métro",
    description: "Bel appartement T3 de 65m² situé au 2ème étage sans ascenseur. Comprend 2 chambres, séjour, cuisine équipée, salle de bain. Chauffage individuel gaz. Proximité immédiate métro ligne 7.",
    thumbUrls: [
      "https://img.leboncoin.fr/image1.jpg",
      "https://img.leboncoin.fr/image2.jpg"
    ],
    url: "https://www.leboncoin.fr/annonces/offres/ile_de_france/occasions/2456789012",
    realEstateType: "appartement",
    rooms: 3,
    surface: 65,
    immoSellType: "ancien",
    price: 285000,
    provider: "leboncoin",
    releaseDate: new Date("2025-11-02T14:30:00.000Z"),
    regionName: "Île-de-France",
    departmentId: "75",
    departmentName: "Paris",
    city: "Paris",
    zipcode: "75013",
    latitude: 48.8323,
    longitude: 2.3574
  },
  {
    title: "Maison 4 pièces avec jardin - 95m²",
    description: "Belle maison individuelle de 95m² avec jardin de 200m². Rez-de-chaussée: séjour, cuisine américaine, WC. Étage: 3 chambres, salle de bain. Garage. Proche commerces et écoles.",
    thumbUrls: [
      "https://img.leboncoin.fr/image3.jpg",
      "https://img.leboncoin.fr/image4.jpg",
      "https://img.leboncoin.fr/image5.jpg"
    ],
    url: "https://www.leboncoin.fr/annonces/offres/ile_de_france/occasions/2456789013",
    realEstateType: "maison",
    rooms: 4,
    surface: 95,
    immoSellType: "ancien",
    price: 420000,
    provider: "leboncoin",
    releaseDate: new Date("2025-11-02T15:45:00.000Z"),
    regionName: "Île-de-France",
    departmentId: "94",
    departmentName: "Val-de-Marne",
    city: "Créteil",
    zipcode: "94000",
    latitude: 48.7905,
    longitude: 2.4548
  }
];
