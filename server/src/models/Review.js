const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    placeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Place',
      required: true,
      index: true
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    moderationStatus: {
      type: String,
      enum: ['approved', 'pending', 'flagged'],
      default: 'approved'
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate review per user per place
reviewSchema.index({ userId: 1, placeId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
