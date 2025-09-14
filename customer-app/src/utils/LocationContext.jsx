import React, { createContext, useState, useEffect } from 'react';

export const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [currentLocation, setCurrentLocation] = useState('Islamabad');
  const [coordinates, setCoordinates] = useState({ lat: 33.6844, lng: 73.0479 });

  useEffect(() => {
    // Try to get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCoordinates({ lat: latitude, lng: longitude });
          
          // Here you would typically use a reverse geocoding service
          // to convert coordinates to a readable address
          // For now, we'll keep the default location
        },
        (error) => {
          console.log('Location access denied or unavailable');
          // Keep default location
        }
      );
    }
  }, []);

  const value = {
    currentLocation,
    setCurrentLocation,
    coordinates,
    setCoordinates
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};