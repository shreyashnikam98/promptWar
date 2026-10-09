const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema(
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
    }
  },
  {
    timestamps: true
  }
);

favoriteSchema.index({ userId: 1, placeId: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
