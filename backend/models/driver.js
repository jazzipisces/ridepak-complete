const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  cnic: {
    type: String,
    required: [true, 'CNIC is required'],
    unique: true,
    match: [/^[0-9]{5}-[0-9]{7}-[0-9]$/, 'Please provide a valid CNIC format (xxxxx-xxxxxxx-x)']
  },
  licenseNumber: {
    type: String,
    required: [true, 'License number is required'],
    unique: true
  },
  licenseExpiry: {
    type: Date,
    required: [true, 'License expiry date is required'],
    validate: {
      validator: function(date) {
        return date > new Date();
      },
      message: 'License expiry date must be in the future'
    }
  },
  vehicle: {
    make: {
      type: String,
      required: [true, 'Vehicle make is required'],
      enum: ['Honda', 'Toyota', 'Suzuki', 'Hyundai', 'KIA', 'Nissan', 'Mitsubishi']
    },
    model: {
      type: String,
      required: [true, 'Vehicle model is required']
    },
    year: {
      type: Number,
      required: [true, 'Vehicle year is required'],
      min: [2005, 'Vehicle must be 2005 or newer'],
      max: [new Date().getFullYear(), 'Invalid vehicle year']
    },
    color: {
      type: String,
      required: [true, 'Vehicle color is required']
    },
    licensePlate: {
      type: String,
      required: [true, 'License plate is required'],
      unique: true,
      uppercase: true
    },
    seatingCapacity: {
      type: Number,
      default: 4,
      min: 1,
      max: 8
    }
  },
  documents: {
    cnic: {
      front: { type: String, default: null },
      back: { type: String, default: null },
      verified: { type: Boolean, default: false },
      verifiedAt: { type: Date, default: null }
    },
    drivingLicense: {
      image: { type: String, default: null },
      verified: { type: Boolean, default: false },
      verifiedAt: { type: Date, default: null }
    },
    vehicleRegistration: {
      image: { type: String, default: null },
      verified: { type: Boolean, default: false },
      verifiedAt: { type: Date, default: null }
    },
    vehicleInsurance: {
      image: { type: String, default: null },
      verified: { type: Boolean, default: false },
      verifiedAt: { type: Date, default: null },
      expiryDate: { type: Date, default: null }
    }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'suspended', 'rejected'],
    default: 'pending'
  },
  approvedAt: {
    type: Date,
    default: null
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    },
    lastUpdate: {
      type: Date,
      default: Date.now
    }
  },
  workingHours: {
    start: { type: String, default: '06:00' },
    end: { type: String, default: '22:00' },
    timezone: { type: String, default: 'Asia/Karachi' }
  },
  earnings: {
    today: { type: Number, default: 0 },
    week: { type: Number, default: 0 },
    month: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
  },
  stats: {
    totalRides: { type: Number, default: 0 },
    completedRides: { type: Number, default: 0 },
    cancelledRides: { type: Number, default: 0 },
    rating: { type: Number, default: 5.0, min: 1, max: 5 },
    totalRatings: { type: Number, default: 0 },
    ratingSum: { type: Number, default: 0 },
    acceptanceRate: { type: Number, default: 100 },
    completionRate: { type: Number, default: 100 }
  },
  bankDetails: {
    accountTitle: { type: String, default: null },
    accountNumber: { type: String, default: null },
    bankName: { type: String, default: null },
    branchCode: { type: String, default: null }
  },
  stripeAccountId: {
    type: String,
    default: null
  },
  emergencyContact: {
    name: { type: String, default: null },
    phone: { type: String, default: null },
    relationship: { type: String, default: null }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
driverSchema.index({ userId: 1 });
driverSchema.index({ status: 1 });
driverSchema.index({ isOnline: 1 });
driverSchema.index({ 'vehicle.licensePlate': 1 });
driverSchema.index({ currentLocation: '2dsphere' });

// Virtual for full vehicle info
driverSchema.virtual('vehicleInfo').get(function() {
  return `${this.vehicle.color} ${this.vehicle.make} ${this.vehicle.model} ${this.vehicle.year}`;
});

// Virtual for documents completion
driverSchema.virtual('documentsComplete').get(function() {
  const docs = this.documents;
  return docs.cnic.verified && 
         docs.drivingLicense.verified && 
         docs.vehicleRegistration.verified && 
         docs.vehicleInsurance.verified;
});

// Methods
driverSchema.methods.updateLocation = function(longitude, latitude) {
  this.currentLocation = {
    type: 'Point',
    coordinates: [longitude, latitude],
    lastUpdate: new Date()
  };
  return this.save();
};

driverSchema.methods.updateEarnings = function(amount) {
  this.earnings.today += amount;
  this.earnings.week += amount;
  this.earnings.month += amount;
  this.earnings.total += amount;
  this.earnings.lastUpdated = new Date();
  return this.save();
};

driverSchema.methods.updateRating = function(newRating) {
  this.stats.totalRatings += 1;
  this.stats.ratingSum += newRating;
  this.stats.rating = this.stats.ratingSum / this.stats.totalRatings;
  return this.save();
};

driverSchema.methods.goOnline = function() {
  this.isOnline = true;
  return this.save();
};

driverSchema.methods.goOffline = function() {
  this.isOnline = false;
  return this.save();
};

module.exports = mongoose.model('Driver', driverSchema);