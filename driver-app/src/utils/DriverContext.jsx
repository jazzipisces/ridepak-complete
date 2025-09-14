import React, { createContext, useState, useContext } from 'react';

export const DriverContext = createContext();

export const DriverProvider = ({ children, initialDriver }) => {
  const [driver, setDriver] = useState(initialDriver);
  const [driverLocation, setDriverLocation] = useState({ lat: 33.6844, lng: 73.0479 });
  const [isOnline, setIsOnline] = useState(false);

  const updateDriver = (updates) => {
    setDriver(prev => ({ ...prev, ...updates }));
    // Sync with localStorage
    const updatedDriver = { ...driver, ...updates };
    localStorage.setItem('driverData', JSON.stringify(updatedDriver));
  };

  const updateDriverStatus = async (status) => {
    setIsOnline(status === 'online');
    updateDriver({ status });
    
    // In real app, this would call API to update status
    try {
      // await api.updateDriverStatus(driver.id, status);
      console.log(`Driver status updated to: ${status}`);
    } catch (error) {
      console.error('Failed to update driver status:', error);
    }
  };

  const updateLocation = (location) => {
    setDriverLocation(location);
    
    // In real app, this would send location to server for tracking
    try {
      // await api.updateDriverLocation(driver.id, location);
    } catch (error) {
      console.error('Failed to update location:', error);
    }
  };

  const value = {
    driver,
    setDriver,
    updateDriver,
    driverLocation,
    setDriverLocation,
    updateLocation,
    isOnline,
    updateDriverStatus
  };

  return (
    <DriverContext.Provider value={value}>
      {children}
    </DriverContext.Provider>
  );
};

export const useDriver = () => {
  const context = useContext(DriverContext);
  if (!context) {
    throw new Error('useDriver must be used within a DriverProvider');
  }
  return context;
};