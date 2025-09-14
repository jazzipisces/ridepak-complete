import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Star, 
  Phone, 
  MessageSquare,
  Car,
  DollarSign,
  Navigation,
  Download,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { api } from '../services/Api';

const RideDetails = () => {
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { rideId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchRideDetails();
  }, [rideId]);

  const fetchRideDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/rides/${rideId}`);
      setRide(response.data.ride);
    } catch (err) {
      console.error('Error fetching ride details:', err);
      setError('Failed to load ride details');
      // Load mock data
      setRide({
        id: rideId,
        status: 'completed',
        pickup: {
          address: '123 Main Street, New York, NY 10001',
          coordinates: { lat: 40.7128, lng: -74.0060 }
        },
        destination: {
          address: '456 Broadway, New York, NY 10013',
          coordinates: { lat: 40.7202, lng: -74.0021 }
        },
        driver: {
          name: 'John Smith',
          rating: 4.8,
          phone: '+1234567890',
          photo: null,
          vehicle: {
            make: 'Toyota',
            model: 'Camry',
            year: 2020,
            color: 'Black',
            licensePlate: 'ABC-123'
          }
        },
        fare: {
          base: 8.50,
          distance: 4.20,
          time: 2.30,
          surge: 0.00,
          tip: 2.00,
          total: 17.00
        },
        trip: {
          distance: '3.2 km',
          duration: '18 min',
          startTime: '2025-09-14T14:30:00Z',
          endTime: '2025-09-14T14:48:00Z'
        },
        payment: {
          method: 'credit_card',
          lastFour: '4242',
          status: 'completed'
        },
        rating: {
          customerRating: 5,
          driverRating: 4,
          feedback: 'Great ride! Very punctual and friendly driver.'
        },
        receipt: {
          available: true,
          url: '/receipts/ride-123456.pdf'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCallDriver = () => {
    if (ride?.driver?.phone) {
      window.open(`tel:${ride.driver.phone}`);
    }
  };

  const handleMessageDriver = () => {
    // Navigate to chat or messaging component
    navigate(`/chat/${ride?.driver?.id}`, {
      state: { rideId: ride?.id, driverName: ride?.driver?.name }
    });
  };

  const handleDownloadReceipt = () => {
    if (ride?.receipt?.url) {
      window.open(ride.receipt.url, '_blank');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'in_progress': return Navigation;
      case 'cancelled': return AlertCircle;
      default: return Clock;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !ride) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">{error || 'Ride not found'}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const StatusIcon = getStatusIcon(ride.status);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate(-1)}
                className="mr-4 p-2 hover:bg-gray-100 rounded-full"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Trip Details</h1>
            </div>
            
            {ride.receipt?.available && (
              <button
                onClick={handleDownloadReceipt}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
              >
                <Download className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-center">
            <div className={`flex items-center px-4 py-2 rounded-full ${getStatusColor(ride.status)}`}>
              <StatusIcon className="w-5 h-5 mr-2" />
              <span className="font-medium capitalize">{ride.status.replace('_', ' ')}</span>
            </div>
          </div>
          <p className="text-center text-gray-600 mt-2 text-sm">
            Trip ID: {ride.id}
          </p>
        </div>

        {/* Route */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Trip Route</h3>
          
          <div className="space-y-4">
            {/* Pickup */}
            <div className="flex items-start">
              <div className="w-3 h-3 bg-green-500 rounded-full mt-2 mr-3"></div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Pickup</p>
                <p className="text-sm text-gray-600">{ride.pickup.address}</p>
                {ride.trip.startTime && (
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDateTime(ride.trip.startTime)}
                  </p>
                )}
              </div>
            </div>

            {/* Route line */}
            <div className="ml-1 w-px h-8 bg-gray-300"></div>

            {/* Destination */}
            <div className="flex items-start">
              <div className="w-3 h-3 bg-red-500 rounded-full mt-2 mr-3"></div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Destination</p>
                <p className="text-sm text-gray-600">{ride.destination.address}</p>
                {ride.trip.endTime && (
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDateTime(ride.trip.endTime)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Trip Stats */}
          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <MapPin className="w-4 h-4 text-gray-500 mr-1" />
                <span className="text-sm text-gray-500">Distance</span>
              </div>
              <p className="font-semibold text-gray-900">{ride.trip.distance}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Clock className="w-4 h-4 text-gray-500 mr-1" />
                <span className="text-sm text-gray-500">Duration</span>
              </div>
              <p className="font-semibold text-gray-900">{ride.trip.duration}</p>
            </div>
          </div>
        </div>

        {/* Driver Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Driver</h3>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                {ride.driver.photo ? (
                  <img
                    src={ride.driver.photo}
                    alt={ride.driver.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-blue-600 font-semibold text-lg">
                    {ride.driver.name.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{ride.driver.name}</p>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 mr-1" />
                  <span className="text-sm text-gray-600">{ride.driver.rating}</span>
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={handleCallDriver}
                className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200"
              >
                <Phone className="w-5 h-5" />
              </button>
              <button
                onClick={handleMessageDriver}
                className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200"
              >
                <MessageSquare className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Vehicle Info */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center">
              <Car className="w-5 h-5 text-gray-500 mr-2" />
              <span className="text-gray-900">
                {ride.driver.vehicle.color} {ride.driver.vehicle.make} {ride.driver.vehicle.model} ({ride.driver.vehicle.year})
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1 ml-7">
              License Plate: {ride.driver.vehicle.licensePlate}
            </p>
          </div>
        </div>

        {/* Fare Breakdown */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Fare Details</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Base Fare</span>
              <span className="font-medium">{formatCurrency(ride.fare.base)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Distance ({ride.trip.distance})</span>
              <span className="font-medium">{formatCurrency(ride.fare.distance)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Time ({ride.trip.duration})</span>
              <span className="font-medium">{formatCurrency(ride.fare.time)}</span>
            </div>
            
            {ride.fare.surge > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Surge Pricing</span>
                <span className="font-medium">{formatCurrency(ride.fare.surge)}</span>
              </div>
            )}
            
            {ride.fare.tip > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Tip</span>
                <span className="font-medium">{formatCurrency(ride.fare.tip)}</span>
              </div>
            )}
            
            <div className="border-t pt-3">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="font-semibold text-lg">{formatCurrency(ride.fare.total)}</span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <DollarSign className="w-5 h-5 text-gray-500 mr-2" />
                <span className="text-gray-900">
                  {ride.payment.method === 'credit_card' ? 'Credit Card' : 'Wallet'} 
                  {ride.payment.lastFour && ` •••• ${ride.payment.lastFour}`}
                </span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                ride.payment.status === 'completed' 
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {ride.payment.status}
              </span>
            </div>
          </div>
        </div>

        {/* Rating & Feedback */}
        {ride.rating && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Rating & Feedback</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Your Rating</span>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= ride.rating.customerRating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                
                {ride.rating.feedback && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-700">"{ride.rating.feedback}"</p>
                  </div>
                )}
              </div>

              {ride.rating.driverRating && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Driver's Rating for You</span>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= ride.rating.driverRating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          {ride.status === 'completed' && !ride.rating?.customerRating && (
            <button className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
              Rate Your Trip
            </button>
          )}

          <button className="w-full py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
            Report an Issue
          </button>

          {ride.receipt?.available && (
            <button
              onClick={handleDownloadReceipt}
              className="w-full py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center justify-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Receipt
            </button>
          )}

          <button
            onClick={() => navigate('/rides')}
            className="w-full py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
          >
            View All Trips
          </button>
        </div>

        {/* Help */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-900">Need Help?</h4>
              <p className="text-sm text-blue-700 mt-1">
                If you have any questions about this trip, our support team is here to help.
              </p>
              <button className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-500">
                Contact Support →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RideDetails;