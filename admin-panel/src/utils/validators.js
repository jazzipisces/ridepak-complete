/**
 * Validation functions for forms and data
 */

import { REGEX_PATTERNS, BUSINESS_RULES } from './constants';

// Base validation helpers
export const isEmpty = (value) => {
  return value === null || value === undefined || 
         (typeof value === 'string' && value.trim() === '') ||
         (Array.isArray(value) && value.length === 0) ||
         (typeof value === 'object' && Object.keys(value).length === 0);
};

export const isString = (value) => {
  return typeof value === 'string';
};

export const isNumber = (value) => {
  return typeof value === 'number' && !isNaN(value);
};

export const isArray = (value) => {
  return Array.isArray(value);
};

export const isObject = (value) => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

// String validators
export const validateRequired = (value, fieldName = 'Field') => {
  if (isEmpty(value)) {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateMinLength = (value, minLength, fieldName = 'Field') => {
  if (isEmpty(value)) return null; // Let required validator handle empty values
  
  if (value.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters long`;
  }
  return null;
};

export const validateMaxLength = (value, maxLength, fieldName = 'Field') => {
  if (isEmpty(value)) return null;
  
  if (value.length > maxLength) {
    return `${fieldName} must be no more than ${maxLength} characters long`;
  }
  return null;
};

export const validateLength = (value, minLength, maxLength, fieldName = 'Field') => {
  const minError = validateMinLength(value, minLength, fieldName);
  if (minError) return minError;
  
  const maxError = validateMaxLength(value, maxLength, fieldName);
  if (maxError) return maxError;
  
  return null;
};

// Email validation
export const validateEmail = (email, fieldName = 'Email') => {
  if (isEmpty(email)) return null;
  
  if (!REGEX_PATTERNS.EMAIL.test(email)) {
    return `${fieldName} must be a valid email address`;
  }
  return null;
};

// Phone validation
export const validatePhone = (phone, fieldName = 'Phone number') => {
  if (isEmpty(phone)) return null;
  
  if (!REGEX_PATTERNS.PHONE.test(phone)) {
    return `${fieldName} must be a valid phone number`;
  }
  return null;
};

// Password validation
export const validatePassword = (password, fieldName = 'Password') => {
  if (isEmpty(password)) return null;
  
  if (password.length < 8) {
    return `${fieldName} must be at least 8 characters long`;
  }
  
  if (!REGEX_PATTERNS.PASSWORD.test(password)) {
    return `${fieldName} must contain at least one uppercase letter, one lowercase letter, one number, and one special character`;
  }
  
  return null;
};

export const validatePasswordConfirmation = (password, confirmPassword, fieldName = 'Password confirmation') => {
  if (isEmpty(confirmPassword)) return null;
  
  if (password !== confirmPassword) {
    return `${fieldName} must match the password`;
  }
  return null;
};

// Number validators
export const validateNumber = (value, fieldName = 'Field') => {
  if (isEmpty(value)) return null;
  
  const numValue = parseFloat(value);
  if (isNaN(numValue)) {
    return `${fieldName} must be a valid number`;
  }
  return null;
};

export const validateInteger = (value, fieldName = 'Field') => {
  if (isEmpty(value)) return null;
  
  const numValue = parseInt(value);
  if (isNaN(numValue) || !Number.isInteger(numValue)) {
    return `${fieldName} must be a valid integer`;
  }
  return null;
};

export const validateMin = (value, minValue, fieldName = 'Field') => {
  if (isEmpty(value)) return null;
  
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return null; // Let number validator handle this
  
  if (numValue < minValue) {
    return `${fieldName} must be at least ${minValue}`;
  }
  return null;
};

export const validateMax = (value, maxValue, fieldName = 'Field') => {
  if (isEmpty(value)) return null;
  
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return null;
  
  if (numValue > maxValue) {
    return `${fieldName} must be no more than ${maxValue}`;
  }
  return null;
};

export const validateRange = (value, minValue, maxValue, fieldName = 'Field') => {
  const minError = validateMin(value, minValue, fieldName);
  if (minError) return minError;
  
  const maxError = validateMax(value, maxValue, fieldName);
  if (maxError) return maxError;
  
  return null;
};

// Date validators
export const validateDate = (value, fieldName = 'Date') => {
  if (isEmpty(value)) return null;
  
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return `${fieldName} must be a valid date`;
  }
  return null;
};

export const validateFutureDate = (value, fieldName = 'Date') => {
  if (isEmpty(value)) return null;
  
  const dateError = validateDate(value, fieldName);
  if (dateError) return dateError;
  
  const date = new Date(value);
  const now = new Date();
  
  if (date <= now) {
    return `${fieldName} must be in the future`;
  }
  return null;
};

export const validatePastDate = (value, fieldName = 'Date') => {
  if (isEmpty(value)) return null;
  
  const dateError = validateDate(value, fieldName);
  if (dateError) return dateError;
  
  const date = new Date(value);
  const now = new Date();
  
  if (date >= now) {
    return `${fieldName} must be in the past`;
  }
  return null;
};

export const validateDateRange = (startDate, endDate, startFieldName = 'Start date', endFieldName = 'End date') => {
  if (isEmpty(startDate) || isEmpty(endDate)) return null;
  
  const startDateError = validateDate(startDate, startFieldName);
  if (startDateError) return startDateError;
  
  const endDateError = validateDate(endDate, endFieldName);
  if (endDateError) return endDateError;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (start >= end) {
    return `${endFieldName} must be after ${startFieldName.toLowerCase()}`;
  }
  return null;
};

// URL validation
export const validateUrl = (url, fieldName = 'URL') => {
  if (isEmpty(url)) return null;
  
  try {
    new URL(url);
    return null;
  } catch {
    return `${fieldName} must be a valid URL`;
  }
};

// File validation
export const validateFile = (file, allowedTypes = [], maxSize = null, fieldName = 'File') => {
  if (!file) return null;
  
  // Check file type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    const allowedExtensions = allowedTypes.map(type => {
      const extension = type.split('/')[1];
      return extension.toUpperCase();
    }).join(', ');
    
    return `${fieldName} must be one of the following types: ${allowedExtensions}`;
  }
  
  // Check file size
  if (maxSize && file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    return `${fieldName} must be no larger than ${maxSizeMB}MB`;
  }
  
  return null;
};

// Business-specific validators
export const validateRideDistance = (distance, fieldName = 'Ride distance') => {
  if (isEmpty(distance)) return null;
  
  const numError = validateNumber(distance, fieldName);
  if (numError) return numError;
  
  return validateRange(
    distance, 
    BUSINESS_RULES.MIN_RIDE_DISTANCE, 
    BUSINESS_RULES.MAX_RIDE_DISTANCE, 
    fieldName
  );
};

export const validateFare = (fare, fieldName = 'Fare') => {
  if (isEmpty(fare)) return null;
  
  const numError = validateNumber(fare, fieldName);
  if (numError) return numError;
  
  return validateRange(
    fare, 
    BUSINESS_RULES.MIN_FARE, 
    BUSINESS_RULES.MAX_FARE, 
    fieldName
  );
};

export const validateRating = (rating, fieldName = 'Rating') => {
  if (isEmpty(rating)) return null;
  
  const numError = validateNumber(rating, fieldName);
  if (numError) return numError;
  
  return validateRange(
    rating, 
    BUSINESS_RULES.DRIVER_RATING_MIN, 
    BUSINESS_RULES.DRIVER_RATING_MAX, 
    fieldName
  );
};

export const validateLicensePlate = (licensePlate, fieldName = 'License plate') => {
  if (isEmpty(licensePlate)) return null;
  
  if (!REGEX_PATTERNS.LICENSE_PLATE.test(licensePlate)) {
    return `${fieldName} must be a valid license plate number`;
  }
  return null;
};

export const validateCoordinates = (coordinates, fieldName = 'Coordinates') => {
  if (isEmpty(coordinates)) return null;
  
  if (!REGEX_PATTERNS.COORDINATES.test(coordinates)) {
    return `${fieldName} must be valid latitude,longitude coordinates`;
  }
  return null;
};

// Form validation
export const validateForm = (formData, validationRules) => {
  const errors = {};
  
  Object.keys(validationRules).forEach(fieldName => {
    const rules = validationRules[fieldName];
    const value = formData[fieldName];
    
    for (const rule of rules) {
      const error = rule(value, fieldName);
      if (error) {
        errors[fieldName] = error;
        break; // Stop at first error for this field
      }
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Composite validators for common forms
export const validateLoginForm = (formData) => {
  return validateForm(formData, {
    email: [
      (value) => validateRequired(value, 'Email'),
      (value) => validateEmail(value, 'Email')
    ],
    password: [
      (value) => validateRequired(value, 'Password')
    ]
  });
};

export const validateDriverForm = (formData) => {
  return validateForm(formData, {
    name: [
      (value) => validateRequired(value, 'Full name'),
      (value) => validateLength(value, 2, 50, 'Full name')
    ],
    email: [
      (value) => validateRequired(value, 'Email'),
      (value) => validateEmail(value, 'Email')
    ],
    phone: [
      (value) => validateRequired(value, 'Phone number'),
      (value) => validatePhone(value, 'Phone number')
    ],
    licensePlate: [
      (value) => validateRequired(value, 'License plate'),
      (value) => validateLicensePlate(value, 'License plate')
    ]
  });
};

export const validateCustomerForm = (formData) => {
  return validateForm(formData, {
    name: [
      (value) => validateRequired(value, 'Full name'),
      (value) => validateLength(value, 2, 50, 'Full name')
    ],
    email: [
      (value) => validateRequired(value, 'Email'),
      (value) => validateEmail(value, 'Email')
    ],
    phone: [
      (value) => validatePhone(value, 'Phone number')
    ]
  });
};

export const validateRideForm = (formData) => {
  return validateForm(formData, {
    pickupAddress: [
      (value) => validateRequired(value, 'Pickup address')
    ],
    destinationAddress: [
      (value) => validateRequired(value, 'Destination address')
    ],
    fare: [
      (value) => validateRequired(value, 'Fare'),
      (value) => validateFare(value, 'Fare')
    ]
  });
};

export const validateChangePasswordForm = (formData) => {
  return validateForm(formData, {
    currentPassword: [
      (value) => validateRequired(value, 'Current password')
    ],
    newPassword: [
      (value) => validateRequired(value, 'New password'),
      (value) => validatePassword(value, 'New password')
    ],
    confirmPassword: [
      (value) => validateRequired(value, 'Confirm password'),
      (value) => validatePasswordConfirmation(formData.newPassword, value, 'Confirm password')
    ]
  });
};

// Array validators
export const validateArrayMinLength = (array, minLength, fieldName = 'List') => {
  if (!isArray(array)) return `${fieldName} must be an array`;
  
  if (array.length < minLength) {
    return `${fieldName} must have at least ${minLength} item${minLength === 1 ? '' : 's'}`;
  }
  return null;
};

export const validateArrayMaxLength = (array, maxLength, fieldName = 'List') => {
  if (!isArray(array)) return `${fieldName} must be an array`;
  
  if (array.length > maxLength) {
    return `${fieldName} must have no more than ${maxLength} item${maxLength === 1 ? '' : 's'}`;
  }
  return null;
};

export const validateArrayUnique = (array, fieldName = 'List') => {
  if (!isArray(array)) return `${fieldName} must be an array`;
  
  const unique = [...new Set(array)];
  if (unique.length !== array.length) {
    return `${fieldName} must contain unique items only`;
  }
  return null;
};

// Custom validation helpers
export const createValidator = (validationFn, errorMessage) => {
  return (value, fieldName = 'Field') => {
    if (isEmpty(value)) return null;
    
    if (!validationFn(value)) {
      return errorMessage.replace('{field}', fieldName);
    }
    return null;
  };
};

export const createRequiredValidator = (validationFn, errorMessage) => {
  return (value, fieldName = 'Field') => {
    if (isEmpty(value)) {
      return `${fieldName} is required`;
    }
    
    if (!validationFn(value)) {
      return errorMessage.replace('{field}', fieldName);
    }
    return null;
  };
};

// Conditional validators
export const validateIf = (condition, validator) => {
  return (value, fieldName, formData) => {
    if (condition(formData)) {
      return validator(value, fieldName);
    }
    return null;
  };
};

export const validateUnless = (condition, validator) => {
  return (value, fieldName, formData) => {
    if (!condition(formData)) {
      return validator(value, fieldName);
    }
    return null;
  };
};

// Cross-field validation
export const validateFieldMatch = (otherFieldName, errorMessage) => {
  return (value, fieldName, formData) => {
    if (isEmpty(value)) return null;
    
    const otherValue = formData[otherFieldName];
    if (value !== otherValue) {
      return errorMessage || `${fieldName} must match ${otherFieldName}`;
    }
    return null;
  };
};

export const validateFieldDifference = (otherFieldName, errorMessage) => {
  return (value, fieldName, formData) => {
    if (isEmpty(value)) return null;
    
    const otherValue = formData[otherFieldName];
    if (value === otherValue) {
      return errorMessage || `${fieldName} must be different from ${otherFieldName}`;
    }
    return null;
  };
};

// Advanced form validation with cross-field support
export const validateFormAdvanced = (formData, validationRules) => {
  const errors = {};
  
  Object.keys(validationRules).forEach(fieldName => {
    const rules = validationRules[fieldName];
    const value = formData[fieldName];
    
    for (const rule of rules) {
      const error = rule(value, fieldName, formData);
      if (error) {
        errors[fieldName] = error;
        break;
      }
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Real-time validation helpers
export const debounceValidator = (validator, delay = 300) => {
  let timeoutId;
  
  return (value, fieldName, callback) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      const error = validator(value, fieldName);
      callback(error);
    }, delay);
  };
};

// Validation schemas for different entities
export const VALIDATION_SCHEMAS = {
  USER_PROFILE: {
    name: [
      (value) => validateRequired(value, 'Full name'),
      (value) => validateLength(value, 2, 50, 'Full name')
    ],
    email: [
      (value) => validateRequired(value, 'Email'),
      (value) => validateEmail(value, 'Email')
    ],
    phone: [
      (value) => validatePhone(value, 'Phone number')
    ]
  },
  
  DRIVER_REGISTRATION: {
    name: [
      (value) => validateRequired(value, 'Full name'),
      (value) => validateLength(value, 2, 50, 'Full name')
    ],
    email: [
      (value) => validateRequired(value, 'Email'),
      (value) => validateEmail(value, 'Email')
    ],
    phone: [
      (value) => validateRequired(value, 'Phone number'),
      (value) => validatePhone(value, 'Phone number')
    ],
    licensePlate: [
      (value) => validateRequired(value, 'License plate'),
      (value) => validateLicensePlate(value, 'License plate')
    ],
    vehicleYear: [
      (value) => validateRequired(value, 'Vehicle year'),
      (value) => validateInteger(value, 'Vehicle year'),
      (value) => validateRange(value, 2000, new Date().getFullYear() + 1, 'Vehicle year')
    ]
  },
  
  RIDE_REQUEST: {
    pickupAddress: [
      (value) => validateRequired(value, 'Pickup address'),
      (value) => validateLength(value, 5, 200, 'Pickup address')
    ],
    destinationAddress: [
      (value) => validateRequired(value, 'Destination address'),
      (value) => validateLength(value, 5, 200, 'Destination address')
    ],
    scheduledTime: [
      (value) => validateIf(
        (formData) => formData.isScheduled,
        (value) => validateFutureDate(value, 'Scheduled time')
      )
    ]
  },
  
  PAYMENT_METHOD: {
    cardNumber: [
      (value) => validateRequired(value, 'Card number'),
      (value) => validateLength(value, 13, 19, 'Card number'),
      createValidator(
        (value) => /^\d+$/.test(value.replace(/\s/g, '')),
        'Card number must contain only numbers'
      )
    ],
    expiryDate: [
      (value) => validateRequired(value, 'Expiry date'),
      createValidator(
        (value) => /^(0[1-9]|1[0-2])\/\d{2}$/.test(value),
        'Expiry date must be in MM/YY format'
      )
    ],
    cvv: [
      (value) => validateRequired(value, 'CVV'),
      (value) => validateLength(value, 3, 4, 'CVV'),
      createValidator(
        (value) => /^\d+$/.test(value),
        'CVV must contain only numbers'
      )
    ]
  }
};

// Utility function to validate using predefined schemas
export const validateWithSchema = (formData, schemaName) => {
  const schema = VALIDATION_SCHEMAS[schemaName];
  if (!schema) {
    throw new Error(`Validation schema '${schemaName}' not found`);
  }
  
  return validateFormAdvanced(formData, schema);
};

// Export commonly used validators as a collection
export const validators = {
  required: validateRequired,
  minLength: validateMinLength,
  maxLength: validateMaxLength,
  length: validateLength,
  email: validateEmail,
  phone: validatePhone,
  password: validatePassword,
  passwordConfirmation: validatePasswordConfirmation,
  number: validateNumber,
  integer: validateInteger,
  min: validateMin,
  max: validateMax,
  range: validateRange,
  date: validateDate,
  futureDate: validateFutureDate,
  pastDate: validatePastDate,
  url: validateUrl,
  file: validateFile,
  rating: validateRating,
  fare: validateFare,
  licensePlate: validateLicensePlate,
  coordinates: validateCoordinates
};

export default {
  // Base validators
  isEmpty,
  isString,
  isNumber,
  isArray,
  isObject,
  
  // String validators
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validateLength,
  validateEmail,
  validatePhone,
  validatePassword,
  validatePasswordConfirmation,
  
  // Number validators
  validateNumber,
  validateInteger,
  validateMin,
  validateMax,
  validateRange,
  
  // Date validators
  validateDate,
  validateFutureDate,
  validatePastDate,
  validateDateRange,
  
  // Other validators
  validateUrl,
  validateFile,
  
  // Business validators
  validateRideDistance,
  validateFare,
  validateRating,
  validateLicensePlate,
  validateCoordinates,
  
  // Array validators
  validateArrayMinLength,
  validateArrayMaxLength,
  validateArrayUnique,
  
  // Form validation
  validateForm,
  validateFormAdvanced,
  
  // Pre-built form validators
  validateLoginForm,
  validateDriverForm,
  validateCustomerForm,
  validateRideForm,
  validateChangePasswordForm,
  
  // Schema validation
  validateWithSchema,
  
  // Custom validators
  createValidator,
  createRequiredValidator,
  validateIf,
  validateUnless,
  validateFieldMatch,
  validateFieldDifference,
  
  // Utility
  debounceValidator,
  
  // Collections
  validators,
  VALIDATION_SCHEMAS
};