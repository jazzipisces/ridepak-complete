import React, { useState, useEffect } from 'react';
import { MapPin, Clock, User, Phone, DollarSign, Car, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RideRequest = ({ 
  rideData, 
  onAccept, 
  onDecline, 
  isVisible, 
  autoDeclineTime = 30 
}) => {
  const [timeLeft, setTimeLeft] = useState(autoDeclineTime);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Auto decline when time runs out
          handleDecline();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible]);

  const handleAccept = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      await onAccept(rideData.id);
    } catch (error) {
      console.error('Error accepting ride:', error);
      setIsProcessing(false);
    }
  };

  const handleDecline = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      await onDecline(rideData.id);
    } catch (error) {
      console.error('Error declining ride:', error);
      setIsProcessing(false);
    }
  };

  const formatDistance = (distance) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${Math.round(minutes)}min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}min`;
  };

  const getProgressBarWidth = () => {
    return (timeLeft / autoDeclineTime) * 100;
  };

  const getProgressBarColor = () => {
    if (timeLeft <= 5) return 'bg-red-500';
    if (timeLeft <= 10) return 'bg-orange-500';
    return 'bg-blue-500';
  };

  if (!isVisible || !rideData) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -50 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      >
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header with timer */}
          <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold">New Ride Request</h2>
              <div className="text-2xl font-mono font-bold">
                {timeLeft}s
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-white bg-opacity-30 rounded-full h-1">
              <motion.div
                className={`h-1 rounded-full ${getProgressBarColor()}`}
                initial={{ width: '100%' }}
                animate={{ width: `${getProgressBarWidth()}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Ride details */}
          <div className="p-6">
            {/* Passenger info */}
            <div className="flex items-center mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  {rideData.passenger?.name || 'Anonymous'}
                </h3>
                <div className="flex items-center text-sm text-gray-600">
                  <span>⭐ {rideData.passenger?.rating || '4.8'}</span>
                  <span className="mx-2">•</span>
                  <span>{rideData.passenger?.totalRides || 0} rides</span>
                </div>
              </div>
              {rideData.passenger?.phone && (
                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-full">
                  <Phone className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Trip details */}
            <div className="space-y-3 mb-6">
              {/* Pickup location */}
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">Pickup</p>
                  <p className="text-sm text-gray-600 truncate">
                    {rideData.pickup?.address || 'Unknown pickup location'}
                  </p>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <MapPin className="w-3 h-3 mr-1" />
                    <span>{formatDistance(rideData.distanceToPickup || 0)} away</span>
                    <span className="mx-2">•</span>
                    <Clock className="w-3 h-3 mr-1" />
                    <span>{formatDuration(rideData.timeToPickup || 0)}</span>
                  </div>
                </div>
              </div>

              {/* Destination */}
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">Destination</p>
                  <p className="text-sm text-gray-600 truncate">
                    {rideData.destination?.address || 'Unknown destination'}
                  </p>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <MapPin className="w-3 h-3 mr-1" />
                    <span>{formatDistance(rideData.tripDistance || 0)}</span>
                    <span className="mx-2">•</span>
                    <Clock className="w-3 h-3 mr-1" />
                    <span>{formatDuration(rideData.estimatedDuration || 0)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ride info cards */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <DollarSign className="w-5 h-5 text-green-600 mx-auto mb-1" />
                <p className="text-sm text-gray-600">Fare</p>
                <p className="font-bold text-green-600">
                  ${rideData.fare?.total?.toFixed(2) || '0.00'}
                </p>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <Car className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <p className="text-sm text-gray-600">Type</p>
                <p className="font-bold text-blue-600 capitalize">
                  {rideData.rideType || 'Standard'}
                </p>
              </div>
            </div>

            {/* Special requests */}
            {rideData.specialRequests && rideData.specialRequests.length > 0 && (
              <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm font-medium text-yellow-800 mb-1">
                  Special Requests:
                </p>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {rideData.specialRequests.map((request, index) => (
                    <li key={index}>• {request}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex space-x-3">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleDecline}
                disabled={isProcessing}
                className="flex-1 py-3 px-4 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600 mr-2"></div>
                    Declining...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <X className="w-5 h-5 mr-2" />
                    Decline
                  </div>
                )}
              </motion.button>
              
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleAccept}
                disabled={isProcessing}
                className="flex-1 py-3 px-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Accepting...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    Accept Ride
                  </div>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RideRequest;