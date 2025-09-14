import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Car, 
  Package, 
  Calendar, 
  Menu, 
  Navigation,
  Bell,
  Star
} from 'lucide-react';
import NavBar from './NavBar';
import ServiceTabs from './ServiceTabs';
import LocationInput from './LocationInput';
import { LocationContext } from '../utils/LocationContext';
import { locations } from '../utils/locationData';

const HomePage = ({ user }) => {
  const navigate = useNavigate();
  const { currentLocation } = useContext(LocationContext);
  const [serviceType, setServiceType] = useState('ride');
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropLocation, setDropLocation] = useState('');

  const allLocations = Object.values(locations).flat();

  const handleQuickBook = (service) => {
    setServiceType(service);
    navigate(`/booking/${service}`);
  };

  const handleFindRide = () => {
    if (!pickupLocation || !dropLocation) {
      alert('Please select pickup and drop locations');
      return;
    }
    navigate(`/booking/${serviceType}`, {
      state: {
        pickup: pickupLocation,
        drop: dropLocation,
        serviceType: serviceType
      }
    });
  };

  const quickServices = [
    { 
      id: 'ride', 
      name: 'Quick Ride', 
      icon: Car, 
      color: 'bg-blue-100 text-blue-600',
      description: 'Book a ride in the city'
    },
    { 
      id: 'intercity', 
      name: 'City to City', 
      icon: Navigation, 
      color: 'bg-green-100 text-green-600',
      description: 'Travel between cities'
    },
    { 
      id: 'cargo', 
      name: 'Cargo', 
      icon: Package, 
      color: 'bg-orange-100 text-orange-600',
      description: 'Deliver packages & goods'
    },
    { 
      id: 'rental', 
      name: 'Rental', 
      icon: Calendar, 
      color: 'bg-purple-100 text-purple-600',
      description: 'Daily car rentals'
    }
  ];

  const recentDestinations = [
    { name: 'F-7 Markaz', address: 'Islamabad' },
    { name: 'Blue Area', address: 'Islamabad' },
    { name: 'Centaurus Mall', address: 'Islamabad' },
    { name: 'Pakistan Monument', address: 'Islamabad' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <NavBar user={user} />
      
      {/* Welcome Section */}
      <div className="bg-green-600 text-white p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-medium">
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0]}!
            </h2>
            <p className="text-green-100 text-sm">Where would you like to go?</p>
          </div>
          <Bell className="w-6 h-6" />
        </div>
      </div>

      <ServiceTabs serviceType={serviceType} setServiceType={setServiceType} />
      
      <div className="p-4 space-y-6">
        {/* Location Inputs */}
        <div className="space-y-4">
          <LocationInput
            value={pickupLocation}
            onChange={setPickupLocation}
            placeholder="Pickup Location"
            locations={allLocations}
            icon={<div className="w-3 h-3 bg-green-600 rounded-full"></div>}
          />
          
          <LocationInput
            value={dropLocation}
            onChange={setDropLocation}
            placeholder="Drop Location"
            locations={allLocations}
            icon={<div className="w-3 h-3 bg-red-600 rounded-full"></div>}
          />

          <button
            onClick={handleFindRide}
            className="w-full bg-green-600 text-white py-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Find Ride
          </button>
        </div>

        {/* Quick Services */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Quick Services</h3>
          <div className="grid grid-cols-2 gap-4">
            {quickServices.map(service => (
              <button
                key={service.id}
                onClick={() => handleQuickBook(service.id)}
                className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
              >
                <div className={`w-12 h-12 rounded-lg ${service.color} flex items-center justify-center mb-3 mx-auto`}>
                  <service.icon className="w-6 h-6" />
                </div>
                <h4 className="font-medium text-gray-800 mb-1">{service.name}</h4>
                <p className="text-xs text-gray-500">{service.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Destinations */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Recent Destinations</h3>
          <div className="space-y-3">
            {recentDestinations.map((destination, index) => (
              <button
                key={index}
                onClick={() => setDropLocation(destination.name)}
                className="w-full bg-white p-4 rounded-lg shadow-sm border flex items-center space-x-3 hover:bg-gray-50"
              >
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-medium text-gray-800">{destination.name}</h4>
                  <p className="text-sm text-gray-500">{destination.address}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Promotional Banner */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold mb-1">Special Offer!</h3>
              <p className="text-sm text-blue-100">Get 20% off on your first intercity ride</p>
            </div>
            <div className="bg-white bg-opacity-20 px-4 py-2 rounded-lg">
              <span className="text-sm font-medium">FIRST20</span>
            </div>
          </div>
        </div>

        {/* Driver Rating */}
        {user && (
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-800">Your Rating</h3>
                <p className="text-sm text-gray-500">Based on {user.totalRides} rides</p>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                <span className="font-semibold text-gray-800">{user.rating}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;