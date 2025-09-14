const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  rideId: {
    type: String,
    unique: true,
    required: true
  },
  passenger: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    default: null
  },
  pickup: {
    address: {
      type: String,
      required: [true, 'Pickup address is required']
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
      }
    },
    landmark: { type: String, default: null }
  },
  destination: {
    address: {
      type: String,
      required: [true, 'Destination address is required']
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
      }
    },
    landmark: { type: String, default: null }
  },
  rideType: {
    type: String,
    enum: ['economy', 'standard', 'premium'],
    default: 'standard'
  },
  fare: {
    estimated: {
      type: Number,
      required: true,
      min: 0
    },
    negotiated: {
      type: Number,
      default: null,
      min: 0
    },
    final: {
      type: Number,
      default: null,
      min: 0
    },
    commission: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  status: {
    type: String,
    enum: [
      'searching',
      'driver_assigned',
      'driver_arriving',
      'driver_arrived',
      'in_progress',
      'completed',
      'cancelled_by_passenger',
      'cancelled_by_driver',
      'cancelled_by_system'
    ],
    default: 'searching'
  },
  timeline: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    location: {
      type: [Number], // [longitude, latitude]
      default: null
    }
  }],
  distance: {
    estimated: { type: Number, default: 0 }, // in kilometers
    actual: { type: Number, default: 0 }
  },
  duration: {
    estimated: { type: Number, default: 0 }, // in minutes
    actual: { type: Number, default: 0 }
  },
  route: [{
    latitude: Number,
    longitude: Number,
    timestamp: { type: Date, default: Date.now }
  }],
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'wallet'],
    default: 'cash'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  stripePaymentIntentId: {
    type: String,
    default: null
  },
  rating: {
    passengerRating: {
      score: { type: Number, min: 1, max: 5, default: null },
      comment: { type: String, default: null },
      ratedAt: { type: Date, default: null }
    },
    driverRating: {
      score: { type: Number, min: 1, max: 5, default: null },
      comment: { type: String, default: null },
      ratedAt: { type: Date, default: null }
    }
  },
  cancellation: {
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'cancellation.cancelledByModel',
      default: null
    },
    cancelledByModel: {
      type: String,
      enum: ['User', 'Driver'],
      default: null
    },
    reason: { type: String, default: null },
    cancelledAt: { type: Date, default: null },
    fee: { type: Number, default: 0 }
  },
  specialRequests: {
    type: String,
    default: null
  },
  scheduledFor: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
rideSchema.index({ rideId: 1 });
rideSchema.index({ passenger: 1 });
rideSchema.index({ driver: 1 });
rideSchema.index({ status: 1 });
rideSchema.index({ createdAt: -1 });
rideSchema.index({ 'pickup.coordinates': '2dsphere' });
rideSchema.index({ 'destination.coordinates': '2dsphere' });

// Generate ride ID before saving
rideSchema.pre('save', function(next) {
  if (this.isNew && !this.rideId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.rideId = `RID${timestamp}${random}`.toUpperCase();
  }
  next();
});

// Update timeline when status changes
rideSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.timeline.push({
      status: this.status,
      timestamp: new Date()
    });
  }
  next();
});

// Virtual for ride duration in readable format
rideSchema.virtual('durationFormatted').get(function() {
  if (!this.duration.actual) return null;
  const hours = Math.floor(this.duration.actual / 60);
  const minutes = this.duration.actual % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
});

// Virtual for distance in readable format
rideSchema.virtual('distanceFormatted').get(function() {
  if (!this.distance.actual) return null;
  return this.distance.actual < 1 
    ? `${Math.round(this.distance.actual * 1000)}m` 
    : `${this.distance.actual.toFixed(1)}km`;
});

// Methods
rideSchema.methods.updateStatus = function(newStatus, location = null) {
  this.status = newStatus;
  this.timeline.push({
    status: newStatus,
    timestamp: new Date(),
    location: location
  });
  return this.save();
};

rideSchema.methods.assignDriver = function(driverId) {
  this.driver = driverId;
  this.status = 'driver_assigned';
  return this.save();
};

rideSchema.methods.calculateFinalFare = function() {
  const baseFare = this.fare.negotiated || this.fare.estimated;
  const commission = baseFare * 0.15; // 15% commission
  this.fare.final = baseFare;
  this.fare.commission = commission;
  return this.save();
};

rideSchema.methods.addRating = function(userType, rating, comment = null) {
  if (userType === 'passenger') {
    this.rating.passengerRating = {
      score: rating,
      comment: comment,
      ratedAt: new Date()
    };
  } else if (userType === 'driver') {
    this.rating.driverRating = {
      score: rating,
      comment: comment,
      ratedAt: new Date()
    };
  }
  return this.save();
};

module.exports = mongoose.model('Ride', rideSchema);