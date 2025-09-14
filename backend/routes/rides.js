const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Ride = require('../models/Ride');
const User = require('../models/User');
const Driver = require('../models/Driver');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');
const { sendPushNotification } = require('../config/firebase');
const { sendSMS } = require('../config/twilio');

// @route   POST /api/rides/request
// @desc    Request a new ride
// @access  Private
router.post('/request', [
  auth,
  body('pickup.address').notEmpty().withMessage('Pickup address is required'),
  body('pickup.coordinates').isArray({ min: 2, max: 2 }).withMessage('Pickup coordinates required'),
  body('destination.address').notEmpty().withMessage('Destination address is required'),
  body('destination.coordinates').isArray({ min: 2, max: 2 }).withMessage('Destination coordinates required'),
  body('rideType').isIn(['economy', 'standard', 'premium']).withMessage('Invalid ride type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { pickup, destination, rideType, scheduledFor, specialRequests } = req.body;

    // Calculate estimated fare based on distance
    const distance = calculateDistance(pickup.coordinates, destination.coordinates);
    const baseFareRates = {
      economy: 12,   // Rs. 12 per km
      standard: 15,  // Rs. 15 per km
      premium: 25    // Rs. 25 per km
    };
    
    const estimatedFare = Math.max(100, Math.round(distance * baseFareRates[rideType]));

    // Create new ride
    const ride = new Ride({
      passenger: req.user.id,
      pickup: {
        address: pickup.address,
        coordinates: {
          type: 'Point',
          coordinates: pickup.coordinates
        },
        landmark: pickup.landmark
      },
      destination: {
        address: destination.address,
        coordinates: {
          type: 'Point',
          coordinates: destination.coordinates
        },
        landmark: destination.landmark
      },
      rideType,
      fare: {
        estimated: estimatedFare
      },
      distance: {
        estimated: distance
      },
      scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
      specialRequests
    });

    await ride.save();

    // Find nearby drivers
    const nearbyDrivers = await Driver.find({
      isOnline: true,
      status: 'approved',
      currentLocation: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: pickup.coordinates
          },
          $maxDistance: 10000 // 10km radius
        }
      }
    }).populate('userId').limit(10);

    // Send ride request notifications to nearby drivers
    const notificationPromises = nearbyDrivers.map(async (driver) => {
      if (driver.userId.fcmTokens.length > 0) {
        const tokens = driver.userId.fcmTokens.map(t => t.token);
        return sendPushNotification(
          tokens[0], // Send to latest token
          'New Ride Request',
          `${pickup.address} → ${destination.address}`,
          {
            type: 'ride_request',
            rideId: ride.rideId,
            estimatedFare: estimatedFare.toString(),
            distance: distance.toString()
          }
        );
      }
    });

    await Promise.all(notificationPromises);

    res.status(201).json({
      success: true,
      message: 'Ride requested successfully',
      data: {
        ride: {
          id: ride._id,
          rideId: ride.rideId,
          status: ride.status,
          pickup: ride.pickup,
          destination: ride.destination,
          estimatedFare: ride.fare.estimated,
          estimatedDistance: ride.distance.estimated,
          rideType: ride.rideType
        },
        nearbyDrivers: nearbyDrivers.length
      }
    });

  } catch (error) {
    console.error('Request ride error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/rides/:rideId/accept
// @desc    Driver accepts a ride request
// @access  Private
router.post('/:rideId/accept', [
  auth,
  body('negotiatedFare').optional().isNumeric().withMessage('Negotiated fare must be a number')
], async (req, res) => {
  try {
    const { rideId } = req.params;
    const { negotiatedFare } = req.body;

    // Find the ride
    const ride = await Ride.findOne({ rideId }).populate('passenger');
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    if (ride.status !== 'searching') {
      return res.status(400).json({
        success: false,
        message: 'Ride is no longer available'
      });
    }

    // Find the driver
    const driver = await Driver.findOne({ userId: req.user.id }).populate('userId');
    if (!driver || driver.status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Driver not authorized'
      });
    }

    // Assign driver to ride
    ride.driver = driver._id;
    ride.status = 'driver_assigned';
    
    if (negotiatedFare) {
      ride.fare.negotiated = negotiatedFare;
    }

    await ride.save();

    // Update driver stats
    driver.stats.totalRides += 1;
    await driver.save();

    // Send notification to passenger
    if (ride.passenger.fcmTokens.length > 0) {
      const token = ride.passenger.fcmTokens[0].token;
      await sendPushNotification(
        token,
        'Driver Found!',
        `${driver.userId.name} is coming to pick you up`,
        {
          type: 'driver_assigned',
          rideId: ride.rideId,
          driverName: driver.userId.name,
          driverPhone: driver.userId.phone,
          vehicleInfo: `${driver.vehicle.color} ${driver.vehicle.make} ${driver.vehicle.model}`,
          licensePlate: driver.vehicle.licensePlate
        }
      );
    }

    // Send SMS notification
    await sendSMS(
      ride.passenger.phone,
      `RidePak: Driver ${driver.userId.name} is coming to pick you up. Vehicle: ${driver.vehicle.color} ${driver.vehicle.make} ${driver.vehicle.model} (${driver.vehicle.licensePlate})`
    );

    res.json({
      success: true,
      message: 'Ride accepted successfully',
      data: {
        ride: {
          id: ride._id,
          rideId: ride.rideId,
          status: ride.status,
          driver: {
            name: driver.userId.name,
            phone: driver.userId.phone,
            rating: driver.stats.rating,
            vehicle: driver.vehicle
          },
          finalFare: ride.fare.negotiated || ride.fare.estimated
        }
      }
    });

  } catch (error) {
    console.error('Accept ride error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/rides/:rideId/status
// @desc    Update ride status
// @access  Private
router.put('/:rideId/status', [
  auth,
  body('status').isIn([
    'driver_arriving',
    'driver_arrived', 
    'in_progress',
    'completed',
    'cancelled_by_passenger',
    'cancelled_by_driver'
  ]).withMessage('Invalid status'),
  body('location').optional().isArray({ min: 2, max: 2 }).withMessage('Location must be [longitude, latitude]')
], async (req, res) => {
  try {
    const { rideId } = req.params;
    const { status, location } = req.body;

    const ride = await Ride.findOne({ rideId })
      .populate('passenger')
      .populate({
        path: 'driver',
        populate: { path: 'userId' }
      });

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    // Verify user authorization
    const isPassenger = ride.passenger._id.toString() === req.user.id;
    const isDriver = ride.driver && ride.driver.userId._id.toString() === req.user.id;

    if (!isPassenger && !isDriver) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Update ride status
    await ride.updateStatus(status, location);

    // Handle specific status updates
    if (status === 'completed') {
      // Calculate final fare and create transaction
      await ride.calculateFinalFare();
      
      const transaction = new Transaction({
        user: ride.passenger._id,
        driver: ride.driver._id,
        ride: ride._id,
        type: 'ride_payment',
        amount: ride.fare.final,
        description: `Payment for ride ${ride.rideId}`,
        paymentMethod: ride.paymentMethod,
        status: 'completed'
      });
      await transaction.save();

      // Update driver earnings
      await ride.driver.updateEarnings(ride.fare.final - ride.fare.commission);
    }

    // Send notifications
    const notificationData = {
      type: 'ride_status_update',
      rideId: ride.rideId,
      status: status
    };

    if (isDriver && ride.passenger.fcmTokens.length > 0) {
      const token = ride.passenger.fcmTokens[0].token;
      const statusMessages = {
        'driver_arriving': 'Your driver is on the way',
        'driver_arrived': 'Your driver has arrived',
        'in_progress': 'Your trip has started',
        'completed': 'Trip completed successfully'
      };

      await sendPushNotification(
        token,
        'Ride Update',
        statusMessages[status] || `Ride status: ${status}`,
        notificationData
      );
    }

    res.json({
      success: true,
      message: 'Ride status updated successfully',
      data: {
        ride: {
          id: ride._id,
          rideId: ride.rideId,
          status: ride.status,
          timeline: ride.timeline
        }
      }
    });

  } catch (error) {
    console.error('Update ride status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/rides/my-rides
// @desc    Get user's ride history
// @access  Private
router.get('/my-rides', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const rides = await Ride.find({ passenger: req.user.id })
      .populate({
        path: 'driver',
        populate: { path: 'userId', select: 'name phone' }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Ride.countDocuments({ passenger: req.user.id });

    res.json({
      success: true,
      data: {
        rides: rides.map(ride => ({
          id: ride._id,
          rideId: ride.rideId,
          pickup: ride.pickup,
          destination: ride.destination,
          status: ride.status,
          fare: ride.fare,
          distance: ride.distance,
          duration: ride.duration,
          driver: ride.driver ? {
            name: ride.driver.userId.name,
            phone: ride.driver.userId.phone,
            vehicle: ride.driver.vehicle,
            rating: ride.driver.stats.rating
          } : null,
          rating: ride.rating,
          createdAt: ride.createdAt,
          completedAt: ride.timeline.find(t => t.status === 'completed')?.timestamp
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
    console.error('Get rides error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Helper function to calculate distance between two coordinates
function calculateDistance(coord1, coord2) {
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;
  
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

function toRadians(degrees) {
  return degrees * (Math.PI/180);
}

module.exports = router;