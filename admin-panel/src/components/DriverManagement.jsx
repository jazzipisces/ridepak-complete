import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  Eye, 
  Phone,
  MessageSquare,
  Car,
  Star,
  CheckCircle,
  XCircle,
  Ban,
  UserPlus,
  MapPin,
  DollarSign,
  Clock,
  Shield,
  AlertTriangle
} from 'lucide-react';
import { useAPI } from '../services/APIService';
import { useSocket } from '../services/SocketService';

const DriverManagement = () => {
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    location: 'all'
  });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { apiCall } = useAPI();
  const socket = useSocket();

  useEffect(() => {
    fetchDrivers();
  }, [filters]);

  useEffect(() => {
    if (socket) {
      socket.on('driver_status_update', (driverData) => {
        setDrivers(prev => 
          prev.map(driver => 
            driver.id === driverData.id 
              ? { ...driver, status: driverData.status, location: driverData.location }
              : driver
          )
        );
      });

      return () => socket.off('driver_status_update');
    }
  }, [socket]);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const response = await apiCall('/api/admin/drivers', 'GET', null, filters);
      setDrivers(response.drivers || []);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      loadMockDrivers();
    } finally {
      setLoading(false);
    }
  };

  const loadMockDrivers = () => {
    setDrivers([
      {
        id: 'DRV001',
        name: 'Mike Wilson',
        email: 'mike@email.com',
        phone: '+1234567890',
        status: 'online',
        rating: 4.8,
        total_rides: 234,
        earnings: { total: 2340.50, this_month: 450.25 },
        vehicle: {
          make: 'Toyota',
          model: 'Camry',
          year: 2020,
          license_plate: 'ABC123',
          color: 'White'
        },
        documents: {
          license: { status: 'approved', expires: '2025-12-31' },
          insurance: { status: 'approved', expires: '2025-06-30' },
          registration: { status: 'approved', expires: '2025-10-15' }
        },
        location: { lat: 40.7128, lng: -74.0060, address: 'New York, NY' },
        join_date: '2024-01-15',
        last_active: '2025-09-14T16:30:00Z',
        completion_rate: 96.5,
        cancellation_rate: 2.1,
        average_rating: 4.8
      },
      {
        id: 'DRV002',
        name: 'David Brown',
        email: 'david@email.com',
        phone: '+1234567891',
        status: 'busy',
        rating: 4.6,
        total_rides: 189,
        earnings: { total: 1890.25, this_month: 380.50 },
        vehicle: {
          make: 'Honda',
          model: 'Civic',
          year: 2019,
          license_plate: 'XYZ789',
          color: 'Blue'
        },
        documents: {
          license: { status: 'approved', expires: '2025-11-20' },
          insurance: { status: 'pending', expires: '2025-05-15' },
          registration: { status: 'approved', expires: '2025-09-10' }
        },
        location: { lat: 40.7589, lng: -73.9851, address: 'Manhattan, NY' },
        join_date: '2024-02-20',
        last_active: '2025-09-14T16:25:00Z',
        completion_rate: 94.2,
        cancellation_rate: 3.8,
        average_rating: 4.6
      },
      {
        id: 'DRV003',
        name: 'Robert Taylor',
        email: 'robert@email.com',
        phone: '+1234567892',
        status: 'suspended',
        rating: 3.9,
        total_rides: 45,
        earnings: { total: 450.75, this_month: 0 },
        vehicle: {
          make: 'Ford',
          model: 'Focus',
          year: 2018,
          license_plate: 'DEF456',
          color: 'Black'
        },
        documents: {
          license: { status: 'expired', expires: '2025-01-10' },
          insurance: { status: 'rejected', expires: '2025-03-20' },
          registration: { status: 'approved', expires: '2025-08-05' }
        },
        location: null,
        join_date: '2024-08-10',
        last_active: '2025-09-10T12:00:00Z',
        completion_rate: 78.5,
        cancellation_rate: 15.2,
        average_rating: 3.9
      }
    ]);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-100';
      case 'busy': return 'text-yellow-600 bg-yellow-100';
      case 'offline': return 'text-gray-600 bg-gray-100';
      case 'suspended': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online': return CheckCircle;
      case 'busy': return Clock;
      case 'offline': return XCircle;
      case 'suspended': return Ban;
      default: return AlertTriangle;
    }
  };

  const handleDriverStatusChange = async (driverId, newStatus) => {
    try {
      await apiCall(`/api/admin/drivers/${driverId}/status`, 'PUT', { status: newStatus });
      fetchDrivers();
    } catch (error) {
      console.error('Error updating driver status:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const DriverModal = ({ driver, onClose }) => {
    if (!driver) return null;

    const StatusIcon = getStatusIcon(driver.status);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto m-4">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div className="flex items-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white text-xl font-bold">{driver.name.charAt(0)}</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{driver.name}</h2>
                  <p className="text-gray-600">ID: {driver.id}</p>
                  <div className="flex items-center mt-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(driver.status)} flex items-center`}>
                      <StatusIcon className="w-4 h-4 mr-1" />
                      {driver.status.toUpperCase()}
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
            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-3">Contact Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Email:</span>
                    <span className="font-medium">{driver.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Phone:</span>
                    <span className="font-medium">{driver.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Join Date:</span>
                    <span className="font-medium">{new Date(driver.join_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Last Active:</span>
                    <span className="font-medium">{new Date(driver.last_active).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-3">Performance Metrics</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-700">Rating:</span>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 mr-1" />
                      <span className="font-medium">{driver.average_rating}/5</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Total Rides:</span>
                    <span className="font-medium">{driver.total_rides}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Completion Rate:</span>
                    <span className="font-medium">{driver.completion_rate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Cancellation Rate:</span>
                    <span className="font-medium">{driver.cancellation_rate}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Car className="w-5 h-5 mr-2" />
                Vehicle Information
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Make & Model</span>
                  <p className="font-medium">{driver.vehicle.make} {driver.vehicle.model}</p>
                </div>
                <div>
                  <span className="text-gray-600">Year</span>
                  <p className="font-medium">{driver.vehicle.year}</p>
                </div>
                <div>
                  <span className="text-gray-600">License Plate</span>
                  <p className="font-medium">{driver.vehicle.license_plate}</p>
                </div>
                <div>
                  <span className="text-gray-600">Color</span>
                  <p className="font-medium">{driver.vehicle.color}</p>
                </div>
              </div>
            </div>

            {/* Documents Status */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Document Status
              </h3>
              <div className="space-y-3">
                {Object.entries(driver.documents).map(([docType, doc]) => (
                  <div key={docType} className="flex justify-between items-center">
                    <span className="capitalize font-medium">{docType.replace('_', ' ')}</span>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        doc.status === 'approved' ? 'text-green-600 bg-green-100' :
                        doc.status === 'pending' ? 'text-yellow-600 bg-yellow-100' :
                        'text-red-600 bg-red-100'
                      }`}>
                        {doc.status}
                      </span>
                      <span className="text-sm text-gray-500">Expires: {doc.expires}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Earnings Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Earnings
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-700">Total Earnings</p>
                  <p className="text-2xl font-bold text-green-900">
                    {formatCurrency(driver.earnings.total)}
                  </p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">This Month</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {formatCurrency(driver.earnings.this_month)}
                  </p>
                </div>
              </div>
            </div>

            {/* Location */}
            {driver.location && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Current Location
                </h3>
                <p className="text-gray-600">{driver.location.address}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Lat: {driver.location.lat}, Lng: {driver.location.lng}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <div className="flex space-x-3">
                {driver.status === 'suspended' ? (
                  <button
                    onClick={() => handleDriverStatusChange(driver.id, 'offline')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Activate Driver
                  </button>
                ) : (
                  <button
                    onClick={() => handleDriverStatusChange(driver.id, 'suspended')}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Suspend Driver
                  </button>
                )}
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Phone className="w-4 h-4 mr-2 inline" />
                  Call Driver
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
          <h1 className="text-3xl font-bold text-gray-900">Driver Management</h1>
          <p className="text-gray-600 mt-1">Manage and monitor all drivers on your platform</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchDrivers}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Driver
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
              placeholder="Search drivers by name, email, or phone..."
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
            <option value="online">Online</option>
            <option value="busy">Busy</option>
            <option value="offline">Offline</option>
            <option value="suspended">Suspended</option>
          </select>
          <select
            value={filters.location}
            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Locations</option>
            <option value="manhattan">Manhattan</option>
            <option value="brooklyn">Brooklyn</option>
            <option value="queens">Queens</option>
          </select>
        </div>
      </div>

      {/* Drivers Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading drivers...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Earnings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {drivers.map((driver) => {
                  const StatusIcon = getStatusIcon(driver.status);
                  return (
                    <tr key={driver.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mr-4">
                            <span className="text-white font-medium text-lg">
                              {driver.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{driver.name}</p>
                            <p className="text-sm text-gray-500">{driver.id}</p>
                            <p className="text-xs text-gray-400">
                              Joined {new Date(driver.join_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="text-gray-900">{driver.email}</p>
                          <p className="text-gray-500">{driver.phone}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">
                            {driver.vehicle.make} {driver.vehicle.model}
                          </p>
                          <p className="text-gray-500">{driver.vehicle.license_plate}</p>
                          <p className="text-xs text-gray-400">{driver.vehicle.year}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center mb-1">
                          <Star className="w-4 h-4 text-yellow-400 mr-1" />
                          <span className="text-sm font-medium">{driver.rating}</span>
                        </div>
                        <p className="text-xs text-gray-500">{driver.total_rides} rides</p>
                        <p className="text-xs text-gray-500">{driver.completion_rate}% completion</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(driver.status)}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {driver.status.toUpperCase()}
                        </span>
                        {driver.location && (
                          <p className="text-xs text-gray-500 mt-1 truncate max-w-xs">
                            📍 {driver.location.address}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">
                            {formatCurrency(driver.earnings.total)}
                          </p>
                          <p className="text-gray-500">
                            {formatCurrency(driver.earnings.this_month)} this month
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedDriver(driver);
                              setShowModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => window.open(`tel:${driver.phone}`)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Phone className="w-4 h-4" />
                          </button>
                          <button className="text-purple-600 hover:text-purple-900">
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          {driver.status !== 'suspended' ? (
                            <button
                              onClick={() => handleDriverStatusChange(driver.id, 'suspended')}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleDriverStatusChange(driver.id, 'offline')}
                              className="text-green-600 hover:text-green-900"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && drivers.length === 0 && (
          <div className="p-8 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No drivers found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Driver Details Modal */}
      {showModal && selectedDriver && (
        <DriverModal
          driver={selectedDriver}
          onClose={() => {
            setShowModal(false);
            setSelectedDriver(null);
          }}
        />
      )}
    </div>
  );
};

export default DriverManagement;