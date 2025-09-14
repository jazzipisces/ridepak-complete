import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Download, 
  RefreshCw, 
  Eye, 
  Phone,
  MessageSquare,
  Star,
  CheckCircle,
  XCircle,
  Ban,
  UserPlus,
  MapPin,
  DollarSign,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { useAPI } from '../services/APIService';
import { useSocket } from '../services/SocketService';

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    joinDate: 'all'
  });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { apiCall } = useAPI();
  const socket = useSocket();

  useEffect(() => {
    fetchCustomers();
  }, [filters]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await apiCall('/api/admin/customers', 'GET', null, filters);
      setCustomers(response.customers || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      loadMockCustomers();
    } finally {
      setLoading(false);
    }
  };

  const loadMockCustomers = () => {
    setCustomers([
      {
        id: 'CUST001',
        name: 'John Doe',
        email: 'john.doe@email.com',
        phone: '+1234567890',
        status: 'active',
        rating: 4.8,
        total_rides: 28,
        total_spent: 542.30,
        average_ride_cost: 19.37,
        join_date: '2024-03-10',
        last_ride: '2025-09-14T15:30:00Z',
        favorite_locations: [
          { name: 'Home', address: '123 Main St, New York, NY' },
          { name: 'Work', address: '456 Office Blvd, New York, NY' }
        ],
        payment_methods: [
          { type: 'credit_card', last_four: '4532', is_default: true },
          { type: 'paypal', email: 'john.doe@email.com', is_default: false }
        ],
        ride_preferences: {
          preferred_car_type: 'standard',
          music_preference: 'pop',
          temperature_preference: 'cool'
        },
        support_tickets: 2,
        complaints: 0,
        compliments: 5
      },
      {
        id: 'CUST002',
        name: 'Sarah Johnson',
        email: 'sarah.j@email.com',
        phone: '+1234567891',
        status: 'active',
        rating: 4.9,
        total_rides: 15,
        total_spent: 285.60,
        average_ride_cost: 19.04,
        join_date: '2024-05-22',
        last_ride: '2025-09-14T12:15:00Z',
        favorite_locations: [
          { name: 'Home', address: '789 Pine St, Brooklyn, NY' },
          { name: 'Gym', address: '321 Fitness Ave, Brooklyn, NY' }
        ],
        payment_methods: [
          { type: 'credit_card', last_four: '8765', is_default: true }
        ],
        ride_preferences: {
          preferred_car_type: 'premium',
          music_preference: 'jazz',
          temperature_preference: 'warm'
        },
        support_tickets: 0,
        complaints: 0,
        compliments: 8
      },
      {
        id: 'CUST003',
        name: 'Alex Chen',
        email: 'alex.chen@email.com',
        phone: '+1234567892',
        status: 'banned',
        rating: 2.1,
        total_rides: 3,
        total_spent: 45.20,
        average_ride_cost: 15.07,
        join_date: '2024-09-01',
        last_ride: '2025-09-10T18:00:00Z',
        favorite_locations: [],
        payment_methods: [
          { type: 'credit_card', last_four: '1234', is_default: true }
        ],
        ride_preferences: {
          preferred_car_type: 'standard',
          music_preference: 'none',
          temperature_preference: 'normal'
        },
        support_tickets: 5,
        complaints: 3,
        compliments: 0,
        ban_reason: 'Inappropriate behavior towards drivers',
        ban_date: '2025-09-12T10:00:00Z'
      }
    ]);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      case 'banned': return 'text-red-600 bg-red-100';
      case 'suspended': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleCustomerStatusChange = async (customerId, newStatus) => {
    try {
      await apiCall(`/api/admin/customers/${customerId}/status`, 'PUT', { status: newStatus });
      fetchCustomers();
    } catch (error) {
      console.error('Error updating customer status:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const CustomerModal = ({ customer, onClose }) => {
    if (!customer) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto m-4">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div className="flex items-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white text-xl font-bold">{customer.name.charAt(0)}</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{customer.name}</h2>
                  <p className="text-gray-600">ID: {customer.id}</p>
                  <div className="flex items-center mt-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(customer.status)}`}>
                      {customer.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <h3 className="text-sm font-medium text-blue-700">Total Rides</h3>
                <p className="text-2xl font-bold text-blue-900">{customer.total_rides}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <h3 className="text-sm font-medium text-green-700">Total Spent</h3>
                <p className="text-2xl font-bold text-green-900">{formatCurrency(customer.total_spent)}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg text-center">
                <h3 className="text-sm font-medium text-yellow-700">Average Ride</h3>
                <p className="text-2xl font-bold text-yellow-900">{formatCurrency(customer.average_ride_cost)}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <h3 className="text-sm font-medium text-purple-700">Rating</h3>
                <div className="flex items-center justify-center mt-1">
                  <Star className="w-5 h-5 text-yellow-400 mr-1" />
                  <span className="text-2xl font-bold text-purple-900">{customer.rating}</span>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{customer.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{customer.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Join Date:</span>
                    <span className="font-medium">{new Date(customer.join_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Ride:</span>
                    <span className="font-medium">{new Date(customer.last_ride).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Account Status</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Support Tickets:</span>
                    <span className="font-medium">{customer.support_tickets}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Complaints:</span>
                    <span className="font-medium text-red-600">{customer.complaints}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Compliments:</span>
                    <span className="font-medium text-green-600">{customer.compliments}</span>
                  </div>
                  {customer.ban_reason && (
                    <div className="mt-4 p-3 bg-red-50 rounded-lg">
                      <p className="text-sm font-medium text-red-800">Ban Reason:</p>
                      <p className="text-sm text-red-600">{customer.ban_reason}</p>
                      <p className="text-xs text-red-500 mt-1">
                        Banned on: {new Date(customer.ban_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Favorite Locations */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Favorite Locations
              </h3>
              {customer.favorite_locations.length > 0 ? (
                <div className="space-y-2">
                  {customer.favorite_locations.map((location, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium text-gray-900">{location.name}</p>
                        <p className="text-sm text-gray-600">{location.address}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No favorite locations saved</p>
              )}
            </div>

            {/* Payment Methods */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Payment Methods
              </h3>
              <div className="space-y-2">
                {customer.payment_methods.map((method, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div className="flex items-center">
                      <span className="capitalize font-medium">{method.type.replace('_', ' ')}</span>
                      {method.last_four && (
                        <span className="ml-2 text-gray-600">****{method.last_four}</span>
                      )}
                      {method.email && (
                        <span className="ml-2 text-gray-600">{method.email}</span>
                      )}
                    </div>
                    {method.is_default && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded">Default</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Ride Preferences */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Ride Preferences</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Car Type:</span>
                  <p className="font-medium capitalize">{customer.ride_preferences.preferred_car_type}</p>
                </div>
                <div>
                  <span className="text-gray-600">Music:</span>
                  <p className="font-medium capitalize">{customer.ride_preferences.music_preference}</p>
                </div>
                <div>
                  <span className="text-gray-600">Temperature:</span>
                  <p className="font-medium capitalize">{customer.ride_preferences.temperature_preference}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <div className="flex space-x-3">
                {customer.status === 'banned' ? (
                  <button
                    onClick={() => handleCustomerStatusChange(customer.id, 'active')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Unban Customer
                  </button>
                ) : (
                  <button
                    onClick={() => handleCustomerStatusChange(customer.id, 'banned')}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Ban Customer
                  </button>
                )}
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Phone className="w-4 h-4 mr-2 inline" />
                  Call Customer
                </button>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  <MessageSquare className="w-4 h-4 mr-2 inline" />
                  Send Message
                </button>
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
          <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-gray-600 mt-1">Manage and support all customers on your platform</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchCustomers}
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
              placeholder="Search customers by name, email, or phone..."
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
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="banned">Banned</option>
            <option value="suspended">Suspended</option>
          </select>
          <select
            value={filters.joinDate}
            onChange={(e) => setFilters({ ...filters, joinDate: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading customers...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Activity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Spending
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center mr-4">
                          <span className="text-white font-medium text-lg">
                            {customer.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{customer.name}</p>
                          <p className="text-sm text-gray-500">{customer.id}</p>
                          <p className="text-xs text-gray-400">
                            Joined {new Date(customer.join_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-gray-900">{customer.email}</p>
                        <p className="text-gray-500">{customer.phone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">{customer.total_rides} rides</p>
                        <p className="text-gray-500">
                          Last: {new Date(customer.last_ride).toLocaleDateString()}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">
                          {formatCurrency(customer.total_spent)}
                        </p>
                        <p className="text-gray-500">
                          Avg: {formatCurrency(customer.average_ride_cost)}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 mr-1" />
                        <span className="text-sm font-medium">{customer.rating}</span>
                      </div>
                      <p className="text-xs text-gray-500">{customer.compliments} compliments</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
                        {customer.status.toUpperCase()}
                      </span>
                      {customer.support_tickets > 0 && (
                        <p className="text-xs text-orange-600 mt-1">
                          {customer.support_tickets} support tickets
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setShowModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => window.open(`tel:${customer.phone}`)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Phone className="w-4 h-4" />
                        </button>
                        <button className="text-purple-600 hover:text-purple-900">
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        {customer.status !== 'banned' ? (
                          <button
                            onClick={() => handleCustomerStatusChange(customer.id, 'banned')}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleCustomerStatusChange(customer.id, 'active')}
                            className="text-green-600 hover:text-green-900"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && customers.length === 0 && (
          <div className="p-8 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No customers found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Customer Details Modal */}
      {showModal && selectedCustomer && (
        <CustomerModal
          customer={selectedCustomer}
          onClose={() => {
            setShowModal(false);
            setSelectedCustomer(null);
          }}
        />
      )}
    </div>
  );
};

export default CustomerManagement;
      