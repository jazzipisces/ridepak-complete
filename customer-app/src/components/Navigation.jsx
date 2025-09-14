import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Car, Clock, CreditCard, User } from 'lucide-react';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { 
      id: 'home', 
      name: 'Home', 
      icon: Car, 
      path: '/' 
    },
    { 
      id: 'rides', 
      name: 'Rides', 
      icon: Clock, 
      path: '/rides' 
    },
    { 
      id: 'wallet', 
      name: 'Wallet', 
      icon: CreditCard, 
      path: '/wallet' 
    },
    { 
      id: 'profile', 
      name: 'Profile', 
      icon: User, 
      path: '/profile' 
    }
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname.startsWith('/booking');
    }
    return location.pathname === path;
  };

  // Don't show navigation on certain pages
  const hideNavigation = location.pathname.includes('/tracking') || 
                         location.pathname.includes('/booking');

  if (hideNavigation) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="flex">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            className={`flex-1 flex flex-col items-center py-3 px-2 transition-colors ${
              isActive(item.path) 
                ? 'text-green-600 bg-green-50' 
                : 'text-gray-400 hover:text-green-600'
            }`}
          >
            <item.icon className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">{item.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Navigation;