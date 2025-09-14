import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  Eye, 
  Phone,
  MessageSquare,
  Navigation,
  Clock,
  DollarSign,
  Star,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Play,
  Pause
} from 'lucide-react';
import { useAPI } from '../services/APIService';
import { useSocket } from '../services/SocketService';

const RideManagement = () => {
  const [rides, setRides] = useState([]);
  const [selectedRide, setSelectedRide] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: 'today',
    search: ''
  });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { apiCall } = useAPI();
  const socket = useSocket();

  // Real-time ride updates
  useEffect(() => {
    if (socket) {
      socket.on('ride_created', (newRide) => {
        setRides(prev => [newRide, ...prev]);
      });

      socket.on('ride_updated', (updatedRide) => {
        setRides(prev => 
          prev.map(ride => ride.id === updatedRide.id ? updatedRide : ride)
        );
        if (selectedRide && selectedRide.id === updatedRide.id) {
          setSelectedRide(updatedRide);
        }
      });

      socket.on('driver_location_update', (data) => {
        setRides(prev =>
          prev.map(ride => 
            ride.driver_id === data.driver_id 
              ? { ...ride, driver_location: data.location }
              : ride
          )
        );
      });

      return () => {
        socket.off('ride_created');
        socket.off('ride_updated');
        socket.off('driver_location_update');
      };
    }
  }, [socket, selectedRide]);

  // Fetch rides data
  useEffect(() => {
    fetchRides();
  }, [filters]);

  const fetchRides = async () => {
    try {
      setLoading(true);
      const response = await apiCall('/api/admin/rides', 'GET', null, {
        status: filters.status,
        date_range: filters.dateRange,
        search: filters.search
      });
      setRides(response.rides || []);
    } catch (error) {
      console.error('Error fetching rides:', error);
      // Load mock data
      loadMockRides();
    } finally {
      setLoading(false);
    }
  };

  const loadMockRides = () => {
    setRides([
      {
        id: 'RIDE001',
        customer: {
          id: 'CUST001',
          name: 'John Doe',
          phone: '+1234567890',
          avatar: null,
          rating: 4.8
        },
        driver: {
          id: 'DRV001',
          name: 'Mike Wilson',
          phone: '+1234567891',
          avatar: null,
          rating: 4.9,
          location: { lat: 40.7128, lng: -74.0060 }
        },
        pickup: {
          address: '123 Main St, New York, NY',
          lat: 40.7128,
          lng: -74.0060
        },
        destination: {
          address: '456 Oak Ave, New York, NY',
          lat: 40.7589,
          lng: -73.9851
        },
        status: 'in_progress',
        fare: 25.50,
        distance: 5.2,
        duration_estimate: 18,
        actual_duration: null,
        created_at: '2025-09-14T14:30:00Z',
        started_at: '2025-09-14T14:35:00Z',
        completed_at: null,
        payment_method: 'credit_card',
        surge_multiplier: 1.0,
        tip: 0,
        notes: 'Customer requested air conditioning'
      },
      {
        id: 'RIDE002',
        customer: {
          id: 'CUST002',
          name: 'Sarah Johnson',
          phone: '+1234567892',
          avatar: null,
          rating: 4.7
        },
        driver: {
          id: 'DRV002',
          name: 'David Brown',
          phone: '+1234567893',
          avatar: null,
          rating: 4.6,
          location: { lat: 40.7589, lng: -73.9851 }
        },
        pickup: {
          address: '789 Pine Rd, New York, NY',
          lat: 40.7505,
          lng: -73.9934
        },
        destination: {
          address: '321 Elm St, New York, NY',
          lat: 40.7282,
          lng: -74.0776
        },
        status: 'completed',
        fare: 18.75,
        distance: 3.8,
        duration_estimate: 12,
        actual_duration: 15,
        created_at: '2025-09-14T13:15:00Z',
        started_at: '2025-09-14T13:20:00Z',
        completed_at: '2025-09-14T13:35:00Z',
        payment_method: 'cash',
        surge_multiplier: 1.2,
        tip: 3.00,
        rating: {
          customer_rating: 5,
          driver_rating: 4,
          customer_feedback: 'Great ride!',
          driver_feedback: 'Pleasant customer'
        }
      },
      {
        id: 'RIDE003',
        customer: {
          id: 'CUST003',
          name: 'Alex Chen',
          phone: '+1234567894',
          avatar: null,
          rating: 4.2
        },
        driver: {
          id: 'DRV003',
          name: 'Robert Taylor',
          phone: '+1234567895',
          avatar: null,
          rating: 4.1,
          location: null
        },
        pickup: {
          address: '555 Cedar Blvd, New York, NY',
          lat: 40.7831,
          lng: -73.9712
        },
        destination: {
          address: '777 Birch Way, New York, NY',
          lat: 40.7549,
          lng: -73.9840
        },
        status: 'cancelled',
        fare: 0,
        distance: 2.1,
        duration_estimate: 8,
        actual_duration: null,
        created_at: '2025-09-14T16:20:00Z',
        started_at: null,
        completed_at: null,
        payment_method: 'credit_card',
        surge_multiplier: 1.0,
        tip: 0,
        cancellation_reason: 'Driver not available',
        cancelled_by: 'driver'
      }
    ]);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'driver_assigned': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'in_progress': return Play;
      case 'pending': return Clock;
      case 'cancelled': return XCircle;
      case 'driver_assigned': return Navigation;
      default: return AlertTriangle;
    }
  };

  const handleRideAction = async (rideId, action) => {
    try {
      await apiCall(`/api/admin/rides/${rideId}/${action}`, 'POST');
      fetchRides();
    } catch (error) {
      console.error(`Error performing ${action} on ride:`, error);
    }
  };

  const handleContactCustomer = (ride) => {
    window.open(`tel:${ride.customer.phone}`);
  };

  const handleContactDriver = (ride) => {
    window.open(`tel:${ride.driver.phone}`);
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const RideModal = ({ ride, onClose }) => {
    if (!ride) return null;

    const StatusIcon = getStatusIcon(ride.status);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto m-4">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Ride Details</h2>
                <p className="text-gray-600">ID: {ride.id}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ride.status)} flex items-center`}>
                  <StatusIcon className="w-4 h-4 mr-1" />
                  {ride.status.replace('_', ' ').toUpperCase()}
                </span>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Trip Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Trip Info</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Distance:</span>
                    <span className="font-medium">{ride.distance} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Est. Duration:</span>
                    <span className="font-medium">{ride.duration_estimate} min</span>
                  </div>
                  {ride.actual_duration && (
                    <div className="flex justify-between">
                      <span className="text-blue-700">Actual Duration:</span>
                      <span className="font-medium">{ride.actual_duration} min</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">Payment</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-700">Base Fare:</span>
                    <span className="font-medium">{formatCurrency(ride.fare)}</span>
                  </div>
                  {ride.tip > 0 && (
                    <div className="flex justify-between">
                      <span className="text-green-700">Tip:</span>
                      <span className="font-medium">{formatCurrency(ride.tip)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-green-700">Payment Method:</span>
                    <span className="font-medium capitalize">{ride.payment_method.replace('_', ' ')}</span>
                  </div>
                  {ride.surge_multiplier > 1 && (
                    <div className="flex justify-between">
                      <span className="text-green-700">Surge:</span>
                      <span className="font-medium">{ride.surge_multiplier}x</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold text-yellow-900 mb-2">Timeline</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-yellow-700">Created:</span>
                    <div className="font-medium">{formatDateTime(ride.created_at)}</div>
                  </div>
                  {ride.started_at && (
                    <div>
                      <span className="text-yellow-700">Started:</span>
                      <div className="font-medium">{formatDateTime(ride.started_at)}</div>
                    </div>
                  )}
                  {ride.completed_at && (
                    <div>
                      <span className="text-yellow-700">Completed:</span>
                      <div className="font-medium">{formatDateTime(ride.completed_at)}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Customer & Driver Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Customer Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{ride.customer.name}</p>
                      <p className="text-sm text-gray-600">{ride.customer.phone}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 mr-1" />
                        <span className="text-sm">{ride.customer.rating}</span>
                      </div>
                      <button
                        onClick={() => handleContactCustomer(ride)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                      >
                        <Phone className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Car className="w-5 h-5 mr-2" />
                  Driver Information
                </h3>
                <div className="space-y-3">
                  {ride.driver ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{ride.driver.name}</p>
                        <p className="text-sm text-gray-600">{ride.driver.phone}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 mr-1" />
                          <span className="text-sm">{ride.driver.rating}</span>
                        </div>
                        <button
                          onClick={() => handleContactDriver(ride)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                        >
                          <Phone className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">No driver assigned</p>
                  )}
                </div>
              </div>
            </div>

            {/* Route Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Route Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-900">Pickup Location</p>
                    <p className="text-gray-600">{ride.pickup.address}</p>
                  </div>
                </div>
                <div className="border-l-2 border-gray-300 ml-1 h-6"></div>
                <div className="flex items-start space-x-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-900">Destination</p>
                    <p className="text-gray-600">{ride.destination.address}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Ratings & Feedback */}
            {ride.rating && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Ratings & Feedback</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium text-gray-700">Customer Rating</p>
                    <div className="flex items-center mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < ride.rating.customer_rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-gray-600">({ride.rating.customer_rating}/5)</span>
                    </div>
                    {ride.rating.customer_feedback && (
                      <p className="text-gray-600 mt-2">"{ride.rating.customer_feedback}"</p>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Driver Rating</p>
                    <div className="flex items-center mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < ride.rating.driver_rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-gray-600">({ride.rating.driver_rating}/5)</span>
                    </div>
                    {ride.rating.driver_feedback && (
                      <p className="text-gray-600 mt-2">"{ride.rating.driver_feedback}"</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Notes & Special Instructions */}
            {(ride.notes || ride.cancellation_reason) && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Additional Information</h3>
                {ride.notes && (
                  <div className="mb-3">
                    <p className="font-medium text-gray-700">Customer Notes</p>
                    <p className="text-gray-600">{ride.notes}</p>
                  </div>
                )}
                {ride.cancellation_reason && (
                  <div>
                    <p className="font-medium text-gray-700">Cancellation Reason</p>
                    <p className="text-gray-600">{ride.cancellation_reason}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Cancelled by: {ride.cancelled_by}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <div className="flex space-x-3">
                {ride.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleRideAction(ride.id, 'assign_driver')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Assign Driver
                    </button>
                    <button
                      onClick={() => handleRideAction(ride.id, 'cancel')}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Cancel Ride
                    </button>
                  </>
                )}
                {ride.status === 'in_progress' && (
                  <button
                    onClick={() => handleRideAction(ride.id, 'complete')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Mark Complete
                  </button>
                )}
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ride Management</h1>
          <p className="text-gray-600 mt-1">Monitor and manage all ride requests in real-time</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchRides}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ride ID, customer, or driver..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 w-80 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="driver_assigned">Driver Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={filters.dateRange}
            onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
      </div>

      {/* Rides Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading rides...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ride Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fare
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rides.map((ride) => {
                  const StatusIcon = getStatusIcon(ride.status);
                  return (
                    <tr key={ride.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="font-medium text-gray-900">{ride.id}</p>
                          <p className="text-sm text-gray-500">
                            {formatDateTime(ride.created_at)}
                          </p>
                          <p className="text-xs text-gray-400">
                            {ride.distance} km • {ride.duration_estimate} min
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-blue-600 font-medium text-sm">
                              {ride.customer.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{ride.customer.name}</p>
                            <div className="flex items-center">
                              <Star className="w-3 h-3 text-yellow-400 mr-1" />
                              <span className="text-sm text-gray-500">{ride.customer.rating}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {ride.driver ? (
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                              <span className="text-green-600 font-medium text-sm">
                                {ride.driver.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{ride.driver.name}</p>
                              <div className="flex items-center">
                                <Star className="w-3 h-3 text-yellow-400 mr-1" />
                                <span className="text-sm text-gray-500">{ride.driver.rating}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Not assigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="font-medium text-gray-900 truncate max-w-xs">
                            {ride.pickup.address.split(',')[0]}
                          </p>
                          <p className="text-gray-500 truncate max-w-xs">
                            → {ride.destination.address.split(',')[0]}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ride.status)}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {ride.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">
                            {formatCurrency(ride.fare + (ride.tip || 0))}
                          </p>
                          {ride.surge_multiplier > 1 && (
                            <p className="text-xs text-orange-600">
                              {ride.surge_multiplier}x surge
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedRide(ride);
                              setShowModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {ride.customer.phone && (
                            <button
                              onClick={() => handleContactCustomer(ride)}
                              className="text-green-600 hover:text-green-900"
                            >
                              <Phone className="w-4 h-4" />
                            </button>
                          )}
                          <button className="text-gray-600 hover:text-gray-900">
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && rides.length === 0 && (
          <div className="p-8 text-center">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No rides found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Ride Details Modal */}
      {showModal && selectedRide && (
        <RideModal
          ride={selectedRide}
          onClose={() => {
            setShowModal(false);
            setSelectedRide(null);
          }}
        />
      )}
    </div>
  );
};

export default RideManagement;