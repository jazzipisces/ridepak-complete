import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MapPin, 
  Users, 
  Car, 
  BarChart3, 
  Settings, 
  Menu,
  ChevronLeft,
  Bell,
  Shield,
  DollarSign,
  FileText
} from 'lucide-react';

const Sidebar = ({ collapsed, onToggle }) => {
  const location = useLocation();

  const menuItems = [
    {
      path: '/dashboard',
      name: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      path: '/rides',
      name: 'Ride Management',
      icon: MapPin,
      badge: '23'
    },
    {
      path: '/drivers',
      name: 'Driver Management',
      icon: Car,
      badge: null
    },
    {
      path: '/customers',
      name: 'Customer Management',
      icon: Users,
      badge: null
    },
    {
      path: '/analytics',
      name: 'Analytics & Reports',
      icon: BarChart3,
      badge: null
    },
    {
      path: '/finance',
      name: 'Financial Management',
      icon: DollarSign,
      badge: null
    },
    {
      path: '/reports',
      name: 'Reports',
      icon: FileText,
      badge: null
    },
    {
      path: '/notifications',
      name: 'Notifications',
      icon: Bell,
      badge: '5'
    },
    {
      path: '/security',
      name: 'Security & Compliance',
      icon: Shield,
      badge: null
    },
    {
      path: '/settings',
      name: 'Settings',
      icon: Settings,
      badge: null
    }
  ];

  return (
    <div className={`fixed inset-y-0 left-0 z-50 bg-white shadow-lg sidebar-animation ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
        {!collapsed && (
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="ml-2 text-xl font-bold text-gray-800">RideAdmin</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {collapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="mt-6 px-3 custom-scrollbar overflow-y-auto h-full pb-20">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={`flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${collapsed ? 'mx-auto' : 'mr-3'} ${
                    isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'
                  }`} />
                  {!collapsed && (
                    <>
                      <span className="truncate">{item.name}</span>
                      {item.badge && (
                        <span className={`ml-auto px-2 py-1 text-xs rounded-full ${
                          isActive 
                            ? 'bg-white text-blue-600' 
                            : 'bg-red-100 text-red-600'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
                {collapsed && item.badge && (
                  <div className="absolute left-12 top-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {item.badge}
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        {/* System Status (when expanded) */}
        {!collapsed && (
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-3">System Status</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">API Status</span>
                <span className="flex items-center text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1 pulse-animation"></div>
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Active Rides</span>
                <span className="text-blue-600 font-medium">23</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Online Drivers</span>
                <span className="text-green-600 font-medium">45</span>
              </div>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Sidebar;