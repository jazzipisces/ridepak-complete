import { STORAGE_KEYS } from '../constants';

// Check if localStorage is available
const isLocalStorageAvailable = () => {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

// Fallback storage for when localStorage is not available
let fallbackStorage = {};

const useLocalStorage = isLocalStorageAvailable();

// Generic storage functions
export const setItem = (key, value) => {
  try {
    const serializedValue = JSON.stringify(value);
    
    if (useLocalStorage) {
      localStorage.setItem(key, serializedValue);
    } else {
      fallbackStorage[key] = serializedValue;
    }
  } catch (error) {
    console.error('Error saving to storage:', error);
  }
};

export const getItem = (key, defaultValue = null) => {
  try {
    let item;
    
    if (useLocalStorage) {
      item = localStorage.getItem(key);
    } else {
      item = fallbackStorage[key];
    }
    
    if (item === null || item === undefined) {
      return defaultValue;
    }
    
    return JSON.parse(item);
  } catch (error) {
    console.error('Error reading from storage:', error);
    return defaultValue;
  }
};

export const removeItem = (key) => {
  try {
    if (useLocalStorage) {
      localStorage.removeItem(key);
    } else {
      delete fallbackStorage[key];
    }
  } catch (error) {
    console.error('Error removing from storage:', error);
  }
};

export const clear = () => {
  try {
    if (useLocalStorage) {
      localStorage.clear();
    } else {
      fallbackStorage = {};
    }
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
};

// Token management
export const setStoredTokens = (accessToken, refreshToken) => {
  setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
  if (refreshToken) {
    setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  }
};

export const getStoredToken = (tokenType = STORAGE_KEYS.ACCESS_TOKEN) => {
  return getItem(tokenType);
};

export const removeStoredTokens = () => {
  removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  removeItem(STORAGE_KEYS.REFRESH_TOKEN);
};

export const isAuthenticated = () => {
  const token = getStoredToken(STORAGE_KEYS.ACCESS_TOKEN);
  return !!token;
};

// Driver data management
export const setDriverData = (driverData) => {
  setItem(STORAGE_KEYS.DRIVER_DATA, driverData);
};

export const getDriverData = () => {
  return getItem(STORAGE_KEYS.DRIVER_DATA, {});
};

export const updateDriverData = (updates) => {
  const currentData = getDriverData();
  const updatedData = { ...currentData, ...updates };
  setDriverData(updatedData);
};

export const removeDriverData = () => {
  removeItem(STORAGE_KEYS.DRIVER_DATA);
};

// User preferences
export const setUserPreferences = (preferences) => {
  setItem(STORAGE_KEYS.USER_PREFERENCES, preferences);
};

export const getUserPreferences = () => {
  return getItem(STORAGE_KEYS.USER_PREFERENCES, {
    theme: 'light',
    language: 'en',
    notifications: true,
    sound: true,
    distanceUnit: 'miles',
    currency: 'USD',
  });
};

export const updateUserPreferences = (updates) => {
  const currentPreferences = getUserPreferences();
  const updatedPreferences = { ...currentPreferences, ...updates };
  setUserPreferences(updatedPreferences);
};

// Ride history cache
export const setRideHistoryCache = (rides) => {
  setItem(STORAGE_KEYS.RIDE_HISTORY, rides);
};

export const getRideHistoryCache = () => {
  return getItem(STORAGE_KEYS.RIDE_HISTORY, []);
};

export const addRideToCache = (ride) => {
  const cache = getRideHistoryCache();
  const updatedCache = [ride, ...cache.slice(0, 99)]; // Keep last 100 rides
  setRideHistoryCache(updatedCache);
};

export const clearRideHistoryCache = () => {
  removeItem(STORAGE_KEYS.RIDE_HISTORY);
};

// Location cache
export const setLocationCache = (location) => {
  setItem(STORAGE_KEYS.LOCATION_CACHE, {
    ...location,
    timestamp: Date.now(),
  });
};

export const getLocationCache = () => {
  const cached = getItem(STORAGE_KEYS.LOCATION_CACHE);
  
  if (!cached) return null;
  
  // Check if cache is still valid (5 minutes)
  const maxAge = 5 * 60 * 1000; // 5 minutes
  if (Date.now() - cached.timestamp > maxAge) {
    removeItem(STORAGE_KEYS.LOCATION_CACHE);
    return null;
  }
  
  return cached;
};

// Encrypted storage functions (basic encryption for sensitive data)
const encryptData = (data) => {
  if (process.env.REACT_APP_ENCRYPT_LOCAL_STORAGE !== 'true') {
    return data;
  }
  
  try {
    // Simple base64 encoding (not secure, just obfuscation)
    return btoa(JSON.stringify(data));
  } catch {
    return data;
  }
};

const decryptData = (encryptedData) => {
  if (process.env.REACT_APP_ENCRYPT_LOCAL_STORAGE !== 'true') {
    return encryptedData;
  }
  
  try {
    return JSON.parse(atob(encryptedData));
  } catch {
    return encryptedData;
  }
};

export const setSecureItem = (key, value) => {
  const encrypted = encryptData(value);
  setItem(key, encrypted);
};

export const getSecureItem = (key, defaultValue = null) => {
  const item = getItem(key);
  if (!item) return defaultValue;
  
  return decryptData(item);
};

// Storage event listeners (for cross-tab synchronization)
export const addStorageListener = (callback) => {
  if (useLocalStorage && typeof window !== 'undefined') {
    window.addEventListener('storage', callback);
  }
};

export const removeStorageListener = (callback) => {
  if (useLocalStorage && typeof window !== 'undefined') {
    window.removeEventListener('storage', callback);
  }
};

// Storage quota management
export const getStorageUsage = () => {
  if (!useLocalStorage) return { used: 0, available: Infinity };
  
  let used = 0;
  
  try {
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length + key.length;
      }
    }
  } catch (error) {
    console.error('Error calculating storage usage:', error);
  }
  
  // Approximate available storage (5MB typical limit)
  const approximateLimit = 5 * 1024 * 1024; // 5MB in bytes
  
  return {
    used,
    available: approximateLimit - used,
    percentage: (used / approximateLimit) * 100,
  };
};

// Clean up old/expired data
export const cleanupStorage = () => {
  try {
    // Remove expired location cache
    getLocationCache(); // This will remove expired cache internally
    
    // Clean up old ride history (keep only last 100)
    const rideHistory = getRideHistoryCache();
    if (rideHistory.length > 100) {
      setRideHistoryCache(rideHistory.slice(0, 100));
    }
    
    // Remove any temporary data older than 24 hours
    const tempKeys = ['temp_', 'cache_', 'tmp_'];
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    
    if (useLocalStorage) {
      for (const key in localStorage) {
        if (tempKeys.some(prefix => key.startsWith(prefix))) {
          try {
            const item = JSON.parse(localStorage[key]);
            if (item.timestamp && item.timestamp < oneDayAgo) {
              localStorage.removeItem(key);
            }
          } catch {
            // If parsing fails, remove the item
            localStorage.removeItem(key);
          }
        }
      }
    }
    
    console.log('Storage cleanup completed');
  } catch (error) {
    console.error('Error during storage cleanup:', error);
  }
};

// Export/Import data for backup
export const exportData = () => {
  const data = {};
  
  try {
    if (useLocalStorage) {
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key) && key.startsWith('ridedriver_')) {
          data[key] = localStorage[key];
        }
      }
    } else {
      Object.keys(fallbackStorage).forEach(key => {
        if (key.startsWith('ridedriver_')) {
          data[key] = fallbackStorage[key];
        }
      });
    }
  } catch (error) {
    console.error('Error exporting data:', error);
  }
  
  return data;
};

export const importData = (data) => {
  try {
    Object.keys(data).forEach(key => {
      if (key.startsWith('ridedriver_')) {
        if (useLocalStorage) {
          localStorage.setItem(key, data[key]);
        } else {
          fallbackStorage[key] = data[key];
        }
      }
    });
    
    console.log('Data import completed');
  } catch (error) {
    console.error('Error importing data:', error);
  }
};

// Utilities for debugging
export const logStorageContents = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Storage contents:');
    
    if (useLocalStorage) {
      for (const key in localStorage) {
        if (key.startsWith('ridedriver_')) {
          console.log(`${key}:`, getItem(key));
        }
      }
    } else {
      Object.keys(fallbackStorage).forEach(key => {
        if (key.startsWith('ridedriver_')) {
          console.log(`${key}:`, getItem(key));
        }
      });
    }
  }
};

export const getStorageInfo = () => {
  const usage = getStorageUsage();
  const isAvailable = useLocalStorage;
  
  return {
    isAvailable,
    usage,
    type: isAvailable ? 'localStorage' : 'memory',
  };
};

// Auto cleanup on app load
if (typeof window !== 'undefined') {
  // Clean up storage on load
  setTimeout(cleanupStorage, 1000);
  
  // Set up periodic cleanup every hour
  setInterval(cleanupStorage, 60 * 60 * 1000);
}