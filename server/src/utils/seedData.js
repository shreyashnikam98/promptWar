const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Place = require('../models/Place');
const Report = require('../models/Report');
const Review = require('../models/Review');
const AuditLog = require('../models/AuditLog');

const seedUsers = async () => {
  const salt = await bcrypt.genSalt(10);
  const adminPass = await bcrypt.hash('Admin@123456', salt);
  const modPass = await bcrypt.hash('Mod@123456', salt);
  const userPass = await bcrypt.hash('User@123456', salt);

  const users = [
    {
      name: 'Municipal Admin Officer',
      email: 'admin@citylife.org',
      passwordHash: adminPass,
      role: 'admin',
      preferences: { city: 'Pune', dietary: 'all' }
    },
    {
      name: 'Safety Moderator Rahul',
      email: 'moderator@citylife.org',
      passwordHash: modPass,
      role: 'moderator',
      preferences: { city: 'Pune', dietary: 'Vegetarian' }
    },
    {
      name: 'Aditi Deshmukh',
      email: 'citizen@citylife.org',
      passwordHash: userPass,
      role: 'user',
      preferences: { city: 'Pune', dietary: 'Vegetarian', accessibilityNeeds: true }
    }
  ];

  await User.deleteMany({});
  const createdUsers = await User.insertMany(users);
  console.log(` Seeded ${createdUsers.length} system users (Admin, Moderator, Citizen).`);
  return createdUsers;
};

const samplePlaces = [
  {
    name: 'Shaniwar Wada',
    slug: 'shaniwar-wada',
    description: 'Historical 18th-century fortification seat of the Peshwas of the Maratha Empire, known for its massive teak gates and bastions.',
    category: 'Historical landmarks',
    address: 'Shaniwar Peth, Pune, Maharashtra 411030',
    city: 'Pune',
    location: { type: 'Point', coordinates: [73.8553, 18.5195] },
    images: ['https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800&auto=format&fit=crop'],
    priceRange: '$',
    estimatedBudget: { amount: 50, currency: 'INR', source: 'Archaeological Survey Entry Fee' },
    rating: { average: 4.5, count: 28 },
    accessibility: { wheelchairAccessible: true, brailleSignage: false, accessibleRestrooms: true, details: 'Ramped entry through Delhi Darwaja, courtyard accessible' },
    openingHours: '09:00 AM - 05:30 PM (Daily)',
    isVerifiedHours: true,
    historicalDetails: { period: 'Maratha Empire (1732 AD)', architect: 'Peshwa Baji Rao I', yearBuilt: '1732', heritageSignificance: 'ASI Monument of National Importance' },
    cleanlinessRating: 4.2,
    source: 'Archaeological Survey of India & OpenStreetMap',
    verificationStatus: 'admin_curated'
  },
  {
    name: 'Aga Khan Palace',
    slug: 'aga-khan-palace',
    description: 'Majestic Italian-arched palace built in 1892, national memorial commemorating Mahatma Gandhi, Kasturba Gandhi, and freedom fighters.',
    category: 'Historical landmarks',
    address: 'Nagar Road, Kalyani Nagar, Pune, Maharashtra 411006',
    city: 'Pune',
    location: { type: 'Point', coordinates: [73.9015, 18.5529] },
    images: ['https://images.unsplash.com/photo-1598890777032-bde835ba27c2?w=800&auto=format&fit=crop'],
    priceRange: '$',
    estimatedBudget: { amount: 25, currency: 'INR', source: 'Memorial Trust' },
    rating: { average: 4.6, count: 34 },
    accessibility: { wheelchairAccessible: true, brailleSignage: true, accessibleRestrooms: true, details: 'Paved garden walkways, museum ramps installed' },
    openingHours: '09:00 AM - 05:30 PM (Daily)',
    isVerifiedHours: true,
    historicalDetails: { period: 'Colonial Era (1892 AD)', architect: 'Sultan Muhammed Shah Aga Khan III', yearBuilt: '1892', heritageSignificance: 'Gandhi Memorial & Gandhi Smarak Samiti' },
    cleanlinessRating: 4.8,
    source: 'National Gandhi Museum Trust',
    verificationStatus: 'admin_curated'
  },
  {
    name: 'Sinhagad Fort',
    slug: 'sinhagad-fort',
    description: 'Ancient hill fortress situated atop a cliff 1,312 meters above sea level with panoramic Sahyadri views and legendary battlefield history.',
    category: 'Tourist attractions',
    address: 'Sinhagad Ghat Road, Thoptewadi, Pune, Maharashtra 411025',
    city: 'Pune',
    location: { type: 'Point', coordinates: [73.7554, 18.3664] },
    images: ['https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?w=800&auto=format&fit=crop'],
    priceRange: '$',
    estimatedBudget: { amount: 100, currency: 'INR', source: 'Forest Dept Toll' },
    rating: { average: 4.7, count: 52 },
    accessibility: { wheelchairAccessible: false, brailleSignage: false, accessibleRestrooms: false, details: 'Steep cobblestone trails and stone stairs' },
    openingHours: '05:00 AM - 07:00 PM (Vehicles restricted after sunset)',
    isVerifiedHours: true,
    historicalDetails: { period: 'Maratha-Mughal Era (Tanaji Malusare 1670 Battle)', yearBuilt: 'Circa 14th Century' },
    cleanlinessRating: 4.1,
    source: 'Maharashtra Tourism (MTDC)',
    verificationStatus: 'admin_curated'
  },
  {
    name: 'Vaishali Restaurant',
    slug: 'vaishali-restaurant',
    description: 'Legendary heritage cafe on Fergusson College Road renowned for authentic South Indian filter coffee, SPDP, and Mysore Masala Dosa.',
    category: 'Restaurants',
    address: '1218/1, FC Road, Shivajinagar, Pune, Maharashtra 411004',
    city: 'Pune',
    location: { type: 'Point', coordinates: [73.8402, 18.5246] },
    images: ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop'],
    priceRange: '$$',
    estimatedBudget: { amount: 250, currency: 'INR', source: 'Average meal per person' },
    rating: { average: 4.7, count: 68 },
    accessibility: { wheelchairAccessible: true, brailleSignage: false, accessibleRestrooms: false, details: 'Ground floor outdoor courtyard seating wheelchair friendly' },
    openingHours: '07:00 AM - 11:00 PM',
    isVerifiedHours: true,
    dietaryOptions: ['Vegetarian', 'Vegan', 'Jain friendly'],
    cleanlinessRating: 4.6,
    source: 'Curated Local Listings',
    verificationStatus: 'admin_curated'
  },
  {
    name: 'Cafe Goodluck',
    slug: 'cafe-goodluck',
    description: 'Iconic Irani cafe founded in 1935 near Deccan Gymkhana, famed for bun maska, Irani chai, kheema pav, and bustling student ambiance.',
    category: 'Cafes',
    address: 'Fergusson College Road, Deccan Gymkhana, Pune, Maharashtra 411004',
    city: 'Pune',
    location: { type: 'Point', coordinates: [73.8415, 18.5222] },
    images: ['https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop'],
    priceRange: '$',
    estimatedBudget: { amount: 180, currency: 'INR', source: 'Standard breakfast/snack bill' },
    rating: { average: 4.5, count: 47 },
    accessibility: { wheelchairAccessible: true, brailleSignage: false, accessibleRestrooms: false, details: 'Street-level entrance without steps' },
    openingHours: '07:30 AM - 11:30 PM',
    isVerifiedHours: true,
    dietaryOptions: ['Non-Vegetarian', 'Vegetarian'],
    cleanlinessRating: 4.3,
    source: 'Deccan Hospitality Directory',
    verificationStatus: 'admin_curated'
  },
  {
    name: 'FC Road Street Food Plaza',
    slug: 'fc-road-street-food',
    description: 'Vibrant street food corridor offering piping-hot vada pav, cheese bhel, momos, kulfi, and fresh sugarcane juice at student-friendly prices.',
    category: 'Street food',
    address: 'Opposite Fergusson College Gate, Shivajinagar, Pune 411004',
    city: 'Pune',
    location: { type: 'Point', coordinates: [73.8395, 18.5255] },
    images: ['https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop'],
    priceRange: '$',
    estimatedBudget: { amount: 80, currency: 'INR', source: 'Per snack item' },
    rating: { average: 4.4, count: 39 },
    accessibility: { wheelchairAccessible: true, details: 'Pedestrian sidewalk paved with tactile tiles' },
    openingHours: '04:00 PM - 10:30 PM',
    isVerifiedHours: true,
    dietaryOptions: ['Vegetarian', 'Jain friendly'],
    cleanlinessRating: 3.9,
    source: 'Pune Street Food Guild',
    verificationStatus: 'admin_curated'
  },
  {
    name: 'Ruby Hall Clinic Multi-Speciality Hospital',
    slug: 'ruby-hall-clinic',
    description: 'Premier 750-bed tertiary care teaching hospital with 24x7 emergency trauma center, air ambulance facility, and cardiac care.',
    category: 'Hospitals',
    address: '40, Sassoon Road, Sangamvadi, Pune, Maharashtra 411001',
    city: 'Pune',
    location: { type: 'Point', coordinates: [73.8797, 18.5323] },
    images: ['https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800&auto=format&fit=crop'],
    priceRange: 'Data unavailable',
    rating: { average: 4.3, count: 22 },
    accessibility: { wheelchairAccessible: true, brailleSignage: true, accessibleRestrooms: true, details: 'Full ADA compliance, barrier-free emergency access' },
    openingHours: 'Open 24 Hours (Emergency & Inpatient)',
    isVerifiedHours: true,
    cleanlinessRating: 4.9,
    source: 'National Hospital Registry',
    verificationStatus: 'verified_public'
  },
  {
    name: 'Shivajinagar Police Station',
    slug: 'shivajinagar-police-station',
    description: 'Key central police precinct providing 24/7 law enforcement, emergency distress response, traffic regulation, and women assistance cells.',
    category: 'Police stations',
    address: 'University Road, Shivajinagar, Pune, Maharashtra 411005',
    city: 'Pune',
    location: { type: 'Point', coordinates: [73.8502, 18.5310] },
    images: ['https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&auto=format&fit=crop'],
    priceRange: 'Free',
    rating: { average: 4.0, count: 15 },
    accessibility: { wheelchairAccessible: true, brailleSignage: false, accessibleRestrooms: true },
    openingHours: 'Open 24 Hours',
    isVerifiedHours: true,
    cleanlinessRating: 4.0,
    source: 'Pune City Police Department',
    verificationStatus: 'verified_public'
  },
  {
    name: 'Bund Garden & Fitzgerald Bridge',
    slug: 'bund-garden',
    description: 'Tranquil municipal park situated on the banks of Mula-Mutha river with jogging tracks, lush tree canopies, and bird-watching spots.',
    category: 'Parks',
    address: 'Sangamvadi, Pune, Maharashtra 411001',
    city: 'Pune',
    location: { type: 'Point', coordinates: [73.8828, 18.5360] },
    images: ['https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=800&auto=format&fit=crop'],
    priceRange: 'Free',
    estimatedBudget: { amount: 0, currency: 'INR', source: 'Public municipal garden' },
    rating: { average: 4.2, count: 26 },
    accessibility: { wheelchairAccessible: true, brailleSignage: false, accessibleRestrooms: true, details: 'Flat paved walkways throughout the promenade' },
    openingHours: '06:00 AM - 08:00 PM',
    isVerifiedHours: true,
    cleanlinessRating: 4.1,
    source: 'Pune Municipal Corporation (PMC)',
    verificationStatus: 'admin_curated'
  },
  {
    name: 'Pataleshwar Cave Temple',
    slug: 'pataleshwar-cave-temple',
    description: '8th-century rock-cut monolith cave temple carved out of basaltic rock, dedicated to Lord Shiva with an ornate circular Nandi mandapa.',
    category: 'Cultural locations',
    address: 'Jangali Maharaj Road, Shivajinagar, Pune 411005',
    city: 'Pune',
    location: { type: 'Point', coordinates: [73.8504, 18.5282] },
    images: ['https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&auto=format&fit=crop'],
    priceRange: 'Free',
    estimatedBudget: { amount: 0, currency: 'INR', source: 'ASI Protected Heritage' },
    rating: { average: 4.6, count: 31 },
    accessibility: { wheelchairAccessible: false, brailleSignage: false, accessibleRestrooms: false, details: 'Subterranean rock stairs down to shrine' },
    openingHours: '08:00 AM - 05:30 PM',
    isVerifiedHours: true,
    historicalDetails: { period: 'Rashtrakuta Dynasty (8th Century AD)', architect: 'Rashtrakuta Artisans', yearBuilt: '750 AD' },
    cleanlinessRating: 4.5,
    source: 'Archaeological Survey of India',
    verificationStatus: 'admin_curated'
  },
  {
    name: 'Pune Central Railway Station',
    slug: 'pune-central-railway-station',
    description: 'Major transit hub of Central Railway connecting Pune to all major Indian metropolitan hubs with suburban EMU local trains.',
    category: 'Public transport',
    address: 'HH Aga Khan Road, Agarkar Nagar, Pune 411001',
    city: 'Pune',
    location: { type: 'Point', coordinates: [73.8744, 18.5284] },
    images: ['https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop'],
    priceRange: '$',
    rating: { average: 4.1, count: 44 },
    accessibility: { wheelchairAccessible: true, brailleSignage: true, accessibleRestrooms: true, details: 'Elevators, escalators, and golf cart assistance for senior citizens' },
    openingHours: 'Open 24 Hours',
    isVerifiedHours: true,
    cleanlinessRating: 4.0,
    source: 'Indian Railways (CR)',
    verificationStatus: 'verified_public'
  },
  {
    name: 'Zostel Pune Backpackers Hostel',
    slug: 'zostel-pune',
    description: 'Modern budget youth hostel in Koregaon Park offering vibrant dormitories, rooftop community lounge, high-speed WiFi, and cafe.',
    category: 'Budget stays',
    address: 'Lane 1, Koregaon Park, Pune, Maharashtra 411001',
    city: 'Pune',
    location: { type: 'Point', coordinates: [73.8966, 18.5372] },
    images: ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&auto=format&fit=crop'],
    priceRange: '$',
    estimatedBudget: { amount: 699, currency: 'INR', source: 'Dorm bed per night' },
    rating: { average: 4.5, count: 29 },
    accessibility: { wheelchairAccessible: true, brailleSignage: false, accessibleRestrooms: true },
    openingHours: 'Check-in: 12:00 PM, Check-out: 10:00 AM',
    isVerifiedHours: true,
    cleanlinessRating: 4.7,
    source: 'Hospitality Partner Network',
    verificationStatus: 'admin_curated'
  },
  {
    name: 'Gateway of India',
    slug: 'gateway-of-india',
    description: 'Iconic 20th-century arch monument overlooking the Arabian Sea, built to commemorate the landing of King George V and Queen Mary.',
    category: 'Historical landmarks',
    address: 'Apollo Bandar, Colaba, Mumbai, Maharashtra 400001',
    city: 'Mumbai',
    location: { type: 'Point', coordinates: [72.8347, 18.9220] },
    images: ['https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&auto=format&fit=crop'],
    priceRange: 'Free',
    estimatedBudget: { amount: 0, currency: 'INR', source: 'Public Promenade' },
    rating: { average: 4.8, count: 75 },
    accessibility: { wheelchairAccessible: true, brailleSignage: false, accessibleRestrooms: true, details: 'Level promenade with ramps' },
    openingHours: 'Open 24 Hours (Security checks apply)',
    isVerifiedHours: true,
    historicalDetails: { period: 'Indo-Saracenic (1924)', architect: 'George Wittet', yearBuilt: '1924' },
    cleanlinessRating: 4.2,
    source: 'Mumbai Heritage Conservation Committee',
    verificationStatus: 'admin_curated'
  },
  {
    name: 'Marine Drive Promenade',
    slug: 'marine-drive',
    description: 'World-famous 3.6-kilometer curved boulevard along the coast known as the Queen’s Necklace, offering stunning Arabian Sea sunsets.',
    category: 'Tourist attractions',
    address: 'Netaji Subhash Chandra Bose Road, Mumbai 400020',
    city: 'Mumbai',
    location: { type: 'Point', coordinates: [72.8236, 18.9432] },
    images: ['https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=800&auto=format&fit=crop'],
    priceRange: 'Free',
    rating: { average: 4.8, count: 88 },
    accessibility: { wheelchairAccessible: true, details: 'Continuous paved seaside walkway' },
    openingHours: 'Open 24 Hours',
    isVerifiedHours: true,
    cleanlinessRating: 4.4,
    source: 'MCGM & MTDC',
    verificationStatus: 'admin_curated'
  }
];

const seedReports = (users) => {
  const admin = users.find(u => u.role === 'admin');
  const mod = users.find(u => u.role === 'moderator');
  const citizen = users.find(u => u.role === 'user');

  return [
    {
      title: 'Deep unbarricaded road cavity near JM Road corner',
      description: 'Significant pothole cavity developed after pipeline maintenance work. Two two-wheelers skidded during evening peak hours. High risk of accidents.',
      category: 'Dangerous road',
      severity: 'high',
      location: { type: 'Point', coordinates: [73.8450, 18.5260] },
      address: 'JM Road junction near Deccan, Pune',
      city: 'Pune',
      reportedAt: new Date(Date.now() - 6 * 3600 * 1000),
      status: 'verified',
      priority: 'high',
      reporterId: citizen._id,
      reporterName: citizen.name,
      verification: {
        verifiedBy: mod._id,
        verifiedAt: new Date(Date.now() - 4 * 3600 * 1000),
        notes: 'Verified by field traffic patrol. PMC Road department ticket #PMC-9921 dispatched.',
        confidenceScore: 0.98
      },
      moderationNotes: [
        { author: 'Safety Moderator Rahul', action: 'STATUS_UPDATE_pending_TO_verified', note: 'Inspected and confirmed hazard' }
      ],
      communityConfirmations: { count: 14, confirmedUsers: [citizen._id] }
    },
    {
      title: 'Waterlogging under Sancheti Hospital Flyover',
      description: 'Approximately 1.5 feet of stagnant rainwater pooling in the underpass. Vehicle movement slowed down to single lane.',
      category: 'Waterlogging',
      severity: 'medium',
      location: { type: 'Point', coordinates: [73.8520, 18.5305] },
      address: 'Sancheti Flyover Underpass, Shivajinagar, Pune',
      city: 'Pune',
      reportedAt: new Date(Date.now() - 14 * 3600 * 1000),
      status: 'under_review',
      priority: 'medium',
      reporterId: citizen._id,
      reporterName: citizen.name,
      communityConfirmations: { count: 8, confirmedUsers: [] }
    },
    {
      title: 'Defective street lights along Bund Garden riverside walkway',
      description: 'Continuous stretch of 6 lamp posts remain non-functional between 8 PM and midnight. Pedestrian walkway is pitch dark.',
      category: 'Poor street lighting',
      severity: 'medium',
      location: { type: 'Point', coordinates: [73.8835, 18.5365] },
      address: 'Promenade stretch, Bund Garden, Pune',
      city: 'Pune',
      reportedAt: new Date(Date.now() - 28 * 3600 * 1000),
      status: 'pending',
      priority: 'medium',
      reporterId: citizen._id,
      reporterName: citizen.name,
      communityConfirmations: { count: 5, confirmedUsers: [] }
    },
    {
      title: 'Fallen tree limb obstructing left lane on FC Road',
      description: 'Overhanging heavy banyan branch snapped during gusty wind, blocking cycle track and bus lane. Traffic personnel placed cones.',
      category: 'Infrastructure hazard',
      severity: 'critical',
      location: { type: 'Point', coordinates: [73.8398, 18.5230] },
      address: 'FC Road opposite Gokhale Institute, Pune',
      city: 'Pune',
      reportedAt: new Date(Date.now() - 2 * 3600 * 1000),
      status: 'verified',
      priority: 'urgent',
      reporterId: admin._id,
      reporterName: 'Emergency Traffic Control',
      verification: {
        verifiedBy: admin._id,
        verifiedAt: new Date(Date.now() - 1 * 3600 * 1000),
        notes: 'Disaster management tree cutting unit in action.',
        confidenceScore: 0.99
      },
      moderationNotes: [
        { author: 'Municipal Admin Officer', action: 'REPORT_VERIFIED', note: 'Priority critical clearance dispatched' }
      ],
      communityConfirmations: { count: 21, confirmedUsers: [citizen._id] }
    },
    {
      title: 'Minor collision cleared at Swargate flyover junction',
      description: 'Two cars involved in rear-end bumper hit. Both vehicles towed away to side bay; normal vehicular movement restored.',
      category: 'Road accident',
      severity: 'low',
      location: { type: 'Point', coordinates: [73.8580, 18.5015] },
      address: 'Swargate Flyover descent, Pune',
      city: 'Pune',
      reportedAt: new Date(Date.now() - 48 * 3600 * 1000),
      status: 'resolved',
      priority: 'low',
      reporterId: mod._id,
      reporterName: 'Traffic Warden',
      verification: {
        verifiedBy: mod._id,
        verifiedAt: new Date(Date.now() - 47 * 3600 * 1000),
        notes: 'Cleared by Swargate Traffic Chowky',
        confidenceScore: 1.0
      },
      communityConfirmations: { count: 6, confirmedUsers: [] }
    }
  ];
};

const seedReviews = (users, places) => {
  const citizen = users.find(u => u.role === 'user');
  const mod = users.find(u => u.role === 'moderator');
  const wada = places.find(p => p.slug === 'shaniwar-wada');
  const vaishali = places.find(p => p.slug === 'vaishali-restaurant');
  const goodluck = places.find(p => p.slug === 'cafe-goodluck');

  const reviews = [];
  if (wada && citizen) {
    reviews.push({
      userId: citizen._id,
      placeId: wada._id,
      rating: 5,
      comment: 'Incredible heritage site! The light and sound show in the evening explains the history of the Peshwas vividly. Well maintained lawns.',
      moderationStatus: 'approved'
    });
  }
  if (vaishali && mod) {
    reviews.push({
      userId: mod._id,
      placeId: vaishali._id,
      rating: 5,
      comment: 'Best filter coffee and Mysore masala dosa in Maharashtra. Be prepared for a 15-minute wait on weekends, but it is worth every second.',
      moderationStatus: 'approved'
    });
  }
  if (goodluck && citizen) {
    reviews.push({
      userId: citizen._id,
      placeId: goodluck._id,
      rating: 4,
      comment: 'Authentic 1930s Irani cafe charm. The bun maska dipped in steaming tea is pure nostalgia.',
      moderationStatus: 'approved'
    });
  }
  return reviews;
};

const seedDatabaseIfEmpty = async () => {
  const placeCount = await Place.countDocuments();
  if (placeCount > 0) {
    console.log(` Database already populated (${placeCount} places found). Skipping automatic seeding.`);
    return;
  }

  console.log(' Empty database detected. Seeding curated smart city dataset...');
  const users = await seedUsers();
  const createdPlaces = await Place.insertMany(samplePlaces);
  console.log(` Seeded ${createdPlaces.length} verified places across Pune and Mumbai.`);

  const reportDocs = seedReports(users);
  const createdReports = await Report.insertMany(reportDocs);
  console.log(` Seeded ${createdReports.length} geolocated citizen safety reports.`);

  const reviewDocs = seedReviews(users, createdPlaces);
  if (reviewDocs.length > 0) {
    await Review.insertMany(reviewDocs);
    console.log(` Seeded ${reviewDocs.length} community reviews.`);
  }

  await AuditLog.create({
    actorId: users[0]._id,
    action: 'SYSTEM_INITIAL_SEED',
    resourceType: 'System',
    resourceId: 'INIT',
    metadata: { places: createdPlaces.length, reports: createdReports.length }
  });

  console.log(' Seeding completed successfully. Ready for exploration & evaluation.');
};

// Direct script execution support
if (require.main === module) {
  const { connectDB } = require('../config/db');
  connectDB().then(async () => {
    await Place.deleteMany({});
    await Report.deleteMany({});
    await Review.deleteMany({});
    await seedDatabaseIfEmpty();
    process.exit(0);
  });
}

module.exports = { seedDatabaseIfEmpty };
