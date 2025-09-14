// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3
};

// Socket Configuration
export const SOCKET_CONFIG = {
  URL: process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000',
  RECONNECTION_ATTEMPTS: 5,
  RECONNECTION_DELAY: 1000
};

// Routes
export const ROUTES = {
  HOME: '/home',
  LOGIN: '/login',
  SIGNUP: '/signup',
  OTP_VERIFICATION: '/otp-verification',
  FORGOT_PASSWORD: '/forgot-password',
  BOOKING: '/booking',
  TRACKING: '/tracking',
  RIDES: '/rides',
  PROFILE: '/profile',
  WALLET: '/wallet',
  SETTINGS: '/settings',
  PAYMENT: '/payment',
  RATING: '/rating',
  SUPPORT: '/support'
};

// Ride Status
export const RIDE_STATUS = {
  PENDING: 'pending',
  DRIVER_ASSIGNED: 'driver_assigned',
  DRIVER_ARRIVED: 'driver_arrived',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Payment Methods
export const PAYMENT_METHODS = {
  CASH: 'cash',
  CREDIT_CARD: 'credit_card',
  DEBIT_CARD: 'debit_card',
  DIGITAL_WALLET: 'wallet',
  PAYPAL: 'paypal',
  APPLE_PAY: 'apple_pay',
  GOOGLE_PAY: 'google_pay'
};

// Vehicle Types
export const VEHICLE_TYPES = {
  ECONOMY: {
    id: 'economy',
    name: 'Economy',
    description: 'Affordable rides for everyday trips',
    capacity: 4,
    baseRate: 1.0,
    icon: '🚗'
  },
  STANDARD: {
    id: 'standard',
    name: 'Standard',
    description: 'Comfortable rides with more space',
    capacity: 4,
    baseRate: 1.2,
    icon: '🚙'
  },
  PREMIUM: {
    id: 'premium',
    name: 'Premium',
    description: 'High-end vehicles for special occasions',
    capacity: 4,
    baseRate: 1.8,
    icon: '🚘'
  },
  SUV: {
    id: 'suv',
    name: 'SUV',
    description: 'Extra space for groups and luggage',
    capacity: 6,
    baseRate: 1.5,
    icon: '🚐'
  },
  LUXURY: {
    id: 'luxury',
    name: 'Luxury',
    description: 'Premium experience with luxury vehicles',
    capacity: 4,
    baseRate: 2.5,
    icon: '🏎️'
  }
};

// Map Configuration
export const MAP_CONFIG = {
  DEFAULT_ZOOM: 15,
  MIN_ZOOM: 10,
  MAX_ZOOM: 20,
  DEFAULT_CENTER: {
    lat: 40.7128,
    lng: -74.0060
  },
  MARKER_COLORS: {
    PICKUP: '#22c55e',
    DESTINATION: '#ef4444',
    DRIVER: '#3b82f6',
    USER: '#8b5cf6'
  }
};

// Location Types
export const LOCATION_TYPES = {
  HOME: 'home',
  WORK: 'work',
  SAVED: 'saved',
  RECENT: 'recent',
  CURRENT: 'current'
};

// Notification Types
export const NOTIFICATION_TYPES = {
  RIDE_ACCEPTED: 'ride_accepted',
  DRIVER_ASSIGNED: 'driver_assigned',
  DRIVER_ARRIVED: 'driver_arrived',
  RIDE_STARTED: 'ride_started',
  RIDE_COMPLETED: 'ride_completed',
  RIDE_CANCELLED: 'ride_cancelled',
  PAYMENT_COMPLETED: 'payment_completed',
  PROMOTIONAL_OFFER: 'promotional_offer',
  SYSTEM_UPDATE: 'system_update'
};

// Emergency Types
export const EMERGENCY_TYPES = {
  ACCIDENT: 'accident',
  MEDICAL: 'medical',
  SAFETY_CONCERN: 'safety_concern',
  VEHICLE_BREAKDOWN: 'vehicle_breakdown',
  OTHER: 'other'
};

// Time Ranges
export const TIME_RANGES = {
  NOW: 'now',
  SCHEDULE_15MIN: '15min',
  SCHEDULE_30MIN: '30min',
  SCHEDULE_1HOUR: '1hour',
  CUSTOM: 'custom'
};

// Rating System
export const RATING_SYSTEM = {
  MIN_RATING: 1,
  MAX_RATING: 5,
  RATING_LABELS: {
    1: 'Terrible',
    2: 'Bad',
    3: 'Okay',
    4: 'Good',
    5: 'Excellent'
  }
};

// Fare Calculation
export const FARE_CONFIG = {
  BASE_FARE: {
    economy: 3.00,
    standard: 3.50,
    premium: 5.00,
    suv: 4.00,
    luxury: 8.00
  },
  PER_KM_RATE: {
    economy: 1.20,
    standard: 1.50,
    premium: 2.00,
    suv: 1.80,
    luxury: 3.00
  },
  PER_MINUTE_RATE: {
    economy: 0.25,
    standard: 0.30,
    premium: 0.40,
    suv: 0.35,
    luxury: 0.60
  },
  SURGE_MULTIPLIERS: [1.0, 1.2, 1.5, 1.8, 2.0, 2.5],
  MIN_FARE: 5.00,
  CANCELLATION_FEE: 3.50,
  TIP_PERCENTAGES: [0, 10, 15, 18, 20, 25],
  BOOKING_FEE: 1.50
};

// App Settings
export const APP_SETTINGS = {
  LANGUAGES: [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' }
  ],
  CURRENCIES: [
    { code: 'USD', symbol: ', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'CAD', symbol: 'C, name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A, name: 'Australian Dollar' },
    { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' }
  ],
  DISTANCE_UNITS: [
    { code: 'metric', name: 'Kilometers', symbol: 'km' },
    { code: 'imperial', name: 'Miles', symbol: 'mi' }
  ]
};

// Business Rules
export const BUSINESS_RULES = {
  MAX_PICKUP_RADIUS: 50, // km
  MAX_DESTINATION_RADIUS: 200, // km
  MIN_RIDE_DISTANCE: 0.5, // km
  MAX_RIDE_DISTANCE: 500, // km
  CANCELLATION_WINDOW: 5, // minutes
  DRIVER_ARRIVAL_TIMEOUT: 15, // minutes
  RATING_REQUIRED_THRESHOLD: 3.0,
  MAX_PASSENGERS: {
    economy: 4,
    standard: 4,
    premium: 4,
    suv: 6,
    luxury: 4
  }
};

// Socket Events
export const SOCKET_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  
  // Customer Events
  CUSTOMER_ONLINE: 'customer_online',
  CUSTOMER_OFFLINE: 'customer_offline',
  
  // Ride Events
  REQUEST_RIDE: 'request_ride',
  CANCEL_RIDE: 'cancel_ride',
  RIDE_ACCEPTED: 'ride_accepted',
  DRIVER_ASSIGNED: 'driver_assigned',
  DRIVER_ARRIVED: 'driver_arrived',
  RIDE_STARTED: 'ride_started',
  RIDE_COMPLETED: 'ride_completed',
  RIDE_CANCELLED: 'ride_cancelled',
  
  // Location Events
  CUSTOMER_LOCATION_UPDATE: 'customer_location_update',
  DRIVER_LOCATION_UPDATE: 'driver_location_update',
  START_LOCATION_SHARING: 'start_location_sharing',
  STOP_LOCATION_SHARING: 'stop_location_sharing',
  
  // Communication
  CUSTOMER_MESSAGE: 'customer_message',
  DRIVER_MESSAGE: 'driver_message',
  
  // Notifications
  NOTIFICATION: 'notification',
  ADMIN_NOTIFICATION: 'admin_notification',
  PROMOTIONAL_OFFER: 'promotional_offer',
  
  // Emergency
  EMERGENCY_ALERT: 'emergency_alert',
  EMERGENCY_RESPONSE: 'emergency_response',
  
  // Payments
  FARE_UPDATED: 'fare_updated',
  PAYMENT_COMPLETED: 'payment_completed',
  
  // Ratings
  RATE_DRIVER: 'rate_driver'
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
  SERVER_ERROR: 'Server error occurred. Please try again later.',
  AUTHENTICATION_ERROR: 'Authentication failed. Please login again.',
  LOCATION_ERROR: 'Unable to get your location. Please enable location services.',
  PAYMENT_ERROR: 'Payment failed. Please check your payment method.',
  RIDE_REQUEST_ERROR: 'Failed to request ride. Please try again.',
  NO_DRIVERS_AVAILABLE: 'No drivers available in your area. Please try again later.',
  INVALID_PICKUP: 'Invalid pickup location. Please select a valid address.',
  INVALID_DESTINATION: 'Invalid destination. Please select a valid address.',
  SAME_LOCATION: 'Pickup and destination cannot be the same.',
  DISTANCE_TOO_SHORT: 'Trip distance is too short. Minimum distance is 0.5 km.',
  DISTANCE_TOO_LONG: 'Trip distance is too long. Maximum distance is 500 km.',
  CANCELLATION_NOT_ALLOWED: 'Cancellation is not allowed at this time.',
  RATING_REQUIRED: 'Please provide a rating for your trip.',
  INVALID_PHONE: 'Please enter a valid phone number.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  WEAK_PASSWORD: 'Password must be at least 8 characters long.',
  OTP_EXPIRED: 'OTP has expired. Please request a new one.',
  INVALID_OTP: 'Invalid OTP. Please try again.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  RIDE_REQUESTED: 'Ride requested successfully! Looking for drivers...',
  RIDE_CANCELLED: 'Ride cancelled successfully.',
  PAYMENT_COMPLETED: 'Payment completed successfully.',
  RATING_SUBMITTED: 'Thank you for your feedback!',
  PROFILE_UPDATED: 'Profile updated successfully.',
  PASSWORD_CHANGED: 'Password changed successfully.',
  OTP_SENT: 'OTP sent successfully.',
  VERIFICATION_COMPLETED: 'Verification completed successfully.',
  REGISTRATION_COMPLETED: 'Registration completed successfully!'
};

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'customer_token',
  USER_DATA: 'customer_user',
  REFRESH_TOKEN: 'customer_refresh_token',
  RECENT_LOCATIONS: 'recent_locations',
  SAVED_PLACES: 'saved_places',
  APP_SETTINGS: 'app_settings',
  NOTIFICATION_SETTINGS: 'notification_settings',
  RIDE_HISTORY: 'ride_history_cache',
  PAYMENT_METHODS: 'payment_methods_cache'
};

// Third-party Services
export const THIRD_PARTY_SERVICES = {
  GOOGLE_MAPS_API_KEY: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  FACEBOOK_APP_ID: process.env.REACT_APP_FACEBOOK_APP_ID,
  GOOGLE_CLIENT_ID: process.env.REACT_APP_GOOGLE_CLIENT_ID,
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

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_DARK_MODE: process.env.REACT_APP_ENABLE_DARK_MODE === 'true',
  ENABLE_REAL_TIME_TRACKING: process.env.REACT_APP_ENABLE_REAL_TIME_TRACKING !== 'false',
  ENABLE_CHAT: process.env.REACT_APP_ENABLE_CHAT !== 'false',
  ENABLE_SCHEDULING: process.env.REACT_APP_ENABLE_SCHEDULING !== 'false',
  ENABLE_MULTI_STOPS: process.env.REACT_APP_ENABLE_MULTI_STOPS === 'true',
  ENABLE_CARPOOLING: process.env.REACT_APP_ENABLE_CARPOOLING === 'true',
  ENABLE_VOICE_COMMANDS: process.env.REACT_APP_ENABLE_VOICE_COMMANDS === 'true'
};

// Regular Expressions
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s\-\(\)]{10,}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  OTP: /^\d{6}$/,
  POSTAL_CODE: /^\d{5}(-\d{4})?$/,
  COORDINATES: /^-?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*-?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/
};

// Animation Durations (in milliseconds)
export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  EXTRA_SLOW: 1000
};

// Geolocation Options
export const GEOLOCATION_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 60000
};

// Push Notification Categories
export const NOTIFICATION_CATEGORIES = {
  RIDE_UPDATES: 'ride_updates',
  PROMOTIONS: 'promotions',
  SYSTEM_ALERTS: 'system_alerts',
  CHAT_MESSAGES: 'chat_messages',
  EMERGENCY: 'emergency'
};

// Default Values
export const DEFAULTS = {
  LANGUAGE: 'en',
  CURRENCY: 'USD',
  DISTANCE_UNIT: 'metric',
  VEHICLE_TYPE: 'economy',
  TIP_PERCENTAGE: 15,
  NOTIFICATION_SETTINGS: {
    push: true,
    email: false,
    sms: true,
    rideUpdates: true,
    promotions: false
  },
  MAP_ZOOM: 15,
  SEARCH_RADIUS: 10 // km
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

export default {
  API_CONFIG,
  SOCKET_CONFIG,
  ROUTES,
  RIDE_STATUS,
  PAYMENT_METHODS,
  VEHICLE_TYPES,
  MAP_CONFIG,
  LOCATION_TYPES,
  NOTIFICATION_TYPES,
  EMERGENCY_TYPES,
  TIME_RANGES,
  RATING_SYSTEM,
  FARE_CONFIG,
  APP_SETTINGS,
  BUSINESS_RULES,
  SOCKET_EVENTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  STORAGE_KEYS,
  THIRD_PARTY_SERVICES,
  FEATURE_FLAGS,
  REGEX_PATTERNS,
  ANIMATION_DURATIONS,
  GEOLOCATION_OPTIONS,
  NOTIFICATION_CATEGORIES,
  DEFAULTS,
  HTTP_STATUS
};