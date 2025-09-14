/**
 * Application constants and configuration
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
};

// Socket Configuration
export const SOCKET_CONFIG = {
  URL: process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000',
  RECONNECTION_ATTEMPTS: 5,
  RECONNECTION_DELAY: 1000,
  TIMEOUT: 20000
};

// Application Routes
export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  RIDES: '/rides',
  DRIVERS: '/drivers',
  CUSTOMERS: '/customers',
  ANALYTICS: '/analytics',
  SETTINGS: '/settings',
  NOTIFICATIONS: '/notifications',
  FINANCE: '/finance',
  REPORTS: '/reports'
};

// User Roles
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  SUPPORT: 'support'
};

// Permissions
export const PERMISSIONS = {
  VIEW_DASHBOARD: 'view_dashboard',
  MANAGE_RIDES: 'manage_rides',
  MANAGE_DRIVERS: 'manage_drivers',
  MANAGE_CUSTOMERS: 'manage_customers',
  VIEW_ANALYTICS: 'view_analytics',
  MANAGE_FINANCE: 'manage_finance',
  SYSTEM_SETTINGS: 'system_settings',
  USER_MANAGEMENT: 'user_management',
  EXPORT_DATA: 'export_data'
};

// Ride Status
export const RIDE_STATUS = {
  PENDING: 'pending',
  DRIVER_ASSIGNED: 'driver_assigned',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Driver Status
export const DRIVER_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  BUSY: 'busy',
  SUSPENDED: 'suspended',
  PENDING_APPROVAL: 'pending_approval'
};

// Customer Status
export const CUSTOMER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  BANNED: 'banned'
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  CANCELLED: 'cancelled'
};

// Payment Methods
export const PAYMENT_METHODS = {
  CASH: 'cash',
  CREDIT_CARD: 'credit_card',
  DEBIT_CARD: 'debit_card',
  PAYPAL: 'paypal',
  APPLE_PAY: 'apple_pay',
  GOOGLE_PAY: 'google_pay',
  WALLET: 'wallet'
};

// Vehicle Types
export const VEHICLE_TYPES = {
  ECONOMY: 'economy',
  STANDARD: 'standard',
  PREMIUM: 'premium',
  LUXURY: 'luxury',
  SUV: 'suv',
  VAN: 'van'
};

// Document Types
export const DOCUMENT_TYPES = {
  DRIVERS_LICENSE: 'drivers_license',
  VEHICLE_REGISTRATION: 'vehicle_registration',
  INSURANCE: 'insurance',
  BACKGROUND_CHECK: 'background_check',
  PROFILE_PHOTO: 'profile_photo',
  VEHICLE_PHOTO: 'vehicle_photo'
};

// Document Status
export const DOCUMENT_STATUS = {
  PENDING: 'pending',
  UNDER_REVIEW: 'under_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  EXPIRED: 'expired'
};

// Notification Types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Time Ranges
export const TIME_RANGES = {
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  THIS_WEEK: 'this_week',
  LAST_WEEK: 'last_week',
  THIS_MONTH: 'this_month',
  LAST_MONTH: 'last_month',
  THIS_QUARTER: 'this_quarter',
  LAST_QUARTER: 'last_quarter',
  THIS_YEAR: 'this_year',
  LAST_YEAR: 'last_year',
  CUSTOM: 'custom'
};

// Chart Colors
export const CHART_COLORS = {
  PRIMARY: '#3B82F6',
  SECONDARY: '#10B981',
  WARNING: '#F59E0B',
  DANGER: '#EF4444',
  INFO: '#6366F1',
  SUCCESS: '#10B981',
  PURPLE: '#8B5CF6',
  PINK: '#EC4899',
  TEAL: '#14B8A6',
  ORANGE: '#F97316',
  LIME: '#84CC16'
};

// Data Export Formats
export const EXPORT_FORMATS = {
  CSV: 'csv',
  EXCEL: 'xlsx',
  PDF: 'pdf',
  JSON: 'json'
};

// File Upload
export const FILE_CONFIG = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: {
    IMAGES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    SPREADSHEETS: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv']
  }
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  MAX_PAGE_SIZE: 200
};

// Status Messages
export const STATUS_MESSAGES = {
  LOADING: 'Loading...',
  NO_DATA: 'No data available',
  ERROR: 'Something went wrong',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SESSION_EXPIRED: 'Your session has expired. Please login again.',
  SUCCESS: 'Operation completed successfully',
  SAVED: 'Changes saved successfully',
  DELETED: 'Item deleted successfully',
  UPDATED: 'Item updated successfully',
  CREATED: 'Item created successfully'
};

// Socket Events
export const SOCKET_EVENTS = {
  // Connection events
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  RECONNECT: 'reconnect',
  CONNECT_ERROR: 'connect_error',
  
  // Ride events
  RIDE_CREATED: 'ride_created',
  RIDE_UPDATED: 'ride_updated',
  RIDE_CANCELLED: 'ride_cancelled',
  RIDE_COMPLETED: 'ride_completed',
  
  // Driver events
  DRIVER_ONLINE: 'driver_online',
  DRIVER_OFFLINE: 'driver_offline',
  DRIVER_LOCATION_UPDATE: 'driver_location_update',
  DRIVER_STATUS_UPDATE: 'driver_status_update',
  
  // Customer events
  CUSTOMER_REGISTERED: 'customer_registered',
  CUSTOMER_STATUS_UPDATE: 'customer_status_update',
  
  // Payment events
  PAYMENT_COMPLETED: 'payment_completed',
  PAYMENT_FAILED: 'payment_failed',
  
  // System events
  SYSTEM_ALERT: 'system_alert',
  STATS_UPDATE: 'stats_update',
  EMERGENCY_ALERT: 'emergency_alert',
  
  // Admin events
  ADMIN_BROADCAST_DRIVERS: 'admin_broadcast_drivers',
  ADMIN_BROADCAST_CUSTOMERS: 'admin_broadcast_customers',
  ADMIN_NOTIFY_DRIVER: 'admin_notify_driver',
  ADMIN_NOTIFY_CUSTOMER: 'admin_notify_customer',
  ADMIN_CANCEL_RIDE: 'admin_cancel_ride',
  ADMIN_FORCE_DRIVER_OFFLINE: 'admin_force_driver_offline'
};

// Regular Expressions
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s\-\(\)]{10,}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  LICENSE_PLATE: /^[A-Z0-9]{2,10}$/i,
  POSTAL_CODE: /^\d{5}(-\d{4})?$/,
  COORDINATES: /^-?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*-?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/
};

// Map Configuration
export const MAP_CONFIG = {
  DEFAULT_ZOOM: 13,
  MIN_ZOOM: 3,
  MAX_ZOOM: 20,
  DEFAULT_CENTER: {
    lat: 40.7128,
    lng: -74.0060
  },
  MARKER_COLORS: {
    CUSTOMER: '#3B82F6',
    DRIVER_AVAILABLE: '#10B981',
    DRIVER_BUSY: '#F59E0B',
    PICKUP: '#10B981',
    DESTINATION: '#EF4444'
  }
};

// Business Rules
export const BUSINESS_RULES = {
  MIN_RIDE_DISTANCE: 0.5, // km
  MAX_RIDE_DISTANCE: 100, // km
  MIN_FARE: 5.00, // USD
  MAX_FARE: 500.00, // USD
  SURGE_MULTIPLIER_MAX: 5.0,
  DRIVER_RATING_MIN: 1.0,
  DRIVER_RATING_MAX: 5.0,
  CUSTOMER_RATING_MIN: 1.0,
  CUSTOMER_RATING_MAX: 5.0,
  MAX_PICKUP_TIME: 15, // minutes
  MAX_RIDE_TIME: 240, // minutes (4 hours)
  CANCELLATION_WINDOW: 5 // minutes
};

// Error Codes
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  SERVER_ERROR: 'SERVER_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR'
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504
};

// Feature Flags
export const FEATURE_FLAGS = {
  DARK_MODE: process.env.REACT_APP_DARK_MODE === 'true',
  ANALYTICS_ADVANCED: process.env.REACT_APP_ANALYTICS_ADVANCED === 'true',
  REAL_TIME_TRACKING: process.env.REACT_APP_REAL_TIME_TRACKING === 'true',
  EXPORT_FUNCTIONALITY: process.env.REACT_APP_EXPORT_FUNCTIONALITY === 'true',
  MULTI_LANGUAGE: process.env.REACT_APP_MULTI_LANGUAGE === 'true',
  PUSH_NOTIFICATIONS: process.env.REACT_APP_PUSH_NOTIFICATIONS === 'true'
};

// Environment
export const ENVIRONMENT = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_STAGING: process.env.NODE_ENV === 'staging',
  API_VERSION: process.env.REACT_APP_API_VERSION || 'v1'
};

// Third-party Services
export const SERVICES = {
  GOOGLE_MAPS_API_KEY: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  STRIPE_PUBLISHABLE_KEY: process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY,
  FIREBASE_CONFIG: {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID
  }
};

// Breakpoints (matching Tailwind CSS)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536
};

// Animation Durations
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  EXTRA_SLOW: 1000
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'admin_token',
  USER_DATA: 'admin_user',
  THEME: 'admin_theme',
  SIDEBAR_COLLAPSED: 'admin_sidebar_collapsed',
  LANGUAGE: 'admin_language',
  PREFERENCES: 'admin_preferences',
  FILTERS: 'admin_filters',
  SORT_PREFERENCES: 'admin_sort_preferences'
};

// Analytics Events
export const ANALYTICS_EVENTS = {
  PAGE_VIEW: 'page_view',
  BUTTON_CLICK: 'button_click',
  FORM_SUBMIT: 'form_submit',
  SEARCH: 'search',
  FILTER_APPLIED: 'filter_applied',
  EXPORT_DATA: 'export_data',
  USER_ACTION: 'user_action',
  ERROR_OCCURRED: 'error_occurred'
};

// Default Values
export const DEFAULTS = {
  PAGE_SIZE: 20,
  CURRENCY: 'USD',
  LANGUAGE: 'en',
  TIMEZONE: 'UTC',
  DATE_FORMAT: 'MM/dd/yyyy',
  TIME_FORMAT: 'hh:mm a',
  DECIMAL_PLACES: 2
};

export default {
  API_CONFIG,
  SOCKET_CONFIG,
  ROUTES,
  USER_ROLES,
  PERMISSIONS,
  RIDE_STATUS,
  DRIVER_STATUS,
  CUSTOMER_STATUS,
  PAYMENT_STATUS,
  PAYMENT_METHODS,
  VEHICLE_TYPES,
  DOCUMENT_TYPES,
  DOCUMENT_STATUS,
  NOTIFICATION_TYPES,
  TIME_RANGES,
  CHART_COLORS,
  EXPORT_FORMATS,
  FILE_CONFIG,
  PAGINATION,
  STATUS_MESSAGES,
  SOCKET_EVENTS,
  REGEX_PATTERNS,
  MAP_CONFIG,
  BUSINESS_RULES,
  ERROR_CODES,
  HTTP_STATUS,
  FEATURE_FLAGS,
  ENVIRONMENT,
  SERVICES,
  BREAKPOINTS,
  ANIMATION_DURATION,
  STORAGE_KEYS,
  ANALYTICS_EVENTS,
  DEFAULTS
};