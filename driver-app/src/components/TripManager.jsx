import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Square, 
  MapPin, 
  Clock, 
  User, 
  Phone, 
  MessageCircle, 
  Navigation,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Camera,
  Star,
  Car
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation from './Navigation';

// Timer component for tracking trip duration
const TripTimer = ({ startTime }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = Math.floor((now - startTime) / 1000); // seconds
      setElapsed(diff);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return <span>{formatTime(elapsed)}</span>;
};

// Trip completion screen component
const TripCompletionScreen = ({ rideData, tripData, completionData, onClose }) => {
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-lg p-6"
    >
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Trip Completed!</h2>
        <p className="text-gray-600">Thanks for the ride</p>
      </div>

      {/* Trip Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold mb-3">Trip Summary</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Duration</p>
            <p className="font-semibold">{tripData.duration || 0} min</p>
          </div>
          <div>
            <p className="text-gray-600">Distance</p>
            <p className="font-semibold">{tripData.distance || 0} km</p>
          </div>
          <div>
            <p className="text-gray-600">Start Time</p>
            <p className="font-semibold">{tripData.startTime?.toLocaleTimeString() || '--:--'}</p>
          </div>
          <div>
            <p className="text-gray-600">End Time</p>
            <p className="font-semibold">{tripData.endTime?.toLocaleTimeString() || '--:--'}</p>
          </div>
        </div>
      </div>

      {/* Fare Breakdown */}
      <div className="border rounded-lg p-4 mb-6">
        <h3 className="font-semibold mb-3 flex items-center">
          <DollarSign className="w-4 h-4 mr-2" />
          Fare Details
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Base Fare</span>
            <span>${rideData.fare?.base?.toFixed(2) || '5.00'}</span>
          </div>
          <div className="flex justify-between">
            <span>Distance</span>
            <span>${((tripData.distance || 2.5) * 1.5).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Time</span>
            <span>${((tripData.duration || 0) * 0.25).toFixed(2)}</span>
          </div>
          <div className="border-t pt-2 flex justify-between font-semibold">
            <span>Total</span>
            <span>${completionData.finalFare}</span>
          </div>
        </div>
      </div>

      {/* Rating */}
      <div className="mb-6">
        <h3 className="font-semibold mb-3">Rate your passenger</h3>
        <div className="flex justify-center space-x-2 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className={`w-8 h-8 ${star <= rating ? 'text-yellow-500' : 'text-gray-300'}`}
            >
              <Star className="w-full h-full fill-current" />
            </button>
          ))}
        </div>
        <textarea
          placeholder="Leave feedback (optional)"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="w-full p-3 border rounded-lg resize-none"
          rows={3}
        />
      </div>

      <button
        onClick={onClose}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
      >
        Continue Driving
      </button>
    </motion.div>
  );
};

const TripManager = ({
  currentRide,
  currentLocation,
  onStartTrip,
  onCompleteTrip,
  onCancelTrip,
  onUpdateLocation,
}) => {
  const [tripStatus, setTripStatus] = useState('accepted'); // accepted, started, completed
  const [tripData, setTripData] = useState({
    startTime: null,
    endTime: null,
    distance: 0,
    duration: 0,
    waitTime: 0,
  });
  const [showNavigation, setShowNavigation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [completionData, setCompletionData] = useState({
    finalFare: 0,
    paymentMethod: '',
    rating: 5,
    feedback: '',
    receipt: null,
  });

  useEffect(() => {
    if (currentRide) {
      setTripStatus(currentRide.status || 'accepted');
    }
  }, [currentRide]);

  const handleStartTrip = async () => {
    setIsLoading(true);
    try {
      const startTime = new Date();
      setTripData(prev => ({
        ...prev,
        startTime,
      }));
      
      setTripStatus('started');
      setShowNavigation(true);
      
      if (onStartTrip) {
        await onStartTrip(currentRide.id);
      }
    } catch (error) {
      console.error('Error starting trip:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteTrip = async () => {
    setIsLoading(true);
    try {
      const endTime = new Date();
      const duration = tripData.startTime ? 
        Math.round((endTime - tripData.startTime) / 60000) : 0; // minutes
      
      const updatedTripData = {
        ...tripData,
        endTime,
        duration,
      };
      
      setTripData(updatedTripData);
      setTripStatus('completed');
      setShowNavigation(false);
      
      // Calculate final fare (mock calculation)
      const baseFare = currentRide.fare?.base || 5.00;
      const distanceFare = (updatedTripData.distance || 2.5) * 1.50;
      const timeFare = duration * 0.25;
      const finalFare = baseFare + distanceFare + timeFare;
      
      setCompletionData(prev => ({
        ...prev,
        finalFare: finalFare.toFixed(2),
        paymentMethod: currentRide.paymentMethod || 'card',
      }));
      
      if (onCompleteTrip) {
        await onCompleteTrip(currentRide.id, {
          ...updatedTripData,
          finalFare,
        });
      }
    } catch (error) {
      console.error('Error completing trip:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelTrip = async (reason) => {
    setIsLoading(true);
    try {
      if (onCancelTrip) {
        await onCancelTrip(currentRide.id, reason);
      }
    } catch (error) {
      console.error('Error cancelling trip:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date) => {
    if (!date) return '--:--';
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes}min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
  };

  if (!currentRide) {
    return (
      <div className="p-6 text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Car className="w-12 h-12 text-gray-400" />
        </div>
        <p className="text-gray-600">No active ride</p>
      </div>
    );
  }

  if (tripStatus === 'completed') {
    return (
      <TripCompletionScreen 
        rideData={currentRide}
        tripData={tripData}
        completionData={completionData}
        onClose={() => setTripStatus('idle')}
      />
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold">Current Trip</h2>
          <div className="flex items-center space-x-2">
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
              tripStatus === 'accepted' ? 'bg-yellow-500' :
              tripStatus === 'started' ? 'bg-green-500' :
              'bg-gray-500'
            }`}>
              {tripStatus === 'accepted' ? 'Ride Accepted' :
               tripStatus === 'started' ? 'In Progress' : 'Unknown'}
            </div>
          </div>
        </div>

        {/* Trip timer */}
        {tripStatus === 'started' && (
          <div className="text-center">
            <p className="text-sm opacity-90">Trip Duration</p>
            <p className="text-2xl font-mono font-bold">
              <TripTimer startTime={tripData.startTime} />
            </p>
          </div>
        )}
      </div>

      {/* Passenger Info */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {currentRide.passenger?.name || 'Anonymous'}
              </h3>
              <div className="flex items-center text-sm text-gray-600">
                <Star className="w-3 h-3 text-yellow-500 mr-1" />
                <span>{currentRide.passenger?.rating || '4.8'}</span>
                <span className="mx-2">•</span>
                <span>{currentRide.passenger?.totalRides || 0} rides</span>
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-full">
              <Phone className="w-4 h-4" />
            </button>
            <button className="p-2 text-green-600 hover:bg-green-50 rounded-full">
              <MessageCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Trip Details */}
      <div className="p-4 border-b">
        <div className="space-y-4">
          {/* Pickup */}
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Pickup</p>
              <p className="text-sm text-gray-600">
                {currentRide.pickup?.address || 'Unknown pickup location'}
              </p>
            </div>
          </div>

          {/* Destination */}
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Destination</p>
              <p className="text-sm text-gray-600">
                {currentRide.destination?.address || 'Unknown destination'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Trip Stats */}
      <div className="p-4 border-b">
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <p className="text-gray-600">Fare</p>
            <p className="font-semibold text-green-600">
              ${currentRide.fare?.total?.toFixed(2) || '0.00'}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Distance</p>
            <p className="font-semibold">
              {currentRide.tripDistance?.toFixed(1) || '0.0'} km
            </p>
          </div>
          <div>
            <p className="text-gray-600">Time</p>
            <p className="font-semibold">
              {formatDuration(currentRide.estimatedDuration || 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Section */}
      {showNavigation && (
        <div className="p-4 border-b">
          <Navigation
            currentLocation={currentLocation}
            destination={currentRide.destination}
            rideData={currentRide}
            isNavigating={tripStatus === 'started'}
            onLocationUpdate={onUpdateLocation}
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="p-4">
        {tripStatus === 'accepted' && (
          <div className="space-y-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleStartTrip}
              disabled={isLoading}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Starting Trip...
                </div>
              ) : (
                <div className="flex items-center">
                  <Play className="w-5 h-5 mr-2" />
                  Start Trip
                </div>
              )}
            </motion.button>

            <button
              onClick={() => setShowNavigation(!showNavigation)}
              className="w-full border border-blue-600 text-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center"
            >
              <Navigation className="w-5 h-5 mr-2" />
              {showNavigation ? 'Hide Navigation' : 'Show Navigation'}
            </button>
          </div>
        )}

        {tripStatus === 'started' && (
          <div className="space-y-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleCompleteTrip}
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Completing Trip...
                </div>
              ) : (
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Complete Trip
                </div>
              )}
            </motion.button>

            <button
              onClick={() => handleCancelTrip('Driver cancelled')}
              disabled={isLoading}
              className="w-full border border-red-600 text-red-600 py-3 rounded-lg font-semibold hover:bg-red-50 disabled:opacity-50 transition-colors flex items-center justify-center"
            >
              <Square className="w-5 h-5 mr-2" />
              Cancel Trip
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TripManager;