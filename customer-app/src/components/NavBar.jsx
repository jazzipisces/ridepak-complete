import React, { useContext, useState } from 'react';
import { MapPin, Menu, User } from 'lucide-react';
import { LocationContext } from '../utils/LocationContext';

const NavBar = ({ user }) => {
  const { currentLocation, setCurrentLocation } = useContext(LocationContext);
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="bg-green-600 text-white p-4 shadow-lg relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 hover:bg-green-700 rounded"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold">PakRide</h1>
            <p className="text-xs text-green-100">Your ride, your way</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5" />
            <span className="text-sm font-medium">{currentLocation}</span>
          </div>
          
          <div className="w-8 h-8 bg-green-700 rounded-full flex items-center justify-center">
            {user?.profileImage ? (
              <img 
                src={user.profileImage} 
                alt="Profile" 
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <User className="w-4 h-4" />
            )}
          </div>
        </div>
      </div>

      {/* Slide-out Menu */}
      {showMenu && (
        <div className="fixed inset-0 z-50">
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowMenu(false)}
          ></div>
          <div className="absolute left-0 top-0 bottom-0 w-80 bg-white shadow-lg">
            <div className="bg-green-600 text-white p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-700 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold">{user?.name || 'Guest User'}</h3>
                  <p className="text-sm text-green-100">{user?.phone}</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 space-y-2">
              {[
                'Emergency Contacts',
                'Ride History',
                'Payment Methods',
                'Promotions',
                'Referral Program',
                'Help & Support',
                'Settings',
                'Rate App',
                'About PakRide'
              ].map(item => (
                <button 
                  key={item}
                  className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors"
                  onClick={() => setShowMenu(false)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavBar;