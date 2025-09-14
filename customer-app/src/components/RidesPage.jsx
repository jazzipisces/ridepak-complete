import React, { useState } from 'react';
import { 
  Clock, 
  MapPin, 
  Star, 
  Filter,
  Calendar,
  Navigation,
  Package,
  Car
} from 'lucide-react';
import NavBar from './NavBar';

const RidesPage = ({ user }) => {
  const [filterType, setFilterType] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const rides = [
    {
      id: 1,
      from: 'Blue Area',
      to: 'F-7 Markaz',
      date: '2024-09-12',
      time: '14:30',
      fare: 180,
      status: 'completed',
      type: 'ride',
      driver: 'Ahmad Khan',
      rating: 5,
      vehicle: 'Toyota Corolla',
      duration: '25 min'
    },
    {
      id: 2,
      from: 'Saddar',
      to: 'G-9 Markaz',
      date: '2024-09-11',
      time: '09:15',
      fare: 220,
      status: 'completed',
      type: 'ride',
      driver: 'Hassan Ali',
      rating: 4,
      vehicle: 'Honda City',
      duration: '18 min'
    },
    {
      id: 3,
      from: 'Islamabad',
      to: 'Lahore',
      date: '2024-09-10',
      time: '06:00',
      fare: 4500,
      status: 'completed',
      type: 'intercity',
      driver: 'Usman Shah',
      rating: 5,
      vehicle: 'Toyota Hiace',
      duration: '4h 30min'
    },
    {
      id: 4,
      from: 'PWD',
      to: 'Centaurus Mall',
      date: '2024-09-10',
      time: '19:45',
      fare: 150,
      status: 'completed',
      type: 'ride',
      driver: 'Bilal Ahmed',
      rating: 4,
      vehicle: 'Suzuki Swift',
      duration: '15 min'
    },
    {
      id: 5,
      from: 'Office',
      to: 'Home',
      date: '2024-09-09',
      time: '18:30',
      fare: 300,
      status: 'completed',
      type: 'cargo',
      driver: 'Kashif Mehmood',
      rating: 5,
      vehicle: 'Suzuki Pickup',
      duration: '35 min'
    },
    {
      id: 6,
      from: 'Airport',
      to: 'Hotel',
      date: '2024-09-08',
      time: '22:15',
      fare: 800,
      status: 'cancelled',
      type: 'ride',
      driver: 'N/A',
      rating: 0,
      vehicle: 'N/A',
      duration: 'N/A'
    }
  ];

  const filterOptions = [
    { id: 'all', name: 'All Rides', icon: Clock },
    { id: 'ride', name: 'City Rides', icon: Car },
    { id: 'intercity', name: 'Intercity', icon: Navigation },
    { id: 'cargo', name: 'Cargo', icon: Package },
    { id: 'completed', name: 'Completed', icon: Star },
    { id: 'cancelled', name: 'Cancelled', icon: Clock }
  ];

  const filteredRides = rides.filter(ride => {
    if (filterType === 'all') return true;
    if (filterType === 'completed' || filterType === 'cancelled') {
      return ride.status === filterType;
    }
    return ride.type === filterType;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-600';
      case 'cancelled':
        return 'bg-red-100 text-red-600';
      case 'ongoing':
        return 'bg-blue-100 text-blue-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'intercity':
        return <Navigation className="w-4 h-4" />;
      case 'cargo':
        return <Package className="w-4 h-4" />;
      default:
        return <Car className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <NavBar user={user} />
      
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">My Rides</h2>
            <p className="text-gray-600">{filteredRides.length} rides found</p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-white p-3 rounded-lg shadow-sm border flex items-center space-x-2 hover:bg-gray-50"
          >
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium">Filter</span>
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
            <h3 className="font-medium text-gray-800 mb-3">Filter by</h3>
            <div className="grid grid-cols-2 gap-2">
              {filterOptions.map(option => (
                <button
                  key={option.id}
                  onClick={() => setFilterType(option.id)}
                  className={`flex items-center space-x-2 p-3 rounded-lg text-sm ${
                    filterType === option.id
                      ? 'bg-green-100 text-green-600 border-green-200'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  } border transition-colors`}
                >
                  <option.icon className="w-4 h-4" />
                  <span>{option.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
            <div className="text-2xl font-bold text-gray-800">
              {rides.filter(r => r.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
            <div className="text-2xl font-bold text-gray-800">
              ₨{rides.filter(r => r.status === 'completed').reduce((sum, r) => sum + r.fare, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Spent</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
            <div className="text-2xl font-bold text-gray-800">
              {(rides.filter(r => r.rating > 0).reduce((sum, r) => sum + r.rating, 0) / rides.filter(r => r.rating > 0).length || 0).toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">Avg Rating</div>
          </div>
        </div>

        {/* Rides List */}
        <div className="space-y-4">
          {filteredRides.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">No rides found</h3>
              <p className="text-gray-600">Try adjusting your filters or book your first ride!</p>
            </div>
          ) : (
            filteredRides.map(ride => (
              <div key={ride.id} className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gray-100 p-2 rounded-lg">
                      {getTypeIcon(ride.type)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-800">
                          {ride.from} → {ride.to}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ride.status)}`}>
                          {ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <span>{formatDate(ride.date)} • {ride.time}</span>
                        {ride.duration !== 'N/A' && <span>{ride.duration}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-800">₨{ride.fare}</div>
                    {ride.rating > 0 && (
                      <div className="flex items-center space-x-1 mt-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm text-gray-600">{ride.rating}</span>
                      </div>
                    )}
                  </div>
                </div>

                {ride.driver !== 'N/A' && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-800">Driver: {ride.driver}</div>
                        <div className="text-sm text-gray-600">Vehicle: {ride.vehicle}</div>
                      </div>
                      <button className="text-green-600 text-sm font-medium hover:text-green-700">
                        Book Again
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RidesPage;