import React, { useState } from 'react';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Edit, 
  Settings, 
  HelpCircle, 
  Shield,
  Bell,
  Star,
  Heart,
  Share2,
  LogOut,
  ChevronRight,
  Camera
} from 'lucide-react';
import NavBar from './NavBar';

const ProfilePage = ({ user, setUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    emergencyContact: user?.emergencyContact || ''
  });

  const menuItems = [
    {
      section: 'Account',
      items: [
        { id: 'edit-profile', name: 'Edit Profile', icon: Edit, action: () => setIsEditing(true) },
        { id: 'emergency', name: 'Emergency Contacts', icon: Phone, action: () => {} },
        { id: 'addresses', name: 'Saved Addresses', icon: MapPin, action: () => {} }
      ]
    },
    {
      section: 'Preferences',
      items: [
        { id: 'notifications', name: 'Notifications', icon: Bell, action: () => {} },
        { id: 'privacy', name: 'Privacy & Security', icon: Shield, action: () => {} },
        { id: 'settings', name: 'App Settings', icon: Settings, action: () => {} }
      ]
    },
    {
      section: 'Support',
      items: [
        { id: 'help', name: 'Help & Support', icon: HelpCircle, action: () => {} },
        { id: 'rate', name: 'Rate PakRide', icon: Star, action: () => {} },
        { id: 'share', name: 'Share App', icon: Share2, action: () => {} }
      ]
    },
    {
      section: 'Legal',
      items: [
        { id: 'terms', name: 'Terms & Conditions', icon: Shield, action: () => {} },
        { id: 'privacy-policy', name: 'Privacy Policy', icon: Shield, action: () => {} }
      ]
    }
  ];

  const handleSaveProfile = () => {
    if (setUser) {
      setUser(prev => ({
        ...prev,
        ...formData
      }));
    }
    setIsEditing(false);
  };

  const handleLogout = () => {
    // Handle logout logic
    alert('Logout functionality would be implemented here');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <NavBar user={user} />
      
      <div className="p-4">
        {/* Profile Header */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                {user?.profileImage ? (
                  <img 
                    src={user.profileImage} 
                    alt="Profile" 
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-green-600" />
                )}
              </div>
              <button className="absolute bottom-0 right-0 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                <Camera className="w-3 h-3 text-white" />
              </button>
            </div>
            
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-800">{user?.name || 'User Name'}</h2>
              <p className="text-gray-600">{user?.phone || '+92 300 1234567'}</p>
              <p className="text-sm text-gray-500">{user?.email || 'user@example.com'}</p>
              
              <div className="flex items-center space-x-4 mt-3">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium">{user?.rating || '4.8'}</span>
                </div>
                <div className="text-sm text-gray-600">
                  {user?.totalRides || 247} rides
                </div>
                <div className="text-sm text-gray-600">
                  Member since 2023
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
            <div className="text-2xl font-bold text-green-600">₨{user?.totalSaved || '2,340'}</div>
            <div className="text-sm text-gray-600">Money Saved</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
            <div className="text-2xl font-bold text-blue-600">{user?.totalDistance || '1,250'}</div>
            <div className="text-sm text-gray-600">KM Traveled</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
            <div className="text-2xl font-bold text-orange-600">{user?.co2Saved || '45'}</div>
            <div className="text-sm text-gray-600">KG CO₂ Saved</div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="space-y-6">
          {menuItems.map((section, index) => (
            <div key={index}>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">{section.section}</h3>
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
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

        {/* Logout Button */}
        <div className="mt-6">
          <button
            onClick={handleLogout}
            className="w-full bg-red-50 text-red-600 p-4 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center justify-center space-x-2"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* App Version */}
        <div className="text-center mt-6 text-gray-500">
          <p className="text-sm">PakRide Customer App</p>
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
          <div className="relative bg-white rounded-lg p-6 m-4 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Edit Profile</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emergency Contact
                </label>
                <input
                  type="tel"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                  placeholder="+92 300 0000000"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="flex-1 py-3 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
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

export default ProfilePage;