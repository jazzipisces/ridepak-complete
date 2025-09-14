import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Power, 
  MapPin, 
  DollarSign, 
  Clock, 
  Star, 
  Navigation,
  Bell,
  Battery,
  Wifi,
  Signal,
  Menu,
  Target,
  TrendingUp,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { DriverContext } from '../utils/DriverContext';
import { RideContext } from '../utils/RideContext';
import { SocketContext } from '../utils/SocketContext';

const DashboardScreen = () => {
  const navigate = useNavigate();
  const { driver, updateDriverStatus } = useContext(DriverContext);
  const { activeRide, pendingRequests } = useContext(RideContext);
  const { isConnected } = useContext(SocketContext);
  
  const [isOnline, setIsOnline] = useState(driver?.status === 'online');
  const [currentLocation, setCurrentLocation] = useState('Getting location...');
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [todayStats, setTodayStats] = useState({
    rides: 12,
    earnings: 2850,
    hours: 6.5,
    rating: 4.9
  });
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'bonus',
      title: 'Bonus Hour Active!',
      message: 'Earn 1.5x more until 6 PM',
      time: '2 min ago'
    },
    {
      id: 2,
      type: 'achievement',
      title: 'Great Job!',
      message: '50 rides completed this week',
      time: '1 hour ago'
    }
  ]);

  useEffect(() => {
    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        // In real app, you'd reverse geocode these coordinates
        setCurrentLocation('Islamabad, Pakistan');
      });
    }

    // Update battery level
    if ('getBattery' in navigator) {
      navigator.getBattery().then((battery) => {
        setBatteryLevel(Math.floor(battery.level * 100));
      });
    }
  }, []);

  const handleStatusToggle = async () => {
    const newStatus = isOnline ? 'offline' : 'online';
    setIsOnline(!isOnline);
    await updateDriverStatus(newStatus);
    
    if (newStatus === 'online') {
      // Start listening for ride requests
      console.log('Driver is now online and available for rides');
    } else {
      console.log('Driver is now offline');
    }
  };

  const handleGoToLocation = () => {
    // Navigate to location/destination screen
    navigate('/navigation/current');
  };

  const StatusCard = () => (
    <div className={`p-6 rounded-xl ${isOnline ? 'bg-green-500' : 'bg-gray-400'} text-white shadow-lg`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold">
            {isOnline ? 'You\'re Online' : 'You\'re Offline'}
          </h2>
          <p className="text-sm opacity-90">
            {isOnline ? 'Ready to accept rides' : 'Go online to start earning'}
          </p>
        </div>
        <button
          onClick={handleStatusToggle}
          className={`w-16 h-16 rounded-full flex items-center justify-center ${
            isOnline ? 'bg-white text-green-500' : 'bg-white text-gray-400'
          } shadow-lg transition-all duration-300 transform hover:scale-105`}
        >
          <Power className="w-8 h-8" />
        </button>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">{currentLocation}</span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Battery className="w-4 h-4" />
            <span className="text-sm">{batteryLevel}%</span>
          </div>
          <div className="flex items-center space-x-1">
            {isConnected ? (
              <Wifi className="w-4 h-4 text-white" />
            ) : (
              <Signal className="w-4 h-4 text-red-200" />
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const TodayStatsCard = () => (
    <div className="bg-white p-6 rounded-xl shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Today's Summary</h3>
        <Calendar className="w-5 h-5 text-gray-400" />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{todayStats.rides}</div>
          <div className="text-sm text-gray-600">Rides</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">₨{todayStats.earnings.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Earnings</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{todayStats.hours}h</div>
          <div className="text-sm text-gray-600">Online</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1">
            <Star className="w-5 h-5 text-yellow-500 fill-current" />
            <span className="text-2xl font-bold text-yellow-600">{todayStats.rating}</span>
          </div>
          <div className="text-sm text-gray-600">Rating</div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Goal: ₨5,000</span>
          <span className="text-blue-600 font-medium">
            {Math.round((todayStats.earnings / 5000) * 100)}% completed
          </span>
        </div>
        <div className="mt-2 bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min((todayStats.earnings / 5000) * 100, 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );

  const QuickActionsCard = () => (
    <div className="bg-white p-6 rounded-xl shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
      
      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={() => navigate('/earnings')}
          className="p-4 bg-green-50 rounded-lg text-center hover:bg-green-100 transition-colors"
        >
          <DollarSign className="w-6 h-6 text-green-600 mx-auto mb-2" />
          <span className="text-sm font-medium text-green-700">View Earnings</span>
        </button>
        
        <button 
          onClick={handleGoToLocation}
          className="p-4 bg-blue-50 rounded-lg text-center hover:bg-blue-100 transition-colors"
        >
          <Navigation className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <span className="text-sm font-medium text-blue-700">Navigate</span>
        </button>
        
        <button 
          onClick={() => navigate('/vehicle')}
          className="p-4 bg-purple-50 rounded-lg text-center hover:bg-purple-100 transition-colors"
        >
          <Target className="w-6 h-6 text-purple-600 mx-auto mb-2" />
          <span className="text-sm font-medium text-purple-700">Vehicle Info</span>
        </button>
        
        <button 
          onClick={() => navigate('/profile')}
          className="p-4 bg-orange-50 rounded-lg text-center hover:bg-orange-100 transition-colors"
        >
          <TrendingUp className="w-6 h-6 text-orange-600 mx-auto mb-2" />
          <span className="text-sm font-medium text-orange-700">Performance</span>
        </button>
      </div>
    </div>
  );

  const NotificationsCard = () => (
    <div className="bg-white p-6 rounded-xl shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
        <Bell className="w-5 h-5 text-gray-400" />
      </div>
      
      <div className="space-y-3">
        {notifications.map(notification => (
          <div key={notification.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className={`w-2 h-2 rounded-full mt-2 ${
              notification.type === 'bonus' ? 'bg-green-500' : 'bg-blue-500'
            }`}></div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-800 text-sm">{notification.title}</h4>
              <p className="text-gray-600 text-xs mt-1">{notification.message}</p>
              <span className="text-gray-400 text-xs">{notification.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4 safe-area-inset-top">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Good {
                new Date().getHours() < 12 ? 'Morning' : 
                new Date().getHours() < 17 ? 'Afternoon' : 'Evening'
              }, {driver?.name?.split(' ')[0]}!</h1>
              <p className="text-sm text-gray-600">Ready to start earning?</p>
            </div>
          </div>
          
          <div className="relative">
            <button className="p-2 hover:bg-gray-100 rounded-lg relative">
              <Bell className="w-6 h-6 text-gray-600" />
              {notifications.length > 0 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Status Card */}
        <StatusCard />

        {/* Active Ride Alert */}
        {activeRide && (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <div>
                <h4 className="font-medium text-yellow-800">Active Ride in Progress</h4>
                <p className="text-sm text-yellow-700">
                  Pickup: {activeRide.pickup} → Drop: {activeRide.destination}
                </p>
              </div>
              <button 
                onClick={() => navigate(`/navigation/${activeRide.id}`)}
                className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Pending Ride Requests */}
        {pendingRequests.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-blue-800">New Ride Request</h4>
                <p className="text-sm text-blue-700">{pendingRequests.length} request(s) waiting</p>
              </div>
              <button 
                onClick={() => navigate(`/ride-request/${pendingRequests[0].id}`)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                View Request
              </button>
            </div>
          </div>
        )}

        {/* Today's Stats */}
        <TodayStatsCard />

        {/* Quick Actions */}
        <QuickActionsCard />

        {/* Notifications */}
        <NotificationsCard />

        {/* Tips for Better Earnings */}
        <div className="bg-gradient-to-r from-green-500 to-blue-500 p-6 rounded-xl text-white">
          <h3 className="text-lg font-semibold mb-2">💡 Earning Tips</h3>
          <div className="space-y-2 text-sm">
            <p>• Peak hours: 7-10 AM, 5-8 PM for higher fares</p>
            <p>• Complete 10 rides today for bonus rewards</p>
            <p>• Maintain 4.8+ rating for premium ride access</p>
          </div>
        </div>

        {/* Support */}
        <div className="text-center">
          <p className="text-gray-600 text-sm">
            Need help? <span className="text-blue-600 font-medium">Call Support: 0800-PAKRIDE</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardScreen;