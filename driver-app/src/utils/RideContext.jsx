import React, { createContext, useState, useContext } from 'react';

export const RideContext = createContext();

export const RideProvider = ({ children }) => {
  const [activeRide, setActiveRide] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [rideHistory, setRideHistory] = useState([]);

  const acceptRide = async (rideRequest) => {
    try {
      // Remove from pending requests
      setPendingRequests(prev => prev.filter(req => req.id !== rideRequest.id));
      
      // Set as active ride
      const activeRideData = {
        ...rideRequest,
        status: 'accepted',
        acceptedAt: new Date().toISOString(),
        driverId: 'current-driver-id' // In real app, get from DriverContext
      };
      
      setActiveRide(activeRideData);
      
      // In real app, notify server
      // await api.acceptRide(rideRequest.id);
      
      console.log('Ride accepted:', activeRideData);
      return activeRideData;
    } catch (error) {
      console.error('Failed to accept ride:', error);
      throw error;
    }
  };

  const declineRide = async (rideRequestId) => {
    try {
      // Remove from pending requests
      setPendingRequests(prev => prev.filter(req => req.id !== rideRequestId));
      
      // In real app, notify server
      // await api.declineRide(rideRequestId);
      
      console.log('Ride declined:', rideRequestId);
    } catch (error) {
      console.error('Failed to decline ride:', error);
      throw error;
    }
  };

  const startRide = async (rideId) => {
    try {
      if (activeRide && activeRide.id === rideId) {
        const updatedRide = {
          ...activeRide,
          status: 'in_progress',
          startedAt: new Date().toISOString()
        };
        
        setActiveRide(updatedRide);
        
        // In real app, notify server and customer
        // await api.startRide(rideId);
        
        console.log('Ride started:', updatedRide);
        return updatedRide;
      }
    } catch (error) {
      console.error('Failed to start ride:', error);
      throw error;
    }
  };

  const completeRide = async (rideId, completionData = {}) => {
    try {
      if (activeRide && activeRide.id === rideId) {
        const completedRide = {
          ...activeRide,
          status: 'completed',
          completedAt: new Date().toISOString(),
          ...completionData
        };
        
        // Move to history
        setRideHistory(prev => [completedRide, ...prev]);
        setActiveRide(null);
        
        // In real app, notify server and process payment
        // await api.completeRide(rideId, completionData);
        
        console.log('Ride completed:', completedRide);
        return completedRide;
      }
    } catch (error) {
      console.error('Failed to complete ride:', error);
      throw error;
    }
  };

  const cancelRide = async (rideId, reason = '') => {
    try {
      if (activeRide && activeRide.id === rideId) {
        const cancelledRide = {
          ...activeRide,
          status: 'cancelled',
          cancelledAt: new Date().toISOString(),
          cancellationReason: reason
        };
        
        // Move to history
        setRideHistory(prev => [cancelledRide, ...prev]);
        setActiveRide(null);
        
        // In real app, notify server and customer
        // await api.cancelRide(rideId, reason);
        
        console.log('Ride cancelled:', cancelledRide);
        return cancelledRide;
      }
    } catch (error) {
      console.error('Failed to cancel ride:', error);
      throw error;
    }
  };

  const addPendingRequest = (rideRequest) => {
    setPendingRequests(prev => [...prev, rideRequest]);
  };

  const removePendingRequest = (requestId) => {
    setPendingRequests(prev => prev.filter(req => req.id !== requestId));
  };

  const updateRideStatus = (rideId, status, additionalData = {}) => {
    if (activeRide && activeRide.id === rideId) {
      setActiveRide(prev => ({
        ...prev,
        status,
        ...additionalData,
        updatedAt: new Date().toISOString()
      }));
    }
  };

  const value = {
    activeRide,
    setActiveRide,
    pendingRequests,
    setPendingRequests,
    rideHistory,
    setRideHistory,
    acceptRide,
    declineRide,
    startRide,
    completeRide,
    cancelRide,
    addPendingRequest,
    removePendingRequest,
    updateRideStatus
  };

  return (
    <RideContext.Provider value={value}>
      {children}
    </RideContext.Provider>
  );
};

export const useRide = () => {
  const context = useContext(RideContext);
  if (!context) {
    throw new Error('useRide must be used within a RideProvider');
  }
  return context;
};