export const vehicleTypes = {
  ride: [
    { 
      id: 'bike', 
      name: 'Bike', 
      icon: '🏍️', 
      price: '₨50-80', 
      time: '5-10 min', 
      seats: 1,
      description: 'Quick and economical'
    },
    { 
      id: 'rickshaw', 
      name: 'Rickshaw', 
      icon: '🛺', 
      price: '₨80-120', 
      time: '8-15 min', 
      seats: 3,
      description: 'Traditional local transport'
    },
    { 
      id: 'car', 
      name: 'Car', 
      icon: '🚗', 
      price: '₨150-250', 
      time: '10-20 min', 
      seats: 4,
      description: 'Comfortable AC ride'
    },
    { 
      id: 'suv', 
      name: 'SUV', 
      icon: '🚙', 
      price: '₨300-450', 
      time: '12-25 min', 
      seats: 6,
      description: 'Spacious family vehicle'
    }
  ],
  
  intercity: [
    { 
      id: 'sedan', 
      name: 'Sedan', 
      icon: '🚗', 
      price: '₨15/km', 
      time: 'Variable', 
      seats: 4,
      description: 'Comfortable long distance'
    },
    { 
      id: 'suv', 
      name: 'SUV', 
      icon: '🚙', 
      price: '₨25/km', 
      time: 'Variable', 
      seats: 6,
      description: 'Premium family travel'
    },
    { 
      id: 'van', 
      name: 'Van', 
      icon: '🚐', 
      price: '₨30/km', 
      time: 'Variable', 
      seats: 8,
      description: 'Group travel solution'
    },
    { 
      id: 'bus', 
      name: 'Mini Bus', 
      icon: '🚌', 
      price: '₨40/km', 
      time: 'Variable', 
      seats: 15,
      description: 'Large group transport'
    }
  ],
  
  cargo: [
    { 
      id: 'pickup', 
      name: 'Pickup', 
      icon: '🛻', 
      price: '₨200-400', 
      time: '15-30 min', 
      capacity: '500kg',
      description: 'Small to medium packages'
    },
    { 
      id: 'van', 
      name: 'Cargo Van', 
      icon: '🚐', 
      price: '₨400-600', 
      time: '20-40 min', 
      capacity: '1000kg',
      description: 'Large packages & furniture'
    },
    { 
      id: 'truck', 
      name: 'Truck', 
      icon: '🚚', 
      price: '₨800-1200', 
      time: '30-60 min', 
      capacity: '3000kg',
      description: 'Heavy cargo & bulk items'
    },
    { 
      id: 'mini-truck', 
      name: 'Mini Truck', 
      icon: '🚛', 
      price: '₨600-900', 
      time: '25-45 min', 
      capacity: '2000kg',
      description: 'Medium cargo transport'
    }
  ],
  
  rental: [
    { 
      id: 'car-day', 
      name: 'Car (Daily)', 
      icon: '🚗', 
      price: '₨3000-5000/day', 
      time: '24 hours', 
      seats: 4,
      description: 'Self-drive or with driver'
    },
    { 
      id: 'suv-day', 
      name: 'SUV (Daily)', 
      icon: '🚙', 
      price: '₨6000-8000/day', 
      time: '24 hours', 
      seats: 6,
      description: 'Premium daily rental'
    },
    { 
      id: 'van-day', 
      name: 'Van (Daily)', 
      icon: '🚐', 
      price: '₨8000-12000/day', 
      time: '24 hours', 
      seats: 8,
      description: 'Group rental solution'
    },
    { 
      id: 'luxury-day', 
      name: 'Luxury Car', 
      icon: '🏎️', 
      price: '₨15000-25000/day', 
      time: '24 hours', 
      seats: 4,
      description: 'Premium luxury experience'
    }
  ]
};

export const getVehiclesByType = (type) => {
  return vehicleTypes[type] || [];
};

export const getVehicleById = (type, id) => {
  const vehicles = vehicleTypes[type] || [];
  return vehicles.find(vehicle => vehicle.id === id);
};

export const calculateEstimatedFare = (serviceType, vehicleId, distance = 10, duration = 1) => {
  const vehicle = getVehicleById(serviceType, vehicleId);
  if (!vehicle) return 0;

  let baseFare = parseInt(vehicle.price.replace(/[^\d]/g, ''));
  
  switch (serviceType) {
    case 'intercity':
      return baseFare * distance; // Per km pricing
    case 'rental':
      return baseFare * duration; // Per day pricing
    case 'cargo':
      return baseFare; // Base pricing + weight charges
    default:
      return baseFare; // City ride base pricing
  }
};