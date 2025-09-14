const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { createPaymentIntent, confirmPayment, createCustomer } = require('../config/stripe');
const User = require('../models/User');
const Driver = require('../models/Driver');
const Ride = require('../models/Ride');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

// @route   POST /api/payments/create-intent
// @desc    Create Stripe payment intent
// @access  Private
router.post('/create-intent', [
  auth,
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('rideId').optional().notEmpty().withMessage('Ride ID is required when provided'),
  body('type').isIn(['ride_payment', 'wallet_topup']).withMessage('Invalid payment type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { amount, rideId, type } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Create Stripe customer if doesn't exist
    if (!user.stripeCustomerId) {
      const customerResult = await createCustomer(user.email, user.name, user.phone);
      if (customerResult.success) {
        user.stripeCustomerId = customerResult.customer_id;
        await user.save();
      }
    }

    // Create payment intent
    const paymentResult = await createPaymentIntent(amount, {
      userId: user._id.toString(),
      userEmail: user.email,
      type,
      rideId: rideId || '',
      platform: 'ridepak'
    });

    if (!paymentResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Failed to create payment intent',
        error: paymentResult.error
      });
    }

    // Create transaction record
    const transaction = new Transaction({
      user: user._id,
      ride: rideId || null,
      type,
      amount,
      description: type === 'ride_payment' ? `Payment for ride ${rideId}` : 'Wallet top-up',
      paymentMethod: 'stripe',
      status: 'pending',
      paymentDetails: {
        stripePaymentIntentId: paymentResult.payment_intent_id
      },
      balances: {
        userWalletBefore: user.wallet.balance
      }
    });

    await transaction.save();

    res.json({
      success: true,
      data: {
        clientSecret: paymentResult.client_secret,
        transactionId: transaction.transactionId,
        amount,
        currency: 'PKR'
      }
    });

  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/payments/confirm
// @desc    Confirm payment and update records
// @access  Private
router.post('/confirm', [
  auth,
  body('paymentIntentId').notEmpty().withMessage('Payment intent ID is required'),
  body('transactionId').notEmpty().withMessage('Transaction ID is required')
], async (req, res) => {
  try {
    const { paymentIntentId, transactionId } = req.body;

    // Find transaction
    const transaction = await Transaction.findOne({ transactionId });
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Confirm payment with Stripe
    const paymentResult = await confirmPayment(paymentIntentId);
    if (!paymentResult.success) {
      await transaction.markFailed(paymentResult.error);
      return res.status(400).json({
        success: false,
        message: 'Payment confirmation failed',
        error: paymentResult.error
      });
    }

    // Update transaction status
    if (paymentResult.status === 'succeeded') {
      await transaction.markCompleted();

      // Update user wallet for wallet top-ups
      if (transaction.type === 'wallet_topup') {
        const user = await User.findById(transaction.user);
        await user.updateWallet(transaction.amount, 'add');
        
        transaction.balances.userWalletAfter = user.wallet.balance;
        await transaction.save();
      }

      // Update ride payment status
      if (transaction.ride) {
        const ride = await Ride.findById(transaction.ride);
        if (ride) {
          ride.paymentStatus = 'completed';
          ride.stripePaymentIntentId = paymentIntentId;
          await ride.save();
        }
      }

      res.json({
        success: true,
        message: 'Payment confirmed successfully',
        data: {
          transactionId: transaction.transactionId,
          status: 'completed',
          amount: transaction.amount
        }
      });

    } else {
      await transaction.markFailed(`Payment status: ${paymentResult.status}`);
      res.status(400).json({
        success: false,
        message: 'Payment not successful',
        status: paymentResult.status
      });
    }

  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/payments/wallet/topup
// @desc    Top up wallet with cash payment
// @access  Private
router.post('/wallet/topup', [
  auth,
  body('amount').isNumeric().custom(value => value > 0).withMessage('Amount must be greater than 0'),
  body('method').isIn(['cash', 'bank_transfer']).withMessage('Invalid payment method')
], async (req, res) => {
  try {
    const { amount, method, reference } = req.body;
    const user = await User.findById(req.user.id);

    // Create transaction
    const transaction = new Transaction({
      user: user._id,
      type: 'wallet_topup',
      amount,
      description: `Wallet top-up via ${method}`,
      paymentMethod: method,
      status: method === 'cash' ? 'completed' : 'pending',
      paymentDetails: {
        bankReference: reference || null
      },
      balances: {
        userWalletBefore: user.wallet.balance
      }
    });

    // Update wallet immediately for cash payments
    if (method === 'cash') {
      await user.updateWallet(amount, 'add');
      transaction.balances.userWalletAfter = user.wallet.balance;
      transaction.processedAt = new Date();
    }

    await transaction.save();

    res.json({
      success: true,
      message: method === 'cash' ? 'Wallet topped up successfully' : 'Top-up request submitted for approval',
      data: {
        transactionId: transaction.transactionId,
        amount,
        newBalance: user.wallet.balance,
        status: transaction.status
      }
    });

  } catch (error) {
    console.error('Wallet topup error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/payments/wallet/balance
// @desc    Get wallet balance
// @access  Private
router.get('/wallet/balance', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.json({
      success: true,
      data: {
        balance: user.wallet.balance,
        currency: user.wallet.currency
      }
    });

  } catch (error) {
    console.error('Get wallet balance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/payments/driver/withdraw
// @desc    Driver withdrawal request
// @access  Private
router.post('/driver/withdraw', [
  auth,
  body('amount').isNumeric().custom(value => value >= 500).withMessage('Minimum withdrawal amount is Rs. 500'),
  body('method').isIn(['bank_transfer', 'mobile_wallet']).withMessage('Invalid withdrawal method')
], async (req, res) => {
  try {
    const { amount, method } = req.body;

    // Find driver
    const driver = await Driver.findOne({ userId: req.user.id }).populate('userId');
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver profile not found'
      });
    }

    // Check available balance
    if (driver.earnings.total < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance'
      });
    }

    // Create withdrawal transaction
    const transaction = new Transaction({
      user: req.user.id,
      driver: driver._id,
      type: 'driver_payout',
      amount,
      description: `Driver withdrawal via ${method}`,
      paymentMethod: method,
      status: 'pending',
      balances: {
        driverEarningsBefore: driver.earnings.total
      }
    });

    // Deduct from driver earnings
    driver.earnings.total -= amount;
    driver.earnings.lastUpdated = new Date();
    await driver.save();

    transaction.balances.driverEarningsAfter = driver.earnings.total;
    await transaction.save();

    res.json({
      success: true,
      message: 'Withdrawal request submitted successfully',
      data: {
        transactionId: transaction.transactionId,
        amount,
        method,
        status: 'pending',
        remainingBalance: driver.earnings.total
      }
    });

  } catch (error) {
    console.error('Driver withdrawal error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/payments/transactions
// @desc    Get payment history
// @access  Private
router.get('/transactions', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const type = req.query.type;

    let query = { user: req.user.id };
    if (type) {
      query.type = type;
    }

    const transactions = await Transaction.find(query)
      .populate('ride', 'rideId pickup.address destination.address')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Transaction.countDocuments(query);

    res.json({
      success: true,
      data: {
        transactions: transactions.map(t => ({
          id: t._id,
          transactionId: t.transactionId,
          type: t.type,
          amount: t.amount,
          currency: t.currency,
          description: t.description,
          status: t.status,
          paymentMethod: t.paymentMethod,
          ride: t.ride ? {
            rideId: t.ride.rideId,
            pickup: t.ride.pickup.address,
            destination: t.ride.destination.address
          } : null,
          createdAt: t.createdAt,
          processedAt: t.processedAt
        })),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/payments/refund
// @desc    Process refund for cancelled ride
// @access  Private
router.post('/refund', [
  auth,
  body('rideId').notEmpty().withMessage('Ride ID is required'),
  body('reason').notEmpty().withMessage('Refund reason is required')
], async (req, res) => {
  try {
    const { rideId, reason } = req.body;

    const ride = await Ride.findOne({ rideId });
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    // Check if ride is eligible for refund
    if (!['cancelled_by_driver', 'cancelled_by_system'].includes(ride.status)) {
      return res.status(400).json({
        success: false,
        message: 'Ride is not eligible for refund'
      });
    }

    // Find original payment transaction
    const originalTransaction = await Transaction.findOne({
      ride: ride._id,
      type: 'ride_payment',
      status: 'completed'
    });

    if (!originalTransaction) {
      return res.status(404).json({
        success: false,
        message: 'Original payment not found'
      });
    }

    // Create refund transaction
    const refundTransaction = new Transaction({
      user: ride.passenger,
      ride: ride._id,
      type: 'refund',
      amount: originalTransaction.amount,
      description: `Refund for cancelled ride ${ride.rideId}: ${reason}`,
      paymentMethod: originalTransaction.paymentMethod,
      status: 'completed',
      metadata: {
        originalTransactionId: originalTransaction.transactionId,
        refundReason: reason
      }
    });

    await refundTransaction.save();

    // Update user wallet
    const user = await User.findById(ride.passenger);
    await user.updateWallet(originalTransaction.amount, 'add');

    // Mark original transaction as refunded
    await originalTransaction.processRefund(originalTransaction.amount);

    // Update ride payment status
    ride.paymentStatus = 'refunded';
    await ride.save();

    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: {
        refundTransactionId: refundTransaction.transactionId,
        amount: refundTransaction.amount,
        newWalletBalance: user.wallet.balance
      }
    });

  } catch (error) {
    console.error('Process refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;