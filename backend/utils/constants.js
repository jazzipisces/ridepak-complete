/**
 * Application Constants
 * Centralized configuration and constant values for the ride hailing app
 */

// =====================================================
// USER & AUTHENTICATION CONSTANTS
// =====================================================

const USER_TYPES = {
  PASSENGER: 'passenger',
  DRIVER: 'driver',
  ADMIN: 'admin'
};

const USER_ROLES = {
  USER: 'user',
  DRIVER: 'driver',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin'
};

const USER_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  BANNED: 'banned',
  DELETED: 'deleted'
};

const VERIFICATION_STATUS = {
  PENDING: 'pending',
  UNDER_REVIEW: 'under_review',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
  EXPIRED: 'expired'
};

// =====================================================
// RIDE CONSTANTS
// =====================================================

const RIDE_STATUS = {
  REQUESTED: 'requested',
  ACCEPTED: 'accepted',
  DRIVER_ASSIGNED: 'driver_assigned',
  DRIVER_ARRIVED: 'driver_arrived',
  STARTED: 'started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  CANCELLED_BY_DRIVER: 'cancelled_by_driver',
  CANCELLED_BY_PASSENGER: 'cancelled_by_passenger',
  NO_SHOW: 'no_show'
};

const RIDE_TYPES = {
  ECONOMY: 'economy',
  STANDARD: 'standard',
  PREMIUM: 'premium',
  LUXURY: 'luxury',
  SHARED: 'shared',
  XL: 'xl'
};

const CANCELLATION_REASONS = {
  PASSENGER: {
    CHANGED_MIND: 'changed_mind',
    DRIVER_TOO_FAR: 'driver_too_far',
    DRIVER_DELAYED: 'driver_delayed',
    FOUND_ALTERNATIVE: 'found_alternative',
    EMERGENCY: 'emergency',
    OTHER: 'other'
  },
  DRIVER: {
    PASSENGER_NO_SHOW: 'passenger_no_show',
    UNSAFE_LOCATION: 'unsafe_location',
    VEHICLE_ISSUE: 'vehicle_issue',
    EMERGENCY: 'emergency',
    TRAFFIC: 'traffic',
    OTHER: 'other'
  }
};

// =====================================================
// VEHICLE CONSTANTS
// =====================================================

const VEHICLE_TYPES = {
  SEDAN: 'sedan',
  SUV: 'suv',
  HATCHBACK: 'hatchback',
  VAN: 'van',
  TRUCK: 'truck',
  MOTORCYCLE: 'motorcycle',
  BICYCLE: 'bicycle'
};

const VEHICLE_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  MAINTENANCE: 'maintenance',
  INSPECTION_DUE: 'inspection_due',
  SUSPENDED: 'suspended'
};

const FUEL_TYPES = {
  GASOLINE: 'gasoline',
  DIESEL: 'diesel',
  ELECTRIC: 'electric',
  HYBRID: 'hybrid',
  CNG: 'cng',
  LPG: 'lpg'
};

// =====================================================
// DRIVER CONSTANTS
// =====================================================

const DRIVER_STATUS = {
  OFFLINE: 'offline',
  ONLINE: 'online',
  BUSY: 'busy',
  ON_RIDE: 'on_ride',
  BREAK: 'break',
  UNAVAILABLE: 'unavailable'
};

const DRIVER_AVAILABILITY = {
  AVAILABLE: 'available',
  BUSY: 'busy',
  OFFLINE: 'offline'
};

const DOCUMENT_TYPES = {
  DRIVING_LICENSE: 'driving_license',
  VEHICLE_REGISTRATION: 'vehicle_registration',
  INSURANCE: 'insurance',
  BACKGROUND_CHECK: 'background_check',
  PROFILE_PHOTO: 'profile_photo',
  VEHICLE_PHOTO: 'vehicle_photo',
  IDENTITY_CARD: 'identity_card'
};

// =====================================================
// PAYMENT CONSTANTS
// =====================================================

const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
  PARTIALLY_REFUNDED: 'partially_refunded'
};

const PAYMENT_METHODS = {
  CASH: 'cash',
  CREDIT_CARD: 'credit_card',
  DEBIT_CARD: 'debit_card',
  PAYPAL: 'paypal',
  STRIPE: 'stripe',
  WALLET: 'wallet',
  APPLE_PAY: 'apple_pay',
  GOOGLE_PAY: 'google_pay',
  BANK_TRANSFER: 'bank_transfer'
};

const PAYMENT_TYPES = {
  RIDE_FARE: 'ride_fare',
  TIP: 'tip',
  CANCELLATION_FEE: 'cancellation_fee',
  CLEANING_FEE: 'cleaning_fee',
  TOLL_FEE: 'toll_fee',
  AIRPORT_FEE: 'airport_fee',
  SURGE_FEE: 'surge_fee'
};

const REFUND_REASONS = {
  DRIVER_CANCELLED: 'driver_cancelled',
  SERVICE_ISSUE: 'service_issue',
  OVERCHARGED: 'overcharged',
  POOR_SERVICE: 'poor_service',
  SAFETY_CONCERN: 'safety_concern',
  APP_ERROR: 'app_error',
  OTHER: 'other'
};

// =====================================================
// NOTIFICATION CONSTANTS
// =====================================================

const NOTIFICATION_TYPES = {
  RIDE_BOOKED: 'ride_booked',
  RIDE_CANCELLED: 'ride_cancelled',
  DRIVER_ASSIGNED: 'driver_assigned',
  DRIVER_ARRIVED: 'driver_arrived',
  RIDE_STARTED: 'ride_started',
  RIDE_COMPLETED: 'ride_completed',
  PAYMENT_PROCESSED: 'payment_processed',
  PAYMENT_FAILED: 'payment_failed',
  RATING_REQUEST: 'rating_request',
  PROMO_CODE: 'promo_code',
  EMERGENCY_ALERT: 'emergency_alert',
  ACCOUNT_UPDATE: 'account_update',
  VERIFICATION_UPDATE: 'verification_update'
};

const NOTIFICATION_CHANNELS = {
  PUSH: 'push',
  SMS: 'sms',
  EMAIL: 'email',
  IN_APP: 'in_app'
};

const NOTIFICATION_PRIORITIES = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent'
};

// =====================================================
// SUPPORT & HELP CONSTANTS
// =====================================================

const SUPPORT_CATEGORIES = {
  TECHNICAL: 'technical',
  PAYMENT: 'payment',
  SAFETY: 'safety',
  DRIVER_ISSUE: 'driver_issue',
  RIDE_ISSUE: 'ride_issue',
  ACCOUNT: 'account',
  GENERAL: 'general'
};

const TICKET_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  PENDING_USER: 'pending_user',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
  REOPENED: 'reopened'
};

const TICKET_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
  CRITICAL: 'critical'
};

// =====================================================
// RATING & REVIEW CONSTANTS
// =====================================================

const RATING_TYPES = {
  DRIVER_RATING: 'driver_rating',
  PASSENGER_RATING: 'passenger_rating',
  VEHICLE_RATING: 'vehicle_rating',
  SERVICE_RATING: 'service_rating'
};

const RATING_TAGS = {
  POSITIVE: [
    'clean',
    'punctual',
    'friendly',
    'safe_driving',
    'good_music',
    'comfortable',
    'professional',
    'helpful',
    'quiet',
    'smooth_ride'
  ],
  NEGATIVE: [
    'reckless_driving',
    'late',
    'rude',
    'dirty_vehicle',
    'unsafe',
    'loud_music',
    'smoking',
    'poor_navigation',
    'aggressive',
    'unprofessional'
  ]
};

// =====================================================
// LOCATION & TRACKING CONSTANTS
// =====================================================

const LOCATION_TYPES = {
  PICKUP: 'pickup',
  DROPOFF: 'dropoff',
  WAYPOINT: 'waypoint',
  CURRENT: 'current',
  HOME: 'home',
  WORK: 'work',
  FAVORITE: 'favorite'
};

const TRACKING_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PAUSED: 'paused',
  ERROR: 'error'
};

const GEOFENCE_TYPES = {
  PICKUP_ZONE: 'pickup_zone',
  AIRPORT: 'airport',
  RESTRICTED: 'restricted',
  HIGH_DEMAND: 'high_demand',
  NO_PARKING: 'no_parking'
};

// =====================================================
// EMERGENCY CONSTANTS
// =====================================================

const EMERGENCY_TYPES = {
  ACCIDENT: 'accident',
  MEDICAL: 'medical',
  HARASSMENT: 'harassment',
  THEFT: 'theft',
  BREAKDOWN: 'breakdown',
  SAFETY_CONCERN: 'safety_concern',
  OTHER: 'other'
};

const EMERGENCY_STATUS = {
  ACTIVE: 'active',
  RESOLVED: 'resolved',
  FALSE_ALARM: 'false_alarm',
  UNDER_INVESTIGATION: 'under_investigation'
};

// =====================================================
// PRICING & FARE CONSTANTS
// =====================================================

const FARE_TYPES = {
  BASE_FARE: 'base_fare',
  DISTANCE_FARE: 'distance_fare',
  TIME_FARE: 'time_fare',
  SURGE_FARE: 'surge_fare',
  BOOKING_FEE: 'booking_fee',
  CANCELLATION_FEE: 'cancellation_fee',
  CLEANING_FEE: 'cleaning_fee',
  TOLL_FEE: 'toll_fee',
  TIP: 'tip',
  TAX: 'tax',
  DISCOUNT: 'discount'
};

const SURGE_LEVELS = {
  NO_SURGE: 1.0,
  LOW_SURGE: 1.2,
  MEDIUM_SURGE: 1.5,
  HIGH_SURGE: 2.0,
  EXTREME_SURGE: 3.0
};

const CURRENCY_CODES = {
  USD: 'USD',
  EUR: 'EUR',
  GBP: 'GBP',
  CAD: 'CAD',
  AUD: 'AUD',
  INR: 'INR',
  JPY: 'JPY'
};

// =====================================================
// PROMO CODE CONSTANTS
// =====================================================

const PROMO_TYPES = {
  PERCENTAGE: 'percentage',
  FIXED_AMOUNT: 'fixed_amount',
  FREE_RIDE: 'free_ride',
  CASHBACK: 'cashback'
};

const PROMO_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  EXPIRED: 'expired',
  USED: 'used',
  SUSPENDED: 'suspended'
};

const PROMO_APPLIES_TO = {
  FIRST_RIDE: 'first_ride',
  ALL_RIDES: 'all_rides',
  SPECIFIC_ROUTE: 'specific_route',
  MINIMUM_AMOUNT: 'minimum_amount',
  NEW_USER: 'new_user'
};

// =====================================================
// TIME & DATE CONSTANTS
// =====================================================

const TIME_ZONES = {
  UTC: 'UTC',
  EST: 'America/New_York',
  PST: 'America/Los_Angeles',
  CST: 'America/Chicago',
  MST: 'America/Denver',
  GMT: 'Europe/London',
  CET: 'Europe/Paris'
};

const DATE_FORMATS = {
  SHORT_DATE: 'MM/DD/YYYY',
  LONG_DATE: 'MMMM Do, YYYY',
  DATE_TIME: 'MM/DD/YYYY HH:mm',
  ISO_DATE: 'YYYY-MM-DD',
  ISO_DATETIME: 'YYYY-MM-DDTHH:mm:ss.sssZ',
  TIME_12H: 'hh:mm A',
  TIME_24H: 'HH:mm'
};

const BUSINESS_HOURS = {
  START: 6, // 6 AM
  END: 23,  // 11 PM
  TIMEZONE: 'America/New_York'
};

// =====================================================
// FILE & UPLOAD CONSTANTS
// =====================================================

const FILE_TYPES = {
  IMAGES: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  DOCUMENTS: ['pdf', 'doc', 'docx', 'txt'],
  VIDEOS: ['mp4', 'avi', 'mov', 'wmv'],
  AUDIO: ['mp3', 'wav', 'aac', 'ogg']
};

const MAX_FILE_SIZES = {
  IMAGE: 5 * 1024 * 1024,    // 5MB
  DOCUMENT: 10 * 1024 * 1024, // 10MB
  VIDEO: 50 * 1024 * 1024,   // 50MB
  AUDIO: 10 * 1024 * 1024    // 10MB
};

const UPLOAD_PATHS = {
  PROFILE_PHOTOS: 'uploads/profiles/',
  VEHICLE_PHOTOS: 'uploads/vehicles/',
  DOCUMENTS: 'uploads/documents/',
  RECEIPTS: 'uploads/receipts/',
  SUPPORT_FILES: 'uploads/support/'
};

// =====================================================
// API & HTTP CONSTANTS
// =====================================================

const HTTP_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
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

const API_VERSIONS = {
  V1: 'v1',
  V2: 'v2',
  CURRENT: 'v1'
};

const REQUEST_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE'
};

// =====================================================
// VALIDATION CONSTANTS
// =====================================================

const VALIDATION_RULES = {
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: true
  },
  OTP: {
    LENGTH: 6,
    EXPIRY_MINUTES: 10,
    MAX_ATTEMPTS: 3
  },
  PHONE: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 15
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50
  },
  ADDRESS: {
    MIN_LENGTH: 5,
    MAX_LENGTH: 200
  }
};

const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^(\+\d{1,3}[- ]?)?\d{10}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  COORDINATES: /^-?([1-8]?\d(\.\d+)?|90(\.0+)?)$/,
  PLATE_NUMBER: /^[A-Z0-9]{2,10}$/,
  PROMO_CODE: /^[A-Z0-9]{3,20}$/,
  RIDE_ID: /^RIDE[A-Z0-9]{8,12}$/
};

// =====================================================
// LIMITS & THRESHOLDS
// =====================================================

const LIMITS = {
  MAX_RIDE_DURATION: 8 * 60 * 60, // 8 hours in seconds
  MAX_RIDE_DISTANCE: 500, // 500 km
  MAX_PASSENGERS: 8,
  MIN_RIDE_AMOUNT: 2.50,
  MAX_TIP_PERCENTAGE: 50,
  MAX_ADVANCE_BOOKING_DAYS: 7,
  MAX_SEARCH_RADIUS: 50, // 50 km
  MAX_DRIVER_IDLE_TIME: 5 * 60, // 5 minutes
  MAX_PICKUP_WAIT_TIME: 15 * 60, // 15 minutes
  MAX_LOGIN_ATTEMPTS: 5,
  SESSION_TIMEOUT: 30 * 60, // 30 minutes
  LOCATION_UPDATE_INTERVAL: 5, // 5 seconds
  MAX_SPEED_ALERT: 120, // 120 km/h
  GEOFENCE_RADIUS: 100 // 100 meters
};

const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
};

// =====================================================
// ERROR CODES
// =====================================================

const ERROR_CODES = {
  // Authentication Errors
  AUTH_TOKEN_MISSING: 'AUTH_TOKEN_MISSING',
  AUTH_TOKEN_INVALID: 'AUTH_TOKEN_INVALID',
  AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  AUTH_INSUFFICIENT_PERMISSIONS: 'AUTH_INSUFFICIENT_PERMISSIONS',
  AUTH_USER_SUSPENDED: 'AUTH_USER_SUSPENDED',
  AUTH_LOGIN_FAILED: 'AUTH_LOGIN_FAILED',
  
  // Validation Errors
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  REQUIRED_FIELD_MISSING: 'REQUIRED_FIELD_MISSING',
  INVALID_FORMAT: 'INVALID_FORMAT',
  VALUE_OUT_OF_RANGE: 'VALUE_OUT_OF_RANGE',
  
  // User Errors
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  USER_ALREADY_EXISTS: 'USER_ALREADY_EXISTS',
  USER_NOT_VERIFIED: 'USER_NOT_VERIFIED',
  
  // Driver Errors
  DRIVER_NOT_FOUND: 'DRIVER_NOT_FOUND',
  DRIVER_NOT_AVAILABLE: 'DRIVER_NOT_AVAILABLE',
  DRIVER_NOT_VERIFIED: 'DRIVER_NOT_VERIFIED',
  DRIVER_ALREADY_ON_RIDE: 'DRIVER_ALREADY_ON_RIDE',
  
  // Ride Errors
  RIDE_NOT_FOUND: 'RIDE_NOT_FOUND',
  RIDE_ALREADY_CANCELLED: 'RIDE_ALREADY_CANCELLED',
  RIDE_ALREADY_COMPLETED: 'RIDE_ALREADY_COMPLETED',
  RIDE_CANNOT_BE_CANCELLED: 'RIDE_CANNOT_BE_CANCELLED',
  NO_DRIVERS_AVAILABLE: 'NO_DRIVERS_AVAILABLE',
  
  // Payment Errors
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PAYMENT_METHOD_INVALID: 'PAYMENT_METHOD_INVALID',
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  REFUND_FAILED: 'REFUND_FAILED',
  
  // Location Errors
  INVALID_COORDINATES: 'INVALID_COORDINATES',
  LOCATION_NOT_FOUND: 'LOCATION_NOT_FOUND',
  OUTSIDE_SERVICE_AREA: 'OUTSIDE_SERVICE_AREA',
  
  // System Errors
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR',
  FILE_UPLOAD_ERROR: 'FILE_UPLOAD_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED'
};

// =====================================================
// SUCCESS MESSAGES
// =====================================================

const SUCCESS_MESSAGES = {
  USER_CREATED: 'User account created successfully',
  USER_UPDATED: 'User profile updated successfully',
  USER_DELETED: 'User account deleted successfully',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  PASSWORD_CHANGED: 'Password changed successfully',
  EMAIL_VERIFIED: 'Email verified successfully',
  PHONE_VERIFIED: 'Phone number verified successfully',
  OTP_SENT: 'OTP sent successfully',
  
  RIDE_BOOKED: 'Ride booked successfully',
  RIDE_CANCELLED: 'Ride cancelled successfully',
  RIDE_COMPLETED: 'Ride completed successfully',
  RIDE_STARTED: 'Ride started successfully',
  
  DRIVER_REGISTERED: 'Driver registration completed',
  DRIVER_VERIFIED: 'Driver verification completed',
  DRIVER_STATUS_UPDATED: 'Driver status updated',
  VEHICLE_ADDED: 'Vehicle added successfully',
  VEHICLE_UPDATED: 'Vehicle information updated',
  
  PAYMENT_PROCESSED: 'Payment processed successfully',
  REFUND_PROCESSED: 'Refund processed successfully',
  PAYMENT_METHOD_ADDED: 'Payment method added successfully',
  
  RATING_SUBMITTED: 'Rating submitted successfully',
  FEEDBACK_SUBMITTED: 'Feedback submitted successfully',
  
  SUPPORT_TICKET_CREATED: 'Support ticket created successfully',
  
  FILE_UPLOADED: 'File uploaded successfully',
  DATA_EXPORTED: 'Data exported successfully'
};

// =====================================================
// CONFIGURATION CONSTANTS
// =====================================================

const CONFIG = {
  APP_NAME: 'RideApp',
  APP_VERSION: '1.0.0',
  API_BASE_URL: process.env.API_BASE_URL || 'https://api.rideapp.com',
  WEB_BASE_URL: process.env.WEB_BASE_URL || 'https://rideapp.com',
  
  // External Services
  GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
  
  // Database
  MONGODB_URI: process.env.MONGODB_URI,
  REDIS_URL: process.env.REDIS_URL,
  
  // Security
  JWT_SECRET: process.env.JWT_SECRET,
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
  
  // Email
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS
};

// =====================================================
// EXPORT ALL CONSTANTS
// =====================================================

module.exports = {
  // User & Auth
  USER_TYPES,
  USER_ROLES,
  USER_STATUS,
  VERIFICATION_STATUS,
  
  // Rides
  RIDE_STATUS,
  RIDE_TYPES,
  CANCELLATION_REASONS,
  
  // Vehicles
  VEHICLE_TYPES,
  VEHICLE_STATUS,
  FUEL_TYPES,
  
  // Drivers
  DRIVER_STATUS,
  DRIVER_AVAILABILITY,
  DOCUMENT_TYPES,
  
  // Payments
  PAYMENT_STATUS,
  PAYMENT_METHODS,
  PAYMENT_TYPES,
  REFUND_REASONS,
  
  // Notifications
  NOTIFICATION_TYPES,
  NOTIFICATION_CHANNELS,
  NOTIFICATION_PRIORITIES,
  
  // Support
  SUPPORT_CATEGORIES,
  TICKET_STATUS,
  TICKET_PRIORITIES,
  
  // Ratings
  RATING_TYPES,
  RATING_TAGS,
  
  // Location
  LOCATION_TYPES,
  TRACKING_STATUS,
  GEOFENCE_TYPES,
  
  // Emergency
  EMERGENCY_TYPES,
  EMERGENCY_STATUS,
  
  // Pricing
  FARE_TYPES,
  SURGE_LEVELS,
  CURRENCY_CODES,
  
  // Promo Codes
  PROMO_TYPES,
  PROMO_STATUS,
  PROMO_APPLIES_TO,
  
  // Time & Date
  TIME_ZONES,
  DATE_FORMATS,
  BUSINESS_HOURS,
  
  // Files
  FILE_TYPES,
  MAX_FILE_SIZES,
  UPLOAD_PATHS,
  
  // API
  HTTP_STATUS_CODES,
  API_VERSIONS,
  REQUEST_METHODS,
  
  // Validation
  VALIDATION_RULES,
  REGEX_PATTERNS,
  
  // Limits
  LIMITS,
  PAGINATION,
  
  // Errors & Messages
  ERROR_CODES,
  SUCCESS_MESSAGES,
  
  // Configuration
  CONFIG
};