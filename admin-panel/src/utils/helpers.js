/**
 * Utility functions for the admin panel
 */

// Date and Time Helpers
export const formatDate = (date, format = 'short') => {
  if (!date) return 'N/A';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return 'Invalid Date';
  
  const options = {
    short: { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    },
    long: { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    },
    time: {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }
  };
  
  return dateObj.toLocaleDateString('en-US', options[format]);
};

export const getTimeAgo = (date) => {
  if (!date) return 'N/A';
  
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now - past) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
  
  return `${Math.floor(diffInSeconds / 31536000)}y ago`;
};

export const getDurationBetween = (startDate, endDate) => {
  if (!startDate || !endDate) return 'N/A';
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffInMinutes = Math.floor((end - start) / (1000 * 60));
  
  if (diffInMinutes < 60) return `${diffInMinutes} min`;
  
  const hours = Math.floor(diffInMinutes / 60);
  const minutes = diffInMinutes % 60;
  
  return `${hours}h ${minutes}m`;
};

// Currency and Number Helpers
export const formatCurrency = (amount, currency = 'USD', locale = 'en-US') => {
  if (amount === null || amount === undefined || isNaN(amount)) return '$0.00';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatNumber = (number, options = {}) => {
  if (number === null || number === undefined || isNaN(number)) return '0';
  
  const defaultOptions = {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  };
  
  return new Intl.NumberFormat('en-US', { ...defaultOptions, ...options }).format(number);
};

export const formatPercentage = (value, total, decimals = 1) => {
  if (!value || !total || total === 0) return '0%';
  return `${((value / total) * 100).toFixed(decimals)}%`;
};

export const abbreviateNumber = (number) => {
  if (number === null || number === undefined || isNaN(number)) return '0';
  
  const absNumber = Math.abs(number);
  
  if (absNumber >= 1e9) return `${(number / 1e9).toFixed(1)}B`;
  if (absNumber >= 1e6) return `${(number / 1e6).toFixed(1)}M`;
  if (absNumber >= 1e3) return `${(number / 1e3).toFixed(1)}K`;
  
  return number.toString();
};

// String Helpers
export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const capitalizeWords = (str) => {
  if (!str) return '';
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

export const truncateText = (text, maxLength = 50, suffix = '...') => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
};

export const slugify = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Array and Object Helpers
export const sortBy = (array, key, direction = 'asc') => {
  return [...array].sort((a, b) => {
    const aValue = typeof key === 'function' ? key(a) : a[key];
    const bValue = typeof key === 'function' ? key(b) : b[key];
    
    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

export const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const group = typeof key === 'function' ? key(item) : item[key];
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {});
};

export const filterBy = (array, filters) => {
  return array.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (value === '' || value === null || value === undefined) return true;
      if (Array.isArray(value)) return value.includes(item[key]);
      if (typeof value === 'string') {
        return item[key]?.toString().toLowerCase().includes(value.toLowerCase());
      }
      return item[key] === value;
    });
  });
};

export const uniqueBy = (array, key) => {
  const seen = new Set();
  return array.filter(item => {
    const value = typeof key === 'function' ? key(item) : item[key];
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
};

// Validation Helpers
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone) => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Color Helpers
export const getStatusColor = (status) => {
  const colors = {
    active: 'text-green-600 bg-green-100',
    online: 'text-green-600 bg-green-100',
    completed: 'text-green-600 bg-green-100',
    success: 'text-green-600 bg-green-100',
    
    pending: 'text-yellow-600 bg-yellow-100',
    warning: 'text-yellow-600 bg-yellow-100',
    busy: 'text-yellow-600 bg-yellow-100',
    
    inactive: 'text-gray-600 bg-gray-100',
    offline: 'text-gray-600 bg-gray-100',
    
    cancelled: 'text-red-600 bg-red-100',
    suspended: 'text-red-600 bg-red-100',
    banned: 'text-red-600 bg-red-100',
    error: 'text-red-600 bg-red-100',
    
    'in-progress': 'text-blue-600 bg-blue-100',
    'driver-assigned': 'text-purple-600 bg-purple-100'
  };
  
  return colors[status?.toLowerCase()] || 'text-gray-600 bg-gray-100';
};

export const generateRandomColor = () => {
  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#14B8A6', '#F97316', '#84CC16', '#6366F1'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Local Storage Helpers
export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },
  
  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch {
      return false;
    }
  }
};

// URL and Query Helpers
export const buildQueryString = (params) => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(v => searchParams.append(key, v));
      } else {
        searchParams.append(key, value);
      }
    }
  });
  
  return searchParams.toString();
};

export const parseQueryString = (queryString = window.location.search) => {
  const params = new URLSearchParams(queryString);
  const result = {};
  
  for (const [key, value] of params) {
    if (result[key]) {
      if (Array.isArray(result[key])) {
        result[key].push(value);
      } else {
        result[key] = [result[key], value];
      }
    } else {
      result[key] = value;
    }
  }
  
  return result;
};

// Debounce and Throttle
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// File Helpers
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

// Analytics Helpers
export const calculateGrowthRate = (current, previous) => {
  if (!previous || previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

export const calculateAverage = (array, key) => {
  if (!array.length) return 0;
  const sum = array.reduce((acc, item) => {
    const value = typeof key === 'function' ? key(item) : item[key] || 0;
    return acc + parseFloat(value);
  }, 0);
  return sum / array.length;
};

export const calculateSum = (array, key) => {
  return array.reduce((acc, item) => {
    const value = typeof key === 'function' ? key(item) : item[key] || 0;
    return acc + parseFloat(value);
  }, 0);
};

// Device Detection
export const isMobile = () => {
  return window.innerWidth <= 768;
};

export const isTablet = () => {
  return window.innerWidth > 768 && window.innerWidth <= 1024;
};

export const isDesktop = () => {
  return window.innerWidth > 1024;
};

// Copy to Clipboard
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch {
      document.body.removeChild(textArea);
      return false;
    }
  }
};

// Generate Random ID
export const generateId = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Deep Clone Object
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (obj instanceof Object) {
    const cloned = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }
};

export default {
  // Date & Time
  formatDate,
  getTimeAgo,
  getDurationBetween,
  
  // Currency & Numbers
  formatCurrency,
  formatNumber,
  formatPercentage,
  abbreviateNumber,
  
  // Strings
  capitalizeFirst,
  capitalizeWords,
  truncateText,
  slugify,
  
  // Arrays & Objects
  sortBy,
  groupBy,
  filterBy,
  uniqueBy,
  
  // Validation
  isValidEmail,
  isValidPhone,
  isValidUrl,
  
  // Colors
  getStatusColor,
  generateRandomColor,
  
  // Storage
  storage,
  
  // URL
  buildQueryString,
  parseQueryString,
  
  // Performance
  debounce,
  throttle,
  
  // Files
  formatFileSize,
  getFileExtension,
  
  // Analytics
  calculateGrowthRate,
  calculateAverage,
  calculateSum,
  
  // Device
  isMobile,
  isTablet,
  isDesktop,
  
  // Utilities
  copyToClipboard,
  generateId,
  deepClone
};