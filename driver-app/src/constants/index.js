// App Constants for RideDriver
export const APP_CONFIG = {
  name: process.env.REACT_APP_NAME || 'RideDriver',
  version: process.env.REACT_APP_VERSION || '1.0.0',
  environment: process.env.REACT_APP_ENVIRONMENT || 'development',
  apiBaseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api',
  websocketUrl: process.env.REACT_APP_WEBSOCKET_URL || 'ws://localhost:3001',
};

// Driver Status Constants
export const DRIVER_STATUS = {
  OFFLINE: 'offline',
  ONLINE: 'online',
  BUSY: 'busy',
  IN_RIDE: 'in_ride',
  BREAK: 'break',
};

// Ride Status Constants
export const RIDE_STATUS = {
  REQUESTED: 'requested',
  ACCEPTED: 'accepted',
  DRIVER_ARRIVED: 'driver_arrived',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
};

// Vehicle Types
export const VEHICLE_TYPES = {
  SEDAN: 'sedan',
  SUV: 'suv',
  HATCHBACK: 'hatchback',
  LUXURY: 'luxury',
  VAN: 'van',
  BIKE: 'bike',
  AUTO: 'auto',
};

// Payment Methods
export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  WALLET: 'wallet',
  UPI: 'upi',
};

// Location Constants
export const LOCATION_CONFIG = {
  defaultZoom: 15,
  locationUpdateInterval: 5000, // 5 seconds
  maxLocationAge: 30000, // 30 seconds
  enableHighAccuracy: true,
  timeout: 10000, // 10 seconds
};

// Navigation Constants
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  EARNINGS: '/earnings',
  HISTORY: '/history',
  SETTINGS: '/settings',
  SUPPORT: '/support',
  DOCUMENTS: '/documents',
  RIDE: '/ride/:id',
};

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  VERIFY: '/auth/verify',
  
  // Driver
  PROFILE: '/driver/profile',
  STATUS: '/driver/status',
  LOCATION: '/driver/location',
  DOCUMENTS: '/driver/documents',
  VEHICLE: '/driver/vehicle',
  
  // Rides
  RIDES: '/rides',
  RIDE_ACCEPT: '/rides/:id/accept',
  RIDE_START: '/rides/:id/start',
  RIDE_COMPLETE: '/rides/:id/complete',
  RIDE_CANCEL: '/rides/:id/cancel',
  
  // Earnings
  EARNINGS: '/earnings',
  EARNINGS_SUMMARY: '/earnings/summary',
  PAYOUTS: '/earnings/payouts',
  
  // Support
  SUPPORT: '/support',
  TICKETS: '/support/tickets',
  
  // Notifications
  NOTIFICATIONS: '/notifications',
};

// WebSocket Events
export const WEBSOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  RIDE_REQUEST: 'ride_request',
  RIDE_CANCELLED: 'ride_cancelled',
  LOCATION_UPDATE: 'location_update',
  STATUS_UPDATE: 'status_update',
  MESSAGE: 'message',
  NOTIFICATION: 'notification',
};

// Notification Types
export const NOTIFICATION_TYPES = {
  RIDE_REQUEST: 'ride_request',
  RIDE_CANCELLED: 'ride_cancelled',
  RIDE_COMPLETED: 'ride_completed',
  PAYMENT_RECEIVED: 'payment_received',
  DOCUMENT_EXPIRED: 'document_expired',
  SYSTEM_UPDATE: 'system_update',
  PROMOTION: 'promotion',
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  LOCATION_DENIED: 'Location access is required to use this app.',
  LOCATION_UNAVAILABLE: 'Unable to get your location. Please try again.',
  SESSION_EXPIRED: 'Your session has expired. Please login again.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  RIDE_NOT_FOUND: 'Ride not found.',
  DRIVER_NOT_AVAILABLE: 'Driver not available for rides.',
  GENERIC_ERROR: 'Something went wrong. Please try again.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  RIDE_ACCEPTED: 'Ride accepted successfully!',
  RIDE_STARTED: 'Ride started!',
  RIDE_COMPLETED: 'Ride completed successfully!',
  STATUS_UPDATED: 'Status updated!',
  DOCUMENT_UPLOADED: 'Document uploaded successfully!',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'ridedriver_access_token',
  REFRESH_TOKEN: 'ridedriver_refresh_token',
  DRIVER_DATA: 'ridedriver_driver_data',
  USER_PREFERENCES: 'ridedriver_preferences',
  RIDE_HISTORY: 'ridedriver_ride_history',
  LOCATION_CACHE: 'ridedriver_location_cache',
};

// Currency and Formatting
export const CURRENCY_CONFIG = {
  default: 'USD',
  symbol: '$',
  precision: 2,
  position: 'before', // 'before' or 'after'
};

// Distance and Units
export const DISTANCE_CONFIG = {
  unit: 'miles', // 'miles' or 'km'
  precision: 1,
};

// Time Constants
export const TIME_CONFIG = {
  formats: {
    short: 'HH:mm',
    long: 'HH:mm:ss',
    date: 'yyyy-MM-dd',
    datetime: 'yyyy-MM-dd HH:mm',
    relative: 'relative',
  },
};

// Feature Flags
export const FEATURES = {
  NOTIFICATIONS: process.env.REACT_APP_ENABLE_NOTIFICATIONS === 'true',
  OFFLINE_MODE: process.env.REACT_APP_ENABLE_OFFLINE_MODE === 'true',
  ANALYTICS: process.env.REACT_APP_ENABLE_ANALYTICS === 'true',
  BETA_FEATURES: process.env.REACT_APP_ENABLE_BETA_FEATURES === 'true',
  DEBUG_MODE: process.env.REACT_APP_DEBUG_MODE === 'true',
};

// Theme Constants
export const THEME = {
  colors: {
    primary: process.env.REACT_APP_PRIMARY_COLOR || '#2563eb',
    secondary: process.env.REACT_APP_SECONDARY_COLOR || '#10b981',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
};

// Performance Constants
export const PERFORMANCE = {
  debounceDelay: 300,
  throttleDelay: 100,
  apiTimeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
};

// Validation Constants
export const VALIDATION = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s-()]+$/,
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSymbols: false,
  },
  license: /^[A-Z0-9-]{5,20}$/,
};

// Document Types
export const DOCUMENT_TYPES = {
  LICENSE: 'drivers_license',
  INSURANCE: 'insurance',
  REGISTRATION: 'registration',
  PHOTO: 'photo',
  BACKGROUND_CHECK: 'background_check',
};

// Support Categories
export const SUPPORT_CATEGORIES = {
  ACCOUNT: 'account',
  RIDES: 'rides',
  PAYMENTS: 'payments',
  TECHNICAL: 'technical',
  VEHICLE: 'vehicle',
  OTHER: 'other',
};

export default {
  APP_CONFIG,
  DRIVER_STATUS,
  RIDE_STATUS,
  VEHICLE_TYPES,
  PAYMENT_METHODS,
  LOCATION_CONFIG,
  ROUTES,
  API_ENDPOINTS,
  WEBSOCKET_EVENTS,
  NOTIFICATION_TYPES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  STORAGE_KEYS,
  CURRENCY_CONFIG,
  DISTANCE_CONFIG,
  TIME_CONFIG,
  FEATURES,
  THEME,
  PERFORMANCE,
  VALIDATION,
  DOCUMENT_TYPES,
  SUPPORT_CATEGORIES,
};