const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');

class AuthMiddleware {
  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    this.jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';
    this.tokenExpiry = process.env.JWT_EXPIRY || '24h';
    this.refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRY || '7d';
    
    // Rate limiting configurations
    this.loginLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // 5 attempts per window
      message: 'Too many login attempts, please try again later',
      standardHeaders: true,
      legacyHeaders: false
    });

    this.generalLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // 100 requests per window
      message: 'Too many requests, please try again later'
    });
  }

  /**
   * Generate JWT token
   */
  generateToken(payload, options = {}) {
    const defaultOptions = {
      expiresIn: this.tokenExpiry,
      issuer: 'ride-app',
      audience: 'ride-app-users'
    };

    return jwt.sign(payload, this.jwtSecret, { ...defaultOptions, ...options });
  }

  /**
   * Generate refresh token
   */
  generateRefreshToken(payload) {
    return jwt.sign(payload, this.jwtRefreshSecret, {
      expiresIn: this.refreshTokenExpiry,
      issuer: 'ride-app',
      audience: 'ride-app-users'
    });
  }

  /**
   * Verify JWT token
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      throw new Error(`Invalid token: ${error.message}`);
    }
  }

  /**
   * Verify refresh token
   */
  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, this.jwtRefreshSecret);
    } catch (error) {
      throw new Error(`Invalid refresh token: ${error.message}`);
    }
  }

  /**
   * Extract token from request
   */
  extractToken(req) {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    
    // Check for token in cookies
    if (req.cookies && req.cookies.token) {
      return req.cookies.token;
    }
    
    // Check for token in query params (less secure, use only for specific cases)
    if (req.query.token) {
      return req.query.token;
    }
    
    return null;
  }

  /**
   * Basic authentication middleware
   */
  authenticate() {
    return async (req, res, next) => {
      try {
        const token = this.extractToken(req);
        
        if (!token) {
          return res.status(401).json({
            success: false,
            message: 'Access denied. No token provided.',
            code: 'NO_TOKEN'
          });
        }

        const decoded = this.verifyToken(token);
        
        // Check if user exists and is active
        const user = await this.getUserById(decoded.id);
        if (!user) {
          return res.status(401).json({
            success: false,
            message: 'Invalid token. User not found.',
            code: 'USER_NOT_FOUND'
          });
        }

        if (user.status === 'suspended' || user.status === 'banned') {
          return res.status(403).json({
            success: false,
            message: 'Account is suspended or banned.',
            code: 'ACCOUNT_SUSPENDED'
          });
        }

        // Add user info to request
        req.user = {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role,
          userType: decoded.userType,
          tokenIssuedAt: decoded.iat
        };

        // Check for token refresh requirement
        const tokenAge = Date.now() / 1000 - decoded.iat;
        const maxAge = 86400; // 24 hours in seconds
        
        if (tokenAge > maxAge * 0.8) { // 80% of token lifetime
          req.shouldRefreshToken = true;
        }

        next();
      } catch (error) {
        console.error('Authentication error:', error);
        
        if (error.name === 'TokenExpiredError') {
          return res.status(401).json({
            success: false,
            message: 'Token has expired.',
            code: 'TOKEN_EXPIRED'
          });
        }
        
        if (error.name === 'JsonWebTokenError') {
          return res.status(401).json({
            success: false,
            message: 'Invalid token.',
            code: 'INVALID_TOKEN'
          });
        }

        return res.status(500).json({
          success: false,
          message: 'Authentication failed.',
          code: 'AUTH_ERROR'
        });
      }
    };
  }

  /**
   * Optional authentication middleware (doesn't fail if no token)
   */
  optionalAuthenticate() {
    return async (req, res, next) => {
      try {
        const token = this.extractToken(req);
        
        if (token) {
          const decoded = this.verifyToken(token);
          const user = await this.getUserById(decoded.id);
          
          if (user && user.status === 'active') {
            req.user = {
              id: decoded.id,
              email: decoded.email,
              role: decoded.role,
              userType: decoded.userType
            };
          }
        }
        
        next();
      } catch (error) {
        // In optional auth, we don't fail on token errors
        console.warn('Optional authentication warning:', error.message);
        next();
      }
    };
  }

  /**
   * Role-based authorization middleware
   */
  authorize(roles = []) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required.',
          code: 'AUTH_REQUIRED'
        });
      }

      const userRoles = Array.isArray(req.user.role) ? req.user.role : [req.user.role];
      const allowedRoles = Array.isArray(roles) ? roles : [roles];
      
      const hasPermission = allowedRoles.some(role => userRoles.includes(role));
      
      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions.',
          code: 'INSUFFICIENT_PERMISSIONS',
          required: allowedRoles,
          current: userRoles
        });
      }

      next();
    };
  }

  /**
   * User type authorization (passenger, driver, admin)
   */
  authorizeUserType(userTypes = []) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required.',
          code: 'AUTH_REQUIRED'
        });
      }

      const allowedTypes = Array.isArray(userTypes) ? userTypes : [userTypes];
      
      if (!allowedTypes.includes(req.user.userType)) {
        return res.status(403).json({
          success: false,
          message: 'User type not authorized for this action.',
          code: 'USER_TYPE_NOT_AUTHORIZED',
          required: allowedTypes,
          current: req.user.userType
        });
      }

      next();
    };
  }

  /**
   * Resource ownership middleware
   */
  authorizeOwnership(resourceIdParam = 'id', userIdField = 'userId') {
    return async (req, res, next) => {
      try {
        if (!req.user) {
          return res.status(401).json({
            success: false,
            message: 'Authentication required.',
            code: 'AUTH_REQUIRED'
          });
        }

        const resourceId = req.params[resourceIdParam];
        const resource = await this.getResourceById(resourceId, req.route.path);
        
        if (!resource) {
          return res.status(404).json({
            success: false,
            message: 'Resource not found.',
            code: 'RESOURCE_NOT_FOUND'
          });
        }

        // Admin can access any resource
        if (req.user.role === 'admin') {
          return next();
        }

        // Check ownership
        if (resource[userIdField] !== req.user.id) {
          return res.status(403).json({
            success: false,
            message: 'Access denied. You can only access your own resources.',
            code: 'OWNERSHIP_REQUIRED'
          });
        }

        req.resource = resource;
        next();
      } catch (error) {
        console.error('Ownership authorization error:', error);
        return res.status(500).json({
          success: false,
          message: 'Authorization check failed.',
          code: 'AUTHORIZATION_ERROR'
        });
      }
    };
  }

  /**
   * Driver verification middleware
   */
  requireVerifiedDriver() {
    return async (req, res, next) => {
      try {
        if (!req.user || req.user.userType !== 'driver') {
          return res.status(403).json({
            success: false,
            message: 'Driver access required.',
            code: 'DRIVER_ACCESS_REQUIRED'
          });
        }

        const driver = await this.getDriverById(req.user.id);
        
        if (!driver) {
          return res.status(404).json({
            success: false,
            message: 'Driver profile not found.',
            code: 'DRIVER_NOT_FOUND'
          });
        }

        if (driver.verificationStatus !== 'verified') {
          return res.status(403).json({
            success: false,
            message: 'Driver verification required.',
            code: 'DRIVER_NOT_VERIFIED',
            verificationStatus: driver.verificationStatus
          });
        }

        if (driver.status !== 'active') {
          return res.status(403).json({
            success: false,
            message: 'Driver account is not active.',
            code: 'DRIVER_NOT_ACTIVE',
            status: driver.status
          });
        }

        req.driver = driver;
        next();
      } catch (error) {
        console.error('Driver verification error:', error);
        return res.status(500).json({
          success: false,
          message: 'Driver verification failed.',
          code: 'DRIVER_VERIFICATION_ERROR'
        });
      }
    };
  }

  /**
   * API key authentication middleware
   */
  authenticateApiKey() {
    return async (req, res, next) => {
      try {
        const apiKey = req.headers['x-api-key'] || req.query.api_key;
        
        if (!apiKey) {
          return res.status(401).json({
            success: false,
            message: 'API key required.',
            code: 'API_KEY_REQUIRED'
          });
        }

        const validApiKey = await this.validateApiKey(apiKey);
        
        if (!validApiKey) {
          return res.status(401).json({
            success: false,
            message: 'Invalid API key.',
            code: 'INVALID_API_KEY'
          });
        }

        req.apiKey = validApiKey;
        next();
      } catch (error) {
        console.error('API key authentication error:', error);
        return res.status(500).json({
          success: false,
          message: 'API key authentication failed.',
          code: 'API_KEY_AUTH_ERROR'
        });
      }
    };
  }

  /**
   * Refresh token middleware
   */
  refreshToken() {
    return async (req, res, next) => {
      try {
        const { refreshToken } = req.body;
        
        if (!refreshToken) {
          return res.status(400).json({
            success: false,
            message: 'Refresh token is required.',
            code: 'REFRESH_TOKEN_REQUIRED'
          });
        }

        const decoded = this.verifyRefreshToken(refreshToken);
        const user = await this.getUserById(decoded.id);
        
        if (!user) {
          return res.status(401).json({
            success: false,
            message: 'Invalid refresh token.',
            code: 'INVALID_REFRESH_TOKEN'
          });
        }

        // Generate new tokens
        const tokenPayload = {
          id: user._id,
          email: user.email,
          role: user.role,
          userType: user.userType
        };

        const newAccessToken = this.generateToken(tokenPayload);
        const newRefreshToken = this.generateRefreshToken({ id: user._id });

        res.json({
          success: true,
          message: 'Tokens refreshed successfully.',
          data: {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            expiresIn: this.tokenExpiry
          }
        });
      } catch (error) {
        console.error('Token refresh error:', error);
        
        if (error.name === 'TokenExpiredError') {
          return res.status(401).json({
            success: false,
            message: 'Refresh token has expired.',
            code: 'REFRESH_TOKEN_EXPIRED'
          });
        }

        return res.status(500).json({
          success: false,
          message: 'Token refresh failed.',
          code: 'TOKEN_REFRESH_ERROR'
        });
      }
    };
  }

  /**
   * Session timeout middleware
   */
  checkSessionTimeout(timeoutMinutes = 30) {
    return (req, res, next) => {
      if (!req.user) {
        return next();
      }

      const now = Date.now() / 1000;
      const tokenAge = now - req.user.tokenIssuedAt;
      const timeoutSeconds = timeoutMinutes * 60;

      if (tokenAge > timeoutSeconds) {
        return res.status(401).json({
          success: false,
          message: 'Session has timed out.',
          code: 'SESSION_TIMEOUT'
        });
      }

      next();
    };
  }

  /**
   * Device/IP restriction middleware
   */
  restrictDevice() {
    return async (req, res, next) => {
      try {
        if (!req.user) {
          return next();
        }

        const userAgent = req.headers['user-agent'];
        const clientIP = req.ip || req.connection.remoteAddress;
        
        // Check if device/IP is registered for this user
        const isAllowedDevice = await this.checkAllowedDevice(req.user.id, userAgent, clientIP);
        
        if (!isAllowedDevice) {
          // Log suspicious activity
          await this.logSuspiciousActivity(req.user.id, {
            userAgent,
            clientIP,
            action: 'unauthorized_device_access'
          });

          return res.status(403).json({
            success: false,
            message: 'Device not authorized.',
            code: 'DEVICE_NOT_AUTHORIZED'
          });
        }

        next();
      } catch (error) {
        console.error('Device restriction error:', error);
        next(); // Don't block on device check errors
      }
    };
  }

  /**
   * Two-factor authentication middleware
   */
  requireTwoFactor() {
    return async (req, res, next) => {
      try {
        if (!req.user) {
          return res.status(401).json({
            success: false,
            message: 'Authentication required.',
            code: 'AUTH_REQUIRED'
          });
        }

        const user = await this.getUserById(req.user.id);
        
        if (user.twoFactorEnabled && !req.user.twoFactorVerified) {
          return res.status(403).json({
            success: false,
            message: 'Two-factor authentication required.',
            code: 'TWO_FACTOR_REQUIRED'
          });
        }

        next();
      } catch (error) {
        console.error('Two-factor authentication error:', error);
        return res.status(500).json({
          success: false,
          message: 'Two-factor authentication check failed.',
          code: 'TWO_FACTOR_ERROR'
        });
      }
    };
  }

  /**
   * Helper methods (implement based on your database)
   */
  async getUserById(id) {
    // Implement user lookup from your database
    // return await User.findById(id);
    return { _id: id, status: 'active' }; // Mock implementation
  }

  async getDriverById(id) {
    // Implement driver lookup from your database
    // return await Driver.findById(id);
    return { _id: id, verificationStatus: 'verified', status: 'active' }; // Mock
  }

  async getResourceById(id, route) {
    // Implement resource lookup based on route
    // This would determine the correct model to query
    return { id, userId: 'user-id' }; // Mock implementation
  }

  async validateApiKey(apiKey) {
    // Implement API key validation
    // return await ApiKey.findOne({ key: apiKey, active: true });
    return apiKey === process.env.VALID_API_KEY; // Mock implementation
  }

  async checkAllowedDevice(userId, userAgent, clientIP) {
    // Implement device/IP checking logic
    return true; // Mock implementation
  }

  async logSuspiciousActivity(userId, activityData) {
    // Implement suspicious activity logging
    console.log(`Suspicious activity for user ${userId}:`, activityData);
  }

  // Rate limiters
  getLoginLimiter() {
    return this.loginLimiter;
  }

  getGeneralLimiter() {
    return this.generalLimiter;
  }

  // Custom rate limiter for specific endpoints
  createRateLimiter(windowMs, max, message) {
    return rateLimit({
      windowMs,
      max,
      message,
      standardHeaders: true,
      legacyHeaders: false
    });
  }
}

module.exports = new AuthMiddleware();