import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Users, 
  Package as PackageIcon, 
  Calendar,
  CreditCard,
  Star,
  Phone
} from 'lucide-react';
import { vehicleTypes } from '../utils/vehicleData';

const BookingPage = ({ user }) => {
  const { serviceType } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropLocation, setDropLocation] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [packageWeight, setPackageWeight] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [promoCode, setPromoCode] = useState('');
  const [estimatedFare, setEstimatedFare] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    // Get location data from navigation state
    if (location.state) {
      setPickupLocation(location.state.pickup || '');
      setDropLocation(location.state.drop || '');
    }

    // Set default date and time
    const now = new Date();
    setPickupDate(now.toISOString().split('T')[0]);
    setPickupTime(now.toTimeString().slice(0, 5));
  }, [location.state]);

  useEffect(() => {
    // Calculate estimated fare based on service type and vehicle
    if (selectedVehicle) {
      let baseFare = parseInt(selectedVehicle.price.replace(/[^\d]/g, ''));
      
      if (serviceType === 'intercity') {
        // Estimate distance (this would come from a real mapping service)
        baseFare = baseFare * 50; // Assume 50km average
      } else if (serviceType === 'rental') {
        // Daily rental already has daily pricing
        baseFare = baseFare;
      } else if (serviceType === 'cargo') {
        // Add weight-based pricing
        if (packageWeight) {
          const weight = parseFloat(packageWeight);
          baseFare += weight * 10; // ₨10 per kg
        }
      }
      
      setEstimatedFare(baseFare);
    }
  }, [selectedVehicle, serviceType, packageWeight]);

  const handleVehicleSelect = (vehicle) => {
    setSelectedVehicle(vehicle);
  };

  const handleBooking = () => {
    if (!selectedVehicle || !pickupLocation || !dropLocation) {
      alert('Please fill all required fields');
      return;
    }

    // Create booking object
    const booking = {
      id: 'PR' + Math.floor(Math.random() * 10000),
      serviceType,
      vehicle: selectedVehicle,
      pickup: pickupLocation,
      drop: dropLocation,
      date: pickupDate,
      time: pickupTime,
      passengers,
      packageWeight,
      fare: estimatedFare,
      paymentMethod,
      promoCode,
      status: 'confirmed',
      driver: {
        name: 'Ahmad Khan',
        phone: '+92 300 1234567',
        rating: 4.8,
        vehicle: 'Toyota Corolla',
        plateNumber: 'ABC-123'
      }
    };

    setShowConfirmation(true);
  };

  const VehicleCard = ({ vehicle, isSelected, onSelect }) => (
    <div
      onClick={() => onSelect(vehicle)}
      className={`p-4 border rounded-lg cursor-pointer transition-all ${
        isSelected 
          ? 'border-green-500 bg-green-50' 
          : 'border-gray-200 hover:border-green-300'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{vehicle.icon}</span>
          <div>
            <h3 className="font-medium">{vehicle.name}</h3>
            <p className="text-sm text-gray-600">{vehicle.time}</p>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              {vehicle.seats && (
                <span className="flex items-center space-x-1">
                  <Users className="w-3 h-3" />
                  <span>{vehicle.seats} seats</span>
                </span>
              )}
              {vehicle.capacity && (
                <span className="flex items-center space-x-1">
                  <PackageIcon className="w-3 h-3" />
                  <span>{vehicle.capacity}</span>
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="font-medium text-green-600">{vehicle.price}</p>
          {isSelected && (
            <p className="text-xs text-green-600">Selected</p>
          )}
        </div>
      </div>
    </div>
  );

  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">✓</span>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking Confirmed!</h2>
            <p className="text-gray-600">Your ride has been booked successfully</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
            <h3 className="font-semibold text-gray-800 mb-4">Booking Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Booking ID:</span>
                <span className="font-medium">PR{Math.floor(Math.random() * 10000)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Service:</span>
                <span className="font-medium capitalize">{serviceType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Vehicle:</span>
                <span className="font-medium">{selectedVehicle?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">From:</span>
                <span className="font-medium">{pickupLocation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">To:</span>
                <span className="font-medium">{dropLocation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date & Time:</span>
                <span className="font-medium">{pickupDate} at {pickupTime}</span>
              </div>
              <div className="flex justify-between border-t pt-3">
                <span className="text-gray-600">Total Fare:</span>
                <span className="font-bold text-green-600">₨{estimatedFare}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border mb-6">
            <h3 className="font-medium text-blue-800 mb-3">Driver Details</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-medium">AK</span>
                </div>
                <div>
                  <p className="font-medium">Ahmad Khan</p>
                  <p className="text-sm text-gray-600">Toyota Corolla - ABC-123</p>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm">4.8 (247 rides)</span>
                  </div>
                </div>
              </div>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>Call</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate('/tracking/PR' + Math.floor(Math.random() * 10000))}
              className="w-full bg-green-600 text-white py-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Track Ride
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-gray-600 text-white py-4 rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              Book Another Ride
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold capitalize">{serviceType} Booking</h1>
            <p className="text-sm text-gray-600">Complete your booking details</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Location Details */}
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="font-semibold text-gray-800 mb-4">Trip Details</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-600 rounded-full"></div>
              <input
                type="text"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                placeholder="Pickup location"
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-red-600 rounded-full"></div>
              <input
                type="text"
                value={dropLocation}
                onChange={(e) => setDropLocation(e.target.value)}
                placeholder="Drop location"
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>

        {/* Date and Time */}
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="font-semibold text-gray-800 mb-4">Schedule</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
              <input
                type="time"
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>

        {/* Additional Options */}
        {(serviceType === 'ride' || serviceType === 'intercity') && (
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h3 className="font-semibold text-gray-800 mb-4">Passengers</h3>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setPassengers(Math.max(1, passengers - 1))}
                className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
              >
                -
              </button>
              <span className="text-lg font-medium">{passengers}</span>
              <button
                onClick={() => setPassengers(passengers + 1)}
                className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
              >
                +
              </button>
            </div>
          </div>
        )}

        {serviceType === 'cargo' && (
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h3 className="font-semibold text-gray-800 mb-4">Package Details</h3>
            <input
              type="number"
              value={packageWeight}
              onChange={(e) => setPackageWeight(e.target.value)}
              placeholder="Package weight (kg)"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
        )}

        {/* Vehicle Selection */}
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="font-semibold text-gray-800 mb-4">Choose Vehicle</h3>
          <div className="space-y-3">
            {vehicleTypes[serviceType]?.map(vehicle => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                isSelected={selectedVehicle?.id === vehicle.id}
                onSelect={handleVehicleSelect}
              />
            ))}
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="font-semibold text-gray-800 mb-4">Payment Method</h3>
          <div className="space-y-3">
            {[
              { id: 'wallet', name: 'Wallet', balance: user?.balance || 1250 },
              { id: 'cash', name: 'Cash' },
              { id: 'card', name: 'Credit/Debit Card' }
            ].map(method => (
              <button
                key={method.id}
                onClick={() => setPaymentMethod(method.id)}
                className={`w-full p-3 border rounded-lg text-left flex items-center justify-between ${
                  paymentMethod === method.id 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-300 hover:border-green-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-5 h-5 text-gray-600" />
                  <span className="font-medium">{method.name}</span>
                  {method.balance && (
                    <span className="text-sm text-gray-600">(₨{method.balance})</span>
                  )}
                </div>
                {paymentMethod === method.id && (
                  <div className="w-4 h-4 bg-green-600 rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Promo Code */}
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="font-semibold text-gray-800 mb-4">Promo Code</h3>
          <div className="flex space-x-3">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="Enter promo code"
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
            <button className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">
              Apply
            </button>
          </div>
        </div>

        {/* Fare Breakdown */}
        {selectedVehicle && (
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h3 className="font-semibold text-gray-800 mb-4">Fare Breakdown</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Base Fare</span>
                <span>₨{estimatedFare}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Service Fee</span>
                <span>₨0</span>
              </div>
              {promoCode && (
                <div className="flex justify-between text-green-600">
                  <span>Promo Discount</span>
                  <span>-₨50</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-green-600">₨{promoCode ? estimatedFare - 50 : estimatedFare}</span>
              </div>
            </div>
          </div>
        )}

        {/* Book Button */}
        <button
          onClick={handleBooking}
          disabled={!selectedVehicle}
          className={`w-full py-4 rounded-lg font-medium transition-colors ${
            selectedVehicle
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Book {serviceType.charAt(0).toUpperCase() + serviceType.slice(1)} - ₨{promoCode ? estimatedFare - 50 : estimatedFare}
        </button>
      </div>
    </div>
  );
};

export default BookingPage;