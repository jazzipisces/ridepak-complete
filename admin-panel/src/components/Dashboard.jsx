import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Car, 
  MapPin, 
  DollarSign, 
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle,
  Eye,
  Filter,
  Calendar,
  Download
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { useAPI } from '../services/APIService';
import { useSocket } from '../services/SocketService';

const Dashboard = () => {
  const [stats, setStats] = useState({});
  const [recentRides, setRecentRides] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [rideStatusData, setRideStatusData] = useState([]);
  const [driverActivity, setDriverActivity] = useState([]);
  const [timeRange, setTimeRange] = useState('today');
  const { apiCall } = useAPI();
  const socket = useSocket();

  // Real-time updates via socket
  useEffect(() => {
    if (socket) {
      socket.on('stats_update', (data) => {
        setStats(prevStats => ({ ...prevStats, ...data }));
      });

      socket.on('new_ride', (ride) => {
        setRecentRides(prev => [ride, ...prev.slice(0, 9)]);
      });

      socket.on('ride_status_update', (updatedRide) => {
        setRecentRides(prev => 
          prev.map(ride => ride.id === updatedRide.id ? updatedRide : ride)
        );
      });

      return () => {
        socket.off('stats_update');
        socket.off('new_ride');
        socket.off('ride_status_update');
      };
    }
  }, [socket]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch main statistics
        const statsResponse = await apiCall('/api/admin/stats', 'GET');
        setStats(statsResponse);

        // Fetch recent rides
        const ridesResponse = await apiCall('/api/admin/rides/recent', 'GET');
        setRecentRides(ridesResponse);

        // Fetch revenue data for chart
        const revenueResponse = await apiCall(`/api/admin/analytics/revenue?range=${timeRange}`, 'GET');
        setRevenueData(revenueResponse);

        // Fetch ride status distribution
        const statusResponse = await apiCall('/api/admin/analytics/ride-status', 'GET');
        setRideStatusData(statusResponse);

        // Fetch driver activity
        const driverResponse = await apiCall('/api/admin/analytics/driver-activity', 'GET');
        setDriverActivity(driverResponse);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Fallback to mock data
        loadMockData();
      }
    };

    fetchDashboardData();
  }, [timeRange]);

  const loadMockData = () => {
    setStats({
      totalRides: 1247,
      totalDrivers: 89,
      totalCustomers: 156,
      totalRevenue: 18650.75,
      activeRides: 23,
      onlineDrivers: 45,
      completionRate: 94.2,
      averageRating: 4.6,
      dailyGrowth: 12.5,
      weeklyGrowth: 8.3,
      monthlyRevenue: 125400,
      averageRideTime: 18.5,
      peakHours: '5-7 PM',
      cancelRate: 5.8
    });

    setRecentRides([
      {
        id: 'R001',
        customer: 'John Doe',
        driver: 'Mike Wilson',
        pickup: '123 Main St',
        destination: '456 Oak Ave',
        status: 'completed',
        fare: 25.50,
        distance: '5.2 km',
        duration: '18 min',
        timestamp: '2025-09-14 14:30',
        rating: 4.8
      },
      {
        id: 'R002',
        customer: 'Sarah Johnson',
        driver: 'David Brown',
        pickup: '789 Pine Rd',
        destination: '321 Elm St',
        status: 'in-progress',
        fare: 18.75,
        distance: '3.8 km',
        duration: '12 min',
        timestamp: '2025-09-14 15:45',
        rating: null
      },
      {
        id: 'R003',
        customer: 'Alex Chen',
        driver: 'Robert Taylor',
        pickup: '555 Cedar Blvd',
        destination: '777 Birch Way',
        status: 'cancelled',
        fare: 0,
        distance: '2.1 km',
        duration: '0 min',
        timestamp: '2025-09-14 16:20',
        rating: null
      }
    ]);

    setRevenueData([
      { time: '00:00', revenue: 1200, rides: 15 },
      { time: '04:00', revenue: 800, rides: 8 },
      { time: '08:00', revenue: 2400, rides: 28 },
      { time: '12:00', revenue: 3200, rides: 35 },
      { time: '16:00', revenue: 2800, rides: 32 },
      { time: '20:00', revenue: 3800, rides: 42 },
      { time: '24:00', revenue: 2200, rides: 25 }
    ]);

    setRideStatusData([
      { name: 'Completed', value: 85, color: '#10B981' },
      { name: 'In Progress', value: 8, color: '#3B82F6' },
      { name: 'Cancelled', value: 7, color: '#EF4444' }
    ]);

    setDriverActivity([
      { name: 'Mon', online: 65, busy: 23, offline: 12 },
      { name: 'Tue', online: 68, busy: 25, offline: 15 },
      { name: 'Wed', online: 72, busy: 28, offline: 10 },
      { name: 'Thu', online: 70, busy: 30, offline: 8 },
      { name: 'Fri', online: 75, busy: 32, offline: 12 },
      { name: 'Sat', online: 80, busy: 35, offline: 5 },
      { name: 'Sun', online: 78, busy: 33, offline: 7 }
    ]);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in-progress': return 'text-blue-600 bg-blue-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const StatCard = ({ title, value, icon: Icon, change, changeType, subtitle, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-3xl font-bold mt-2 ${color || 'text-gray-900'}`}>{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full ${color ? color.replace('text-', 'bg-').replace('900', '100') : 'bg-gray-100'}`}>
          <Icon className={`h-8 w-8 ${color || 'text-gray-600'}`} />
        </div>
      </div>
      {change && (
        <div className="mt-4 flex items-center">
          {changeType === 'increase' ? (
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
          )}
          <span className={`text-sm ${changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
            {change}%
          </span>
          <span className="text-sm text-gray-500 ml-1">vs last period</span>
        </div>
      )}
    </div>
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your ride-hailing platform.</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
          </select>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Rides Today"
          value={stats.totalRides?.toLocaleString() || '0'}
          icon={MapPin}
          change={stats.dailyGrowth}
          changeType="increase"
          subtitle={`${stats.activeRides || 0} active rides`}
          color="text-blue-600"
        />
        <StatCard
          title="Online Drivers"
          value={`${stats.onlineDrivers || 0}/${stats.totalDrivers || 0}`}
          icon={Car}
          change={stats.weeklyGrowth}
          changeType="increase"
          subtitle={`${stats.totalDrivers || 0} total drivers`}
          color="text-green-600"
        />
        <StatCard
          title="Revenue Today"
          value={formatCurrency(stats.totalRevenue || 0)}
          icon={DollarSign}
          change={15.2}
          changeType="increase"
          subtitle={formatCurrency(stats.monthlyRevenue || 0) + ' this month'}
          color="text-yellow-600"
        />
        <StatCard
          title="Customer Satisfaction"
          value={`${stats.averageRating || '0'}/5`}
          icon={Activity}
          change={2.1}
          changeType="increase"
          subtitle={`${stats.completionRate || 0}% completion rate`}
          color="text-purple-600"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Revenue & Rides Trend</h3>
              <p className="text-sm text-gray-600">Today's performance overview</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Revenue</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Rides</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="time" stroke="#666" />
              <YAxis yAxisId="left" stroke="#666" />
              <YAxis yAxisId="right" orientation="right" stroke="#666" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#3B82F6" fill="#3B82F680" strokeWidth={2} />
              <Line yAxisId="right" type="monotone" dataKey="rides" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Ride Status Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Ride Status Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={rideStatusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {rideStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {rideStatusData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
                <span className="text-sm font-medium">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Driver Activity & Recent Rides */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Driver Activity Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Driver Activity</h3>
              <p className="text-sm text-gray-600">Weekly driver status overview</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={driverActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px' 
                }}
              />
              <Bar dataKey="online" stackId="a" fill="#10B981" />
              <Bar dataKey="busy" stackId="a" fill="#F59E0B" />
              <Bar dataKey="offline" stackId="a" fill="#EF4444" />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex justify-center mt-4 space-x-6">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Online</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Busy</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Offline</span>
            </div>
          </div>
        </div>

        {/* Recent Rides */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Rides</h3>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All
            </button>
          </div>
          <div className="space-y-4 max-h-80 overflow-y-auto custom-scrollbar">
            {recentRides.map((ride) => (
              <div key={ride.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{ride.id}</p>
                    <p className="text-sm text-gray-600">{ride.customer}</p>
                    <p className="text-xs text-gray-500">{ride.timestamp}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ride.status)}`}>
                    {ride.status}
                  </span>
                  <p className="text-sm font-medium mt-1">{formatCurrency(ride.fare)}</p>
                  {ride.rating && (
                    <div className="flex items-center mt-1">
                      <span className="text-yellow-400 text-xs">★</span>
                      <span className="text-xs text-gray-500 ml-1">{ride.rating}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Alerts */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Alerts & Notifications</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center p-4 bg-green-50 rounded-lg">
            <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <p className="font-medium text-green-800">All Systems Operational</p>
              <p className="text-sm text-green-600">Payment gateway and APIs running smoothly</p>
            </div>
          </div>
          <div className="flex items-center p-4 bg-yellow-50 rounded-lg">
            <Clock className="h-8 w-8 text-yellow-500 mr-3" />
            <div>
              <p className="font-medium text-yellow-800">Peak Hours Active</p>
              <p className="text-sm text-yellow-600">High demand period: {stats.peakHours || '5-7 PM'}</p>
            </div>
          </div>
          <div className="flex items-center p-4 bg-blue-50 rounded-lg">
            <Activity className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p className="font-medium text-blue-800">Driver Performance</p>
              <p className="text-sm text-blue-600">Average response time: {stats.averageRideTime || 18.5} min</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;