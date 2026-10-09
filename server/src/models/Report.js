const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Report category is required'],
      enum: [
        'Road accident',
        'Dangerous road',
        'Poor street lighting',
        'Harassment or public disturbance',
        'Flooding',
        'Waterlogging',
        'Suspicious activity',
        'Infrastructure hazard',
        'Other public safety concern'
      ],
      index: true
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
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
    address: {
      type: String,
      default: 'Location on map'
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      index: true
    },
    images: [{
      type: String
    }],
    voiceNoteUrl: {
      type: String,
      default: null
    },
    voiceNoteDuration: {
      type: Number,
      default: 0
    },
    reportedAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    status: {
      type: String,
      enum: ['pending', 'under_review', 'verified', 'rejected', 'resolved'],
      default: 'pending',
      index: true
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    classification: {
      predictedCategory: { type: String, default: null },
      confidence: { type: Number, default: 0 },
      isAutomated: { type: Boolean, default: false }
    },
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    reporterName: {
      type: String,
      default: 'Anonymous Citizen'
    },
    verification: {
      verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      verifiedAt: { type: Date, default: null },
      notes: { type: String, default: '' },
      confidenceScore: { type: Number, default: 0 }
    },
    moderationNotes: [{
      author: { type: String },
      action: { type: String },
      note: { type: String },
      timestamp: { type: Date, default: Date.now }
    }],
    communityConfirmations: {
      count: { type: Number, default: 0 },
      confirmedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    },
    isDuplicateCandidate: {
      type: Boolean,
      default: false
    },
    duplicateOfReportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Report',
      default: null
    }
  },
  {
    timestamps: true
  }
);

reportSchema.index({ location: '2dsphere' });
reportSchema.index({ city: 1, status: 1 });
reportSchema.index({ reportedAt: -1 });

module.exports = mongoose.model('Report', reportSchema);
