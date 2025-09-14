import React from 'react';
import { Car, Navigation, Package, Calendar } from 'lucide-react';

const ServiceTabs = ({ serviceType, setServiceType }) => {
  const services = [
    { 
      id: 'ride', 
      name: 'City Ride', 
      icon: Car,
      description: 'Quick rides in the city'
    },
    { 
      id: 'intercity', 
      name: 'City to City', 
      icon: Navigation,
      description: 'Travel between cities'
    },
    { 
      id: 'cargo', 
      name: 'Cargo', 
      icon: Package,
      description: 'Deliver packages'
    },
    { 
      id: 'rental', 
      name: 'Daily Rental', 
      icon: Calendar,
      description: '24-hour rentals'
    }
  ];

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="flex overflow-x-auto">
        {services.map(service => (
          <button
            key={service.id}
            onClick={() => setServiceType(service.id)}
            className={`flex-1 min-w-0 flex flex-col items-center justify-center py-4 px-3 ${
              serviceType === service.id 
                ? 'border-b-2 border-green-600 text-green-600 bg-green-50' 
                : 'text-gray-600 hover:text-green-600 hover:bg-gray-50'
            } transition-all duration-200`}
          >
            <service.icon className="w-6 h-6 mb-1" />
            <span className="text-sm font-medium text-center leading-tight">
              {service.name}
            </span>
            <span className="text-xs text-gray-500 mt-1 text-center">
              {service.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ServiceTabs;