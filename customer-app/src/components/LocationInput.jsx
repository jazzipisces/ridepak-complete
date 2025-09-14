import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Search, Clock } from 'lucide-react';

const LocationInput = ({ 
  value, 
  onChange, 
  placeholder, 
  locations, 
  icon,
  showRecentLocations = true 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const inputRef = useRef(null);

  const recentLocations = [
    'Blue Area, Islamabad',
    'F-7 Markaz, Islamabad',
    'Centaurus Mall, Islamabad',
    'Pakistan Monument, Islamabad'
  ];

  useEffect(() => {
    if (value) {
      const filtered = locations.filter(location =>
        location.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5);
      setFilteredLocations(filtered);
    } else {
      setFilteredLocations([]);
    }
  }, [value, locations]);

  const handleInputChange = (e) => {
    onChange(e.target.value);
    setIsOpen(true);
  };

  const handleLocationSelect = (location) => {
    onChange(location);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleFocus = () => {
    setIsOpen(true);
  };

  const handleBlur = () => {
    // Delay closing to allow clicking on dropdown items
    setTimeout(() => setIsOpen(false), 200);
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="w-full p-4 pl-12 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white shadow-sm"
        />
        
        <div className="absolute left-4 top-4 flex items-center">
          {icon || <MapPin className="w-5 h-5 text-gray-400" />}
        </div>
        
        <div className="absolute right-4 top-4">
          <Search className="w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {value && filteredLocations.length > 0 && (
            <div>
              <div className="px-4 py-2 text-sm font-medium text-gray-700 border-b">
                Search Results
              </div>
              {filteredLocations.map((location, index) => (
                <button
                  key={index}
                  onClick={() => handleLocationSelect(location)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3"
                >
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-800">{location}</span>
                </button>
              ))}
            </div>
          )}

          {!value && showRecentLocations && (
            <div>
              <div className="px-4 py-2 text-sm font-medium text-gray-700 border-b">
                Recent Locations
              </div>
              {recentLocations.map((location, index) => (
                <button
                  key={index}
                  onClick={() => handleLocationSelect(location.split(',')[0])}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3"
                >
                  <Clock className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="text-gray-800">{location.split(',')[0]}</div>
                    <div className="text-sm text-gray-500">{location.split(',')[1]}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {((value && filteredLocations.length === 0) || (!value && !showRecentLocations)) && (
            <div className="px-4 py-8 text-center text-gray-500">
              <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>No locations found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationInput;