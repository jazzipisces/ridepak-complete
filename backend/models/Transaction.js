const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    unique: true,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    default: null
  },
  ride: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ride',
    default: null
  },
  type: {
    type: String,
    enum: [
      'ride_payment',
      'wallet_topup',
      'wallet_deduction',
      'driver_payout',
      'refund',
      'cancellation_fee',
      'commission',
      'bonus',
      'penalty'
    ],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'PKR'
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'stripe', 'wallet', 'bank_transfer'],
    required: true
  },
  paymentDetails: {
    stripePaymentIntentId: { type: String, default: null },
    stripeChargeId: { type: String, default: null },
    cardLast4: { type: String, default: null },
    cardBrand: { type: String, default: null },
    bankReference: { type: String, default: null }
  },
  balances: {
    userWalletBefore: { type: Number, default: 0 },
    userWalletAfter: { type: Number, default: 0 },
    driverEarningsBefore: { type: Number, default: 0 },
    driverEarningsAfter: { type: Number, default: 0 }
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  processedAt: {
    type: Date,
    default: null
  },
  failureReason: {
    type: String,
    default: null
  },
  refundedAt: {
    type: Date,
    default: null
  },
  refundAmount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
transactionSchema.index({ transactionId: 1 });
transactionSchema.index({ user: 1 });
transactionSchema.index({ driver: 1 });
transactionSchema.index({ ride: 1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ createdAt: -1 });

// Generate transaction ID before saving
transactionSchema.pre('save', function(next) {
  if (this.isNew && !this.transactionId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.transactionId = `TXN${timestamp}${random}`.toUpperCase();
  }
  next();
});

// Virtual for formatted amount
transactionSchema.virtual('formattedAmount').get(function() {
  return `${this.currency} ${this.amount.toLocaleString()}`;
});

// Methods
transactionSchema.methods.markCompleted = function() {
  this.status = 'completed';
  this.processedAt = new Date();
  return this.save();
};

transactionSchema.methods.markFailed = function(reason) {
  this.status = 'failed';
  this.failureReason = reason;
  this.processedAt = new Date();
  return this.save();
};

transactionSchema.methods.processRefund = function(amount = null) {
  this.status = 'refunded';
  this.refundedAt = new Date();
  this.refundAmount = amount || this.amount;
  return this.save();
};

module.exports = mongoose.model('Transaction', transactionSchema);