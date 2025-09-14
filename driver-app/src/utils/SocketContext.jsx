import React, { createContext, useContext, useEffect, useState } from 'react';
// import io from 'socket.io-client';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize socket connection
    // In a real app, you would use actual socket.io
    // const newSocket = io(process.env.REACT_APP_WEBSOCKET_URL || 'ws://localhost:5000');
    
    // Mock socket for development
    const mockSocket = {
      emit: (event, data) => {
        console.log('Socket emit:', event, data);
      },
      on: (event, callback) => {
        console.log('Socket listener added for:', event);
        // Store callback for mock events
      },
      off: (event, callback) => {
        console.log('Socket listener removed for:', event);
      },
      disconnect: () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      }
    };

    setSocket(mockSocket);
    setIsConnected(true);

    // Simulate connection events
    setTimeout(() => {
      console.log('Socket connected (mock)');
    }, 1000);

    // Cleanup
    return () => {
      if (mockSocket) {
        mockSocket.disconnect();
      }
    };
  }, []);

  // Socket event handlers
  const emitDriverLocation = (location) => {
    if (socket && isConnected) {
      socket.emit('driver:location-update', {
        driverId: 'current-driver-id', // Get from DriverContext in real app
        location,
        timestamp: new Date().toISOString()
      });
    }
  };

  const emitDriverStatus = (status) => {
    if (socket && isConnected) {
      socket.emit('driver:status-update', {
        driverId: 'current-driver-id',
        status,
        timestamp: new Date().toISOString()
      });
    }
  };

  const emitRideUpdate = (rideId, status, data = {}) => {
    if (socket && isConnected) {
      socket.emit('ride:status-update', {
        rideId,
        status,
        driverId: 'current-driver-id',
        ...data,
        timestamp: new Date().toISOString()
      });
    }
  };

  const joinDriverRoom = (driverId) => {
    if (socket && isConnected) {
      socket.emit('driver:join-room', { driverId });
    }
  };

  const leaveDriverRoom = (driverId) => {
    if (socket && isConnected) {
      socket.emit('driver:leave-room', { driverId });
    }
  };

  // Listen for ride requests
  const onRideRequest = (callback) => {
    if (socket) {
      socket.on('ride:new-request', callback);
      return () => socket.off('ride:new-request', callback);
    }
  };

  // Listen for ride cancellations
  const onRideCancellation = (callback) => {
    if (socket) {
      socket.on('ride:cancelled-by-customer', callback);
      return () => socket.off('ride:cancelled-by-customer', callback);
    }
  };

  // Listen for customer messages
  const onCustomerMessage = (callback) => {
    if (socket) {
      socket.on('ride:customer-message', callback);
      return () => socket.off('ride:customer-message', callback);
    }
  };

  // Listen for admin notifications
  const onAdminNotification = (callback) => {
    if (socket) {
      socket.on('admin:notification', callback);
      return () => socket.off('admin:notification', callback);
    }
  };

  const value = {
    socket,
    isConnected,
    emitDriverLocation,
    emitDriverStatus,
    emitRideUpdate,
    joinDriverRoom,
    leaveDriverRoom,
    onRideRequest,
    onRideCancellation,
    onCustomerMessage,
    onAdminNotification
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
  return context;
};