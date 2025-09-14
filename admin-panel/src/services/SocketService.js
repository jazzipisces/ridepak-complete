import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  useEffect(() => {
    // Initialize socket connection
    const initSocket = () => {
      const token = localStorage.getItem('admin_token');
      
      if (!token) {
        console.log('No admin token found, skipping socket connection');
        return;
      }

      const socketInstance = io(SOCKET_URL, {
        auth: {
          token: token,
          role: 'admin'
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      // Connection event handlers
      socketInstance.on('connect', () => {
        console.log('Admin socket connected:', socketInstance.id);
        setConnected(true);
        setReconnectAttempts(0);
        
        // Join admin room for admin-specific events
        socketInstance.emit('join_admin_room');
      });

      socketInstance.on('disconnect', (reason) => {
        console.log('Admin socket disconnected:', reason);
        setConnected(false);
      });

      socketInstance.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setConnected(false);
        setReconnectAttempts(prev => prev + 1);
      });

      socketInstance.on('reconnect', (attemptNumber) => {
        console.log('Socket reconnected after', attemptNumber, 'attempts');
        setConnected(true);
        setReconnectAttempts(0);
      });

      socketInstance.on('reconnect_failed', () => {
        console.error('Socket reconnection failed');
        setConnected(false);
      });

      // Admin-specific event handlers
      setupAdminEventHandlers(socketInstance);

      setSocket(socketInstance);
    };

    initSocket();

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
    };
  }, []);

  const setupAdminEventHandlers = (socketInstance) => {
    // Real-time ride events
    socketInstance.on('ride_created', (rideData) => {
      console.log('New ride created:', rideData);
      // This will be handled by individual components
    });

    socketInstance.on('ride_updated', (rideData) => {
      console.log('Ride updated:', rideData);
    });

    socketInstance.on('ride_cancelled', (rideData) => {
      console.log('Ride cancelled:', rideData);
    });

    // Driver events
    socketInstance.on('driver_online', (driverData) => {
      console.log('Driver came online:', driverData);
    });

    socketInstance.on('driver_offline', (driverData) => {
      console.log('Driver went offline:', driverData);
    });

    socketInstance.on('driver_location_update', (locationData) => {
      console.log('Driver location updated:', locationData);
    });

    // Customer events
    socketInstance.on('customer_registered', (customerData) => {
      console.log('New customer registered:', customerData);
    });

    // System events
    socketInstance.on('system_alert', (alertData) => {
      console.log('System alert:', alertData);
    });

    socketInstance.on('stats_update', (statsData) => {
      console.log('Stats updated:', statsData);
    });

    // Payment events
    socketInstance.on('payment_completed', (paymentData) => {
      console.log('Payment completed:', paymentData);
    });

    socketInstance.on('payment_failed', (paymentData) => {
      console.log('Payment failed:', paymentData);
    });

    // Emergency events
    socketInstance.on('emergency_alert', (emergencyData) => {
      console.log('Emergency alert:', emergencyData);
    });
  };

  // Admin action functions
  const adminActions = {
    // Broadcast message to all drivers
    broadcastToDrivers: (message) => {
      if (socket && connected) {
        socket.emit('admin_broadcast_drivers', message);
      }
    },

    // Broadcast message to all customers
    broadcastToCustomers: (message) => {
      if (socket && connected) {
        socket.emit('admin_broadcast_customers', message);
      }
    },

    // Send notification to specific driver
    notifyDriver: (driverId, notification) => {
      if (socket && connected) {
        socket.emit('admin_notify_driver', {
          driver_id: driverId,
          notification
        });
      }
    },

    // Send notification to specific customer
    notifyCustomer: (customerId, notification) => {
      if (socket && connected) {
        socket.emit('admin_notify_customer', {
          customer_id: customerId,
          notification
        });
      }
    },

    // Force driver offline (emergency)
    forceDriverOffline: (driverId, reason) => {
      if (socket && connected) {
        socket.emit('admin_force_driver_offline', {
          driver_id: driverId,
          reason
        });
      }
    },

    // Cancel ride (admin override)
    cancelRide: (rideId, reason) => {
      if (socket && connected) {
        socket.emit('admin_cancel_ride', {
          ride_id: rideId,
          reason
        });
      }
    },

    // Request driver location update
    requestDriverLocation: (driverId) => {
      if (socket && connected) {
        socket.emit('admin_request_driver_location', {
          driver_id: driverId
        });
      }
    },

    // Emergency broadcast
    emergencyBroadcast: (message, severity = 'high') => {
      if (socket && connected) {
        socket.emit('admin_emergency_broadcast', {
          message,
          severity,
          timestamp: new Date().toISOString()
        });
      }
    },

    // System maintenance notification
    maintenanceNotification: (startTime, duration, affectedServices) => {
      if (socket && connected) {
        socket.emit('admin_maintenance_notification', {
          start_time: startTime,
          duration,
          affected_services: affectedServices
        });
      }
    },

    // Update app settings in real-time
    updateAppSettings: (settingsType, settings) => {
      if (socket && connected) {
        socket.emit('admin_update_app_settings', {
          type: settingsType, // 'driver' or 'customer'
          settings
        });
      }
    },

    // Monitor specific ride in real-time
    monitorRide: (rideId) => {
      if (socket && connected) {
        socket.emit('admin_monitor_ride', { ride_id: rideId });
      }
    },

    // Stop monitoring ride
    stopMonitoringRide: (rideId) => {
      if (socket && connected) {
        socket.emit('admin_stop_monitor_ride', { ride_id: rideId });
      }
    }
  };

  const value = {
    socket,
    connected,
    reconnectAttempts,
    actions: adminActions,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context.socket;
};

export const useSocketConnection = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocketConnection must be used within a SocketProvider');
  }
  return {
    socket: context.socket,
    connected: context.connected,
    reconnectAttempts: context.reconnectAttempts,
    actions: context.actions
  };
};