import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Volume2, 
  Moon, 
  Sun, 
  Globe, 
  DollarSign, 
  Navigation, 
  Shield, 
  User, 
  Car, 
  CreditCard,
  Smartphone,
  ChevronRight,
  Save,
  RotateCcw
} from 'lucide-react';
import { getUserPreferences, updateUserPreferences } from '../utils/storage';

const Settings = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    // General settings
    theme: 'light',
    language: 'en',
    currency: 'USD',
    distanceUnit: 'miles',
    
    // Notification settings
    pushNotifications: true,
    rideRequests: true,
    earnings: true,
    promotions: false,
    systemUpdates: true,
    
    // Audio settings
    soundEffects: true,
    voiceNavigation: true,
    notificationSound: 'default',
    volume: 80,
    
    // Privacy settings
    shareLocation: true,
    analytics: true,
    crashReports: true,
    personalizedAds: false,
    
    // Navigation settings
    autoNavigation: true,
    avoidTolls: false,
    avoidHighways: false,
    mapStyle: 'default',
    
    // Vehicle settings
    fuelType: 'gasoline',
    vehicleClass: 'sedan',
    airConditioning: true,
    accessibility: false,
  });

  const [originalSettings, setOriginalSettings] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Load user preferences
    const preferences = getUserPreferences();
    setSettings(prev => ({ ...prev, ...preferences }));
    setOriginalSettings({ ...settings, ...preferences });
  }, []);

  useEffect(() => {
    // Check if settings have changed
    const changed = JSON.stringify(settings) !== JSON.stringify(originalSettings);
    setHasChanges(changed);
  }, [settings, originalSettings]);

  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    try {
      await updateUserPreferences(settings);
      setOriginalSettings({ ...settings });
      setHasChanges(false);
      // Show success message
      console.log('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleReset = () => {
    setSettings({ ...originalSettings });
    setHasChanges(false);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'audio', label: 'Audio', icon: Volume2 },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'navigation', label: 'Navigation', icon: Navigation },
    { id: 'vehicle', label: 'Vehicle', icon: Car },
  ];

  const ToggleSwitch = ({ checked, onChange, label, description }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <p className="font-medium text-gray-900">{label}</p>
        {description && (
          <p className="text-sm text-gray-600">{description}</p>
        )}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-blue-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  const SelectOption = ({ value, onChange, options, label, description }) => (
    <div className="py-3">
      <label className="block font-medium text-gray-900 mb-1">{label}</label>
      {description && (
        <p className="text-sm text-gray-600 mb-2">{description}</p>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  const SliderOption = ({ value, onChange, min, max, label, description, unit = '' }) => (
    <div className="py-3">
      <div className="flex justify-between items-center mb-2">
        <label className="font-medium text-gray-900">{label}</label>
        <span className="text-sm text-gray-600">{value}{unit}</span>
      </div>
      {description && (
        <p className="text-sm text-gray-600 mb-2">{description}</p>
      )}
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
      />
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">General Settings</h3>
            
            <SelectOption
              value={settings.theme}
              onChange={(value) => updateSetting('theme', value)}
              label="Theme"
              description="Choose your app appearance"
              options={[
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
                { value: 'auto', label: 'Auto (System)' },
              ]}
            />

            <SelectOption
              value={settings.language}
              onChange={(value) => updateSetting('language', value)}
              label="Language"
              description="Select your preferred language"
              options={[
                { value: 'en', label: 'English' },
                { value: 'es', label: 'Español' },
                { value: 'fr', label: 'Français' },
                { value: 'de', label: 'Deutsch' },
                { value: 'it', label: 'Italiano' },
                { value: 'pt', label: 'Português' },
              ]}
            />

            <SelectOption
              value={settings.currency}
              onChange={(value) => updateSetting('currency', value)}
              label="Currency"
              description="Default currency for earnings"
              options={[
                { value: 'USD', label: 'US Dollar ($)' },
                { value: 'EUR', label: 'Euro (€)' },
                { value: 'GBP', label: 'British Pound (£)' },
                { value: 'CAD', label: 'Canadian Dollar (C$)' },
                { value: 'AUD', label: 'Australian Dollar (A$)' },
              ]}
            />

            <SelectOption
              value={settings.distanceUnit}
              onChange={(value) => updateSetting('distanceUnit', value)}
              label="Distance Unit"
              description="Choose between miles or kilometers"
              options={[
                { value: 'miles', label: 'Miles' },
                { value: 'km', label: 'Kilometers' },
              ]}
            />
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Notification Settings</h3>
            
            <ToggleSwitch
              checked={settings.pushNotifications}
              onChange={(value) => updateSetting('pushNotifications', value)}
              label="Push Notifications"
              description="Allow the app to send you notifications"
            />

            <ToggleSwitch
              checked={settings.rideRequests}
              onChange={(value) => updateSetting('rideRequests', value)}
              label="Ride Requests"
              description="Get notified about new ride requests"
            />

            <ToggleSwitch
              checked={settings.earnings}
              onChange={(value) => updateSetting('earnings', value)}
              label="Earnings Updates"
              description="Notifications about payments and earnings"
            />

            <ToggleSwitch
              checked={settings.promotions}
              onChange={(value) => updateSetting('promotions', value)}
              label="Promotions & Offers"
              description="Get notified about special offers and bonuses"
            />

            <ToggleSwitch
              checked={settings.systemUpdates}
              onChange={(value) => updateSetting('systemUpdates', value)}
              label="System Updates"
              description="Important app updates and announcements"
            />
          </div>
        );

      case 'audio':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Audio Settings</h3>
            
            <ToggleSwitch
              checked={settings.soundEffects}
              onChange={(value) => updateSetting('soundEffects', value)}
              label="Sound Effects"
              description="Play sounds for app interactions"
            />

            <ToggleSwitch
              checked={settings.voiceNavigation}
              onChange={(value) => updateSetting('voiceNavigation', value)}
              label="Voice Navigation"
              description="Spoken turn-by-turn directions"
            />

            <SelectOption
              value={settings.notificationSound}
              onChange={(value) => updateSetting('notificationSound', value)}
              label="Notification Sound"
              description="Sound for ride requests and alerts"
              options={[
                { value: 'default', label: 'Default' },
                { value: 'chime', label: 'Chime' },
                { value: 'ping', label: 'Ping' },
                { value: 'bell', label: 'Bell' },
                { value: 'none', label: 'Silent' },
              ]}
            />

            <SliderOption
              value={settings.volume}
              onChange={(value) => updateSetting('volume', value)}
              min={0}
              max={100}
              label="Volume"
              description="Adjust overall app volume"
              unit="%"
            />
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Privacy Settings</h3>
            
            <ToggleSwitch
              checked={settings.shareLocation}
              onChange={(value) => updateSetting('shareLocation', value)}
              label="Share Location"
              description="Allow location sharing with passengers"
            />

            <ToggleSwitch
              checked={settings.analytics}
              onChange={(value) => updateSetting('analytics', value)}
              label="Analytics"
              description="Help improve the app by sharing usage data"
            />

            <ToggleSwitch
              checked={settings.crashReports}
              onChange={(value) => updateSetting('crashReports', value)}
              label="Crash Reports"
              description="Automatically send crash reports to developers"
            />

            <ToggleSwitch
              checked={settings.personalizedAds}
              onChange={(value) => updateSetting('personalizedAds', value)}
              label="Personalized Ads"
              description="Show ads based on your interests"
            />
          </div>
        );

      case 'navigation':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Navigation Settings</h3>
            
            <ToggleSwitch
              checked={settings.autoNavigation}
              onChange={(value) => updateSetting('autoNavigation', value)}
              label="Auto Navigation"
              description="Automatically start navigation when trip begins"
            />

            <ToggleSwitch
              checked={settings.avoidTolls}
              onChange={(value) => updateSetting('avoidTolls', value)}
              label="Avoid Tolls"
              description="Route around toll roads when possible"
            />

            <ToggleSwitch
              checked={settings.avoidHighways}
              onChange={(value) => updateSetting('avoidHighways', value)}
              label="Avoid Highways"
              description="Prefer local roads over highways"
            />

            <SelectOption
              value={settings.mapStyle}
              onChange={(value) => updateSetting('mapStyle', value)}
              label="Map Style"
              description="Choose your preferred map appearance"
              options={[
                { value: 'default', label: 'Default' },
                { value: 'satellite', label: 'Satellite' },
                { value: 'terrain', label: 'Terrain' },
                { value: 'dark', label: 'Dark Mode' },
              ]}
            />
          </div>
        );

      case 'vehicle':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Vehicle Settings</h3>
            
            <SelectOption
              value={settings.fuelType}
              onChange={(value) => updateSetting('fuelType', value)}
              label="Fuel Type"
              description="Your vehicle's fuel type"
              options={[
                { value: 'gasoline', label: 'Gasoline' },
                { value: 'diesel', label: 'Diesel' },
                { value: 'hybrid', label: 'Hybrid' },
                { value: 'electric', label: 'Electric' },
                { value: 'lng', label: 'LNG' },
              ]}
            />

            <SelectOption
              value={settings.vehicleClass}
              onChange={(value) => updateSetting('vehicleClass', value)}
              label="Vehicle Class"
              description="Type of vehicle you drive"
              options={[
                { value: 'sedan', label: 'Sedan' },
                { value: 'suv', label: 'SUV' },
                { value: 'hatchback', label: 'Hatchback' },
                { value: 'luxury', label: 'Luxury' },
                { value: 'van', label: 'Van' },
              ]}
            />

            <ToggleSwitch
              checked={settings.airConditioning}
              onChange={(value) => updateSetting('airConditioning', value)}
              label="Air Conditioning"
              description="Your vehicle has working AC"
            />

            <ToggleSwitch
              checked={settings.accessibility}
              onChange={(value) => updateSetting('accessibility', value)}
              label="Accessibility Features"
              description="Your vehicle is wheelchair accessible"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[80vh] flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-gray-50 border-r">
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold text-gray-900">Settings</h2>
          </div>
          <nav className="p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-6">
            {renderTabContent()}
          </div>

          {/* Footer */}
          <div className="border-t bg-gray-50 p-4 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {hasChanges && (
                <span className="text-orange-600">• Unsaved changes</span>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleReset}
                disabled={!hasChanges}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanges}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;