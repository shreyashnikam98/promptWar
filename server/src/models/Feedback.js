const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    targetType: {
      type: String,
      enum: ['report', 'place', 'platform'],
      required: true
    },
    targetId: {
      type: String,
      default: ''
    },
    feedbackType: {
      type: String,
      enum: ['accuracy_confirm', 'incorrect_info', 'duplicate_flag', 'resolved_confirmation', 'general'],
      required: true
    },
    details: {
      type: String,
      required: true,
      maxlength: 1000
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Feedback', feedbackSchema);
