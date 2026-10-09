const Place = require('../models/Place');
const Report = require('../models/Report');
const Review = require('../models/Review');
const User = require('../models/User');

exports.getSummary = async (req, res, next) => {
  try {
    const { city } = req.query;
    const placeMatch = {};
    const reportMatch = {};

    if (city && city !== 'all') {
      placeMatch.city = new RegExp(`^${city}$`, 'i');
      reportMatch.city = new RegExp(`^${city}$`, 'i');
    }

    const [
      totalPlaces,
      totalReports,
      pendingReports,
      verifiedReports,
      resolvedReports,
      rejectedReports,
      totalUsers,
      totalReviews,
      avgRatingData,
      recentActivity
    ] = await Promise.all([
      Place.countDocuments(placeMatch),
      Report.countDocuments(reportMatch),
      Report.countDocuments({ ...reportMatch, status: 'pending' }),
      Report.countDocuments({ ...reportMatch, status: 'verified' }),
      Report.countDocuments({ ...reportMatch, status: 'resolved' }),
      Report.countDocuments({ ...reportMatch, status: 'rejected' }),
      User.countDocuments(),
      Review.countDocuments(),
      Place.aggregate([
        { $match: placeMatch },
        { $match: { 'rating.count': { $gt: 0 } } },
        { $group: { _id: null, avg: { $avg: '$rating.average' } } }
      ]),
      Report.find(reportMatch).sort({ reportedAt: -1 }).limit(6).select('title category severity status city reportedAt')
    ]);

    res.json({
      success: true,
      data: {
        totalPlaces,
        totalReports,
        pendingReports,
        verifiedReports,
        resolvedReports,
        rejectedReports,
        totalUsers,
        totalReviews,
        averageRating: avgRatingData.length > 0 ? parseFloat(avgRatingData[0].avg.toFixed(2)) : 0,
        recentActivity
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getReportAnalytics = async (req, res, next) => {
  try {
    const { city, days = 30 } = req.query;
    const match = {};

    if (city && city !== 'all') {
      match.city = new RegExp(`^${city}$`, 'i');
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days, 10));
    match.reportedAt = { $gte: startDate };

    // Reports grouped by category
    const byCategory = await Report.aggregate([
      { $match: match },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Reports grouped by severity
    const bySeverity = await Report.aggregate([
      { $match: match },
      { $group: { _id: '$severity', count: { $sum: 1 } } }
    ]);

    // Reports grouped by status
    const byStatus = await Report.aggregate([
      { $match: match },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Reports timeline (by day)
    const timeline = await Report.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$reportedAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Top reported areas
    const topAreas = await Report.aggregate([
      { $match: match },
      { $group: { _id: '$address', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 7 }
    ]);

    res.json({
      success: true,
      data: {
        byCategory: byCategory.map(c => ({ category: c._id, count: c.count })),
        bySeverity: bySeverity.map(s => ({ severity: s._id, count: s.count })),
        byStatus: byStatus.map(st => ({ status: st._id, count: st.count })),
        timeline: timeline.map(t => ({ date: t._id, reports: t.count })),
        topAreas: topAreas.map(a => ({ area: a._id || 'General City Area', count: a.count }))
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getCategoryAnalytics = async (req, res, next) => {
  try {
    const { city } = req.query;
    const match = {};

    if (city && city !== 'all') {
      match.city = new RegExp(`^${city}$`, 'i');
    }

    // Places by category
    const placesByCategory = await Place.aggregate([
      { $match: match },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Places by price range
    const priceDistribution = await Place.aggregate([
      { $match: match },
      { $group: { _id: '$priceRange', count: { $sum: 1 } } }
    ]);

    // Historical & cultural places count
    const historicalCount = await Place.countDocuments({
      ...match,
      category: { $in: ['Historical landmarks', 'Cultural locations'] }
    });

    res.json({
      success: true,
      data: {
        placesByCategory: placesByCategory.map(c => ({ category: c._id, count: c.count })),
        priceDistribution: priceDistribution.map(p => ({ priceRange: p._id, count: p.count })),
        historicalCount
      }
    });
  } catch (err) {
    next(err);
  }
};
