const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    match: [/^\+92[0-9]{10}$/, 'Please provide a valid Pakistani phone number']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    enum: [
      'Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 
      'Multan', 'Hyderabad', 'Quetta', 'Peshawar', 'Gujranwala',
      'Sialkot', 'Sargodha', 'Bahawalpur', 'Sukkur', 'Larkana'
    ]
  },
  avatar: {
    type: String,
    default: null
  },
  rating: {
    type: Number,
    default: 5.0,
    min: 1,
    max: 5
  },
  totalRides: {
    type: Number,
    default: 0
  },
  totalSpent: {
    type: Number,
    default: 0
  },
  wallet: {
    balance: {
      type: Number,
      default: 0,
      min: 0
    },
    currency: {
      type: String,
      default: 'PKR'
    }
  },
  preferences: {
    language: {
      type: String,
      enum: ['en', 'ur'],
      default: 'en'
    },
    notifications: {
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      email: { type: Boolean, default: true }
    }
  },
  fcmTokens: [{
    token: String,
    device: String,
    createdAt: { type: Date, default: Date.now }
  }],
  stripeCustomerId: {
    type: String,
    default: null
  },
  referralCode: {
    type: String,
    unique: true,
    sparse: true
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
userSchema.index({ phone: 1 });
userSchema.index({ email: 1 });
userSchema.index({ city: 1 });
userSchema.index({ referralCode: 1 });

// Virtual for average rating
userSchema.virtual('averageRating').get(function() {
  return Math.round(this.rating * 10) / 10;
});

// Generate referral code before saving
userSchema.pre('save', function(next) {
  if (this.isNew && !this.referralCode) {
    this.referralCode = `RP${this._id.toString().slice(-6).toUpperCase()}`;
  }
  next();
});

// Methods
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.__v;
  return user;
};

userSchema.methods.addFCMToken = function(token, device) {
  // Remove existing token for this device
  this.fcmTokens = this.fcmTokens.filter(t => t.device !== device);
  
  // Add new token
  this.fcmTokens.push({ token, device });
  
  // Keep only last 5 tokens
  if (this.fcmTokens.length > 5) {
    this.fcmTokens = this.fcmTokens.slice(-5);
  }
  
  return this.save();
};

userSchema.methods.updateWallet = function(amount, type = 'add') {
  if (type === 'add') {
    this.wallet.balance += amount;
  } else if (type === 'subtract') {
    this.wallet.balance = Math.max(0, this.wallet.balance - amount);
  }
  return this.save();
};

module.exports = mongoose.model('User', userSchema);