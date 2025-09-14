const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const moment = require('moment');
const axios = require('axios');
const sharp = require('sharp');
const geolib = require('geolib');

class Helpers {
  constructor() {
    this.saltRounds = 12;
  }

  // =====================================================
  // AUTHENTICATION & SECURITY HELPERS
  // =====================================================

  /**
   * Generate OTP
   */
  generateOTP(length = 6) {
    const digits = '0123456789';
    let otp = '';
    
    for (let i = 0; i < length; i++) {
      otp += digits[Math.floor(Math.random() * digits.length)];
    }
    
    return otp;
  }

  /**
   * Generate secure random string
   */
  generateSecureToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Hash password
   */
  async hashPassword(password) {
    try {
      const salt = await bcrypt.genSalt(this.saltRounds);
      return await bcrypt.hash(password, salt);
    } catch (error) {
      throw new Error(`Password hashing failed: ${error.message}`);
    }
  }

  /**
   * Compare password with hash
   */
  async comparePassword(password, hash) {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      throw new Error(`Password comparison failed: ${error.message}`);
    }
  }

  /**
   * Generate unique ride ID
   */
  generateRideId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `RIDE${timestamp}${random}`.toUpperCase();
  }

  /**
   * Generate referral code
   */
  generateReferralCode(name = '') {
    const cleanName = name.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const timestamp = Date.now().toString(36).substring(-2).toUpperCase();
    
    return `${cleanName}${random}${timestamp}`;
  }

  /**
   * Encrypt sensitive data
   */
  encrypt(text, key = process.env.ENCRYPTION_KEY) {
    try {
      const cipher = crypto.createCipher('aes-256-cbc', key);
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      return encrypted;
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  /**
   * Decrypt sensitive data
   */
  decrypt(encryptedText, key = process.env.ENCRYPTION_KEY) {
    try {
      const decipher = crypto.createDecipher('aes-256-cbc', key);
      let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  // =====================================================
  // DATE & TIME HELPERS
  // =====================================================

  /**
   * Format date for display
   */
  formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
    return moment(date).format(format);
  }

  /**
   * Get time ago string
   */
  getTimeAgo(date) {
    return moment(date).fromNow();
  }

  /**
   * Check if date is today
   */
  isToday(date) {
    return moment(date).isSame(moment(), 'day');
  }

  /**
   * Add time to date
   */
  addTime(date, amount, unit = 'minutes') {
    return moment(date).add(amount, unit).toDate();
  }

  /**
   * Calculate duration between dates
   */
  getDuration(startDate, endDate, unit = 'minutes') {
    return moment(endDate).diff(moment(startDate), unit);
  }

  /**
   * Get start and end of day
   */
  getDayBounds(date = new Date()) {
    const start = moment(date).startOf('day').toDate();
    const end = moment(date).endOf('day').toDate();
    return { start, end };
  }

  /**
   * Check if time is within business hours
   */
  isWithinBusinessHours(time = new Date(), startHour = 6, endHour = 23) {
    const hour = moment(time).hour();
    return hour >= startHour && hour <= endHour;
  }

  /**
   * Get timezone offset
   */
  getTimezoneOffset(timezone = 'UTC') {
    return moment.tz(timezone).utcOffset();
  }

  // =====================================================
  // LOCATION & DISTANCE HELPERS
  // =====================================================

  /**
   * Calculate distance between two points (Haversine formula)
   */
  calculateDistance(point1, point2, unit = 'km') {
    const distance = geolib.getDistance(
      { latitude: point1.latitude, longitude: point1.longitude },
      { latitude: point2.latitude, longitude: point2.longitude }
    );

    switch (unit) {
      case 'km':
        return distance / 1000;
      case 'miles':
        return distance / 1609.344;
      case 'meters':
      default:
        return distance;
    }
  }

  /**
   * Get center point of multiple coordinates
   */
  getCenterPoint(coordinates) {
    return geolib.getCenterOfBounds(coordinates);
  }

  /**
   * Check if point is within radius
   */
  isWithinRadius(centerPoint, checkPoint, radiusKm) {
    const distance = this.calculateDistance(centerPoint, checkPoint, 'km');
    return distance <= radiusKm;
  }

  /**
   * Get bearing between two points
   */
  getBearing(point1, point2) {
    return geolib.getBearing(point1, point2);
  }

  /**
   * Validate coordinates
   */
  isValidCoordinate(latitude, longitude) {
    return (
      typeof latitude === 'number' &&
      typeof longitude === 'number' &&
      latitude >= -90 && latitude <= 90 &&
      longitude >= -180 && longitude <= 180
    );
  }

  /**
   * Format coordinates for display
   */
  formatCoordinates(latitude, longitude, precision = 6) {
    return {
      latitude: parseFloat(latitude.toFixed(precision)),
      longitude: parseFloat(longitude.toFixed(precision))
    };
  }

  // =====================================================
  // FARE CALCULATION HELPERS
  // =====================================================

  /**
   * Calculate base fare
   */
  calculateBaseFare(distance, duration, rideType = 'standard') {
    const fareRates = {
      economy: { base: 2.5, perKm: 1.2, perMinute: 0.2 },
      standard: { base: 3.0, perKm: 1.5, perMinute: 0.25 },
      premium: { base: 4.0, perKm: 2.0, perMinute: 0.35 },
      luxury: { base: 6.0, perKm: 3.0, perMinute: 0.5 }
    };

    const rates = fareRates[rideType] || fareRates.standard;
    const durationMinutes = duration / 60; // Convert seconds to minutes
    
    const baseFare = rates.base;
    const distanceFare = distance * rates.perKm;
    const timeFare = durationMinutes * rates.perMinute;
    
    return baseFare + distanceFare + timeFare;
  }

  /**
   * Apply surge pricing
   */
  applySurgePrice(baseFare, surgeMultiplier = 1.0) {
    return baseFare * surgeMultiplier;
  }

  /**
   * Calculate tax
   */
  calculateTax(amount, taxRate = 0.13) { // 13% default tax
    return amount * taxRate;
  }

  /**
   * Apply discount
   */
  applyDiscount(amount, discountPercent = 0, maxDiscount = null) {
    const discount = amount * (discountPercent / 100);
    return maxDiscount ? Math.min(discount, maxDiscount) : discount;
  }

  /**
   * Calculate final fare
   */
  calculateFinalFare(params) {
    const {
      distance,
      duration,
      rideType = 'standard',
      surgeMultiplier = 1.0,
      discountPercent = 0,
      maxDiscount = null,
      taxRate = 0.13,
      tip = 0
    } = params;

    let fare = this.calculateBaseFare(distance, duration, rideType);
    fare = this.applySurgePrice(fare, surgeMultiplier);
    
    const discount = this.applyDiscount(fare, discountPercent, maxDiscount);
    fare -= discount;
    
    const tax = this.calculateTax(fare, taxRate);
    const total = fare + tax + tip;

    return {
      baseFare: this.roundToTwoDecimals(this.calculateBaseFare(distance, duration, rideType)),
      surgeFare: this.roundToTwoDecimals(fare + discount), // Before discount
      discount: this.roundToTwoDecimals(discount),
      subtotal: this.roundToTwoDecimals(fare),
      tax: this.roundToTwoDecimals(tax),
      tip: this.roundToTwoDecimals(tip),
      total: this.roundToTwoDecimals(total)
    };
  }

  // =====================================================
  // STRING & DATA HELPERS
  // =====================================================

  /**
   * Capitalize first letter
   */
  capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  /**
   * Convert to title case
   */
  toTitleCase(str) {
    if (!str) return '';
    return str.replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }

  /**
   * Generate slug from string
   */
  generateSlug(str) {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }

  /**
   * Mask sensitive data
   */
  maskString(str, visibleChars = 4, maskChar = '*') {
    if (!str || str.length <= visibleChars) return str;
    
    const visiblePart = str.slice(-visibleChars);
    const maskedPart = maskChar.repeat(str.length - visibleChars);
    
    return maskedPart + visiblePart;
  }

  /**
   * Mask email
   */
  maskEmail(email) {
    if (!email || !email.includes('@')) return email;
    
    const [username, domain] = email.split('@');
    const maskedUsername = username.length > 2 
      ? username[0] + '*'.repeat(username.length - 2) + username.slice(-1)
      : username;
    
    return `${maskedUsername}@${domain}`;
  }

  /**
   * Mask phone number
   */
  maskPhone(phone) {
    if (!phone) return phone;
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length >= 10) {
      const last4 = cleaned.slice(-4);
      const masked = '*'.repeat(cleaned.length - 4);
      return masked + last4;
    }
    
    return phone;
  }

  /**
   * Validate email format
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number format
   */
  isValidPhone(phone) {
    const phoneRegex = /^(\+\d{1,3}[- ]?)?\d{10}$/;
    return phoneRegex.test(phone.replace(/[\s-()]/g, ''));
  }

  /**
   * Clean phone number
   */
  cleanPhoneNumber(phone) {
    return phone.replace(/\D/g, '');
  }

  /**
   * Format phone number for display
   */
  formatPhoneNumber(phone) {
    const cleaned = this.cleanPhoneNumber(phone);
    
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length === 11 && cleaned[0] === '1') {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    
    return phone; // Return original if can't format
  }

  // =====================================================
  // NUMBER & CURRENCY HELPERS
  // =====================================================

  /**
   * Round to two decimal places
   */
  roundToTwoDecimals(number) {
    return Math.round((number + Number.EPSILON) * 100) / 100;
  }

  /**
   * Format currency
   */
  formatCurrency(amount, currency = 'USD', locale = 'en-US') {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  /**
   * Convert cents to dollars
   */
  centsToDollars(cents) {
    return this.roundToTwoDecimals(cents / 100);
  }

  /**
   * Convert dollars to cents
   */
  dollarsToCents(dollars) {
    return Math.round(dollars * 100);
  }

  /**
   * Generate random number within range
   */
  randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Calculate percentage
   */
  calculatePercentage(value, total) {
    if (total === 0) return 0;
    return this.roundToTwoDecimals((value / total) * 100);
  }

  // =====================================================
  // ARRAY & OBJECT HELPERS
  // =====================================================

  /**
   * Remove duplicates from array
   */
  removeDuplicates(array, key = null) {
    if (key) {
      const seen = new Set();
      return array.filter(item => {
        const keyValue = item[key];
        if (seen.has(keyValue)) {
          return false;
        }
        seen.add(keyValue);
        return true;
      });
    }
    return [...new Set(array)];
  }

  /**
   * Group array by key
   */
  groupBy(array, key) {
    return array.reduce((groups, item) => {
      const group = item[key];
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(item);
      return groups;
    }, {});
  }

  /**
   * Sort array by multiple fields
   */
  sortBy(array, fields) {
    return array.sort((a, b) => {
      for (let field of fields) {
        let direction = 1;
        if (field.startsWith('-')) {
          direction = -1;
          field = field.substring(1);
        }
        
        if (a[field] < b[field]) return -1 * direction;
        if (a[field] > b[field]) return 1 * direction;
      }
      return 0;
    });
  }

  /**
   * Deep clone object
   */
  deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * Merge objects deeply
   */
  deepMerge(target, source) {
    const output = Object.assign({}, target);
    
    if (this.isObject(target) && this.isObject(source)) {
      Object.keys(source).forEach(key => {
        if (this.isObject(source[key])) {
          if (!(key in target)) {
            Object.assign(output, { [key]: source[key] });
          } else {
            output[key] = this.deepMerge(target[key], source[key]);
          }
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      });
    }
    
    return output;
  }

  /**
   * Check if value is object
   */
  isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
  }

  /**
   * Pick specific keys from object
   */
  pick(obj, keys) {
    const result = {};
    keys.forEach(key => {
      if (key in obj) {
        result[key] = obj[key];
      }
    });
    return result;
  }

  /**
   * Omit specific keys from object
   */
  omit(obj, keys) {
    const result = { ...obj };
    keys.forEach(key => {
      delete result[key];
    });
    return result;
  }

  // =====================================================
  // FILE & IMAGE HELPERS
  // =====================================================

  /**
   * Get file extension
   */
  getFileExtension(filename) {
    return filename.split('.').pop().toLowerCase();
  }

  /**
   * Generate unique filename
   */
  generateUniqueFilename(originalFilename) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const extension = this.getFileExtension(originalFilename);
    
    return `${timestamp}_${random}.${extension}`;
  }

  /**
   * Validate file type
   */
  isValidFileType(filename, allowedTypes = ['jpg', 'jpeg', 'png', 'pdf']) {
    const extension = this.getFileExtension(filename);
    return allowedTypes.includes(extension);
  }

  /**
   * Format file size
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Resize image using Sharp
   */
  async resizeImage(inputBuffer, width = 800, height = 600, quality = 80) {
    try {
      return await sharp(inputBuffer)
        .resize(width, height, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality })
        .toBuffer();
    } catch (error) {
      throw new Error(`Image resize failed: ${error.message}`);
    }
  }

  /**
   * Create thumbnail
   */
  async createThumbnail(inputBuffer, size = 150) {
    try {
      return await sharp(inputBuffer)
        .resize(size, size, { fit: 'cover' })
        .jpeg({ quality: 70 })
        .toBuffer();
    } catch (error) {
      throw new Error(`Thumbnail creation failed: ${error.message}`);
    }
  }

  // =====================================================
  // VALIDATION HELPERS
  // =====================================================

  /**
   * Validate required fields
   */
  validateRequired(data, requiredFields) {
    const missing = [];
    
    requiredFields.forEach(field => {
      if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
        missing.push(field);
      }
    });
    
    return {
      isValid: missing.length === 0,
      missingFields: missing
    };
  }

  /**
   * Sanitize HTML
   */
  sanitizeHtml(html) {
    if (!html) return '';
    
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }

  /**
   * Validate and sanitize input
   */
  sanitizeInput(input, maxLength = null) {
    if (typeof input !== 'string') return input;
    
    let sanitized = input.trim()
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/['"]/g, '') // Remove quotes
      .replace(/[&]/g, '&amp;'); // Escape ampersand
    
    if (maxLength && sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength);
    }
    
    return sanitized;
  }

  // =====================================================
  // HTTP & API HELPERS
  // =====================================================

  /**
   * Make HTTP request with retry
   */
  async makeHttpRequest(url, options = {}, maxRetries = 3) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await axios({
          url,
          timeout: 30000,
          ...options
        });
        return response.data;
      } catch (error) {
        lastError = error;
        
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          await this.sleep(delay);
        }
      }
    }
    
    throw new Error(`HTTP request failed after ${maxRetries} attempts: ${lastError.message}`);
  }

  /**
   * Sleep/delay function
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Parse user agent
   */
  parseUserAgent(userAgent) {
    const mobile = /Mobile|Android|iPhone|iPad/i.test(userAgent);
    const browser = this.getBrowserName(userAgent);
    const os = this.getOSName(userAgent);
    
    return { mobile, browser, os };
  }

  /**
   * Get browser name from user agent
   */
  getBrowserName(userAgent) {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  /**
   * Get OS name from user agent
   */
  getOSName(userAgent) {
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Unknown';
  }

  // =====================================================
  // LOGGING & DEBUG HELPERS
  // =====================================================

  /**
   * Log with timestamp
   */
  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
  }

  /**
   * Log error with stack trace
   */
  logError(error, context = '') {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] [ERROR] ${context}`, {
      message: error.message,
      stack: error.stack,
      context
    });
  }

  /**
   * Create standardized API response
   */
  createResponse(success, message, data = null, errors = null) {
    const response = {
      success,
      message,
      timestamp: new Date().toISOString()
    };
    
    if (data !== null) response.data = data;
    if (errors !== null) response.errors = errors;
    
    return response;
  }

  /**
   * Create paginated response
   */
  createPaginatedResponse(data, page, limit, total, message = 'Data retrieved successfully') {
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    return this.createResponse(true, message, {
      items: data,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage
      }
    });
  }
}

module.exports = new Helpers();