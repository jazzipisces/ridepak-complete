const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Driver = require('../models/Driver');
const { sendOTP, verifyOTP } = require('../config/twilio');
const auth = require('../middleware/auth');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @route   POST /api/auth/send-otp
// @desc    Send OTP to phone number
// @access  Public
router.post('/send-otp', [
  body('phone').matches(/^\+92[0-9]{10}$/).withMessage('Invalid Pakistani phone number format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { phone } = req.body;

    // Send OTP via Twilio
    const otpResult = await sendOTP(phone);
    
    if (!otpResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Failed to send OTP',
        error: otpResult.error
      });
    }

    res.json({
      success: true,
      message: 'OTP sent successfully',
      data: {
        phone,
        status: otpResult.status
      }
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP and login/register user
// @access  Public
router.post('/verify-otp', [
  body('phone').matches(/^\+92[0-9]{10}$/).withMessage('Invalid Pakistani phone number format'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  body('userType').isIn(['customer', 'driver']).withMessage('Invalid user type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { phone, otp, userType } = req.body;

    // Verify OTP with Twilio
    const verifyResult = await verifyOTP(phone, otp);
    
    if (!verifyResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Find or create user
    let user = await User.findOne({ phone });
    let isNewUser = false;

    if (!user) {
      // Create new user if doesn't exist
      user = new User({
        phone,
        name: '', // Will be updated in profile completion
        email: '', // Will be updated in profile completion
        city: '',
        isVerified: true
      });
      await user.save();
      isNewUser = true;
    } else {
      // Update last login
      user.lastLogin = new Date();
      user.isVerified = true;
      await user.save();
    }

    // For drivers, check if driver profile exists
    let driver = null;
    if (userType === 'driver') {
      driver = await Driver.findOne({ userId: user._id }).populate('userId');
    }

    // Generate JWT token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: isNewUser ? 'Account created successfully' : 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          phone: user.phone,
          name: user.name,
          email: user.email,
          city: user.city,
          isVerified: user.isVerified,
          rating: user.rating,
          totalRides: user.totalRides
        },
        driver: driver ? {
          id: driver._id,
          status: driver.status,
          isOnline: driver.isOnline,
          vehicle: driver.vehicle,
          rating: driver.stats.rating,
          totalRides: driver.stats.totalRides
        } : null,
        isNewUser,
        userType
      }
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/auth/complete-profile
// @desc    Complete user profile after registration
// @access  Private
router.post('/complete-profile', [
  auth,
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Invalid email format'),
  body('city').notEmpty().withMessage('City is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, email, city, referralCode } = req.body;

    // Check if email is already taken
    const existingUser = await User.findOne({ 
      email, 
      _id: { $ne: req.user.id } 
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email is already registered'
      });
    }

    // Update user profile
    const user = await User.findById(req.user.id);
    user.name = name;
    user.email = email;
    user.city = city;

    // Handle referral code
    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      if (referrer) {
        user.referredBy = referrer._id;
        
        // Add bonus to both users
        user.wallet.balance += 100; // Rs. 100 bonus for new user
        referrer.wallet.balance += 50; // Rs. 50 bonus for referrer
        await referrer.save();
      }
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile completed successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          city: user.city,
          wallet: user.wallet,
          referralCode: user.referralCode
        }
      }
    });

  } catch (error) {
    console.error('Complete profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-__v');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is also a driver
    const driver = await Driver.findOne({ userId: user._id });

    res.json({
      success: true,
      data: {
        user,
        driver: driver || null
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/auth/update-fcm-token
// @desc    Update FCM token for push notifications
// @access  Private
router.post('/update-fcm-token', [
  auth,
  body('token').notEmpty().withMessage('FCM token is required'),
  body('device').notEmpty().withMessage('Device identifier is required')
], async (req, res) => {
  try {
    const { token, device } = req.body;
    
    const user = await User.findById(req.user.id);
    await user.addFCMToken(token, device);

    res.json({
      success: true,
      message: 'FCM token updated successfully'
    });

  } catch (error) {
    console.error('Update FCM token error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (remove FCM token)
// @access  Private
router.post('/logout', [
  auth,
  body('device').notEmpty().withMessage('Device identifier is required')
], async (req, res) => {
  try {
    const { device } = req.body;
    
    const user = await User.findById(req.user.id);
    user.fcmTokens = user.fcmTokens.filter(t => t.device !== device);
    await user.save();

    // If user is a driver, set offline
    const driver = await Driver.findOne({ userId: user._id });
    if (driver) {
      driver.isOnline = false;
      await driver.save();
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;