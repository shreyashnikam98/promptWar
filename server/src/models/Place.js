const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Place name is required'],
      trim: true,
      index: true
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
      index: true
    },
    description: {
      type: String,
      required: [true, 'Description is required']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Tourist attractions',
        'Restaurants',
        'Street food',
        'Cafes',
        'Hotels',
        'Budget stays',
        'Shopping',
        'Parks',
        'Hospitals',
        'Police stations',
        'Public transport',
        'Historical landmarks',
        'Cultural locations',
        'Public facilities'
      ],
      index: true
    },
    address: {
      type: String,
      required: [true, 'Address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      index: true
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
        required: true
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
      }
    },
    images: [{
      type: String
    }],
    priceRange: {
      type: String,
      enum: ['Free', '$', '$$', '$$$', '$$$$', 'Data unavailable'],
      default: 'Data unavailable'
    },
    estimatedBudget: {
      amount: { type: Number, default: 0 },
      currency: { type: String, default: 'INR' },
      source: { type: String, default: 'Curated estimate' }
    },
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 }
    },
    accessibility: {
      wheelchairAccessible: { type: Boolean, default: false },
      brailleSignage: { type: Boolean, default: false },
      accessibleRestrooms: { type: Boolean, default: false },
      details: { type: String, default: '' }
    },
    openingHours: {
      type: String,
      default: 'Operating hours vary; check local listings'
    },
    isVerifiedHours: {
      type: Boolean,
      default: false
    },
    historicalDetails: {
      period: { type: String, default: '' },
      architect: { type: String, default: '' },
      yearBuilt: { type: String, default: '' },
      heritageSignificance: { type: String, default: '' },
      festivalsCelebrated: [{ type: String }]
    },
    dietaryOptions: [{
      type: String,
      enum: ['Vegetarian', 'Vegan', 'Halal', 'Jain friendly', 'Non-Vegetarian']
    }],
    cleanlinessRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 4.0
    },
    source: {
      type: String,
      default: 'City Life Curated'
    },
    sourceUrl: {
      type: String,
      default: ''
    },
    verificationStatus: {
      type: String,
      enum: ['unverified', 'verified_public', 'admin_curated'],
      default: 'admin_curated'
    }
  },
  {
    timestamps: true
  }
);

// Create 2dsphere index for location queries
placeSchema.index({ location: '2dsphere' });
placeSchema.index({ city: 1, category: 1 });
placeSchema.index({ name: 'text', description: 'text', address: 'text' });

module.exports = mongoose.model('Place', placeSchema);
