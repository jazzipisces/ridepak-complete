import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { 
  Navigation as NavigationIcon, 
  MapPin, 
  Clock, 
  Speedometer, 
  Volume2,
  VolumeX,
  Maximize,
  Phone,
  MessageCircle
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom marker icons
const createCustomIcon = (color, iconClass) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          color: white;
          font-weight: bold;
          font-size: 12px;
        ">${iconClass}</div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

// Map controller to handle updates
const MapController = ({ center, zoom, route }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || map.getZoom());
    }
  }, [center, zoom, map]);

  useEffect(() => {
    if (route && route.length > 0) {
      const bounds = L.latLngBounds(route);
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [route, map]);

  return null;
};

const Navigation = ({ 
  currentLocation,
  destination,
  rideData,
  isNavigating = false,
  onStartNavigation,
  onEndNavigation,
  onLocationUpdate
}) => {
  const [route, setRoute] = useState([]);
  const [directions, setDirections] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapCenter, setMapCenter] = useState(currentLocation);
  const [navigationData, setNavigationData] = useState({
    distance: 0,
    duration: 0,
    speed: 0,
    nextTurn: null,
  });

  const mapRef = useRef();
  const speechSynthesis = useRef(window.speechSynthesis);

  // Update map center when current location changes
  useEffect(() => {
    if (currentLocation) {
      setMapCenter([currentLocation.latitude, currentLocation.longitude]);
    }
  }, [currentLocation]);

  // Get route from API
  useEffect(() => {
    if (currentLocation && destination && isNavigating) {
      fetchRoute();
    }
  }, [currentLocation, destination, isNavigating]);

  const fetchRoute = async () => {
    try {
      // Mock route data - in production, use actual routing service
      const mockRoute = [
        [currentLocation.latitude, currentLocation.longitude],
        [destination.latitude, destination.longitude]
      ];
      
      const mockDirections = [
        {
          instruction: 'Head north on Main Street',
          distance: 0.5,
          duration: 2,
          maneuver: 'straight'
        },
        {
          instruction: 'Turn right onto Oak Avenue',
          distance: 1.2,
          duration: 4,
          maneuver: 'turn-right'
        },
        {
          instruction: 'Continue straight for 2.3 km',
          distance: 2.3,
          duration: 6,
          maneuver: 'straight'
        },
        {
          instruction: 'Arrive at destination',
          distance: 0,
          duration: 0,
          maneuver: 'arrive'
        }
      ];

      setRoute(mockRoute);
      setDirections(mockDirections);
      setCurrentStep(0);
      
      // Calculate total distance and time
      const totalDistance = mockDirections.reduce((sum, step) => sum + step.distance, 0);
      const totalDuration = mockDirections.reduce((sum, step) => sum + step.duration, 0);
      
      setNavigationData(prev => ({
        ...prev,
        distance: totalDistance,
        duration: totalDuration
      }));

      // Speak first instruction
      if (!isMuted) {
        speakInstruction(mockDirections[0].instruction);
      }

    } catch (error) {
      console.error('Error fetching route:', error);
    }
  };

  const speakInstruction = (instruction) => {
    if (speechSynthesis.current && !isMuted) {
      speechSynthesis.current.cancel(); // Cancel any ongoing speech
      const utterance = new SpeechSynthesisUtterance(instruction);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      speechSynthesis.current.speak(utterance);
    }
  };

  const handleStartNavigation = () => {
    if (onStartNavigation) {
      onStartNavigation();
    }
  };

  const handleEndNavigation = () => {
    setRoute([]);
    setDirections([]);
    setCurrentStep(0);
    if (onEndNavigation) {
      onEndNavigation();
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      speechSynthesis.current.cancel();
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const formatDistance = (distance) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${Math.round(minutes)}min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}min`;
  };

  const getManeuverIcon = (maneuver) => {
    switch (maneuver) {
      case 'turn-right':
        return '➡️';
      case 'turn-left':
        return '⬅️';
      case 'straight':
        return '⬆️';
      case 'arrive':
        return '🏁';
      default:
        return '⬆️';
    }
  };

  if (!currentLocation) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <div className="text-center">
          <NavigationIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">Waiting for location...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'h-96 rounded-lg overflow-hidden'}`}>
      {/* Navigation header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-white bg-opacity-95 backdrop-blur-sm shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            {isNavigating ? (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <NavigationIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatDistance(navigationData.distance)} • {formatDuration(navigationData.duration)}
                  </p>
                  {directions[currentStep] && (
                    <p className="text-xs text-gray-600">
                      {getManeuverIcon(directions[currentStep].maneuver)} {directions[currentStep].instruction}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">Map View</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {isNavigating && (
              <>
                <button
                  onClick={toggleMute}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                
                {rideData?.passenger?.phone && (
                  <>
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-full">
                      <Phone className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-green-600 hover:bg-green-50 rounded-full">
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  </>
                )}
              </>
            )}
            
            <button
              onClick={toggleFullscreen}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
            >
              <Maximize className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Map */}
      <MapContainer
        ref={mapRef}
        center={mapCenter}
        zoom={15}
        style={{ width: '100%', height: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController 
          center={mapCenter} 
          zoom={isNavigating ? 17 : 15} 
          route={route} 
        />

        {/* Current location marker */}
        {currentLocation && (
          <Marker
            position={[currentLocation.latitude, currentLocation.longitude]}
            icon={createCustomIcon('#3B82F6', '🚗')}
          >
            <Popup>
              <div className="text-center">
                <p className="font-semibold">Your Location</p>
                <p className="text-sm text-gray-600">
                  Speed: {navigationData.speed || 0} km/h
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Destination marker */}
        {destination && (
          <Marker
            position={[destination.latitude, destination.longitude]}
            icon={createCustomIcon('#EF4444', '🏁')}
          >
            <Popup>
              <div className="text-center">
                <p className="font-semibold">Destination</p>
                <p className="text-sm text-gray-600">
                  {destination.address || 'Drop-off location'}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Route polyline */}
        {route.length > 0 && (
          <Polyline
            positions={route}
            color="#3B82F6"
            weight={5}
            opacity={0.8}
          />
        )}
      </MapContainer>

      {/* Speed and stats overlay */}
      {isNavigating && (
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white p-3 rounded-lg">
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <Speedometer className="w-4 h-4" />
              <span>{navigationData.speed || 0} km/h</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{formatDuration(navigationData.duration)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation controls */}
      {!isNavigating && destination && (
        <div className="absolute bottom-4 right-4">
          <button
            onClick={handleStartNavigation}
            className="bg-blue-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <NavigationIcon className="w-5 h-5" />
            <span>Start Navigation</span>
          </button>
        </div>
      )}

      {isNavigating && (
        <div className="absolute bottom-4 right-4">
          <button
            onClick={handleEndNavigation}
            className="bg-red-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:bg-red-700 transition-colors"
          >
            End Navigation
          </button>
        </div>
      )}

      {/* Turn-by-turn directions panel */}
      {isNavigating && directions.length > 0 && !isFullscreen && (
        <div className="absolute top-16 left-4 right-4 bg-white rounded-lg shadow-lg p-4 max-h-48 overflow-y-auto">
          <h3 className="font-semibold text-gray-900 mb-2">Directions</h3>
          <div className="space-y-2">
            {directions.map((step, index) => (
              <div
                key={index}
                className={`flex items-center space-x-3 p-2 rounded ${
                  index === currentStep ? 'bg-blue-50 border border-blue-200' : ''
                }`}
              >
                <span className="text-lg">
                  {getManeuverIcon(step.maneuver)}
                </span>
                <div className="flex-1">
                  <p className={`text-sm ${index === currentStep ? 'font-semibold text-blue-900' : 'text-gray-700'}`}>
                    {step.instruction}
                  </p>
                  {step.distance > 0 && (
                    <p className="text-xs text-gray-500">
                      {formatDistance(step.distance)} • {formatDuration(step.duration)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Navigation;