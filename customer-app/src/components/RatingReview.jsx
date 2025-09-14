import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Star, ThumbsUp, MessageSquare, X } from 'lucide-react';
import { api } from '../services/Api';

const RatingReview = () => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  
  const { rideDetails, driverInfo } = location.state || {};

  const positiveOptions = [
    'Great conversation',
    'Clean vehicle',
    'Smooth ride',
    'On time',
    'Safe driving',
    'Friendly',
    'Professional',
    'Helpful'
  ];

  const negativeOptions = [
    'Late pickup',
    'Unsafe driving',
    'Unprofessional',
    'Vehicle issues',
    'Route problems',
    'Cleanliness',
    'Communication',
    'Other'
  ];

  const handleTagToggle = (tag) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      } else {
        return [...prev, tag];
      }
    });
  };

  const handleSubmitRating = async () => {
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const ratingData = {
        rideId: rideDetails?.id,
        driverId: driverInfo?.id,
        rating: rating,
        feedback: feedback.trim(),
        tags: selectedTags
      };

      const response = await api.post('/rides/rating', ratingData);

      if (response.data.success) {
        navigate('/home', {
          state: {
            message: 'Thank you for your feedback!',
            showRatingSuccess: true
          }
        });
      } else {
        throw new Error(response.data.message || 'Failed to submit rating');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to submit rating');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    navigate('/home');
  };

  const getRatingText = (rating) => {
    switch (rating) {
      case 1: return 'Terrible';
      case 2: return 'Bad';
      case 3: return 'Okay';
      case 4: return 'Good';
      case 5: return 'Excellent';
      default: return '';
    }
  };

  const currentOptions = rating >= 4 ? positiveOptions : negativeOptions;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">Rate Your Trip</h1>
            <button
              onClick={handleSkip}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Driver Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {driverInfo?.photo ? (
                <img
                  src={driverInfo.photo}
                  alt={driverInfo.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <span className="text-blue-600 font-semibold text-2xl">
                  {driverInfo?.name?.charAt(0) || 'D'}
                </span>
              )}
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900 mb-1">
              {driverInfo?.name || 'Your Driver'}
            </h2>
            
            <div className="flex items-center justify-center mb-2">
              <Star className="w-4 h-4 text-yellow-400 mr-1" />
              <span className="text-gray-600">{driverInfo?.rating || '4.8'} • {driverInfo?.totalTrips || '1,234'} trips</span>
            </div>

            <p className="text-gray-600 text-sm">
              {driverInfo?.vehicle?.make} {driverInfo?.vehicle?.model} • {driverInfo?.vehicle?.licensePlate}
            </p>
          </div>
        </div>

        {/* Rating Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            How was your trip?
          </h3>

          {/* Star Rating */}
          <div className="flex justify-center mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="mx-1 p-1 focus:outline-none"
              >
                <Star
                  className={`w-10 h-10 transition-colors ${
                    star <= (hoverRating || rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Rating Text */}
          {(rating > 0 || hoverRating > 0) && (
            <p className="text-center text-lg font-medium text-gray-900 mb-4">
              {getRatingText(hoverRating || rating)}
            </p>
          )}

          {/* Quick Tags */}
          {rating > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                {rating >= 4 ? 'What went well?' : 'What could be improved?'}
              </h4>
              
              <div className="flex flex-wrap gap-2">
                {currentOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleTagToggle(option)}
                    className={`px-3 py-2 rounded-full text-sm font-medium border transition-colors ${
                      selectedTags.includes(option)
                        ? 'bg-blue-100 text-blue-700 border-blue-300'
                        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Feedback Text */}
          {rating > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional comments (optional)
              </label>
              <div className="relative">
                <MessageSquare className="absolute top-3 left-3 w-5 h-5 text-gray-400" />
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows="3"
                  placeholder="Tell us more about your experience..."
                  maxLength={500}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {feedback.length}/500 characters
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmitRating}
            disabled={loading || rating === 0}
            className={`w-full py-3 px-4 rounded-lg text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
              loading || rating === 0
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Submitting...
              </div>
            ) : (
              <>
                <ThumbsUp className="w-5 h-5 inline mr-2" />
                Submit Rating
              </>
            )}
          </button>

          {/* Skip Button */}
          <button
            onClick={handleSkip}
            className="w-full mt-3 py-2 px-4 text-gray-600 hover:text-gray-800 font-medium"
          >
            Skip for now
          </button>
        </div>

        {/* Privacy Notice */}
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs text-gray-600 text-center leading-relaxed">
            Your feedback helps us improve our service and assists other riders in making informed decisions. 
            Ratings and reviews may be shared with drivers to help them improve their service.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RatingReview;