import React, { useState, useContext } from 'react';
import { 
  User, 
  Edit, 
  Star, 
  Award, 
  Shield, 
  Phone,
  Mail,
  MapPin,
  Calendar,
  TrendingUp,
  Settings,
  LogOut,
  Camera,
  Bell,
  HelpCircle,
  FileText,
  ChevronRight
} from 'lucide-react';
import { DriverContext } from '../utils/DriverContext';

const ProfileScreen = ({ onLogout }) => {
  const { driver, updateDriver } = useContext(DriverContext);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: driver?.name || '',
    email: driver?.email || '',
    phone: driver?.phone || '',
    city: driver?.city || ''
  });

  const achievements = [
    { id: 1, title: '5-Star Driver', description: 'Maintained 5-star rating for 30 days', icon: '⭐', earned: true },
    { id: 2, title: 'Safe Driver', description: 'No incidents for 6 months', icon: '🛡️', earned: true },
    { id: 3, title: 'Top Earner', description: 'Top 10% earnings this month', icon: '💰', earned: true },
    { id: 4, title: 'Speed Demon', description: 'Complete 100 rides in a week', icon: '⚡', earned: false },
    { id: 5, title: 'Customer Favorite', description: '50 five-star reviews', icon: '❤️', earned: false },
    { id: 6, title: 'Night Owl', description: 'Complete 20 night rides', icon: '🌙', earned: true }
  ];

  const menuItems = [
    {
      section: 'Account',
      items: [
        { id: 'edit-profile', name: 'Edit Profile', icon: Edit, action: () => setIsEditing(true) },
        { id: 'phone', name: 'Change Phone Number', icon: Phone, action: () => {} },
        { id: 'password', name: 'Change Password', icon: Shield, action: () => {} }
      ]
    },
    {
      section: 'App Settings',
      items: [
        { id: 'notifications', name: 'Notifications', icon: Bell, action: () => {} },
        { id: 'settings', name: 'App Preferences', icon: Settings, action: () => {} }
      ]
    },
    {
      section: 'Support',
      items: [
        { id: 'help', name: 'Help & Support', icon: HelpCircle, action: () => {} },
        { id: 'documents', name: 'Legal Documents', icon: FileText, action: () => {} }
      ]
    }
  ];

  const handleSaveProfile = () => {
    updateDriver(formData);
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4">
        <h1 className="text-xl font-bold text-gray-800">Profile</h1>
      </div>

      <div className="p-4 space-y-6">
        {/* Profile Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                {driver?.profileImage ? (
                  <img 
                    src={driver.profileImage} 
                    alt="Profile" 
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-blue-600" />
                )}
              </div>
              <button className="absolute bottom-0 right-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <Camera className="w-3 h-3 text-white" />
              </button>
            </div>
            
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-800">{driver?.name}</h2>
              <p className="text-gray-600">{driver?.phone}</p>
              <p className="text-sm text-gray-500">{driver?.email}</p>
              
              <div className="flex items-center space-x-4 mt-3">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium">{driver?.rating}</span>
                </div>
                <div className="text-sm text-gray-600">
                  {driver?.totalRides} rides
                </div>
                <div className="text-sm text-gray-600">
                  Since {new Date().getFullYear() - 2}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border text-center">
            <div className="text-2xl font-bold text-green-600">₨{driver?.earnings?.thisMonth?.toLocaleString() || '75,400'}</div>
            <div className="text-sm text-gray-600">This Month</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border text-center">
            <div className="text-2xl font-bold text-blue-600">{driver?.rating || '4.8'}★</div>
            <div className="text-sm text-gray-600">Rating</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border text-center">
            <div className="text-2xl font-bold text-purple-600">{driver?.totalRides || '1,247'}</div>
            <div className="text-sm text-gray-600">Total Rides</div>
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Achievements</h3>
            <Award className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {achievements.map(achievement => (
              <div 
                key={achievement.id}
                className={`p-3 rounded-lg text-center transition-colors ${
                  achievement.earned 
                    ? 'bg-yellow-50 border border-yellow-200' 
                    : 'bg-gray-50 border border-gray-200 opacity-60'
                }`}
              >
                <div className="text-2xl mb-1">{achievement.icon}</div>
                <div className="text-xs font-medium text-gray-800">{achievement.title}</div>
                <div className="text-xs text-gray-500 mt-1">{achievement.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Insights */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">This Month's Performance</h3>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Acceptance Rate</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{width: '94%'}}></div>
                </div>
                <span className="text-sm font-medium">94%</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Cancellation Rate</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{width: '3%'}}></div>
                </div>
                <span className="text-sm font-medium">3%</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Online Hours</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{width: '85%'}}></div>
                </div>
                <span className="text-sm font-medium">168h</span>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="space-y-6">
          {menuItems.map((section, index) => (
            <div key={index}>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">{section.section}</h3>
              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                {section.items.map((item, itemIndex) => (
                  <button
                    key={item.id}
                    onClick={item.action}
                    className={`w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors ${
                      itemIndex !== section.items.length - 1 ? 'border-b border-gray-100' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="w-5 h-5 text-gray-600" />
                      <span className="font-medium text-gray-800">{item.name}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Vehicle Info */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Vehicle Information</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Type:</span>
              <span className="font-medium">{driver?.vehicle?.type || 'Car'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Model:</span>
              <span className="font-medium">{driver?.vehicle?.model || 'Toyota Corolla'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Plate Number:</span>
              <span className="font-medium">{driver?.vehicle?.plateNumber || 'ABC-123'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Color:</span>
              <span className="font-medium">{driver?.vehicle?.color || 'White'}</span>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="mt-6">
          <button
            onClick={onLogout}
            className="w-full bg-red-50 text-red-600 p-4 rounded-xl font-medium hover:bg-red-100 transition-colors flex items-center justify-center space-x-2"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* App Version */}
        <div className="text-center mt-6 text-gray-500">
          <p className="text-sm">PakRide Driver App</p>
          <p className="text-xs">Version 1.0.0</p>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsEditing(false)}
          ></div>
          <div className="relative bg-white rounded-lg p-6 m-4 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Edit Profile</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileScreen;