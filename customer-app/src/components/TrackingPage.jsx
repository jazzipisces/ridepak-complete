import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  MessageCircle, 
  Star,
  Navigation,
  Clock,
  User,
  Car,
  Shield
} from 'lucide-react';

const TrackingPage = ({ user }) => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [driverLocation, setDriverLocation] = useState({ lat: 33.6844, lng: 73.0479 });
  const [estimatedArrival, setEstimatedArrival] = useState('5 mins');
  const [rideStatus, setRideStatus] = useState('driver_assigned');

  // Mock booking data
  const booking = {
    id: bookingId,
    from: 'Blue Area',
    to: 'F-7 Markaz',
    serviceType: 'ride',
    vehicle: 'Car',
    fare: 180,
    driver: {
      name: 'Ahmad Khan',
      phone: '+92 300 1234567',
      rating: 4.8,
      totalRides: 247,
      vehicle: 'Toyota Corolla',
      plateNumber: 'ABC-123',
      profileImage: null
    },
    estimatedTime: '15 mins',
    bookedAt: '14:30'
  };

  const statusMessages = {
    driver_assigned: 'Driver has been assigned to your ride',
    driver_arriving: 'Driver is on the way to pickup location',
    arrived: 'Driver has arrived at pickup location',
    picked_up: 'You have been picked up',
    in_transit: 'On the way to destination',
    completed: 'Ride completed successfully'
  };

  const statusSteps = [
    { id: 'driver_assigned', name: 'Driver Assigned', completed: true },
    { id: 'driver_arriving', name: 'Driver Arriving', completed: true },
    { id: 'arrived', name: 'Driver Arrived', completed: rideStatus !== 'driver_assigned' },
    { id: 'picked_up', name: 'Picked Up', completed: false },
    { id: 'in_transit', name: 'In Transit', completed: false },
    { id: 'completed', name: 'Completed', completed: false }
  ];

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      // Update driver location (mock movement)
      setDriverLocation(prev => ({
        lat: prev.lat + (Math.random() - 0.5) * 0.001,
        lng: prev.lng + (Math.random() - 0.5) * 0.001
      }));

      // Update estimated arrival time
      const times = ['4 mins', '3 mins', '2 mins', '1 min', 'Arriving now'];
      const currentIndex = times.indexOf(estimatedArrival);
      if (currentIndex < times.length - 1) {
        setEstimatedArrival(times[currentIndex + 1]);
      }
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [estimatedArrival]);

  const handleCall = () => {
    window.location.href = `tel:${booking.driver.phone}`;
  };

  const handleMessage = () => {
    // In a real app, this would open a chat interface
    alert('Chat feature would open here');
  };

  const handleEmergency = () => {
    // Emergency contact functionality
    alert('Emergency services have been notified');
  };

  const handleCancelRide = () => {
    if (window.confirm('Are you sure you want to cancel this ride?')) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold">Track Your Ride</h1>
            <p className="text-sm text-gray-600">Booking ID: {bookingId}</p>
          </div>
        </div>
      </div>

      {/* Map Area */}
      <div className="bg-white">
        <div className="h-64 bg-gradient-to-br from-green-100 to-blue-100 relative overflow-hidden">
          {/* Mock Map */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Navigation className="w-12 h-12 text-green-600 mx-auto mb-2" />
              <p className="text-gray-600 text-sm">Live tracking map would appear here</p>
              <p className="text-xs text-gray-500 mt-1">Driver location: {driverLocation.lat.toFixed(4)}, {driverLocation.lng.toFixed(4)}</p>
            </div>
          </div>
          
          {/* Driver Location Pin */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-6 h-6 bg-blue-600 rounded-full border-2 border-white shadow-lg pulse"></div>
          </div>
          
          {/* Pickup Location Pin */}
          <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-4 h-4 bg-green-600 rounded-full border-2 border-white"></div>
          </div>
          
          {/* Drop Location Pin */}
          <div className="absolute bottom-1/4 right-1/4 transform translate-x-1/2 translate-y-1/2">
            <div className="w-4 h-4 bg-red-600 rounded-full border-2 border-white"></div>
          </div>
        </div>

        {/* Trip Info */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                <Clock className="w-4 h-4" />
                <span>Estimated arrival: {estimatedArrival}</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  <span className="text-gray-800">{booking.from}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                  <span className="text-gray-800">{booking.to}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-green-600">₨{booking.fare}</div>
              <div className="text-sm text-gray-500 capitalize">{booking.serviceType}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Progress */}
      <div className="bg-white p-4 border-b">
        <h3 className="font-semibold text-gray-800 mb-4">Ride Status</h3>
        <div className="space-y-3">
          {statusSteps.map((step, index) => (
            <div key={step.id} className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                step.completed 
                  ? 'bg-green-600 text-white' 
                  : rideStatus === step.id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200'
              }`}>
                {step.completed ? '✓' : index + 1}
              </div>
              <span className={`text-sm ${
                step.completed || rideStatus === step.id 
                  ? 'text-gray-800 font-medium' 
                  : 'text-gray-500'
              }`}>
                {step.name}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">{statusMessages[rideStatus]}</p>
        </div>
      </div>

      {/* Driver Info */}
      <div className="bg-white p-4 border-b">
        <h3 className="font-semibold text-gray-800 mb-4">Driver Details</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              {booking.driver.profileImage ? (
                <img 
                  src={booking.driver.profileImage} 
                  alt="Driver" 
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <User className="w-6 h-6 text-blue-600" />
              )}
            </div>
            <div>
              <h4 className="font-medium text-gray-800">{booking.driver.name}</h4>
              <p className="text-sm text-gray-600">{booking.driver.vehicle} • {booking.driver.plateNumber}</p>
              <div className="flex items-center space-x-1 mt-1">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm font-medium">{booking.driver.rating}</span>
                <span className="text-sm text-gray-500">({booking.driver.totalRides} rides)</span>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleCall}
              className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center hover:bg-green-700"
            >
              <Phone className="w-5 h-5" />
            </button>
            <button
              onClick={handleMessage}
              className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700"
            >
              <MessageCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 space-y-3">
        <button
          onClick={handleEmergency}
          className="w-full bg-red-600 text-white py-4 rounded-lg font-medium hover:bg-red-700 flex items-center justify-center space-x-2"
        >
          <Shield className="w-5 h-5" />
          <span>Emergency</span>
        </button>
        
        <button
          onClick={handleCancelRide}
          className="w-full bg-gray-600 text-white py-4 rounded-lg font-medium hover:bg-gray-700"
        >
          Cancel Ride
        </button>

        <div className="text-center">
          <button className="text-green-600 text-sm font-medium hover:text-green-700">
            Share Trip Details
          </button>
        </div>
      </div>

      {/* Safety Info */}
      <div className="p-4 bg-gray-50">
        <div className="bg-white p-4 rounded-lg border">
          <h4 className="font-medium text-gray-800 mb-2">Safety First</h4>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Your trip is being tracked in real-time</p>
            <p>• Emergency contacts have been notified</p>
            <p>• All drivers are verified and background checked</p>
            <p>• 24/7 support available: +92 300 PAKRIDE</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackingPage;