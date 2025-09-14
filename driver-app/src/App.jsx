import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginScreen from './components/LoginScreen';
import DashboardScreen from './components/DashboardScreen';
import RideRequestScreen from './components/RideRequestScreen';
import NavigationScreen from './components/NavigationScreen';
import EarningsScreen from './components/EarningsScreen';
import ProfileScreen from './components/ProfileScreen';
import VehicleScreen from './components/VehicleScreen';
import DocumentsScreen from './components/DocumentsScreen';
import Navigation from './components/Navigation';
import { DriverProvider } from './utils/DriverContext';
import { RideProvider } from './utils/RideContext';
import { SocketProvider } from './utils/SocketContext';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [driver, setDriver] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored authentication
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('driverToken');
        const storedDriver = localStorage.getItem('driverData');
        
        if (token && storedDriver) {
          setDriver(JSON.parse(storedDriver));
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('driverToken');
        localStorage.removeItem('driverData');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = (driverData, token) => {
    localStorage.setItem('driverToken', token);
    localStorage.setItem('driverData', JSON.stringify(driverData));
    setDriver(driverData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('driverToken');
    localStorage.removeItem('driverData');
    setDriver(null);
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-blue-600 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading PakRide Driver...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <DriverProvider initialDriver={driver}>
      <RideProvider>
        <SocketProvider>
          <Router>
            <div className="App min-h-screen bg-gray-50">
              <Routes>
                <Route path="/" element={<DashboardScreen />} />
                <Route path="/dashboard" element={<DashboardScreen />} />
                <Route path="/ride-request/:requestId" element={<RideRequestScreen />} />
                <Route path="/navigation/:rideId" element={<NavigationScreen />} />
                <Route path="/earnings" element={<EarningsScreen />} />
                <Route path="/profile" element={<ProfileScreen onLogout={handleLogout} />} />
                <Route path="/vehicle" element={<VehicleScreen />} />
                <Route path="/documents" element={<DocumentsScreen />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
              <Navigation />
            </div>
          </Router>
        </SocketProvider>
      </RideProvider>
    </DriverProvider>
  );
}

export default App;