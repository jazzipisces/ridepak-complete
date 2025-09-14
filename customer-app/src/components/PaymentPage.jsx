import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  CreditCard, 
  Wallet, 
  DollarSign,
  CheckCircle,
  AlertCircle,
  Star
} from 'lucide-react';
import { useBooking } from '../utils/BookingContext';
import { api } from '../services/Api';

const PaymentPage = () => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [tipAmount, setTipAmount] = useState(0);
  const [customTip, setCustomTip] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const { bookingData, updateBookingData } = useBooking();

  const rideDetails = location.state?.rideDetails || bookingData;

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      const response = await api.get('/payments/methods');
      setPaymentMethods(response.data.paymentMethods || []);
      
      // Set default payment method
      const defaultMethod = response.data.paymentMethods.find(method => method.isDefault);
      if (defaultMethod) {
        setSelectedPaymentMethod(defaultMethod.id);
      }
    } catch (err) {
      console.error('Error fetching payment methods:', err);
      // Load mock data
      setPaymentMethods([
        {
          id: 'card_1',
          type: 'credit_card',
          lastFour: '4242',
          brand: 'visa',
          isDefault: true,
          expiryMonth: 12,
          expiryYear: 2025
        },
        {
          id: 'wallet_1',
          type: 'wallet',
          balance: 45.20,
          currency: 'USD'
        }
      ]);
      setSelectedPaymentMethod('card_1');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedPaymentMethod) {
      setError('Please select a payment method');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const totalAmount = rideDetails.fare + tipAmount;
      
      const paymentData = {
        rideId: rideDetails.rideId,
        paymentMethodId: selectedPaymentMethod,
        amount: totalAmount,
        tip: tipAmount,
        currency: 'USD'
      };

      const response = await api.post('/payments/process', paymentData);

      if (response.data.success) {
        updateBookingData({
          ...rideDetails,
          paymentStatus: 'completed',
          totalPaid: totalAmount,
          tip: tipAmount
        });

        navigate('/payment-success', {
          state: {
            paymentDetails: {
              ...response.data.payment,
              rideDetails,
              totalAmount,
              tip: tipAmount
            }
          }
        });
      } else {
        throw new Error(response.data.message || 'Payment failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleTipSelect = (amount) => {
    setTipAmount(amount);
    setCustomTip('');
  };

  const handleCustomTipChange = (value) => {
    setCustomTip(value);
    setTipAmount(parseFloat(value) || 0);
  };

  const getPaymentMethodIcon = (type, brand = '') => {
    switch (type) {
      case 'credit_card':
      case 'debit_card':
        return <CreditCard className="w-6 h-6" />;
      case 'wallet':
        return <Wallet className="w-6 h-6" />;
      default:
        return <DollarSign className="w-6 h-6" />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const suggestedTips = [
    { label: '15%', amount: Math.round(rideDetails.fare * 0.15 * 100) / 100 },
    { label: '18%', amount: Math.round(rideDetails.fare * 0.18 * 100) / 100 },
    { label: '20%', amount: Math.round(rideDetails.fare * 0.20 * 100) / 100 },
    { label: '25%', amount: Math.round(rideDetails.fare * 0.25 * 100) / 100 }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="mr-4 p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Payment</h1>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Ride Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Trip Summary</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Base Fare</span>
              <span className="font-medium">{formatCurrency(rideDetails.baseFare || rideDetails.fare)}</span>
            </div>
            
            {rideDetails.surgeMultiplier > 1 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Surge ({rideDetails.surgeMultiplier}x)</span>
                <span className="font-medium">{formatCurrency((rideDetails.fare - rideDetails.baseFare) || 0)}</span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span className="text-gray-600">Distance</span>
              <span className="text-gray-600">{rideDetails.distance} km</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Duration</span>
              <span className="text-gray-600">{rideDetails.duration} min</span>
            </div>
            
            <div className="border-t pt-3">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-900">Subtotal</span>
                <span className="font-semibold">{formatCurrency(rideDetails.fare)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Driver Rating & Tip */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-blue-600 font-semibold">
                {rideDetails.driverName?.charAt(0) || 'D'}
              </span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{rideDetails.driverName || 'Your Driver'}</p>
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-400 mr-1" />
                <span className="text-sm text-gray-600">{rideDetails.driverRating || '4.8'}</span>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h4 className="font-semibold text-gray-900 mb-3">Add Tip</h4>
            
            {/* Suggested Tips */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              {suggestedTips.map((tip, index) => (
                <button
                  key={index}
                  onClick={() => handleTipSelect(tip.amount)}
                  className={`py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                    tipAmount === tip.amount
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {tip.label} ({formatCurrency(tip.amount)})
                </button>
              ))}
            </div>

            {/* Custom Tip */}
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={customTip}
                onChange={(e) => handleCustomTipChange(e.target.value)}
                placeholder="Custom tip"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                step="0.01"
                min="0"
              />
              <button
                onClick={() => handleTipSelect(0)}
                className={`py-2 px-4 rounded-lg border text-sm font-medium transition-colors ${
                  tipAmount === 0
                    ? 'bg-gray-600 text-white border-gray-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                No Tip
              </button>
            </div>
          </div>

          {tipAmount > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-sm text-green-800">
                  Tip: {formatCurrency(tipAmount)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Payment Method</h3>
          
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                onClick={() => setSelectedPaymentMethod(method.id)}
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedPaymentMethod === method.id
                    ? 'bg-blue-50 border-blue-300'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                  {getPaymentMethodIcon(method.type, method.brand)}
                </div>
                
                <div className="flex-1">
                  {method.type === 'wallet' ? (
                    <div>
                      <p className="font-medium text-gray-900">Wallet Balance</p>
                      <p className="text-sm text-gray-500">
                        Available: {formatCurrency(method.balance)}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-medium text-gray-900 capitalize">
                        {method.brand} •••• {method.lastFour}
                      </p>
                      <p className="text-sm text-gray-500">
                        Expires {method.expiryMonth}/{method.expiryYear}
                      </p>
                    </div>
                  )}
                </div>

                {method.isDefault && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    Default
                  </span>
                )}

                {selectedPaymentMethod === method.id && (
                  <CheckCircle className="w-5 h-5 text-blue-600 ml-2" />
                )}
              </div>
            ))}
          </div>

          <button className="w-full mt-4 py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
            + Add New Payment Method
          </button>
        </div>

        {/* Total */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-900">Total</span>
            <span className="text-xl font-bold text-gray-900">
              {formatCurrency(rideDetails.fare + tipAmount)}
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Pay Button */}
        <button
          onClick={handlePayment}
          disabled={processing || !selectedPaymentMethod}
          className={`w-full py-4 px-6 rounded-lg text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
            processing || !selectedPaymentMethod
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {processing ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Processing Payment...
            </div>
          ) : (
            `Pay ${formatCurrency(rideDetails.fare + tipAmount)}`
          )}
        </button>

        {/* Security Notice */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-start">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Secure Payment</p>
              <p className="text-xs text-gray-600 mt-1">
                Your payment information is encrypted and secure. You'll only be charged after the trip is completed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;