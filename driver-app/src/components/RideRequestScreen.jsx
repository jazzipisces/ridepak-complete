import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  User, 
  Star, 
  Phone,
  MessageCircle,
  Navigation,
  X,
  Check,
  AlertCircle,
  Timer,
  Car,
  Package,
  Users,
  Calendar
} from 'lucide-react';
import { RideContext } from '../utils/RideContext';

const RideRequestScreen = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { acceptRide, declineRide } = useContext(RideContext);
  
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds to respond
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);

  // Mock ride request data
  const rideRequest = {
    id: requestId,
    customer: {
      name: 'Sarah Ahmed',
      rating: 4.7,
      profileImage: null,
      phone: '+92 300 1234567',
      totalRides: 127
    },
    pickup: {
      address: 'Blue Area, Islamabad',
      coordinates: { lat: 33.6844, lng: 73.0479 },
      landmark: 'Near Jinnah Super Market'
    },
    destination: {
      address: 'F-7 Markaz, Islamabad',
      coordinates: { lat: 33.7077, lng: 73.0522 },
      landmark: 'Main Market Entrance'
    },
    fare: 180,
    distance: '8.5 km',
    estimatedTime: '22 min',
    serviceType: 'ride',
    vehicleType: 'car',
    pickupTime: new Date().toISOString(),
    paymentMethod: 'cash',
    specialRequests: 'Please call when you arrive',
    surgeMultiplier: 1.0,
    tip: 0,
    requestTime: new Date().toISOString()
  };

  useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Auto-decline if time runs out
          handleDecline();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      await acceptRide(rideRequest);
      navigate(`/navigation/${rideRequest.id}`);
    } catch (error) {
      console.error('Failed to accept ride:', error);
      alert('Failed to accept ride. Please try again.');
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDecline = async () => {
    setIsDeclining(true);
    try {
      await declineRide(rideRequest.id);
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to decline ride:', error);
    } finally {
      setIsDeclining(false);
    }
  };

  const handleCall = () => {
    window.location.href = `tel:${rideRequest.customer.phone}`;
  };

  const handleMessage = () => {
    // In real app, this would open SMS or in-app chat
    const message = `Hi ${rideRequest.customer.name}, I'm on my way to pick you up from ${rideRequest.pickup.address}. I'll be there in approximately ${rideRequest.estimatedTime}.`;
    window.location.href = `sms:${rideRequest.customer.phone}?body=${encodeURIComponent(message)}`;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getServiceIcon = (serviceType) => {
    switch (serviceType) {
      case 'ride':
        return <Car className="w-5 h-5" />;
      case 'cargo':
        return <Package className="w-5 h-5" />;
      case 'rental':
        return <Calendar className="w-5 h-5" />;
      default:
        return <Car className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Timer */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              {getServiceIcon(rideRequest.serviceType)}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">New Ride Request</h1>
              <p className="text-sm text-gray-600 capitalize">{rideRequest.serviceType} Service</p>
            </div>
          </div>
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
            timeLeft <= 10 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
          }`}>
            <Timer className="w-5 h-5" />
            <span className="font-mono font-bold text-lg">{formatTime(timeLeft)}</span>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-3">
          <div className="bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-1000 ${
                timeLeft <= 10 ? 'bg-red-500' : 'bg-blue-500'
              }`}
              style={{ width: `${(timeLeft / 30) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Map Area */}
      <div className="h-64 bg-gradient-to-br from-blue-100 to-green-100 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Navigation className="w-12 h-12 text-blue-600 mx-auto mb-2" />
            <p className="text-gray-600 text-sm">Route map would appear here</p>
            <p className="text-xs text-gray-500 mt-1">{rideRequest.distance} • {rideRequest.estimatedTime}</p>
          </div>
        </div>
        
        {/* Distance Badge */}
        <div className="absolute top-4 left-4 bg-white px-3 py-2 rounded-full shadow-md">
          <div className="text-center">
            <div className="text-sm font-bold text-gray-800">{rideRequest.distance}</div>
            <div className="text-xs text-gray-600">away</div>
          </div>
        </div>
        
        {/* Fare Badge */}
        <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-full shadow-md">
          <div className="text-center">
            <div className="text-lg font-bold">₨{rideRequest.fare}</div>
            {rideRequest.surgeMultiplier > 1 && (
              <div className="text-xs">
                {rideRequest.surgeMultiplier}x surge
              </div>
            )}
          </div>
        </div>

        {/* Estimated Time Badge */}
        <div className="absolute bottom-4 left-4 bg-white px-3 py-2 rounded-full shadow-md">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium">{rideRequest.estimatedTime}</span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Customer Info */}
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                {rideRequest.customer.profileImage ? (
                  <img 
                    src={rideRequest.customer.profileImage} 
                    alt="Customer" 
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6 text-blue-600" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">{rideRequest.customer.name}</h3>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium">{rideRequest.customer.rating}</span>
                  <span className="text-sm text-gray-500">• {rideRequest.customer.totalRides} rides</span>
                </div>
                <p className="text-xs text-gray-500">{rideRequest.customer.phone}</p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={handleCall}
                className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
              >
                <Phone className="w-5 h-5" />
              </button>
              <button
                onClick={handleMessage}
                className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Trip Details */}
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <h4 className="font-semibold text-gray-800 mb-3">Trip Details</h4>
          
          <div className="space-y-4">
            {/* Pickup */}
            <div className="flex items-start space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Pickup Location</p>
                <p className="font-medium text-gray-800">{rideRequest.pickup.address}</p>
                {rideRequest.pickup.landmark && (
                  <p className="text-xs text-gray-500">{rideRequest.pickup.landmark}</p>
                )}
                <p className="text-xs text-gray-500 mt-1 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  Now
                </p>
              </div>
            </div>
            
            {/* Route Line */}
            <div className="ml-1.5 w-px h-8 bg-gray-300"></div>
            
            {/* Destination */}
            <div className="flex items-start space-x-3">
              <div className="w-3 h-3 bg-red-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Destination</p>
                <p className="font-medium text-gray-800">{rideRequest.destination.address}</p>
                {rideRequest.destination.landmark && (
                  <p className="text-xs text-gray-500">{rideRequest.destination.landmark}</p>
                )}
                <p className="text-xs text-gray-500 mt-1 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  Est. {rideRequest.estimatedTime}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Ride Info Grid */}
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-green-600">₨{rideRequest.fare}</div>
              <div className="text-xs text-gray-600">Total Fare</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600">{rideRequest.distance}</div>
              <div className="text-xs text-gray-600">Distance</div>
            </div>
            <div>
              <div className="text-lg font-bold text-purple-600">{rideRequest.estimatedTime}</div>
              <div className="text-xs text-gray-600">Duration</div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Payment Method:</span>
              <span className="font-medium capitalize flex items-center">
                {rideRequest.paymentMethod === 'cash' ? '💵' : '💳'} {rideRequest.paymentMethod}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Vehicle Type:</span>
              <span className="font-medium capitalize">{rideRequest.vehicleType}</span>
            </div>
            {rideRequest.tip > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Pre-tip:</span>
                <span className="font-medium text-green-600">₨{rideRequest.tip}</span>
              </div>
            )}
          </div>
        </div>

        {/* Special Requests */}
        {rideRequest.specialRequests && (
          <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Special Request</h4>
                <p className="text-sm text-yellow-700 mt-1">{rideRequest.specialRequests}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-2">
          <button
            onClick={handleDecline}
            disabled={isDeclining || timeLeft <= 0}
            className="flex-1 bg-red-500 text-white py-4 rounded-xl font-semibold hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            <X className="w-5 h-5" />
            <span>{isDeclining ? 'Declining...' : 'Decline'}</span>
          </button>
          
          <button
            onClick={handleAccept}
            disabled={isAccepting || timeLeft <= 0}
            className="flex-1 bg-green-500 text-white py-4 rounded-xl font-semibold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            <Check className="w-5 h-5" />
            <span>{isAccepting ? 'Accepting...' : 'Accept Ride'}</span>
          </button>
        </div>

        {/* Earnings Breakdown */}
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
          <h4 className="font-medium text-blue-800 mb-3">💰 Your Earnings</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-blue-700">Base Fare:</span>
              <span className="font-medium">₨{Math.floor(rideRequest.fare * 0.75)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Distance Bonus:</span>
              <span className="font-medium">₨{Math.floor(rideRequest.fare * 0.15)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Time Bonus:</span>
              <span className="font-medium">₨{Math.floor(rideRequest.fare * 0.1)}</span>
            </div>
            {rideRequest.tip > 0 && (
              <div className="flex justify-between">
                <span className="text-blue-700">Customer Tip:</span>
                <span className="font-medium">₨{rideRequest.tip}</span>
              </div>
            )}
            {rideRequest.surgeMultiplier > 1 && (
              <div className="flex justify-between">
                <span className="text-blue-700">Surge Bonus:</span>
                <span className="font-medium text-orange-600">
                  +₨{Math.floor((rideRequest.fare * (rideRequest.surgeMultiplier - 1)))}
                </span>
              </div>
            )}
            <div className="border-t border-blue-200 pt-2 flex justify-between font-semibold">
              <span className="text-blue-800">Total Earnings:</span>
              <span className="text-green-600">
                ₨{Math.floor(rideRequest.fare + rideRequest.tip + (rideRequest.fare * (rideRequest.surgeMultiplier - 1)))}
              </span>
            </div>
          </div>
        </div>

        {/* Safety Note */}
        <div className="bg-gray-100 p-4 rounded-xl">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">Safety Reminder</p>
              <p className="text-xs text-gray-600">Always verify customer identity before starting the trip</p>
            </div>
          </div>
        </div>

        {/* Auto-decline warning */}
        {timeLeft <= 10 && (
          <div className="bg-red-50 p-4 rounded-xl border border-red-200 animate-pulse">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-red-800">Time Running Out!</p>
                <p className="text-xs text-red-600">Request will auto-decline in {timeLeft} seconds</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RideRequestScreen;/* Special Requests */}
        {rideRequest.specialRequests && (
          <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Special Request</h4>
                <p className="text-sm text-yellow-700 mt-1">{rideRequest.specialRequests}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <button
            onClick={handleDecline}
            disabled={isDeclining || timeLeft <= 0}
            className="flex-1 bg-red-500 text-white py-4 rounded-xl font-semibold hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            <X className="w-5 h-5" />
            <span>{isDeclining ? 'Declining...' : 'Decline'}</span>
          </button>
          
          <button
            onClick={handleAccept}
            disabled={isAccepting || timeLeft <= 0}
            className="flex-1 bg-green-500 text-white py-4 rounded-xl font-semibold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            <Check className="w-5 h-5" />
            <span>{isAccepting ? 'Accepting...' : 'Accept Ride'}</span>
          </button>
        </div>

        {/* Earnings Breakdown */}
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
          <h4 className="font-medium text-blue-800 mb-3">Earnings Breakdown</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-blue-700">Base Fare:</span>
              <span className="font-medium">₨{Math.floor(rideRequest.fare * 0.8)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Distance Bonus:</span>
              <span className="font-medium">₨{Math.floor(rideRequest.fare * 0.15)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Time Bonus:</span>
              <span className="font-medium">₨{Math.floor(rideRequest.fare * 0.05)}</span>
            </div>
            <div className="border-t border-blue-200 pt-2 flex justify-between font-semibold">
              <span className="text-blue-800">Your Earnings:</span>
              <span className="text-green-600">₨{rideRequest.fare}</span>
            </div>
          </div>
        </div>

        {/* Safety Note */}
        <div className="bg-gray-100 p-4 rounded-xl">
          <p className="text-sm text-gray-600 text-center">
            🛡️ Always verify customer identity before starting the trip
          </p>
        </div>
      </div>
    </div>
  );
};

export default RideRequestScreen;