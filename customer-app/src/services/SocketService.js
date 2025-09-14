import io from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.listeners = new Map();
  }

  connect(token, userId) {
    if (this.socket) {
      this.disconnect();
    }

    const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

    this.socket = io(SOCKET_URL, {
      auth: {
        token: token,
        userId: userId,
        userType: 'customer'
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
    });

    this.setupEventHandlers();
  }

  setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('customer_online', { timestamp: new Date().toISOString() });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.isConnected = false;
      this.reconnectAttempts++;
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on('reconnect_failed', () => {
      console.error('Socket reconnection failed');
      this.isConnected = false;
    });

    // Customer-specific events
    this.setupCustomerEvents();
  }

  setupCustomerEvents() {
    if (!this.socket) return;

    // Ride events
    this.socket.on('ride_accepted', (data) => {
      console.log('Ride accepted:', data);
      this.notifyListeners('ride_accepted', data);
    });

    this.socket.on('driver_assigned', (data) => {
      console.log('Driver assigned:', data);
      this.notifyListeners('driver_assigned', data);
    });

    this.socket.on('driver_arrived', (data) => {
      console.log('Driver arrived:', data);
      this.notifyListeners('driver_arrived', data);
    });

    this.socket.on('ride_started', (data) => {
      console.log('Ride started:', data);
      this.notifyListeners('ride_started', data);
    });

    this.socket.on('ride_completed', (data) => {
      console.log('Ride completed:', data);
      this.notifyListeners('ride_completed', data);
    });

    this.socket.on('ride_cancelled', (data) => {
      console.log('Ride cancelled:', data);
      this.notifyListeners('ride_cancelled', data);
    });

    // Location updates
    this.socket.on('driver_location_update', (data) => {
      this.notifyListeners('driver_location_update', data);
    });

    // Messages
    this.socket.on('driver_message', (data) => {
      console.log('Message from driver:', data);
      this.notifyListeners('driver_message', data);
    });

    // Notifications
    this.socket.on('notification', (data) => {
      console.log('Notification received:', data);
      this.notifyListeners('notification', data);
    });

    // Fare updates
    this.socket.on('fare_updated', (data) => {
      console.log('Fare updated:', data);
      this.notifyListeners('fare_updated', data);
    });

    // Emergency
    this.socket.on('emergency_response', (data) => {
      console.log('Emergency response:', data);
      this.notifyListeners('emergency_response', data);
    });

    // Admin notifications
    this.socket.on('admin_notification', (data) => {
      console.log('Admin notification:', data);
      this.notifyListeners('admin_notification', data);
    });

    // Promotional offers
    this.socket.on('promotional_offer', (data) => {
      console.log('Promotional offer:', data);
      this.notifyListeners('promotional_offer', data);
    });
  }

  // Customer actions
  requestRide(rideData) {
    if (this.isConnected) {
      this.emit('request_ride', rideData);
    }
  }

  cancelRide(rideId, reason) {
    if (this.isConnected) {
      this.emit('cancel_ride', { rideId, reason });
    }
  }

  updateLocation(location) {
    if (this.isConnected) {
      this.emit('customer_location_update', {
        location,
        timestamp: new Date().toISOString()
      });
    }
  }

  sendMessageToDriver(driverId, message) {
    if (this.isConnected) {
      this.emit('customer_message', {
        driverId,
        message,
        timestamp: new Date().toISOString()
      });
    }
  }

  reportEmergency(rideId, emergencyType, location) {
    if (this.isConnected) {
      this.emit('emergency_alert', {
        rideId,
        emergencyType,
        location,
        userType: 'customer',
        timestamp: new Date().toISOString()
      });
    }
  }

  rateDriver(rideId, rating, feedback) {
    if (this.isConnected) {
      this.emit('rate_driver', {
        rideId,
        rating,
        feedback,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Location sharing
  startLocationSharing(rideId) {
    if (this.isConnected) {
      this.emit('start_location_sharing', { rideId });
    }
  }

  stopLocationSharing(rideId) {
    if (this.isConnected) {
      this.emit('stop_location_sharing', { rideId });
    }
  }

  // Generic emit
  emit(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot emit:', event);
    }
  }

  // Event listeners management
  addEventListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  removeEventListener(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  removeAllListeners(event) {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  notifyListeners(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in socket listener:', error);
        }
      });
    }
  }

  // Convenience methods for common events
  onRideAccepted(callback) {
    this.addEventListener('ride_accepted', callback);
  }

  onDriverAssigned(callback) {
    this.addEventListener('driver_assigned', callback);
  }

  onDriverArrived(callback) {
    this.addEventListener('driver_arrived', callback);
  }

  onRideStarted(callback) {
    this.addEventListener('ride_started', callback);
  }

  onRideCompleted(callback) {
    this.addEventListener('ride_completed', callback);
  }

  onRideCancelled(callback) {
    this.addEventListener('ride_cancelled', callback);
  }

  onDriverLocationUpdate(callback) {
    this.addEventListener('driver_location_update', callback);
  }

  onDriverMessage(callback) {
    this.addEventListener('driver_message', callback);
  }

  onNotification(callback) {
    this.addEventListener('notification', callback);
  }

  onFareUpdated(callback) {
    this.addEventListener('fare_updated', callback);
  }

  // Connection management
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
    this.removeAllListeners();
  }

  reconnect() {
    if (this.socket) {
      this.socket.connect();
    }
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      socketId: this.socket?.id
    };
  }
}

// Create and export singleton instance
const socketService = new SocketService();
export default socketService;