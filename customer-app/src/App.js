import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import RidesPage from './components/RidesPage';
import WalletPage from './components/WalletPage';
import ProfilePage from './components/ProfilePage';
import BookingPage from './components/BookingPage';
import TrackingPage from './components/TrackingPage';
import Navigation from './components/Navigation';
import { LocationProvider } from './utils/LocationContext';
import { BookingProvider } from './utils/BookingContext';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Simulate user authentication
    const userData = {
      id: 1,
      name: 'Muhammad Ali',
      phone: '+92 300 1234567',
      email: 'ali@example.com',
      profileImage: null,
      rating: 4.8,
      totalRides: 247,
      balance: 1250
    };
    setUser(userData);
  }, []);

  return (
    <LocationProvider>
      <BookingProvider>
        <Router>
          <div className="App min-h-screen bg-gray-50">
            <Routes>
              <Route 
                path="/" 
                element={<HomePage user={user} />} 
              />
              <Route 
                path="/rides" 
                element={<RidesPage user={user} />} 
              />
              <Route 
                path="/wallet" 
                element={<WalletPage user={user} />} 
              />
              <Route 
                path="/profile" 
                element={<ProfilePage user={user} setUser={setUser} />} 
              />
              <Route 
                path="/booking/:serviceType" 
                element={<BookingPage user={user} />} 
              />
              <Route 
                path="/tracking/:bookingId" 
                element={<TrackingPage user={user} />} 
              />
            </Routes>
            <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
        </Router>
      </BookingProvider>
    </LocationProvider>
  );
}

export default App;