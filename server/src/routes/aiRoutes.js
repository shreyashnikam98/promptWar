const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');
const Place = require('../models/Place');
const Review = require('../models/Review');
const Report = require('../models/Report');

// Subsystem health check
router.get('/health', async (req, res) => {
  const health = await aiService.checkHealth();
  res.json({
    success: true,
    data: health
  });
});

// Classify complaint / report
router.post('/classify-report', async (req, res, next) => {
  try {
    const { title, description, category, severity } = req.body;

    if (!title && !description) {
      return res.status(400).json({
        success: false,
        message: 'Title or description is required for classification.'
      });
    }

    const classification = await aiService.classifyReport(title, description);
    const triage = aiService.estimatePriority(
      category || classification.predictedCategory,
      severity || 'medium',
      description
    );

    res.json({
      success: true,
      classification,
      triage
    });
  } catch (err) {
    next(err);
  }
});

// Smart search intent
router.post('/search', async (req, res, next) => {
  try {
    const { query, city } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Query string is required.'
      });
    }

    const intent = aiService.parseSearchIntent(query, city);

    // Fetch places matching the intent
    const dbQuery = {};
    if (intent.city) dbQuery.city = new RegExp(`^${intent.city}$`, 'i');
    if (intent.category) dbQuery.category = intent.category;
    if (intent.accessibilityRequired) dbQuery['accessibility.wheelchairAccessible'] = true;
    if (intent.budgetFilter === 'budget') dbQuery.priceRange = { $in: ['Free', '$'] };

    const places = await Place.find(dbQuery).limit(20);

    res.json({
      success: true,
      intent,
      results: places
    });
  } catch (err) {
    next(err);
  }
});

// Recommendation engine
router.post('/recommendations', async (req, res, next) => {
  try {
    const { category, maxBudget, wheelchairAccessible, city, userCoords } = req.body;

    const query = {};
    if (city) {
      query.city = new RegExp(`^${city}$`, 'i');
    }

    const candidatePlaces = await Place.find(query).limit(100);

    const recommendations = aiService.generateRecommendations(candidatePlaces, {
      category,
      maxBudget,
      wheelchairAccessible,
      userCoords
    });

    res.json({
      success: true,
      count: recommendations.length,
      data: recommendations
    });
  } catch (err) {
    next(err);
  }
});

// Analyze citizen feedback / reviews
router.post('/analyze-feedback', async (req, res, next) => {
  try {
    const { placeId, city } = req.body;
    let items = [];

    if (placeId) {
      items = await Review.find({ placeId, moderationStatus: 'approved' }).select('comment');
    } else {
      const query = {};
      if (city) query.city = new RegExp(`^${city}$`, 'i');
      items = await Report.find(query).select('description').limit(100);
    }

    const analysis = aiService.analyzeFeedback(items);

    res.json({
      success: true,
      data: analysis
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
