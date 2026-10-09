const axios = require('axios');

// Lexicon for baseline rule-based / keyword NLP classification
const CATEGORY_KEYWORDS = {
  'Road accident': ['accident', 'crash', 'collision', 'hit and run', 'overturned', 'bike fell', 'injury', 'ambulance', 'traffic jam due to crash', 'skidded'],
  'Dangerous road': ['pothole', 'open manhole', 'broken road', 'cave in', 'tarmac missing', 'speed breaker unpainted', 'crater', 'ditch', 'damaged asphalt'],
  'Poor street lighting': ['dark', 'street light', 'streetlight', 'no light', 'pitch black', 'bulb broken', 'lamp off', 'dim light', 'night visibility'],
  'Harassment or public disturbance': ['harassment', 'eve teasing', 'catcalling', 'loud noise', 'brawl', 'fight', 'drunk', 'unsafe crowd', 'nuisance', 'stalking'],
  'Flooding': ['flood', 'water level', 'river overflow', 'submerged', 'inundated', 'deluge', 'current', 'canal broke'],
  'Waterlogging': ['waterlogged', 'water logging', 'water puddles', 'clogged drain', 'rain water', 'blocked gutter', 'water pooling'],
  'Suspicious activity': ['theft', 'burglary', 'vandalism', 'suspicious person', 'loitering', 'drug', 'unattended bag', 'prowler'],
  'Infrastructure hazard': ['fallen tree', 'hanging wire', 'electric pole leaning', 'transformer spark', 'broken bridge', 'wall collapse', 'loose cable', 'scaffolding collapsed']
};

/**
 * Calculates Haversine distance in meters between two lat/lng coordinates
 */
function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Calculate Jaccard text similarity between two strings
 */
function calculateTextSimilarity(text1, text2) {
  if (!text1 || !text2) return 0;
  const set1 = new Set(text1.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean));
  const set2 = new Set(text2.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean));

  if (set1.size === 0 || set2.size === 0) return 0;
  let intersection = 0;
  for (const token of set1) {
    if (set2.has(token)) intersection++;
  }
  const union = new Set([...set1, ...set2]).size;
  return union === 0 ? 0 : intersection / union;
}

class AIService {
  constructor() {
    this.pythonServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    this.timeoutMs = 3000;
  }

  /**
   * Health check for AI subsystem
   */
  async checkHealth() {
    try {
      const response = await axios.get(`${this.pythonServiceUrl}/health`, { timeout: 1500 });
      return {
        provider: 'Python FastAPI NLP Service',
        status: 'online',
        details: response.data
      };
    } catch (err) {
      return {
        provider: 'Node.js Modular NLP Baseline Service',
        status: 'online_fallback',
        details: 'Python microservice unreachable or not running; baseline engine active.'
      };
    }
  }

  /**
   * Classify incident report
   */
  async classifyReport(title, description) {
    // Attempt Python service first if available
    try {
      const response = await axios.post(`${this.pythonServiceUrl}/classify`, {
        title,
        description
      }, { timeout: this.timeoutMs });

      if (response.data && response.data.predictedCategory) {
        return {
          ...response.data,
          source: 'fastapi_ml_service'
        };
      }
    } catch (e) {
      // Fallback to documented Node baseline classifier
    }

    const combinedText = `${title || ''} ${description || ''}`.toLowerCase();
    let bestCategory = 'Other public safety concern';
    let highestScore = 0;

    for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      let matches = 0;
      for (const kw of keywords) {
        if (combinedText.includes(kw)) {
          matches++;
        }
      }
      if (matches > highestScore) {
        highestScore = matches;
        bestCategory = cat;
      }
    }

    const confidence = highestScore >= 3 ? 0.92 : highestScore === 2 ? 0.78 : highestScore === 1 ? 0.62 : 0.40;
    const requiresManualReview = confidence < 0.70;

    return {
      predictedCategory: bestCategory,
      confidence: parseFloat(confidence.toFixed(2)),
      processingStatus: requiresManualReview ? 'marked_for_manual_review' : 'automated_high_confidence',
      source: 'baseline_nlp_engine',
      matchedScore: highestScore
    };
  }

  /**
   * Estimate triage priority
   */
  estimatePriority(category, severity, details, corroborationCount = 0) {
    let score = 0;

    // Severity weighting
    if (severity === 'critical') score += 40;
    else if (severity === 'high') score += 30;
    else if (severity === 'medium') score += 15;
    else score += 5;

    // Category weighting
    if (['Road accident', 'Flooding', 'Infrastructure hazard'].includes(category)) score += 35;
    else if (['Dangerous road', 'Harassment or public disturbance'].includes(category)) score += 25;
    else if (['Waterlogging', 'Poor street lighting'].includes(category)) score += 15;
    else score += 10;

    // Corroboration boost
    score += Math.min(corroborationCount * 10, 25);

    let priority = 'low';
    if (score >= 65) priority = 'urgent';
    else if (score >= 45) priority = 'high';
    else if (score >= 25) priority = 'medium';

    return {
      priority,
      score,
      label: 'Automated Triage Recommendation',
      disclaimer: 'This is an algorithmic triage suggestion for moderators, not a confirmed emergency service dispatch.'
    };
  }

  /**
   * Detect potential duplicates among recent reports
   */
  findDuplicateCandidates(newReport, existingReports, maxDistanceMeters = 500, timeWindowHours = 48) {
    const candidates = [];
    const newCoords = newReport.location?.coordinates; // [lng, lat]
    if (!newCoords || newCoords.length < 2) return candidates;

    const newTime = new Date(newReport.reportedAt || Date.now()).getTime();

    for (const report of existingReports) {
      if (report._id && report._id.toString() === (newReport._id ? newReport._id.toString() : '')) continue;
      if (report.status === 'rejected' || report.status === 'resolved') continue;

      const reportCoords = report.location?.coordinates;
      if (!reportCoords || reportCoords.length < 2) continue;

      const distance = calculateDistanceMeters(newCoords[1], newCoords[0], reportCoords[1], reportCoords[0]);
      const reportTime = new Date(report.reportedAt).getTime();
      const diffHours = Math.abs(newTime - reportTime) / (1000 * 60 * 60);

      if (distance <= maxDistanceMeters && diffHours <= timeWindowHours) {
        const textSim = calculateTextSimilarity(
          `${newReport.title} ${newReport.description}`,
          `${report.title} ${report.description}`
        );

        const categoryMatch = newReport.category === report.category;

        if (categoryMatch || textSim > 0.35) {
          candidates.push({
            existingReportId: report._id,
            title: report.title,
            category: report.category,
            distanceMeters: Math.round(distance),
            textSimilarity: parseFloat(textSim.toFixed(2)),
            hoursApart: parseFloat(diffHours.toFixed(1))
          });
        }
      }
    }

    return candidates;
  }

  /**
   * Smart Search Intent Extractor
   */
  parseSearchIntent(query, userCity = 'Pune') {
    const q = (query || '').toLowerCase().trim();
    const intent = {
      originalQuery: query,
      category: null,
      city: null,
      budgetFilter: null,
      accessibilityRequired: false,
      nearMe: false,
      isHazardQuery: false,
      extractedKeywords: []
    };

    if (q.includes('near me') || q.includes('nearby') || q.includes('close to me')) {
      intent.nearMe = true;
    }

    // Detect cities
    const knownCities = [
      'pune', 'mumbai', 'delhi', 'bengaluru', 'bangalore', 'chennai', 'hyderabad',
      'kolkata', 'jaipur', 'goa', 'ahmedabad', 'chandigarh', 'surat', 'lucknow',
      'varanasi', 'agra', 'kochi', 'amritsar', 'shimla', 'manali', 'nagpur', 'nashik'
    ];
    for (const city of knownCities) {
      if (q.includes(city)) {
        intent.city = city === 'bangalore' ? 'Bengaluru' : city.charAt(0).toUpperCase() + city.slice(1);
        break;
      }
    }

    // Dynamic city matching if pattern "in <city>" or single word query without category words
    if (!intent.city) {
      const inMatch = q.match(/\bin\s+([a-zA-Z]+)/);
      if (inMatch) {
        intent.city = inMatch[1].charAt(0).toUpperCase() + inMatch[1].slice(1);
      } else if (!q.includes(' ') && q.length > 2 && !['food', 'hotel', 'park', 'cafe', 'stay', 'fort', 'near'].includes(q)) {
        intent.city = q.charAt(0).toUpperCase() + q.slice(1);
      }
    }

    // Detect categories
    if (q.includes('food') || q.includes('eat') || q.includes('restaurant') || q.includes('dining')) {
      intent.category = q.includes('street') ? 'Street food' : 'Restaurants';
    } else if (q.includes('cafe') || q.includes('coffee') || q.includes('tea')) {
      intent.category = 'Cafes';
    } else if (q.includes('hotel') || q.includes('stay') || q.includes('resort') || q.includes('hostel')) {
      intent.category = (q.includes('cheap') || q.includes('budget')) ? 'Budget stays' : 'Hotels';
    } else if (q.includes('history') || q.includes('historical') || q.includes('monument') || q.includes('fort') || q.includes('heritage')) {
      intent.category = 'Historical landmarks';
    } else if (q.includes('tourist') || q.includes('sightseeing') || q.includes('attraction')) {
      intent.category = 'Tourist attractions';
    } else if (q.includes('park') || q.includes('garden')) {
      intent.category = 'Parks';
    } else if (q.includes('hospital') || q.includes('clinic') || q.includes('emergency')) {
      intent.category = 'Hospitals';
    } else if (q.includes('police')) {
      intent.category = 'Police stations';
    } else if (q.includes('hazard') || q.includes('pothole') || q.includes('accident') || q.includes('danger') || q.includes('unsafe')) {
      intent.isHazardQuery = true;
    }

    // Budget
    if (q.includes('cheap') || q.includes('budget') || q.includes('affordable') || q.includes('low cost')) {
      intent.budgetFilter = 'budget';
    } else if (q.includes('luxury') || q.includes('fine dine') || q.includes('expensive')) {
      intent.budgetFilter = 'luxury';
    }

    // Accessibility
    if (q.includes('wheelchair') || q.includes('accessible') || q.includes('handicap')) {
      intent.accessibilityRequired = true;
    }

    return intent;
  }

  /**
   * Recommendation Engine with transparent rationales
   */
  generateRecommendations(places, userPreferences = {}) {
    const { category, maxBudget, wheelchairAccessible, userCoords } = userPreferences;

    const scored = places.map(place => {
      let score = 50; // base score
      const reasons = [];

      // Rating boost
      const avgRating = place.rating?.average || 0;
      if (avgRating >= 4.5) {
        score += 25;
        reasons.push(`Top-rated community rating (${avgRating}★)`);
      } else if (avgRating >= 4.0) {
        score += 15;
        reasons.push(`Highly rated by visitors (${avgRating}★)`);
      }

      // Category matching
      if (category && place.category === category) {
        score += 30;
        reasons.push(`Matches your interest in ${category}`);
      }

      // Accessibility match
      if (wheelchairAccessible && place.accessibility?.wheelchairAccessible) {
        score += 20;
        reasons.push('Verified wheelchair accessible facilities');
      }

      // Budget check
      if (maxBudget && place.estimatedBudget?.amount) {
        if (place.estimatedBudget.amount <= maxBudget) {
          score += 15;
          reasons.push(`Within requested budget limit (₹${place.estimatedBudget.amount})`);
        }
      }

      // Distance calculation if userCoords provided
      let distanceMeters = null;
      if (userCoords && userCoords.lat && userCoords.lng && place.location?.coordinates) {
        const [pLng, pLat] = place.location.coordinates;
        distanceMeters = calculateDistanceMeters(userCoords.lat, userCoords.lng, pLat, pLng);
        if (distanceMeters < 3000) {
          score += 20;
          reasons.push(`Close proximity (${(distanceMeters / 1000).toFixed(1)} km away)`);
        }
      }

      if (reasons.length === 0) {
        reasons.push('Popular destination in the city');
      }

      return {
        place,
        score,
        distanceMeters,
        recommendationRationale: reasons.join(' • ')
      };
    });

    // Sort descending by score
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 10);
  }

  /**
   * Citizen Feedback and Review Analysis
   */
  analyzeFeedback(items) {
    if (!items || items.length === 0) {
      return {
        sampleSize: 0,
        message: 'Insufficient feedback data to compute reliable theme analysis.',
        topThemes: []
      };
    }

    const wordCounts = {};
    const stopWords = new Set(['the', 'and', 'is', 'in', 'to', 'of', 'a', 'it', 'was', 'for', 'on', 'with', 'at', 'by', 'this', 'that', 'i', 'my', 'very', 'good', 'bad']);

    items.forEach(item => {
      const text = `${item.comment || item.description || ''}`.toLowerCase();
      const words = text.replace(/[^\w\s]/g, '').split(/\s+/);
      words.forEach(w => {
        if (w.length > 3 && !stopWords.has(w)) {
          wordCounts[w] = (wordCounts[w] || 0) + 1;
        }
      });
    });

    const sortedThemes = Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([term, count]) => ({
        term,
        mentions: count,
        relevance: parseFloat((count / items.length).toFixed(2))
      }));

    return {
      sampleSize: items.length,
      methodology: 'Keyword frequency clustering with stopword suppression',
      topThemes: sortedThemes
    };
  }
}

module.exports = new AIService();
