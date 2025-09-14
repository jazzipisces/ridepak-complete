import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Car, Shield, RefreshCw } from 'lucide-react';
import { useAuth } from '../utils/AuthContext';

const OTPVerification = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  const inputRefs = useRef([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyOTP, resendOTP } = useAuth();

  const { email, phone, isSignup } = location.state || {};

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  useEffect(() => {
    // Timer countdown
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleInputChange = (index, value) => {
    // Only allow single digit
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields filled
    if (newOtp.every(digit => digit !== '') && value) {
      handleVerifyOTP(newOtp.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    // Handle paste
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then(text => {
        const digits = text.replace(/\D/g, '').slice(0, 6).split('');
        const newOtp = [...otp];
        digits.forEach((digit, i) => {
          if (i < 6) newOtp[i] = digit;
        });
        setOtp(newOtp);
        
        // Focus last filled input or next empty
        const nextIndex = Math.min(digits.length, 5);
        inputRefs.current[nextIndex]?.focus();
        
        // Auto-submit if complete
        if (digits.length === 6) {
          handleVerifyOTP(digits.join(''));
        }
      });
    }
  };

  const handleVerifyOTP = async (otpValue = null) => {
    const otpToVerify = otpValue || otp.join('');
    
    if (otpToVerify.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await verifyOTP({
        otp: otpToVerify,
        email,
        phone,
        isSignup
      });

      if (result.success) {
        if (isSignup) {
          navigate('/home', { 
            state: { 
              message: 'Account verified successfully! Welcome to our platform.' 
            } 
          });
        } else {
          navigate('/home');
        }
      } else {
        setError(result.error || 'Invalid verification code. Please try again.');
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    setError('');

    try {
      const result = await resendOTP({ email, phone });
      
      if (result.success) {
        setTimer(60);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        setError(result.error || 'Failed to resend code. Please try again.');
      }
    } catch (err) {
      setError('Failed to resend code. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-white opacity-10 rounded-full animate-pulse"></div>
        <div className="absolute -bottom-32 -left-40 w-96 h-96 bg-white opacity-5 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Verify Your Account</h1>
          <p className="text-blue-100">
            We've sent a 6-digit code to
          </p>
          <p className="text-white font-medium">
            {email ? email : phone}
          </p>
        </div>

        {/* OTP Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="space-y-6">
            {/* OTP Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                Enter Verification Code
              </label>
              <div className="flex justify-center space-x-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => inputRefs.current[index] = el}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className={`w-12 h-14 text-center text-xl font-bold border-2 rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors ${
                      digit
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300'
                    } ${error ? 'border-red-300' : ''}`}
                    disabled={loading}
                  />
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800 text-center">{error}</p>
              </div>
            )}

            {/* Verify Button */}
            <button
              onClick={() => handleVerifyOTP()}
              disabled={loading || otp.some(digit => !digit)}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
                loading || otp.some(digit => !digit)
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Verifying...
                </div>
              ) : (
                'Verify Code'
              )}
            </button>

            {/* Resend Section */}
            <div className="text-center">
              {!canResend ? (
                <p className="text-sm text-gray-600">
                  Resend code in{' '}
                  <span className="font-medium text-blue-600">
                    {formatTime(timer)}
                  </span>
                </p>
              ) : (
                <button
                  onClick={handleResendOTP}
                  disabled={resendLoading}
                  className="text-sm text-blue-600 hover:text-blue-500 font-medium inline-flex items-center"
                >
                  {resendLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Resend Code
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Change Contact Info */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Didn't receive the code?
              </p>
              <button
                onClick={() => navigate('/login')}
                className="text-sm text-blue-600 hover:text-blue-500 font-medium"
              >
                Try a different email or phone number
              </button>
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="text-center mt-6">
          <p className="text-blue-100 text-sm">
            Having trouble? Check your spam folder or{' '}
            <button className="underline hover:text-white">
              contact support
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;