const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required']
    },
    role: {
      type: String,
      enum: ['user', 'moderator', 'admin'],
      default: 'user'
    },
    profileImage: {
      type: String,
      default: ''
    },
    preferences: {
      city: { type: String, default: 'Pune' },
      dietary: { type: String, default: 'all' },
      accessibilityNeeds: { type: Boolean, default: false },
      emailNotifications: { type: Boolean, default: true }
    }
  },
  {
    timestamps: true
  }
);

userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.passwordHash;
  return user;
};

module.exports = mongoose.model('User', userSchema);
