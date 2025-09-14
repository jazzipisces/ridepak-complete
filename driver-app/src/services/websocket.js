import { io } from 'socket.io-client';
import { APP_CONFIG, WEBSOCKET_EVENTS, STORAGE_KEYS } from '../constants';
import { getStoredToken } from '../utils/storage';
import toast from 'react-hot-toast';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.eventListeners = new Map();
    this.connectionPromise = null;
  }

  // Initialize connection
  connect() {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        const token = getStoredToken(STORAGE_KEYS.ACCESS_TOKEN);
        
        if (!token) {
          reject(new Error('No authentication token found'));
          return;
        }

        this.socket = io(APP_CONFIG.websocketUrl, {
          auth: {
            token: `Bearer ${token}`,
          },
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionDelay: this.reconnectDelay,
          reconnectionAttempts: this.maxReconnectAttempts,
          timeout: 10000,
        });

        this.setupEventListeners();
        
        this.socket.on('connect', () => {
          console.log('WebSocket connected:', this.socket.id);
          this.isConnected = true;
          this.reconnectAttempts = 0;
          resolve(this.socket);
        });

        this.socket.on('connect_error', (error) => {
          console.error('WebSocket connection error:', error);
          this.isConnected = false;
          reject(error);
        });

      } catch (error) {
        console.error('WebSocket initialization error:', error);
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  // Setup default event listeners
  setupEventListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.isConnected = false;
      
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, reconnect manually
        setTimeout(() => this.reconnect(), this.reconnectDelay);
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('WebSocket reconnected after', attemptNumber, 'attempts');
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('WebSocket reconnection attempt:', attemptNumber);
      this.reconnectAttempts = attemptNumber;
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('WebSocket reconnection error:', error);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('WebSocket reconnection failed');
      toast.error('Connection lost. Please refresh the page.');
    });

    // Handle ride requests
    this.socket.on(WEBSOCKET_EVENTS.RIDE_REQUEST, (rideData) => {
      console.log('New ride request:', rideData);
      this.handleRideRequest(rideData);
    });

    // Handle ride cancellations
    this.socket.on(WEBSOCKET_EVENTS.RIDE_CANCELLED, (rideData) => {
      console.log('Ride cancelled:', rideData);
      this.handleRideCancellation(rideData);
    });

    // Handle general notifications
    this.socket.on(WEBSOCKET_EVENTS.NOTIFICATION, (notification) => {
      console.log('New notification:', notification);
      this.handleNotification(notification);
    });

    // Handle messages
    this.socket.on(WEBSOCKET_EVENTS.MESSAGE, (message) => {
      console.log('New message:', message);
      this.handleMessage(message);
    });
  }

  // Handle ride request
  handleRideRequest(rideData) {
    // Show notification
    this.showRideRequestNotification(rideData);
    
    // Emit to registered listeners
    this.emit('ride_request', rideData);
    
    // Play notification sound
    this.playNotificationSound();
  }

  // Handle ride cancellation
  handleRideCancellation(rideData) {
    toast.info(`Ride #${rideData.id} has been cancelled`);
    this.emit('ride_cancelled', rideData);
  }

  // Handle notifications
  handleNotification(notification) {
    toast.success(notification.message);
    this.emit('notification', notification);
  }

  // Handle messages
  handleMessage(message) {
    this.emit('message', message);
  }

  // Show ride request notification
  showRideRequestNotification(rideData) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification('New Ride Request', {
        body: `Pickup: ${rideData.pickupAddress}`,
        icon: '/logo192.png',
        badge: '/badge-72.png',
        tag: `ride-${rideData.id}`,
        requireInteraction: true,
        actions: [
          { action: 'accept', title: 'Accept' },
          { action: 'decline', title: 'Decline' }
        ]
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  }

  // Play notification sound
  playNotificationSound() {
    try {
      const audio = new Audio('/sounds/notification.mp3');
      audio.play().catch(e => console.log('Could not play notification sound:', e));
    } catch (error) {
      console.log('Notification sound not available:', error);
    }
  }

  // Disconnect
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.connectionPromise = null;
    }
  }

  // Reconnect
  reconnect() {
    this.disconnect();
    return this.connect();
  }

  // Send location update
  updateLocation(location) {
    if (this.isConnected && this.socket) {
      this.socket.emit(WEBSOCKET_EVENTS.LOCATION_UPDATE, {
        latitude: location.latitude,
        longitude: location.longitude,
        heading: location.heading,
        speed: location.speed,
        timestamp: Date.now(),
      });
    }
  }

  // Send status update
  updateStatus(status) {
    if (this.isConnected && this.socket) {
      this.socket.emit(WEBSOCKET_EVENTS.STATUS_UPDATE, {
        status,
        timestamp: Date.now(),
      });
    }
  }

  // Send message
  sendMessage(message) {
    if (this.isConnected && this.socket) {
      this.socket.emit(WEBSOCKET_EVENTS.MESSAGE, message);
    }
  }

  // Event listener management
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
    }
  }

  // Join driver room
  joinDriverRoom(driverId) {
    if (this.isConnected && this.socket) {
      this.socket.emit('join_driver_room', { driverId });
    }
  }

  // Leave driver room
  leaveDriverRoom(driverId) {
    if (this.isConnected && this.socket) {
      this.socket.emit('leave_driver_room', { driverId });
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      socketId: this.socket?.id || null,
    };
  }

  // Request notification permission
  static async requestNotificationPermission() {
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      }
      return Notification.permission === 'granted';
    }
    return false;
  }
}

// Create singleton instance
const webSocketService = new WebSocketService();

// Auto-connect when service is imported
if (typeof window !== 'undefined') {
  // Request notification permission on first load
  WebSocketService.requestNotificationPermission();
}

export default webSocketService;