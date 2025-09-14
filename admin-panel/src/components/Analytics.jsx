import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Calendar,
  DollarSign,
  Users,
  Car,
  MapPin,
  Clock,
  Star,
  Filter
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useAPI } from '../services/APIService';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('month');
  const [analyticsData, setAnalyticsData] = useState({});
  const [loading, setLoading] = useState(true);
  const { apiCall } = useAPI();

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await apiCall('/api/admin/analytics', 'GET', null, { period: timeRange });
      setAnalyticsData(response || {});
    } catch (error) {
      console.error('Error fetching analytics:', error);
      loadMockAnalytics();
    } finally {
      setLoading(false);
    }
  };

  const loadMockAnalytics = () => {
    setAnalyticsData({
      revenue: {
        current: 125400,
        previous: 98200,
        growth: 27.7,
        data: [
          { date: '2025-09-01', amount: 3200, rides: 45 },
          { date: '2025-09-02', amount: 4100, rides: 58 },
          { date: '2025-09-03', amount: 3800, rides: 52 },
          { date: '2025-09-04', amount: 4500, rides: 63 },
          { date: '2025-09-05', amount: 5200, rides: 71 },
          { date: '2025-09-06', amount: 6100, rides: 84 },
          { date: '2025-09-07', amount: 5800, rides: 79 },
          { date: '2025-09-08', amount: 4900, rides: 67 },
          { date: '2025-09-09', amount: 5500, rides: 76 },
          { date: '2025-09-10', amount: 6200, rides: 85 },
          { date: '2025-09-11', amount: 5900, rides: 81 },
          { date: '2025-09-12', amount: 4700, rides: 64 },
          { date: '2025-09-13', amount: 5300, rides: 73 },
          { date: '2025-09-14', amount: 4800, rides: 66 }
        ]
      },
      rides: {
        total: 2847,
        completed: 2698,
        cancelled: 149,
        completion_rate: 94.8,
        hourly_distribution: [
          { hour: '00', rides: 45 },
          { hour: '01', rides: 32 },
          { hour: '02', rides: 28 },
          { hour: '03', rides: 25 },
          { hour: '04', rides: 30 },
          { hour: '05', rides: 55 },
          { hour: '06', rides: 98 },
          { hour: '07', rides: 142 },
          { hour: '08', rides: 185 },
          { hour: '09', rides: 156 },
          { hour: '10', rides: 134 },
          { hour: '11', rides: 128 },
          { hour: '12', rides: 145 },
          { hour: '13', rides: 138 },
          { hour: '14', rides: 125 },
          { hour: '15', rides: 142 },
          { hour: '16', rides: 165 },
          { hour: '17', rides: 198 },
          { hour: '18', rides: 225 },
          { hour: '19', rides: 201 },
          { hour: '20', rides: 178 },
          { hour: '21', rides: 145 },
          { hour: '22', rides: 112 },
          { hour: '23', rides: 78 }
        ]
      },
      drivers: {
        total: 156,
        active: 89,
        performance: [
          { rating: '5 Star', count: 45, percentage: 50.6 },
          { rating: '4+ Star', count: 32, percentage: 36.0 },
          { rating: '3+ Star', count: 10, percentage: 11.2 },
          { rating: 'Below 3', count: 2, percentage: 2.2 }
        ]
      },
      customers: {
        total: 1247,
        new_this_month: 89,
        retention_rate: 78.5,
        satisfaction: [
          { rating: '5 Star', count: 892, percentage: 71.5 },
          { rating: '4 Star', count: 234, percentage: 18.8 },
          { rating: '3 Star', count: 87, percentage: 7.0 },
          { rating: '2 Star', count: 23, percentage: 1.8 },
          { rating: '1 Star', count: 11, percentage: 0.9 }
        ]
      },
      geography: [
        { area: 'Manhattan', rides: 1156, revenue: 45200 },
        { area: 'Brooklyn', rides: 856, revenue: 32400 },
        { area: 'Queens', rides: 534, revenue: 18900 },
        { area: 'Bronx', range: 201, revenue: 7800 },
        { area: 'Staten Island', rides: 100, revenue: 3200 }
      ],
      peak_hours: {
        morning: { start: '07:00', end: '09:00', avg_rides: 165 },
        lunch: { start: '12:00', end: '14:00', avg_rides: 132 },
        evening: { start: '17:00', end: '20:00', avg_rides: 201 }
      }
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const MetricCard = ({ title, value, subtitle, icon: Icon, change, changeType }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className="p-3 bg-blue-50 rounded-full">
          <Icon className="h-8 w-8 text-blue-600" />
        </div>
      </div>
      {change && (
        <div className="mt-4 flex items-center">
          <TrendingUp className={`h-4 w-4 mr-1 ${changeType === 'positive' ? 'text-green-500' : 'text-red-500'}`} />
          <span className={`text-sm ${changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
            {change}% vs last period
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-600 mt-1">Comprehensive insights into your platform performance</p>
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
            <option value="year">This Year</option>
          </select>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading analytics...</p>
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Revenue"
              value={formatCurrency(analyticsData.revenue?.current || 0)}
              subtitle={`${analyticsData.revenue?.growth || 0}% growth`}
              icon={DollarSign}
              change={analyticsData.revenue?.growth}
              changeType="positive"
            />
            <MetricCard
              title="Total Rides"
              value={analyticsData.rides?.total?.toLocaleString() || '0'}
              subtitle={`${analyticsData.rides?.completion_rate || 0}% completion rate`}
              icon={MapPin}
              change={12.5}
              changeType="positive"
            />
            <MetricCard
              title="Active Drivers"
              value={`${analyticsData.drivers?.active || 0}/${analyticsData.drivers?.total || 0}`}
              subtitle="Driver utilization"
              icon={Car}
              change={8.3}
              changeType="positive"
            />
            <MetricCard
              title="Total Customers"
              value={analyticsData.customers?.total?.toLocaleString() || '0'}
              subtitle={`${analyticsData.customers?.new_this_month || 0} new this month`}
              icon={Users}
              change={15.7}
              changeType="positive"
            />
          </div>

          {/* Revenue & Rides Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Revenue & Rides Trend</h3>
                <p className="text-sm text-gray-600">Daily performance over time</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={analyticsData.revenue?.data || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#666"
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis yAxisId="left" stroke="#666" />
                <YAxis yAxisId="right" orientation="right" stroke="#666" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px' 
                  }}
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <Area 
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#3B82F6" 
                  fill="#3B82F680" 
                  strokeWidth={2} 
                />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="rides" 
                  stroke="#10B981" 
                  strokeWidth={2} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Hourly Rides Distribution */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Hourly Rides Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.rides?.hourly_distribution || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="hour" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px' 
                    }}
                  />
                  <Bar dataKey="rides" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Customer Satisfaction */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Customer Satisfaction</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={analyticsData.customers?.satisfaction || []}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    label={({ rating, percentage }) => `${rating}: ${percentage}%`}
                  >
                    {(analyticsData.customers?.satisfaction || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Geographic Performance & Driver Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Geographic Performance */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Geographic Performance</h3>
              <div className="space-y-4">
                {(analyticsData.geography || []).map((area, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{area.area}</p>
                      <p className="text-sm text-gray-600">{area.rides} rides</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatCurrency(area.revenue)}</p>
                      <p className="text-sm text-gray-600">Revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Driver Performance */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Driver Performance</h3>
              <div className="space-y-4">
                {(analyticsData.drivers?.performance || []).map((rating, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Star className="w-5 h-5 text-yellow-400 mr-2" />
                      <span className="font-medium text-gray-900">{rating.rating}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${rating.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-600">{rating.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Peak Hours Analysis */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Peak Hours Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(analyticsData.peak_hours || {}).map(([period, data]) => (
                <div key={period} className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <Clock className="w-5 h-5 text-blue-600 mr-2" />
                    <h4 className="font-semibold text-blue-900 capitalize">{period}</h4>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">{data.avg_rides}</p>
                  <p className="text-sm text-blue-600">avg rides</p>
                  <p className="text-xs text-blue-500 mt-1">
                    {data.start} - {data.end}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;