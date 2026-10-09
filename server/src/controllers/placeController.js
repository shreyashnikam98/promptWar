const Place = require('../models/Place');
const AuditLog = require('../models/AuditLog');
const routingService = require('../services/routingService');
const aiService = require('../services/aiService');
const overpassService = require('../services/overpassService');

// Safe regex character escaping
const escapeRegex = (str) => (str || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Get places with filters, case-insensitive keyword/city search, and pagination
exports.getPlaces = async (req, res, next) => {
  try {
    const {
      city,
      category,
      priceRange,
      minRating,
      wheelchairAccessible,
      dietary,
      sort = 'popularity',
      page = 1,
      limit = 30,
      search
    } = req.query;

    const query = {};
    const cleanSearch = (search || '').trim();

    if (cleanSearch) {
      const searchEscaped = escapeRegex(cleanSearch);
      const searchRegex = new RegExp(searchEscaped, 'i');

      // Check if search contains a known city name or word
      const isKnownCity = ['pune', 'mumbai', 'delhi', 'bengaluru', 'bangalore', 'jaipur', 'kolkata', 'hyderabad', 'chennai', 'goa']
        .some(c => cleanSearch.toLowerCase().includes(c));

      query.$or = [
        { name: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
        { address: { $regex: searchRegex } },
        { category: { $regex: searchRegex } },
        { city: { $regex: searchRegex } }
      ];

      // Tokenize multi-word queries (e.g. "Historical Forts", "Street food")
      const tokens = cleanSearch.split(/\s+/).filter(t => t.length > 2);
      if (tokens.length > 1) {
        tokens.forEach(t => {
          const tEsc = escapeRegex(t);
          query.$or.push(
            { name: { $regex: tEsc, $options: 'i' } },
            { category: { $regex: tEsc, $options: 'i' } },
            { description: { $regex: tEsc, $options: 'i' } },
            { address: { $regex: tEsc, $options: 'i' } },
            { city: { $regex: tEsc, $options: 'i' } }
          );
        });
      }

      // If user typed a search that contains a known city, don't force city filter
      if (!isKnownCity && city && city !== 'all') {
        query.city = new RegExp(`^${escapeRegex(city)}$`, 'i');
      }
    } else if (city && city !== 'all') {
      query.city = new RegExp(`^${escapeRegex(city)}$`, 'i');
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (priceRange && priceRange !== 'all') {
      query.priceRange = priceRange;
    }

    if (minRating) {
      query['rating.average'] = { $gte: Number(minRating) };
    }

    if (wheelchairAccessible === 'true') {
      query['accessibility.wheelchairAccessible'] = true;
    }

    if (dietary && dietary !== 'all') {
      query.dietaryOptions = dietary;
    }

    let sortOptions = { 'rating.average': -1, 'rating.count': -1 };
    if (sort === 'rating') {
      sortOptions = { 'rating.average': -1 };
    } else if (sort === 'price_asc') {
      sortOptions = { 'estimatedBudget.amount': 1 };
    } else if (sort === 'price_desc') {
      sortOptions = { 'estimatedBudget.amount': -1 };
    } else if (sort === 'newest') {
      sortOptions = { createdAt: -1 };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = Math.min(parseInt(limit, 10) || 30, 100);
    const skip = (pageNum - 1) * limitNum;

    let [places, total] = await Promise.all([
      Place.find(query).sort(sortOptions).skip(skip).limit(limitNum),
      Place.countDocuments(query)
    ]);

    // If zero places found with city constraint, try searching MongoDB across all cities
    if (places.length === 0 && cleanSearch && query.city) {
      const relaxedQuery = { ...query };
      delete relaxedQuery.city;
      const [allCityPlaces, allCityTotal] = await Promise.all([
        Place.find(relaxedQuery).sort(sortOptions).skip(skip).limit(limitNum),
        Place.countDocuments(relaxedQuery)
      ]);
      if (allCityPlaces.length > 0) {
        places = allCityPlaces;
        total = allCityTotal;
      }
    }

    // If still zero places found and user searched a city or term, query OpenStreetMap
    if (places.length === 0 && (cleanSearch || (city && city !== 'all'))) {
      const targetQuery = cleanSearch || city;
      const externalPlaces = await overpassService.searchPlacesInCity(targetQuery, city);
      if (externalPlaces.length > 0) {
        places = externalPlaces;
        total = externalPlaces.length;
      }
    }

    res.json({
      success: true,
      data: places,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1
      }
    });
  } catch (err) {
    next(err);
  }
};

// Get single place by ID or slug
exports.getPlaceById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check external cached places (e.g. osm_...)
    if (id.startsWith('osm_')) {
      const cached = overpassService.getPlaceById(id);
      if (cached) {
        return res.json({
          success: true,
          data: cached
        });
      }
    }

    let place;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      place = await Place.findById(id);
    } else {
      place = await Place.findOne({ slug: id.toLowerCase() });
    }

    if (!place) {
      // Also check overpass cache by slug
      const cached = overpassService.getPlaceById(id);
      if (cached) {
        return res.json({
          success: true,
          data: cached
        });
      }

      return res.status(404).json({
        success: false,
        message: 'Place not found.'
      });
    }

    res.json({
      success: true,
      data: place
    });
  } catch (err) {
    next(err);
  }
};

// Get nearby places using MongoDB 2dsphere $near
exports.getNearbyPlaces = async (req, res, next) => {
  try {
    const { lat, lng, radius = 5000, category, limit = 20 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude (lat) and Longitude (lng) are required query parameters.'
      });
    }

    const query = {
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(radius, 10) // meters
        }
      }
    };

    if (category) {
      query.category = category;
    }

    const places = await Place.find(query).limit(parseInt(limit, 10) || 20);

    res.json({
      success: true,
      count: places.length,
      data: places
    });
  } catch (err) {
    next(err);
  }
};

// Search places
exports.searchPlaces = async (req, res, next) => {
  try {
    const { q, city, nearLat, nearLng } = req.query;

    if (!q || q.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Search term query parameter (q) is required.'
      });
    }

    const cleanQuery = q.trim();
    // Process NLP search intent
    const parsedIntent = aiService.parseSearchIntent(cleanQuery, city);

    const query = {};
    const searchEscaped = escapeRegex(cleanQuery);
    const searchRegex = new RegExp(searchEscaped, 'i');

    const orClauses = [
      { name: searchRegex },
      { description: searchRegex },
      { address: searchRegex },
      { category: searchRegex },
      { city: searchRegex }
    ];

    // Tokenize multi-word queries for resilient partial matching
    const tokens = cleanQuery.split(/\s+/).filter(tok => tok.length > 2);
    if (tokens.length > 1) {
      tokens.forEach(tok => {
        const tokReg = new RegExp(escapeRegex(tok), 'i');
        orClauses.push(
          { name: tokReg },
          { category: tokReg },
          { description: tokReg },
          { address: tokReg }
        );
      });
    }

    // If intent detected a specific category
    if (parsedIntent.category) {
      query.category = parsedIntent.category;
    }

    // If search matches a city name
    if (parsedIntent.city) {
      query.$or = [
        { city: new RegExp(`^${escapeRegex(parsedIntent.city)}$`, 'i') },
        ...orClauses
      ];
    } else {
      query.$or = orClauses;
    }

    if (parsedIntent.accessibilityRequired) {
      query['accessibility.wheelchairAccessible'] = true;
    }

    if (parsedIntent.budgetFilter === 'budget') {
      query.priceRange = { $in: ['Free', '$'] };
    }

    let places = await Place.find(query).limit(30);
    let isExternalSource = false;

    // If zero places found in MongoDB, fall back to OpenStreetMap Nominatim + Overpass live places!
    if (places.length === 0) {
      const searchCity = parsedIntent.city || city || cleanQuery;
      const externalPlaces = await overpassService.searchPlacesInCity(cleanQuery, searchCity);
      if (externalPlaces.length > 0) {
        places = externalPlaces;
        isExternalSource = true;
      }
    }

    // If near coordinates provided or detected
    if ((parsedIntent.nearMe || nearLat) && nearLat && nearLng) {
      places = places.map(p => {
        const coords = p.location?.coordinates;
        if (!coords || coords.length < 2) return p;
        const [pLng, pLat] = coords;
        const R = 6371e3;
        const dLat = ((pLat - Number(nearLat)) * Math.PI) / 180;
        const dLon = ((pLng - Number(nearLng)) * Math.PI) / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos((Number(nearLat) * Math.PI) / 180) * Math.cos((pLat * Math.PI) / 180) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const distM = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const itemObj = p.toObject ? p.toObject() : p;
        return { ...itemObj, distanceMeters: Math.round(distM) };
      }).sort((a, b) => a.distanceMeters - b.distanceMeters);
    }

    res.json({
      success: true,
      query: cleanQuery,
      intentDetected: parsedIntent,
      source: isExternalSource ? 'OpenStreetMap Live Feed' : 'MongoDB Atlas Curated',
      count: places.length,
      data: places
    });
  } catch (err) {
    next(err);
  }
};

// Create new place (Admin / Moderator)
exports.createPlace = async (req, res, next) => {
  try {
    const { name, description, category, address, city, coordinates, images, priceRange, estimatedBudget, accessibility, openingHours, historicalDetails, dietaryOptions } = req.body;

    if (!name || !description || !category || !address || !city || !coordinates) {
      return res.status(400).json({
        success: false,
        message: 'Name, description, category, address, city, and coordinates [lng, lat] are required.'
      });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const place = await Place.create({
      name,
      slug: `${slug}-${Date.now().toString().slice(-4)}`,
      description,
      category,
      address,
      city,
      location: {
        type: 'Point',
        coordinates: [Number(coordinates[0]), Number(coordinates[1])]
      },
      images: images || [],
      priceRange: priceRange || 'Data unavailable',
      estimatedBudget: estimatedBudget || {},
      accessibility: accessibility || {},
      openingHours: openingHours || 'Operating hours vary',
      historicalDetails: historicalDetails || {},
      dietaryOptions: dietaryOptions || [],
      source: 'City Life Curated',
      verificationStatus: 'admin_curated'
    });

    await AuditLog.create({
      actorId: req.user._id,
      action: 'PLACE_CREATE',
      resourceType: 'Place',
      resourceId: place._id.toString(),
      metadata: { name: place.name, city: place.city }
    });

    res.status(201).json({
      success: true,
      data: place
    });
  } catch (err) {
    next(err);
  }
};

// Update place (Admin / Moderator)
exports.updatePlace = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (updates.coordinates) {
      updates.location = {
        type: 'Point',
        coordinates: [Number(updates.coordinates[0]), Number(updates.coordinates[1])]
      };
      delete updates.coordinates;
    }

    const place = await Place.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

    if (!place) {
      return res.status(404).json({
        success: false,
        message: 'Place not found.'
      });
    }

    await AuditLog.create({
      actorId: req.user._id,
      action: 'PLACE_UPDATE',
      resourceType: 'Place',
      resourceId: place._id.toString(),
      metadata: { fields: Object.keys(updates) }
    });

    res.json({
      success: true,
      data: place
    });
  } catch (err) {
    next(err);
  }
};

// Delete place (Admin only)
exports.deletePlace = async (req, res, next) => {
  try {
    const { id } = req.params;
    const place = await Place.findByIdAndDelete(id);

    if (!place) {
      return res.status(404).json({
        success: false,
        message: 'Place not found.'
      });
    }

    await AuditLog.create({
      actorId: req.user._id,
      action: 'PLACE_DELETE',
      resourceType: 'Place',
      resourceId: id,
      metadata: { name: place.name }
    });

    res.json({
      success: true,
      message: 'Place removed successfully.'
    });
  } catch (err) {
    next(err);
  }
};

// Safer Route planning between coordinates
exports.getSaferRoute = async (req, res, next) => {
  try {
    const { startLng, startLat, endLng, endLat, mode = 'driving' } = req.body;

    if (startLng === undefined || startLat === undefined || endLng === undefined || endLat === undefined) {
      return res.status(400).json({
        success: false,
        message: 'startLng, startLat, endLng, and endLat are required.'
      });
    }

    const result = await routingService.getRoute(
      [Number(startLng), Number(startLat)],
      [Number(endLng), Number(endLat)],
      mode
    );

    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    next(err);
  }
};
