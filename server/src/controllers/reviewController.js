const mongoose = require('mongoose');
const Review = require('../models/Review');
const Place = require('../models/Place');

// Helper to recalculate place average rating
async function updatePlaceRating(placeId) {
  const stats = await Review.aggregate([
    { $match: { placeId: placeId, moderationStatus: 'approved' } },
    {
      $group: {
        _id: '$placeId',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await Place.findByIdAndUpdate(placeId, {
      'rating.average': parseFloat(stats[0].avgRating.toFixed(1)),
      'rating.count': stats[0].count
    });
  } else {
    await Place.findByIdAndUpdate(placeId, {
      'rating.average': 0,
      'rating.count': 0
    });
  }
}

exports.createReview = async (req, res, next) => {
  try {
    const { placeId, rating, comment } = req.body;

    if (!placeId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'placeId, rating (1-5), and comment are required.'
      });
    }

    const place = await Place.findById(placeId);
    if (!place) {
      return res.status(404).json({
        success: false,
        message: 'Place not found.'
      });
    }

    // Check if user already reviewed
    const existing = await Review.findOne({ userId: req.user._id, placeId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this location. You can edit your existing review.'
      });
    }

    const review = await Review.create({
      userId: req.user._id,
      placeId,
      rating: Number(rating),
      comment: comment.trim(),
      moderationStatus: 'approved'
    });

    await updatePlaceRating(placeId);

    const populated = await Review.findById(review._id).populate('userId', 'name profileImage');

    res.status(201).json({
      success: true,
      data: populated
    });
  } catch (err) {
    next(err);
  }
};

exports.getReviewsByPlace = async (req, res, next) => {
  try {
    const { placeId } = req.params;

    if (!placeId || !mongoose.Types.ObjectId.isValid(placeId)) {
      return res.json({
        success: true,
        count: 0,
        data: []
      });
    }

    const reviews = await Review.find({ placeId, moderationStatus: 'approved' })
      .populate('userId', 'name profileImage')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (err) {
    next(err);
  }
};

exports.updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found.'
      });
    }

    if (review.userId.toString() !== req.user._id.toString() && !['admin', 'moderator'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to edit this review.'
      });
    }

    if (rating) review.rating = Number(rating);
    if (comment) review.comment = comment.trim();

    await review.save();
    await updatePlaceRating(review.placeId);

    res.json({
      success: true,
      data: review
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found.'
      });
    }

    if (review.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to delete this review.'
      });
    }

    const placeId = review.placeId;
    await Review.findByIdAndDelete(id);
    await updatePlaceRating(placeId);

    res.json({
      success: true,
      message: 'Review deleted.'
    });
  } catch (err) {
    next(err);
  }
};
