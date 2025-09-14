const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

// Middleware to verify admin token
const verifyAdminToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    req.admin = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};

// Admin login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    
    // In a real app, query your database for admin user
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Dashboard stats
router.get('/dashboard', verifyAdminToken, async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const stats = {
      users: {
        total: await User.countDocuments(),
        active: await User.countDocuments({ status: 'active' }),
        newToday: await User.countDocuments({ createdAt: { $gte: startOfDay } })
      },
      drivers: {
        total: await Driver.countDocuments(),
        active: await Driver.countDocuments({ status: 'active' }),
        online: await Driver.countDocuments({ isOnline: true }),
        pendingApproval: await Driver.countDocuments({ status: 'pending' })
      },
      rides: {
        total: await Ride.countDocuments(),
        today: await Ride.countDocuments({ createdAt: { $gte: startOfDay } }),
        thisWeek: await Ride.countDocuments({ createdAt: { $gte: startOfWeek } }),
        thisMonth: await Ride.countDocuments({ createdAt: { $gte: startOfMonth } }),
        completed: await Ride.countDocuments({ status: 'completed' }),
        ongoing: await Ride.countDocuments({ status: 'ongoing' }),
        cancelled: await Ride.countDocuments({ status: 'cancelled' })
      },
      revenue: {
        today: await Payment.aggregate([
          { $match: { createdAt: { $gte: startOfDay }, status: 'completed' } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]),
        thisWeek: await Payment.aggregate([
          { $match: { createdAt: { $gte: startOfWeek }, status: 'completed' } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]),
        thisMonth: await Payment.aggregate([
          { $match: { createdAt: { $gte: startOfMonth }, status: 'completed' } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ])
      }
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// User Management
router.get('/users', verifyAdminToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status || '';

    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) {
      query.status = status;
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/users/:id/status', verifyAdminToken, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['active', 'suspended', 'banned'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: new Date() },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User status updated', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Driver Management
router.get('/drivers', verifyAdminToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status || '';

    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { licenseNumber: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) {
      query.status = status;
    }

    const drivers = await Driver.find(query)
      .select('-password')
      .populate('vehicle')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Driver.countDocuments(query);

    res.json({
      drivers,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/drivers/:id/approve', verifyAdminToken, async (req, res) => {
  try {
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'active',
        approvedAt: new Date(),
        approvedBy: req.admin.id
      },
      { new: true }
    );

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    res.json({ message: 'Driver approved successfully', driver });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/drivers/:id/reject', verifyAdminToken, async (req, res) => {
  try {
    const { reason } = req.body;
    
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'rejected',
        rejectionReason: reason,
        rejectedAt: new Date(),
        rejectedBy: req.admin.id
      },
      { new: true }
    );

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    res.json({ message: 'Driver rejected', driver });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Ride Management
router.get('/rides', verifyAdminToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || '';
    const dateFrom = req.query.dateFrom;
    const dateTo = req.query.dateTo;

    let query = {};
    if (status) {
      query.status = status;
    }
    if (dateFrom && dateTo) {
      query.createdAt = {
        $gte: new Date(dateFrom),
        $lte: new Date(dateTo)
      };
    }

    const rides = await Ride.find(query)
      .populate('user', 'name email phone')
      .populate('driver', 'name email phone vehicle')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Ride.countDocuments(query);

    res.json({
      rides,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/rides/:id/cancel', verifyAdminToken, async (req, res) => {
  try {
    const { reason } = req.body;
    
    const ride = await Ride.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'cancelled',
        cancellationReason: reason,
        cancelledBy: 'admin',
        cancelledAt: new Date()
      },
      { new: true }
    );

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    res.json({ message: 'Ride cancelled by admin', ride });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Payment Management
router.get('/payments', verifyAdminToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || '';
    const method = req.query.method || '';

    let query = {};
    if (status) {
      query.status = status;
    }
    if (method) {
      query.paymentMethod = method;
    }

    const payments = await Payment.find(query)
      .populate('user', 'name email')
      .populate('ride', 'rideId pickupLocation dropoffLocation')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments(query);

    res.json({
      payments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/payments/:id/refund', verifyAdminToken, async (req, res) => {
  try {
    const { amount, reason } = req.body;
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.status !== 'completed') {
      return res.status(400).json({ message: 'Can only refund completed payments' });
    }

    // Process refund logic here (integrate with payment gateway)
    
    const refund = new Refund({
      payment: payment._id,
      amount: amount || payment.amount,
      reason,
      processedBy: req.admin.id,
      status: 'processed'
    });

    await refund.save();

    payment.status = 'refunded';
    payment.refundAmount = amount || payment.amount;
    payment.refundReason = reason;
    await payment.save();

    res.json({ message: 'Refund processed successfully', refund });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Analytics
router.get('/analytics/revenue', verifyAdminToken, async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    let groupFormat, dateRange;

    const now = new Date();
    
    switch (period) {
      case 'day':
        groupFormat = { $dateToString: { format: '%Y-%m-%d %H:00', date: '$createdAt' } };
        dateRange = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
        dateRange = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
        dateRange = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        groupFormat = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
        dateRange = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
    }

    const revenue = await Payment.aggregate([
      {
        $match: {
          createdAt: { $gte: dateRange },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: groupFormat,
          totalRevenue: { $sum: '$amount' },
          totalTransactions: { $sum: 1 },
          avgTransactionValue: { $avg: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({ revenue });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/analytics/rides', verifyAdminToken, async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    let groupFormat, dateRange;

    const now = new Date();
    
    switch (period) {
      case 'day':
        groupFormat = { $dateToString: { format: '%Y-%m-%d %H:00', date: '$createdAt' } };
        dateRange = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
        dateRange = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
        dateRange = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }

    const rideStats = await Ride.aggregate([
      {
        $match: {
          createdAt: { $gte: dateRange }
        }
      },
      {
        $group: {
          _id: {
            date: groupFormat,
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          rides: {
            $push: {
              status: '$_id.status',
              count: '$count'
            }
          },
          totalRides: { $sum: '$count' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({ rideStats });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// System Settings
router.get('/settings', verifyAdminToken, async (req, res) => {
  try {
    const settings = await Setting.findOne();
    res.json(settings || {});
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/settings', verifyAdminToken, async (req, res) => {
  try {
    const settings = await Setting.findOneAndUpdate(
      {},
      { ...req.body, updatedBy: req.admin.id, updatedAt: new Date() },
      { new: true, upsert: true }
    );

    res.json({ message: 'Settings updated', settings });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Reports
router.get('/reports/summary', verifyAdminToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const summary = {
      totalUsers: await User.countDocuments(),
      totalDrivers: await Driver.countDocuments(),
      totalRides: await Ride.countDocuments(dateFilter),
      completedRides: await Ride.countDocuments({ ...dateFilter, status: 'completed' }),
      cancelledRides: await Ride.countDocuments({ ...dateFilter, status: 'cancelled' }),
      totalRevenue: await Payment.aggregate([
        { $match: { ...dateFilter, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      avgRideValue: await Ride.aggregate([
        { $match: { ...dateFilter, status: 'completed' } },
        { $group: { _id: null, avg: { $avg: '$totalAmount' } } }
      ])
    };

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;