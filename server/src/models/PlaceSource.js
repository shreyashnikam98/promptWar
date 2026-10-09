const mongoose = require('mongoose');

const placeSourceSchema = new mongoose.Schema(
  {
    placeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Place',
      required: true,
      index: true
    },
    provider: {
      type: String,
      required: true, // e.g. 'OpenStreetMap', 'Overpass', 'Curated'
      index: true
    },
    externalId: {
      type: String,
      default: ''
    },
    sourceUrl: {
      type: String,
      default: ''
    },
    lastSyncedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('PlaceSource', placeSourceSchema);
