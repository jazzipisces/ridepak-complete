import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Navigation, 
  Phone, 
  MessageCircle, 
  MapPin, 
  Clock, 
  User,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  RotateCcw,
  Shield,
  Camera
} from 'lucide-react';

const NavigationScreen = () => {
  const { rideId } = useParams();
  const navigate = useNavigate();
  
  const [rideStatus, setRideStatus] = useState('heading_to_pickup'); // heading_to_pickup, arrived_pickup, in_transit, completed
  const [estimatedTime, setEstimatedTime] = useState('5 mins');
  const [distance, setDistance] = useState('2.3 km');
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [otp, setOtp] = useState('');

  // Mock ride data
  const ride = {
    id: rideId,
    customer: {
      name: 'Sarah Ahmed',
      phone: '+92 300 1234567',
      rating: 4.7,
      otp: '1234'
    },
    pickup: {
      address: 'Blue Area, Islamabad',
      landmark: 'Near Jinnah Super Market'
    },
    destination: {
      address: 'F-7 Markaz, Islamabad',
      landmark: 'Main Market Entrance'
    },
    fare: 180,
    startTime: new Date().toISOString(),
    paymentMethod: 'cash'
  };

  useEffect(() => {
    // Simulate navigation updates
    const interval = setInterval(() => {
      // Update ETA and distance (mock)
      if (rideStatus === 'heading_to_pickup') {
        setEstimatedTime(prev => {
          const current = parseInt(prev);
          return current > 1 ? `${current - 1} mins` : 'Arriving now';
        });
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [rideStatus]);

  const handleStatusUpdate = (newStatus) => {
    setRideStatus(newStatus);
    
    switch (newStatus) {
      case 'arrived_pickup':
        setShowOTPInput(true);
        // Notify customer
        break;
      case 'in_transit':
        setShowOTPInput(false);
        // Start trip
        break;
      case 'completed':
        // Complete ride and navigate to completion screen
        navigate('/dashboard');
        break;
    }
  };

  const handleCall = () => {
    window.location.href = `tel:${ride.customer.phone}`;
  };

  const handleMessage = () => {
    // Open SMS or in-app messaging
    alert('Message feature would open here');
  };

  const handleEmergency = () => {
    // Emergency protocol
    alert('Emergency services contacted');
  };

  const handleOTPVerification = () => {
    if (otp === ride.customer.otp) {
      handleStatusUpdate('in_transit');
    } else {
      alert('Invalid OTP. Please ask customer for correct OTP.');
    }
  };

  const getStatusMessage = () => {
    switch (rideStatus) {
      case 'heading_to_pickup':
        return 'Heading to pickup location';
      case 'arrived_pickup':
        return 'Arrived at pickup - Waiting for customer';
      case 'in_transit':
        return 'Trip in progress';
      case 'completed':
        return 'Trip completed';
      default:
        return 'Navigation in progress';
    }
  };

  const getActionButton = () => {
    switch (rideStatus) {
      case 'heading_to_pickup':
        return (
          <button
            onClick={() => handleStatusUpdate('arrived_pickup')}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            I've Arrived at Pickup
          </button>
        );
      case 'arrived_pickup':
        return showOTPInput ? (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Customer OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 4-digit OTP"
                className="w-full p-3 border border-gray-300 rounded-lg text-center text-lg font-mono"
                maxLength={4}
              />
            </div>
            <button
              onClick={handleOTPVerification}
              disabled={otp.length !== 4}
              className="w-full bg-green-600 text-white py-4 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Start Trip
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowOTPInput(true)}
            className="w-full bg-green-600 text-white py-4 rounded-xl font-semibold hover:bg-green-700 transition-colors"
          >
            Customer Entered - Get OTP
          </button>
        );
      case 'in_transit':
        return (
          <button
            onClick={() => handleStatusUpdate('completed')}
            className="w-full bg-purple-600 text-white py-4 rounded-xl font-semibold hover:bg-purple-700 transition-colors"
          >
            Complete Trip
          </button>
        );
      default:
        return null;
    }
  };

  const getCurrentDestination = () => {
    return rideStatus === 'heading_to_pickup' || rideStatus === 'arrived_pickup' 
      ? ride.pickup 
      : ride.destination;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Status Header */}
      <div className={`p-4 text-white ${
        rideStatus === 'heading_to_pickup' ? 'bg-blue-600' :
        rideStatus === 'arrived_pickup' ? 'bg-orange-500' :
        rideStatus === 'in_transit' ? 'bg-green-600' :
        'bg-purple-600'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Navigation className="w-6 h-6" />
            <div>
              <h1 className="text-lg font-semibold">{getStatusMessage()}</h1>
              <p className="text-sm opacity-90">{estimatedTime} • {distance}</p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleCall}
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
            >
              <Phone className="w-5 h-5" />
            </button>
            <button
              onClick={handleMessage}
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
            >
              <MessageCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Map Area */}
      <div className="h-64 bg-gradient-to-br from-blue-100 to-green-100 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Navigation className="w-16 h-16 text-blue-600 mx-auto mb-2" />
            <p className="text-gray-600">Turn-by-turn navigation</p>
            <p className="text-sm text-gray-500 mt-1">Maps integration would appear here</p>
          </div>
        </div>
        
        {/* Next Turn Instruction */}
        <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg p-3 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <ArrowRight className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-800">Continue straight</p>
              <p className="text-sm text-gray-600">for 800 meters</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Customer Info */}
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">{ride.customer.name}</h3>
                <p className="text-sm text-gray-600">{ride.customer.phone}</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-lg font-bold text-green-600">₨{ride.fare}</div>
              <div className="text-sm text-gray-500 capitalize">{ride.paymentMethod}</div>
            </div>
          </div>
        </div>

        {/* Current Destination */}
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex items-start space-x-3">
            <MapPin className={`w-5 h-5 mt-1 ${
              rideStatus === 'heading_to_pickup' || rideStatus === 'arrived_pickup' 
                ? 'text-green-600' 
                : 'text-red-600'
            }`} />
            <div className="flex-1">
              <h4 className="font-medium text-gray-800">
                {rideStatus === 'heading_to_pickup' || rideStatus === 'arrived_pickup' 
                  ? 'Pickup Location' 
                  : 'Destination'}
              </h4>
              <p className="text-gray-600">{getCurrentDestination().address}</p>
              {getCurrentDestination().landmark && (
                <p className="text-sm text-gray-500 mt-1">{getCurrentDestination().landmark}</p>
              )}
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-800">{estimatedTime}</div>
              <div className="text-xs text-gray-500">{distance}</div>
            </div>
          </div>
        </div>

        {/* Trip Progress */}
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <h4 className="font-medium text-gray-800 mb-3">Trip Progress</h4>
          
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${
              ['heading_to_pickup', 'arrived_pickup', 'in_transit', 'completed'].includes(rideStatus) 
                ? 'bg-green-500' : 'bg-gray-300'
            }`}></div>
            <span className="text-sm text-gray-600">Pickup</span>
            
            <div className={`flex-1 h-1 ${
              ['in_transit', 'completed'].includes(rideStatus) 
                ? 'bg-green-500' : 'bg-gray-300'
            }`}></div>
            
            <div className={`w-3 h-3 rounded-full ${
              rideStatus === 'completed' ? 'bg-green-500' : 'bg-gray-300'
            }`}></div>
            <span className="text-sm text-gray-600">Drop-off</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="space-y-3">
          {getActionButton()}
          
          {/* Secondary Actions */}
          <div className="grid grid-cols-3 gap-3">
            <button 
              onClick={() => {/* Open maps app */}}
              className="flex flex-col items-center p-3 bg-white rounded-lg border hover:bg-gray-50"
            >
              <Navigation className="w-5 h-5 text-blue-600 mb-1" />
              <span className="text-xs font-medium">Maps</span>
            </button>
            
            <button 
              onClick={handleEmergency}
              className="flex flex-col items-center p-3 bg-white rounded-lg border hover:bg-gray-50"
            >
              <Shield className="w-5 h-5 text-red-600 mb-1" />
              <span className="text-xs font-medium">Emergency</span>
            </button>
            
            <button 
              onClick={() => {/* Open camera */}}
              className="flex flex-col items-center p-3 bg-white rounded-lg border hover:bg-gray-50"
            >
              <Camera className="w-5 h-5 text-purple-600 mb-1" />
              <span className="text-xs font-medium">Photo</span>
            </button>
          </div>
        </div>

        {/* Status-specific Messages */}
        {rideStatus === 'arrived_pickup' && (
          <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-orange-800">Waiting for Customer</h4>
                <p className="text-sm text-orange-700 mt-1">
                  Please wait for the customer to arrive. Free waiting time: 3 minutes.
                </p>
              </div>
            </div>
          </div>
        )}

        {rideStatus === 'in_transit' && (
          <div className="bg-green-50 p-4 rounded-xl border border-green-200">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-800">Trip in Progress</h4>
                <p className="text-sm text-green-700 mt-1">
                  Drive safely and follow traffic rules. Customer has been notified.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Safety Reminders */}
        <div className="bg-gray-100 p-4 rounded-xl">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-800">Safety Reminder</h4>
              <ul className="text-sm text-gray-600 mt-1 space-y-1">
                <li>• Verify customer identity before starting trip</li>
                <li>• Follow all traffic rules and speed limits</li>
                <li>• Use hands-free for calls while driving</li>
                <li>• Report any issues immediately</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavigationScreen;