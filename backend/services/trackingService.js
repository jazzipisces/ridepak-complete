const Redis = require('redis');
const geolib = require('geolib');
const axios = require('axios');

class TrackingService {
  constructor() {
    // Initialize Redis for real-time location storage
    this.redis = Redis.createClient({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD
    });

    this.redis.on('error', (err) => {
      console.error('Redis connection error:', err);
    });

    this.redis.on('connect', () => {
      console.log('Redis connected successfully');
    });

    // Configuration
    this.config = {
      locationUpdateInterval: 5000, // 5 seconds
      maxLocationHistory: 100,
      geofenceRadius: 100, // meters
      speedThreshold: 120, // km/h for speeding alerts
      maxIdleTime: 300000, // 5 minutes
      trackingExpiry: 86400 // 24 hours in seconds
    };

    // Google Maps API key
    this.googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
  }

  /**
   * Start tracking a driver
   */
  async startTracking(driverId, initialLocation = null) {
    try {
      const trackingData = {
        driverId,
        status: 'active',
        startTime: new Date().toISOString(),
        lastUpdate: new Date().toISOString(),
        isOnline: true
      };

      if (initialLocation) {
        trackingData.currentLocation = initialLocation;
        trackingData.locationHistory = [initialLocation];
      }

      // Store in Redis
      await this.redis.hset(
        `tracking:driver:${driverId}`,
        trackingData
      );

      // Set expiry
      await this.redis.expire(`tracking:driver:${driverId}`, this.config.trackingExpiry);

      // Add to active drivers geo set
      if (initialLocation) {
        await this.redis.geoadd(
          'drivers:active',
          initialLocation.longitude,
          initialLocation.latitude,
          driverId
        );
      }

      console.log(`Started tracking driver: ${driverId}`);
      return { success: true, driverId };

    } catch (error) {
      console.error('Failed to start tracking:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update driver location
   */
  async updateLocation(driverId, location) {
    try {
      const { latitude, longitude, speed = 0, heading = 0, accuracy = 0 } = location;

      // Validate coordinates
      if (!this.isValidCoordinate(latitude, longitude)) {
        throw new Error('Invalid coordinates');
      }

      const timestamp = new Date().toISOString();
      const locationData = {
        latitude,
        longitude,
        speed,
        heading,
        accuracy,
        timestamp
      };

      // Get current tracking data
      const trackingKey = `tracking:driver:${driverId}`;
      const currentData = await this.redis.hgetall(trackingKey);

      if (!currentData.driverId) {
        throw new Error('Driver tracking not started');
      }

      // Update current location
      await this.redis.hset(trackingKey, {
        currentLocation: JSON.stringify(locationData),
        lastUpdate: timestamp,
        speed: speed.toString(),
        heading: heading.toString()
      });

      // Update location history
      await this.addLocationToHistory(driverId, locationData);

      // Update geo index
      await this.redis.geoadd(
        'drivers:active',
        longitude,
        latitude,
        driverId
      );

      // Check for alerts
      await this.checkLocationAlerts(driverId, locationData, currentData);

      // Update ride tracking if driver is on a ride
      if (currentData.currentRideId) {
        await this.updateRideTracking(currentData.currentRideId, locationData);
      }

      return { success: true, location: locationData };

    } catch (error) {
      console.error('Failed to update location:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Start ride tracking
   */
  async startRideTracking(rideId, driverId, passengerId, route) {
    try {
      const rideTrackingData = {
        rideId,
        driverId,
        passengerId,
        status: 'started',
        startTime: new Date().toISOString(),
        route: JSON.stringify(route),
        distanceTraveled: 0,
        estimatedDuration: route.duration,
        estimatedDistance: route.distance
      };

      // Store ride tracking data
      await this.redis.hset(
        `tracking:ride:${rideId}`,
        rideTrackingData
      );

      // Link driver to ride
      await this.redis.hset(
        `tracking:driver:${driverId}`,
        'currentRideId',
        rideId
      );

      // Set expiry
      await this.redis.expire(`tracking:ride:${rideId}`, this.config.trackingExpiry);

      console.log(`Started ride tracking: ${rideId}`);
      return { success: true, rideId };

    } catch (error) {
      console.error('Failed to start ride tracking:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update ride tracking with current location
   */
  async updateRideTracking(rideId, location) {
    try {
      const rideKey = `tracking:ride:${rideId}`;
      const rideData = await this.redis.hgetall(rideKey);

      if (!rideData.rideId) {
        return { success: false, error: 'Ride tracking not found' };
      }

      const route = JSON.parse(rideData.route || '[]');
      const currentLocation = {
        latitude: parseFloat(location.latitude),
        longitude: parseFloat(location.longitude)
      };

      // Calculate progress
      const progress = this.calculateRouteProgress(route, currentLocation);
      
      // Update tracking data
      await this.redis.hset(rideKey, {
        currentLocation: JSON.stringify(location),
        progress: progress.percentage.toString(),
        distanceTraveled: progress.distanceTraveled.toString(),
        eta: progress.eta.toString(),
        lastUpdate: new Date().toISOString()
      });

      // Notify passenger of location update
      await this.notifyLocationUpdate(rideData.passengerId, location, progress);

      return { success: true, progress };

    } catch (error) {
      console.error('Failed to update ride tracking:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get nearby drivers
   */
  async getNearbyDrivers(location, radiusKm = 5, limit = 10) {
    try {
      const { latitude, longitude } = location;

      // Get drivers within radius using Redis GEORADIUS
      const nearbyDrivers = await this.redis.georadius(
        'drivers:active',
        longitude,
        latitude,
        radiusKm,
        'km',
        'WITHCOORD',
        'WITHDIST',
        'ASC',
        'COUNT',
        limit
      );

      const drivers = [];
      for (const driver of nearbyDrivers) {
        const driverId = driver[0];
        const distance = parseFloat(driver[1]);
        const coordinates = driver[2];

        // Get driver details
        const driverData = await this.redis.hgetall(`tracking:driver:${driverId}`);
        
        if (driverData.isOnline === 'true' && driverData.status === 'available') {
          drivers.push({
            driverId,
            distance,
            location: {
              latitude: parseFloat(coordinates[1]),
              longitude: parseFloat(coordinates[0])
            },
            lastUpdate: driverData.lastUpdate,
            speed: parseFloat(driverData.speed || 0),
            heading: parseFloat(driverData.heading || 0)
          });
        }
      }

      return { success: true, drivers };

    } catch (error) {
      console.error('Failed to get nearby drivers:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get driver current location
   */
  async getDriverLocation(driverId) {
    try {
      const driverData = await this.redis.hgetall(`tracking:driver:${driverId}`);
      
      if (!driverData.driverId) {
        return { success: false, error: 'Driver not found' };
      }

      const currentLocation = JSON.parse(driverData.currentLocation || '{}');
      
      return {
        success: true,
        location: currentLocation,
        isOnline: driverData.isOnline === 'true',
        status: driverData.status,
        lastUpdate: driverData.lastUpdate
      };

    } catch (error) {
      console.error('Failed to get driver location:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get ride tracking info
   */
  async getRideTracking(rideId) {
    try {
      const rideData = await this.redis.hgetall(`tracking:ride:${rideId}`);
      
      if (!rideData.rideId) {
        return { success: false, error: 'Ride tracking not found' };
      }

      const currentLocation = JSON.parse(rideData.currentLocation || '{}');
      const route = JSON.parse(rideData.route || '[]');

      return {
        success: true,
        tracking: {
          rideId,
          driverId: rideData.driverId,
          currentLocation,
          route,
          progress: parseFloat(rideData.progress || 0),
          distanceTraveled: parseFloat(rideData.distanceTraveled || 0),
          eta: parseFloat(rideData.eta || 0),
          status: rideData.status,
          startTime: rideData.startTime,
          lastUpdate: rideData.lastUpdate
        }
      };

    } catch (error) {
      console.error('Failed to get ride tracking:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get location history for a driver
   */
  async getLocationHistory(driverId, limit = 50) {
    try {
      const historyKey = `history:driver:${driverId}`;
      const history = await this.redis.lrange(historyKey, 0, limit - 1);
      
      const locations = history.map(item => JSON.parse(item));
      
      return { success: true, history: locations };

    } catch (error) {
      console.error('Failed to get location history:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Set geofence for location-based alerts
   */
  async setGeofence(name, center, radius, alertType = 'enter') {
    try {
      const geofence = {
        name,
        center,
        radius,
        alertType,
        createdAt: new Date().toISOString()
      };

      await this.redis.hset(
        `geofence:${name}`,
        geofence
      );

      console.log(`Geofence set: ${name}`);
      return { success: true, geofence };

    } catch (error) {
      console.error('Failed to set geofence:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if location is within geofence
   */
  async checkGeofence(location, geofenceName) {
    try {
      const geofenceData = await this.redis.hgetall(`geofence:${geofenceName}`);
      
      if (!geofenceData.name) {
        return { success: false, error: 'Geofence not found' };
      }

      const center = JSON.parse(geofenceData.center);
      const radius = parseFloat(geofenceData.radius);

      const distance = geolib.getDistance(location, center);
      const isInside = distance <= radius;

      return {
        success: true,
        isInside,
        distance,
        geofence: geofenceData.name
      };

    } catch (error) {
      console.error('Failed to check geofence:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Calculate ETA using Google Maps API
   */
  async calculateETA(origin, destination, mode = 'driving') {
    try {
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json`;
      const params = {
        origins: `${origin.latitude},${origin.longitude}`,
        destinations: `${destination.latitude},${destination.longitude}`,
        mode,
        departure_time: 'now',
        traffic_model: 'best_guess',
        key: this.googleMapsApiKey
      };

      const response = await axios.get(url, { params });
      const result = response.data;

      if (result.status === 'OK' && result.rows[0].elements[0].status === 'OK') {
        const element = result.rows[0].elements[0];
        return {
          success: true,
          duration: element.duration.value, // seconds
          durationText: element.duration.text,
          distance: element.distance.value, // meters
          distanceText: element.distance.text,
          durationInTraffic: element.duration_in_traffic?.value
        };
      }

      throw new Error('Unable to calculate ETA');

    } catch (error) {
      console.error('Failed to calculate ETA:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get route between two points
   */
  async getRoute(origin, destination, waypoints = []) {
    try {
      const url = `https://maps.googleapis.com/maps/api/directions/json`;
      const params = {
        origin: `${origin.latitude},${origin.longitude}`,
        destination: `${destination.latitude},${destination.longitude}`,
        mode: 'driving',
        traffic_model: 'best_guess',
        departure_time: 'now',
        key: this.googleMapsApiKey
      };

      if (waypoints.length > 0) {
        params.waypoints = waypoints
          .map(wp => `${wp.latitude},${wp.longitude}`)
          .join('|');
      }

      const response = await axios.get(url, { params });
      const result = response.data;

      if (result.status === 'OK' && result.routes.length > 0) {
        const route = result.routes[0];
        return {
          success: true,
          route: {
            duration: route.legs.reduce((sum, leg) => sum + leg.duration.value, 0),
            distance: route.legs.reduce((sum, leg) => sum + leg.distance.value, 0),
            polyline: route.overview_polyline.points,
            bounds: route.bounds,
            legs: route.legs,
            warnings: route.warnings
          }
        };
      }

      throw new Error('Unable to get route');

    } catch (error) {
      console.error('Failed to get route:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Stop tracking a driver
   */
  async stopTracking(driverId) {
    try {
      // Remove from active drivers
      await this.redis.zrem('drivers:active', driverId);

      // Update tracking data
      await this.redis.hset(
        `tracking:driver:${driverId}`,
        'status',
        'inactive',
        'isOnline',
        'false',
        'endTime',
        new Date().toISOString()
      );

      console.log(`Stopped tracking driver: ${driverId}`);
      return { success: true, driverId };

    } catch (error) {
      console.error('Failed to stop tracking:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * End ride tracking
   */
  async endRideTracking(rideId) {
    try {
      const rideData = await this.redis.hgetall(`tracking:ride:${rideId}`);
      
      if (rideData.rideId) {
        // Update ride status
        await this.redis.hset(
          `tracking:ride:${rideId}`,
          'status',
          'completed',
          'endTime',
          new Date().toISOString()
        );

        // Remove ride from driver tracking
        if (rideData.driverId) {
          await this.redis.hdel(`tracking:driver:${rideData.driverId}`, 'currentRideId');
        }
      }

      console.log(`Ended ride tracking: ${rideId}`);
      return { success: true, rideId };

    } catch (error) {
      console.error('Failed to end ride tracking:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Helper methods
   */

  isValidCoordinate(latitude, longitude) {
    return (
      typeof latitude === 'number' &&
      typeof longitude === 'number' &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180
    );
  }

  async addLocationToHistory(driverId, location) {
    try {
      const historyKey = `history:driver:${driverId}`;
      
      // Add to list (most recent first)
      await this.redis.lpush(historyKey, JSON.stringify(location));
      
      // Trim to max history length
      await this.redis.ltrim(historyKey, 0, this.config.maxLocationHistory - 1);
      
      // Set expiry
      await this.redis.expire(historyKey, this.config.trackingExpiry);

    } catch (error) {
      console.error('Failed to add location to history:', error);
    }
  }

  calculateRouteProgress(route, currentLocation) {
    if (!route.legs || route.legs.length === 0) {
      return { percentage: 0, distanceTraveled: 0, eta: 0 };
    }

    // Simplified progress calculation
    // In production, use more sophisticated route matching
    const totalDistance = route.legs.reduce((sum, leg) => sum + leg.distance.value, 0);
    const totalDuration = route.legs.reduce((sum, leg) => sum + leg.duration.value, 0);
    
    // Calculate distance from start
    const startPoint = {
      latitude: route.legs[0].start_location.lat,
      longitude: route.legs[0].start_location.lng
    };
    
    const distanceFromStart = geolib.getDistance(startPoint, currentLocation);
    const progressPercentage = Math.min((distanceFromStart / totalDistance) * 100, 100);
    
    const remainingDuration = totalDuration * (1 - progressPercentage / 100);

    return {
      percentage: progressPercentage,
      distanceTraveled: distanceFromStart,
      eta: remainingDuration
    };
  }

  async checkLocationAlerts(driverId, location, currentData) {
    try {
      // Check speeding
      if (location.speed > this.config.speedThreshold) {
        await this.triggerAlert('speeding', driverId, {
          speed: location.speed,
          location
        });
      }

      // Check for idle time (if speed is 0 for too long)
      if (location.speed === 0 && currentData.lastSpeedUpdate) {
        const idleTime = Date.now() - new Date(currentData.lastSpeedUpdate).getTime();
        if (idleTime > this.config.maxIdleTime) {
          await this.triggerAlert('idle', driverId, {
            idleTime,
            location
          });
        }
      }

      // Update last speed update time
      if (location.speed > 0) {
        await this.redis.hset(
          `tracking:driver:${driverId}`,
          'lastSpeedUpdate',
          new Date().toISOString()
        );
      }

    } catch (error) {
      console.error('Failed to check location alerts:', error);
    }
  }

  async triggerAlert(alertType, driverId, data) {
    try {
      const alert = {
        type: alertType,
        driverId,
        data,
        timestamp: new Date().toISOString()
      };

      // Save alert
      await this.redis.lpush('alerts:tracking', JSON.stringify(alert));
      
      // Notify admin/monitoring system
      console.log('Tracking alert triggered:', alert);

      // You can integrate with your notification system here
      // await notificationService.sendAlert(alertType, data);

    } catch (error) {
      console.error('Failed to trigger alert:', error);
    }
  }

  async notifyLocationUpdate(passengerId, location, progress) {
    try {
      // This would integrate with your push notification service
      // await pushService.sendLocationUpdate(passengerId, {
      //   location,
      //   progress,
      //   timestamp: new Date().toISOString()
      // });

      console.log(`Location update sent to passenger: ${passengerId}`);

    } catch (error) {
      console.error('Failed to notify location update:', error);
    }
  }

  /**
   * Get tracking statistics
   */
  async getTrackingStats() {
    try {
      const activeDrivers = await this.redis.zcard('drivers:active');
      const onlineDrivers = await this.redis.eval(`
        local drivers = redis.call('keys', 'tracking:driver:*')
        local online = 0
        for i=1,#drivers do
          local isOnline = redis.call('hget', drivers[i], 'isOnline')
          if isOnline == 'true' then
            online = online + 1
          end
        end
        return online
      `, 0);

      return {
        success: true,
        stats: {
          activeDrivers,
          onlineDrivers,
          totalTracked: await this.redis.eval(`
            return #redis.call('keys', 'tracking:driver:*')
          `, 0)
        }
      };

    } catch (error) {
      console.error('Failed to get tracking stats:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Cleanup expired tracking data
   */
  async cleanupExpiredData() {
    try {
      const expiredKeys = await this.redis.eval(`
        local keys = redis.call('keys', 'tracking:*')
        local expired = {}
        for i=1,#keys do
          local ttl = redis.call('ttl', keys[i])
          if ttl == -1 or ttl == 0 then
            table.insert(expired, keys[i])
          end
        end
        return expired
      `, 0);

      if (expiredKeys.length > 0) {
        await this.redis.del(...expiredKeys);
        console.log(`Cleaned up ${expiredKeys.length} expired tracking records`);
      }

      return { success: true, cleanedUp: expiredKeys.length };

    } catch (error) {
      console.error('Failed to cleanup expired data:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get heatmap data for driver locations
   */
  async getLocationHeatmap(bounds, zoom = 10) {
    try {
      const { north, south, east, west } = bounds;
      
      // Get all drivers in bounds
      const drivers = await this.redis.georadiusbymember(
        'drivers:active',
        'dummy', // This would need to be adjusted based on actual Redis GEORADIUS usage
        Math.max(
          geolib.getDistance(
            { latitude: north, longitude: west },
            { latitude: south, longitude: east }
          ) / 1000,
          50
        ),
        'km'
      );

      const heatmapData = [];
      
      for (const driverId of drivers) {
        const location = await this.getDriverLocation(driverId);
        if (location.success && location.location.latitude) {
          heatmapData.push({
            lat: location.location.latitude,
            lng: location.location.longitude,
            weight: 1
          });
        }
      }

      return { success: true, heatmapData };

    } catch (error) {
      console.error('Failed to get location heatmap:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Emergency tracking - high frequency updates
   */
  async startEmergencyTracking(rideId, driverId) {
    try {
      const emergencyData = {
        rideId,
        driverId,
        startTime: new Date().toISOString(),
        status: 'active',
        updateInterval: 1000 // 1 second updates
      };

      await this.redis.hset(
        `emergency:${rideId}`,
        emergencyData
      );

      // Set shorter expiry for emergency tracking
      await this.redis.expire(`emergency:${rideId}`, 3600); // 1 hour

      console.log(`Emergency tracking started for ride: ${rideId}`);
      return { success: true, rideId };

    } catch (error) {
      console.error('Failed to start emergency tracking:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Stop emergency tracking
   */
  async stopEmergencyTracking(rideId) {
    try {
      await this.redis.hset(
        `emergency:${rideId}`,
        'status',
        'stopped',
        'endTime',
        new Date().toISOString()
      );

      console.log(`Emergency tracking stopped for ride: ${rideId}`);
      return { success: true, rideId };

    } catch (error) {
      console.error('Failed to stop emergency tracking:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get traffic conditions for a route
   */
  async getTrafficConditions(origin, destination) {
    try {
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json`;
      const params = {
        origins: `${origin.latitude},${origin.longitude}`,
        destinations: `${destination.latitude},${destination.longitude}`,
        departure_time: 'now',
        traffic_model: 'best_guess',
        key: this.googleMapsApiKey
      };

      const response = await axios.get(url, { params });
      const result = response.data;

      if (result.status === 'OK' && result.rows[0].elements[0].status === 'OK') {
        const element = result.rows[0].elements[0];
        const normalDuration = element.duration.value;
        const trafficDuration = element.duration_in_traffic?.value || normalDuration;
        
        const trafficRatio = trafficDuration / normalDuration;
        let trafficLevel = 'light';
        
        if (trafficRatio > 1.5) trafficLevel = 'heavy';
        else if (trafficRatio > 1.2) trafficLevel = 'moderate';

        return {
          success: true,
          traffic: {
            level: trafficLevel,
            ratio: trafficRatio,
            normalDuration,
            trafficDuration,
            delay: trafficDuration - normalDuration
          }
        };
      }

      throw new Error('Unable to get traffic conditions');

    } catch (error) {
      console.error('Failed to get traffic conditions:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Predict arrival time based on historical data
   */
  async predictArrivalTime(origin, destination, driverId) {
    try {
      // Get current traffic conditions
      const traffic = await this.getTrafficConditions(origin, destination);
      
      if (!traffic.success) {
        return traffic;
      }

      // Get historical data for this driver on similar routes
      const historicalData = await this.getHistoricalRouteData(driverId, origin, destination);
      
      let adjustmentFactor = 1;
      if (historicalData.averageSpeedRatio) {
        adjustmentFactor = historicalData.averageSpeedRatio;
      }

      const predictedDuration = Math.round(
        traffic.traffic.trafficDuration * adjustmentFactor
      );

      return {
        success: true,
        prediction: {
          duration: predictedDuration,
          confidence: historicalData.confidence || 0.7,
          factors: {
            traffic: traffic.traffic.level,
            historical: historicalData.sampleSize || 0,
            adjustment: adjustmentFactor
          }
        }
      };

    } catch (error) {
      console.error('Failed to predict arrival time:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get historical route data for predictions
   */
  async getHistoricalRouteData(driverId, origin, destination) {
    try {
      // This would query your database for historical ride data
      // For now, returning mock data
      return {
        averageSpeedRatio: 0.9,
        sampleSize: 10,
        confidence: 0.8
      };

    } catch (error) {
      console.error('Failed to get historical route data:', error);
      return {};
    }
  }

  /**
   * Monitor driver behavior patterns
   */
  async analyzeDriverBehavior(driverId, timeWindow = 24) {
    try {
      const history = await this.getLocationHistory(driverId, 1000);
      
      if (!history.success || history.history.length < 10) {
        return { success: false, error: 'Insufficient data' };
      }

      const locations = history.history;
      let totalDistance = 0;
      let totalTime = 0;
      let maxSpeed = 0;
      let speedingEvents = 0;
      let hardBraking = 0;
      let hardAcceleration = 0;

      for (let i = 1; i < locations.length; i++) {
        const prev = locations[i - 1];
        const curr = locations[i];
        
        const distance = geolib.getDistance(
          { latitude: prev.latitude, longitude: prev.longitude },
          { latitude: curr.latitude, longitude: curr.longitude }
        );
        
        const timeDiff = (new Date(curr.timestamp) - new Date(prev.timestamp)) / 1000;
        
        if (timeDiff > 0) {
          const speed = (distance / timeDiff) * 3.6; // km/h
          
          totalDistance += distance;
          totalTime += timeDiff;
          maxSpeed = Math.max(maxSpeed, speed);
          
          if (speed > this.config.speedThreshold) {
            speedingEvents++;
          }
          
          // Check for hard braking/acceleration
          if (i > 1) {
            const prevSpeed = prev.speed || 0;
            const speedChange = Math.abs(speed - prevSpeed);
            const acceleration = speedChange / timeDiff;
            
            if (acceleration > 5) { // m/s²
              if (speed < prevSpeed) hardBraking++;
              else hardAcceleration++;
            }
          }
        }
      }

      const averageSpeed = totalTime > 0 ? (totalDistance / 1000) / (totalTime / 3600) : 0;
      
      return {
        success: true,
        behavior: {
          totalDistance: totalDistance / 1000, // km
          totalTime: totalTime / 3600, // hours
          averageSpeed,
          maxSpeed,
          speedingEvents,
          hardBraking,
          hardAcceleration,
          safetyScore: this.calculateSafetyScore({
            speedingEvents,
            hardBraking,
            hardAcceleration,
            totalTime
          })
        }
      };

    } catch (error) {
      console.error('Failed to analyze driver behavior:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Calculate driver safety score
   */
  calculateSafetyScore({ speedingEvents, hardBraking, hardAcceleration, totalTime }) {
    let score = 100;
    
    const hoursOfDriving = totalTime / 3600;
    if (hoursOfDriving === 0) return score;
    
    // Deduct points for safety violations
    score -= (speedingEvents / hoursOfDriving) * 5;
    score -= (hardBraking / hoursOfDriving) * 3;
    score -= (hardAcceleration / hoursOfDriving) * 2;
    
    return Math.max(0, Math.round(score));
  }

  /**
   * Get real-time traffic alerts
   */
  async getTrafficAlerts(location, radius = 10) {
    try {
      // This would integrate with traffic APIs like Google Maps Traffic API
      // or Waze API for real-time traffic alerts
      
      // Mock implementation
      const alerts = [
        {
          type: 'accident',
          location: { latitude: location.latitude + 0.01, longitude: location.longitude + 0.01 },
          severity: 'moderate',
          description: 'Minor accident reported',
          estimatedClearTime: new Date(Date.now() + 30 * 60 * 1000).toISOString()
        }
      ];

      return { success: true, alerts };

    } catch (error) {
      console.error('Failed to get traffic alerts:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Optimize route based on current conditions
   */
  async optimizeRoute(origin, destination, waypoints = []) {
    try {
      const baseRoute = await this.getRoute(origin, destination, waypoints);
      
      if (!baseRoute.success) {
        return baseRoute;
      }

      // Get traffic conditions
      const traffic = await this.getTrafficConditions(origin, destination);
      
      // Get traffic alerts
      const alerts = await this.getTrafficAlerts(origin);

      let optimizedRoute = baseRoute.route;
      let recommendations = [];

      if (traffic.success && traffic.traffic.level === 'heavy') {
        recommendations.push({
          type: 'traffic',
          message: 'Heavy traffic detected. Consider alternative route.',
          impact: `${traffic.traffic.delay} seconds delay expected`
        });
      }

      if (alerts.success && alerts.alerts.length > 0) {
        recommendations.push({
          type: 'incident',
          message: 'Traffic incident detected on route.',
          alerts: alerts.alerts
        });
      }

      return {
        success: true,
        route: optimizedRoute,
        recommendations,
        trafficConditions: traffic.success ? traffic.traffic : null
      };

    } catch (error) {
      console.error('Failed to optimize route:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Close Redis connection
   */
  async close() {
    try {
      await this.redis.quit();
      console.log('Tracking service Redis connection closed');
    } catch (error) {
      console.error('Failed to close Redis connection:', error);
    }
  }
}

module.exports = new TrackingService();