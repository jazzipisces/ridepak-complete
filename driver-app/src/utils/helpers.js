import { CURRENCY_CONFIG, DISTANCE_CONFIG, TIME_CONFIG } from '../constants';

// Date and Time utilities
export const formatDate = (date, format = TIME_CONFIG.formats.date) => {
  if (!date) return '';
  
  const d = new Date(date);
  
  switch (format) {
    case 'short':
      return d.toLocaleDateString();
    case 'long':
      return d.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    case 'time':
      return d.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    case 'datetime':
      return d.toLocaleString();
    case 'relative':
      return getRelativeTime(d);
    default:
      return d.toLocaleDateString();
  }
};

export const getRelativeTime = (date) => {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(date, 'short');
};

// Currency utilities
export const formatCurrency = (amount, currency = CURRENCY_CONFIG.default) => {
  if (typeof amount !== 'number') return '0.00';
  
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: CURRENCY_CONFIG.precision,
    maximumFractionDigits: CURRENCY_CONFIG.precision,
  });
  
  return formatter.format(amount);
};

export const parseCurrency = (currencyString) => {
  const cleaned = currencyString.replace(/[^\d.-]/g, '');
  return parseFloat(cleaned) || 0;
};

// Distance utilities
export const formatDistance = (distance, unit = DISTANCE_CONFIG.unit) => {
  if (typeof distance !== 'number') return '0';
  
  let value = distance;
  let unitLabel = unit;
  
  if (unit === 'miles') {
    if (distance < 0.1) {
      value = distance * 5280; // Convert to feet
      unitLabel = 'ft';
    } else {
      unitLabel = distance === 1 ? 'mile' : 'miles';
    }
  } else if (unit === 'km') {
    if (distance < 1) {
      value = distance * 1000; // Convert to meters
      unitLabel = 'm';
    } else {
      unitLabel = 'km';
    }
  }
  
  return `${value.toFixed(DISTANCE_CONFIG.precision)} ${unitLabel}`;
};

export const convertDistance = (distance, fromUnit, toUnit) => {
  if (fromUnit === toUnit) return distance;
  
  // Convert to meters first
  let meters = distance;
  if (fromUnit === 'miles') meters = distance * 1609.34;
  if (fromUnit === 'km') meters = distance * 1000;
  if (fromUnit === 'ft') meters = distance * 0.3048;
  
  // Convert from meters to target unit
  if (toUnit === 'miles') return meters / 1609.34;
  if (toUnit === 'km') return meters / 1000;
  if (toUnit === 'ft') return meters / 0.3048;
  if (toUnit === 'm') return meters;
  
  return distance;
};

// Duration utilities
export const formatDuration = (minutes) => {
  if (typeof minutes !== 'number' || minutes < 0) return '0 min';
  
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
};

export const parseDuration = (durationString) => {
  const matches = durationString.match(/(\d+)h?\s*(\d+)?m?/);
  if (!matches) return 0;
  
  const hours = parseInt(matches[1]) || 0;
  const minutes = parseInt(matches[2]) || 0;
  
  return hours * 60 + minutes;
};

// String utilities
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const truncateText = (text, maxLength) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

export const slugify = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Number utilities
export const formatNumber = (num, decimals = 0) => {
  if (typeof num !== 'number') return '0';
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max);
};

export const roundToNearest = (value, nearest = 1) => {
  return Math.round(value / nearest) * nearest;
};

// Array utilities
export const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const group = item[key];
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {});
};

export const sortBy = (array, key, direction = 'asc') => {
  return [...array].sort((a, b) => {
    const aVal = typeof key === 'function' ? key(a) : a[key];
    const bVal = typeof key === 'function' ? key(b) : b[key];
    
    if (direction === 'desc') {
      return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
    }
    return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
  });
};

export const unique = (array, key) => {
  if (!key) return [...new Set(array)];
  
  const seen = new Set();
  return array.filter(item => {
    const value = typeof key === 'function' ? key(item) : item[key];
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
};

// Object utilities
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  
  const cloned = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
};

export const isEmpty = (obj) => {
  if (obj == null) return true;
  if (Array.isArray(obj) || typeof obj === 'string') return obj.length === 0;
  return Object.keys(obj).length === 0;
};

export const pick = (obj, keys) => {
  const picked = {};
  keys.forEach(key => {
    if (key in obj) picked[key] = obj[key];
  });
  return picked;
};

export const omit = (obj, keys) => {
  const omitted = { ...obj };
  keys.forEach(key => delete omitted[key]);
  return omitted;
};

// URL utilities
export const getQueryParams = () => {
  const params = new URLSearchParams(window.location.search);
  const result = {};
  for (const [key, value] of params) {
    result[key] = value;
  }
  return result;
};

export const buildQueryString = (params) => {
  const searchParams = new URLSearchParams();
  Object.keys(params).forEach(key => {
    if (params[key] !== null && params[key] !== undefined) {
      searchParams.append(key, params[key]);
    }
  });
  return searchParams.toString();
};

// Validation utilities
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone) => {
  const phoneRegex = /^\+?[\d\s-()]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

export const isValidPassword = (password, requirements = {}) => {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSymbols = false,
  } = requirements;

  if (password.length < minLength) return false;
  if (requireUppercase && !/[A-Z]/.test(password)) return false;
  if (requireLowercase && !/[a-z]/.test(password)) return false;
  if (requireNumbers && !/\d/.test(password)) return false;
  if (requireSymbols && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false;

  return true;
};

// Location utilities
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
};

export const calculateBearing = (lat1, lon1, lat2, lon2) => {
  const dLon = toRadians(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(toRadians(lat2));
  const x = Math.cos(toRadians(lat1)) * Math.sin(toRadians(lat2)) -
            Math.sin(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.cos(dLon);
  
  let bearing = Math.atan2(y, x);
  bearing = toDegrees(bearing);
  return (bearing + 360) % 360; // Normalize to 0-360
};

export const toRadians = (degrees) => degrees * (Math.PI / 180);
export const toDegrees = (radians) => radians * (180 / Math.PI);

// Device utilities
export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

export const isAndroid = () => {
  return /Android/.test(navigator.userAgent);
};

export const getDeviceType = () => {
  if (isMobile()) {
    return isIOS() ? 'ios' : isAndroid() ? 'android' : 'mobile';
  }
  return 'desktop';
};

// Performance utilities
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

export const memoize = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

// Error utilities
export const createError = (message, code, details = {}) => {
  const error = new Error(message);
  error.code = code;
  error.details = details;
  error.timestamp = new Date().toISOString();
  return error;
};

export const handleAsyncError = (asyncFn) => {
  return async (...args) => {
    try {
      return await asyncFn(...args);
    } catch (error) {
      console.error('Async error:', error);
      throw error;
    }
  };
};

// Color utilities
export const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

export const rgbToHex = (r, g, b) => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

export const getContrastColor = (hexColor) => {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return '#000000';
  
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#ffffff';
};

// Random utilities
export const generateId = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const randomBetween = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// File utilities
export const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const readFileAsDataURL = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Analytics utilities
export const trackEvent = (eventName, properties = {}) => {
  if (process.env.REACT_APP_ENABLE_ANALYTICS === 'true') {
    // Send to analytics service
    console.log('Track event:', eventName, properties);
  }
};

export const trackPageView = (pageName) => {
  if (process.env.REACT_APP_ENABLE_ANALYTICS === 'true') {
    // Send to analytics service
    console.log('Track page view:', pageName);
  }
};

// Development utilities
export const logger = {
  info: (...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[INFO]', ...args);
    }
  },
  warn: (...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[WARN]', ...args);
    }
  },
  error: (...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('[ERROR]', ...args);
    }
  },
  debug: (...args) => {
    if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_DEBUG_MODE === 'true') {
      console.log('[DEBUG]', ...args);
    }
  }
};

export default {
  // Date and Time
  formatDate,
  getRelativeTime,
  
  // Currency
  formatCurrency,
  parseCurrency,
  
  // Distance
  formatDistance,
  convertDistance,
  
  // Duration
  formatDuration,
  parseDuration,
  
  // String
  capitalize,
  truncateText,
  slugify,
  
  // Number
  formatNumber,
  clamp,
  roundToNearest,
  
  // Array
  groupBy,
  sortBy,
  unique,
  
  // Object
  deepClone,
  isEmpty,
  pick,
  omit,
  
  // URL
  getQueryParams,
  buildQueryString,
  
  // Validation
  isValidEmail,
  isValidPhone,
  isValidPassword,
  
  // Location
  calculateDistance,
  calculateBearing,
  toRadians,
  toDegrees,
  
  // Device
  isMobile,
  isIOS,
  isAndroid,
  getDeviceType,
  
  // Performance
  debounce,
  throttle,
  memoize,
  
  // Error
  createError,
  handleAsyncError,
  
  // Color
  hexToRgb,
  rgbToHex,
  getContrastColor,
  
  // Random
  generateId,
  randomBetween,
  shuffleArray,
  
  // File
  getFileExtension,
  formatFileSize,
  readFileAsDataURL,
  
  // Analytics
  trackEvent,
  trackPageView,
  
  // Development
  logger,
};