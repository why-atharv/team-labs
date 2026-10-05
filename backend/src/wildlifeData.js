/**
 * Wild Animal Catalog & Biological Data
 * teamLab Wildlife Living Sanctuary
 * Contains authentic zoological classifications, biomes, conservation statuses, and biological metrics.
 */

export const WILDLIFE_CATALOG = [
  // ===================== APEX BEASTS / LEGENDARY (5% Rare Natural Spawn) =====================
  {
    id_template: 'tiger',
    speciesNumber: 1,
    name: 'Royal Bengal Tiger',
    scientificName: 'Panthera tigris tigris',
    category: 'predator',
    diet: 'Apex Carnivore',
    habitat: 'Sundarbans Mangroves & Dense Jungles',
    conservationStatus: 'Endangered',
    rarity: 'legendary',
    isApex: true,
    scale: 1.35,
    archetype: 'tiger',
    color: '#f97316',          // Warm amber-orange coat
    secondaryColor: '#18181b', // Pitch-black stripes
    accentColor: '#ffffff',    // White underbelly & facial marks
    emissiveColor: '#ffedd5',
    auraColor: '#f97316',
    lifespanMs: 38000,
    baseStats: {
      speedKmH: 65,
      weightKg: 230,
      lifespanYears: 16,
      biteForcePsi: 1050
    },
    description: 'The undisputed lord of the Asian jungle. Solitary, stealthy, and possessing crushing bite force, Bengal tigers roam vast territories with silent majesty.'
  },
  {
    id_template: 'lion',
    speciesNumber: 2,
    name: 'African Lion',
    scientificName: 'Panthera leo',
    category: 'predator',
    diet: 'Apex Carnivore',
    habitat: 'Sub-Saharan Savannahs & Open Grasslands',
    conservationStatus: 'Vulnerable',
    rarity: 'legendary',
    isApex: true,
    scale: 1.4,
    archetype: 'lion',
    color: '#d97706',          // Golden tawny body
    secondaryColor: '#451a03', // Dense dark mane
    accentColor: '#fef3c7',
    emissiveColor: '#fed7aa',
    auraColor: '#f59e0b',
    lifespanMs: 38000,
    baseStats: {
      speedKmH: 80,
      weightKg: 210,
      lifespanYears: 14,
      biteForcePsi: 650
    },
    description: 'The iconic King of the Savannah. Males flaunt massive dark manes signifying prime health and dominance, leading prides across golden sunlit grasslands.'
  },
  {
    id_template: 'snow_leopard',
    speciesNumber: 3,
    name: 'Snow Leopard',
    scientificName: 'Panthera uncia',
    category: 'predator',
    diet: 'Carnivore',
    habitat: 'Himalayan Cliffs & High Alpine Tundra',
    conservationStatus: 'Vulnerable',
    rarity: 'legendary',
    isApex: true,
    scale: 1.25,
    archetype: 'snow_leopard',
    color: '#cbd5e1',          // Smoky silver-gray
    secondaryColor: '#334155', // Charcoal rosettes
    accentColor: '#f8fafc',
    emissiveColor: '#e0f2fe',
    auraColor: '#38bdf8',
    lifespanMs: 36000,
    baseStats: {
      speedKmH: 64,
      weightKg: 55,
      lifespanYears: 18,
      biteForcePsi: 450
    },
    description: 'The elusive "Ghost of the Mountains." Master of steep crags, its massive furry paws act as natural snowshoes and its thick, bushy tail provides agile balance.'
  },
  {
    id_template: 'wolf',
    speciesNumber: 4,
    name: 'Alpha Timber Wolf',
    scientificName: 'Canis lupus',
    category: 'predator',
    diet: 'Pack Carnivore',
    habitat: 'Boreal Taiga & Mountain Wilderness',
    conservationStatus: 'Least Concern',
    rarity: 'legendary',
    isApex: true,
    scale: 1.25,
    archetype: 'wolf',
    color: '#94a3b8',          // Silver-slate coat
    secondaryColor: '#1e293b', // Deep charcoal mantle
    accentColor: '#f1f5f9',
    emissiveColor: '#e2e8f0',
    auraColor: '#a855f7',
    lifespanMs: 36000,
    baseStats: {
      speedKmH: 60,
      weightKg: 58,
      lifespanYears: 13,
      biteForcePsi: 400
    },
    description: 'The sovereign leader of the wilderness pack. Armed with tireless endurance, keen olfactory senses, and coordinated pack intelligence that spans generations.'
  },
  {
    id_template: 'panther',
    speciesNumber: 5,
    name: 'Black Panther',
    scientificName: 'Panthera onca',
    category: 'predator',
    diet: 'Apex Carnivore',
    habitat: 'Amazon Rainforest & Deep River Basins',
    conservationStatus: 'Near Threatened',
    rarity: 'legendary',
    isApex: true,
    scale: 1.3,
    archetype: 'panther',
    color: '#18181b',          // Midnight obsidian coat
    secondaryColor: '#09090b', // Ghost rosettes
    accentColor: '#10b981',    // Piercing emerald eye shine
    emissiveColor: '#27272a',
    auraColor: '#10b981',
    lifespanMs: 36000,
    baseStats: {
      speedKmH: 70,
      weightKg: 100,
      lifespanYears: 15,
      biteForcePsi: 1500
    },
    description: 'Melanistic phantom of the tropical canopy. Possesses the strongest jaw of any big cat relative to body size, effortlessly swimming across flooded jungle rivers.'
  },

  // ===================== MAJESTIC GIANTS & RARE WILDLIFE =====================
  {
    id_template: 'elephant',
    speciesNumber: 6,
    name: 'African Bush Elephant',
    scientificName: 'Loxodonta africana',
    category: 'megaherbivore',
    diet: 'Megaherbivore',
    habitat: 'African Woodlands & Dry Scrublands',
    conservationStatus: 'Endangered',
    rarity: 'rare',
    isApex: false,
    scale: 1.85,
    archetype: 'elephant',
    color: '#64748b',          // Weathered slate gray
    secondaryColor: '#475569',
    accentColor: '#fef08a',    // Ivory tusks
    emissiveColor: '#94a3b8',
    auraColor: '#06b6d4',
    lifespanMs: 65000,
    baseStats: {
      speedKmH: 40,
      weightKg: 6000,
      lifespanYears: 70,
      biteForcePsi: 200
    },
    description: 'The monumental titan of terrestrial wildlife. Revered for emotional intelligence, complex matriarchal lineages, and sweeping tusks of resilient ivory.'
  },
  {
    id_template: 'bear',
    speciesNumber: 7,
    name: 'Grizzly Bear',
    scientificName: 'Ursus arctos horribilis',
    category: 'predator',
    diet: 'Apex Omnivore',
    habitat: 'Alpine Valleys, Coastal Forests & Tundra',
    conservationStatus: 'Least Concern',
    rarity: 'rare',
    isApex: false,
    scale: 1.5,
    archetype: 'bear',
    color: '#78350f',          // Deep shaggy brown
    secondaryColor: '#451a03',
    accentColor: '#d97706',
    emissiveColor: '#92400e',
    auraColor: '#d97706',
    lifespanMs: 55000,
    baseStats: {
      speedKmH: 56,
      weightKg: 380,
      lifespanYears: 25,
      biteForcePsi: 1160
    },
    description: 'A force of nature in northern forests. Identifiable by a prominent muscular shoulder hump powering ferocious digging, running, and river salmon fishing.'
  },
  {
    id_template: 'stag',
    speciesNumber: 8,
    name: 'Majestic Red Deer Stag',
    scientificName: 'Cervus elaphus',
    category: 'herbivore',
    diet: 'Herbivore',
    habitat: 'Ancient Highland Woods & Misty Glades',
    conservationStatus: 'Least Concern',
    rarity: 'rare',
    isApex: false,
    scale: 1.35,
    archetype: 'stag',
    color: '#b45309',          // Warm russet coat
    secondaryColor: '#78350f',
    accentColor: '#fef3c7',    // Antler crown
    emissiveColor: '#d97706',
    auraColor: '#10b981',
    lifespanMs: 50000,
    baseStats: {
      speedKmH: 72,
      weightKg: 240,
      lifespanYears: 20,
      biteForcePsi: 150
    },
    description: 'Monarch of the highland glens. Crowned with magnificent branching multi-tined antlers grown anew each spring, moving with stately grace through ancient oaks.'
  },
  {
    id_template: 'crocodile',
    speciesNumber: 9,
    name: 'Nile Crocodile',
    scientificName: 'Crocodylus niloticus',
    category: 'reptile',
    diet: 'Apex Carnivore',
    habitat: 'Freshwater Basins, Mangroves & Swamps',
    conservationStatus: 'Least Concern',
    rarity: 'rare',
    isApex: false,
    scale: 1.45,
    archetype: 'crocodile',
    color: '#365314',          // Armored olive-drab
    secondaryColor: '#1a2e05',
    accentColor: '#a3e635',
    emissiveColor: '#4d7c0f',
    auraColor: '#84cc16',
    lifespanMs: 50000,
    baseStats: {
      speedKmH: 30,
      weightKg: 750,
      lifespanYears: 70,
      biteForcePsi: 5000
    },
    description: 'An ancient prehistoric survivor unchanged for millions of years. Armored with keeled scutes and possessing the most devastating hydraulic bite on Earth.'
  },

  // ===================== WILD SAFARI & FOREST SPECIES (Common Roamers) =====================
  {
    id_template: 'cheetah',
    speciesNumber: 10,
    name: 'African Cheetah',
    scientificName: 'Acinonyx jubatus',
    category: 'predator',
    diet: 'Carnivore',
    habitat: 'Open Plains & Semi-Arid Steppes',
    conservationStatus: 'Vulnerable',
    rarity: 'common',
    isApex: false,
    scale: 1.2,
    archetype: 'cheetah',
    color: '#eab308',          // Tawny gold with black spots
    secondaryColor: '#713f12',
    accentColor: '#fef9c3',
    emissiveColor: '#facc15',
    auraColor: '#eab308',
    lifespanMs: 45000,
    baseStats: {
      speedKmH: 112,
      weightKg: 52,
      lifespanYears: 12,
      biteForcePsi: 400
    },
    description: 'The fastest land mammal on planet Earth. Accelerating from 0 to 100 km/h in 3 seconds flat, built with lightweight aerodynamic bones and flexible spine.'
  },
  {
    id_template: 'zebra',
    speciesNumber: 11,
    name: 'Plains Zebra',
    scientificName: 'Equus quagga',
    category: 'herbivore',
    diet: 'Herbivore',
    habitat: 'Savannah Grasslands & Woodlands',
    conservationStatus: 'Near Threatened',
    rarity: 'common',
    isApex: false,
    scale: 1.25,
    archetype: 'zebra',
    color: '#f8fafc',          // Dazzle white coat
    secondaryColor: '#09090b', // Bold black stripes
    accentColor: '#1e293b',
    emissiveColor: '#e2e8f0',
    auraColor: '#38bdf8',
    lifespanMs: 45000,
    baseStats: {
      speedKmH: 68,
      weightKg: 320,
      lifespanYears: 25,
      biteForcePsi: 220
    },
    description: 'Striking wild equines famous for black and white dazzle camouflage that confuses predator stereoscopic vision during swift migration herds across the plains.'
  },
  {
    id_template: 'eagle',
    speciesNumber: 12,
    name: 'Golden Eagle',
    scientificName: 'Aquila chrysaetos',
    category: 'raptor',
    diet: 'Apex Raptor',
    habitat: 'Rugged Mountains, Cliffs & High Plateaus',
    conservationStatus: 'Least Concern',
    rarity: 'common',
    isApex: false,
    scale: 1.3,
    archetype: 'eagle',
    color: '#713f12',          // Deep golden-brown plumage
    secondaryColor: '#ca8a04', // Golden crown feathers
    accentColor: '#fef08a',    // Razor-sharp talons & beak
    emissiveColor: '#eab308',
    auraColor: '#f59e0b',
    lifespanMs: 45000,
    baseStats: {
      speedKmH: 240,            // Diving speed
      weightKg: 5.5,
      lifespanYears: 30,
      biteForcePsi: 400
    },
    description: 'The supreme feathered predator of mountain heights. Unsurpassed aerial agility allows it to dive at speeds exceeding 240 km/h with razor-tipped talons.'
  }
];

export const APEX_WILDLIFE = WILDLIFE_CATALOG.filter((w) => w.rarity === 'legendary');
export const RARE_WILDLIFE = WILDLIFE_CATALOG.filter((w) => w.rarity === 'rare');
export const COMMON_WILDLIFE = WILDLIFE_CATALOG.filter((w) => w.rarity === 'common');

// Backward compatibility alias for any lingering server/client references
export const POKEMON_CATALOG = WILDLIFE_CATALOG;
export const LEGENDARY_ROSTER = APEX_WILDLIFE;
export const RARE_ROSTER = RARE_WILDLIFE;
export const COMMON_ROSTER = COMMON_WILDLIFE;
