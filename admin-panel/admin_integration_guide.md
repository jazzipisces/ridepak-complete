# Admin Panel Integration with Customer & Driver Apps

## Overview
This admin panel is designed to seamlessly integrate with your existing customer and driver ride-hailing applications. The integration happens through:

1. **Shared Backend APIs**
2. **Real-time Socket.IO connections**
3. **Database synchronization**
4. **Push notification services**

## Integration Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Customer App  │    │   Backend APIs   │    │   Driver App    │
│                 │◄──►│                  │◄──►│                 │
└─────────────────┘    │  - REST APIs     │    └─────────────────┘
                       │  - Socket.IO     │
                       │  - Database      │
                       │  - Push Service  │
                       └────────▲─────────┘
                                │
                       ┌────────▼─────────┐
                       │   Admin Panel    │
                       │                  │
                       └──────────────────┘
```

## Backend API Integration

### 1. Shared Endpoints

The admin panel uses the same backend APIs as your customer and driver apps:

#### Authentication Endpoints
```javascript
POST /api/admin/auth/login       // Admin login
POST /api/customer/auth/login    // Customer login
POST /api/driver/auth/login      // Driver login
```

#### Ride Management
```javascript
GET  /api/rides                  // Get rides (filtered by role)
POST /api/rides                  // Create ride (customer only)
PUT  /api/rides/:id              // Update ride
GET  /api/rides/:id              // Get ride details
```

#### User Management
```javascript
GET  /api/admin/users            // Admin: Get all users
GET  /api/customer/profile       // Customer: Get profile
GET  /api/driver/profile         // Driver: Get profile
PUT  /api/driver/location        // Driver: Update location
```

### 2. Database Schema Integration

Ensure your database has these tables that all apps share:

```sql
-- Users table (shared by all apps)
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20) UNIQUE,
  role ENUM('admin', 'customer', 'driver'),
  status ENUM('active', 'suspended', 'banned'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rides table (shared by all apps)
CREATE TABLE rides (
  id VARCHAR(255) PRIMARY KEY,
  customer_id VARCHAR(255),
  driver_id VARCHAR(255),
  pickup_lat DECIMAL(10, 8),
  pickup_lng DECIMAL(11, 8),
  pickup_address TEXT,
  destination_lat DECIMAL(10, 8),
  destination_lng DECIMAL(11, 8),
  destination_address TEXT,
  status ENUM('pending', 'driver_assigned', 'in_progress', 'completed', 'cancelled'),
  fare DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES users(id),
  FOREIGN KEY (driver_id) REFERENCES users(id)
);
```

## Real-time Socket Integration

### 1. Socket.IO Events

The admin panel listens to and emits these events:

```javascript
// Events the admin panel listens to:
socket.on('ride_created', (rideData) => {
  // Update ride list in real-time
});

socket.on('driver_online', (driverData) => {
  // Update driver status
});

socket.on('customer_registered', (customerData) => {
  // Update customer list
});

// Events the admin panel emits:
socket.emit('admin_broadcast_drivers', message);
socket.emit('admin_cancel_ride', { ride_id, reason });
socket.emit('admin_notify_driver', { driver_id, notification });
```

### 2. Customer App Integration

Your customer app should emit these events:

```javascript
// Customer app events
socket.emit('customer_online', { customer_id });
socket.emit('ride_request', rideData);
socket.emit('customer_location_update', { customer_id, location });

// Listen for admin actions
socket.on('admin_notification', (notification) => {
  // Show notification to customer
});
```

### 3. Driver App Integration

Your driver app should emit these events:

```javascript
// Driver app events
socket.emit('driver_online', { driver_id });
socket.emit('driver_location_update', { driver_id, location });
socket.emit('ride_accepted', { ride_id, driver_id });
socket.emit('ride_completed', { ride_id });

// Listen for admin actions
socket.on('admin_force_offline', (data) => {
  // Force driver offline
});
```

## Push Notification Integration

### 1. Firebase Cloud Messaging (FCM) Setup

Add FCM tokens to user records:

```sql
ALTER TABLE users ADD COLUMN fcm_token VARCHAR(255);
```

### 2. Admin Panel Notification Integration

```javascript
// Send push notification through admin panel
const { integration } = useAPI();

// Notify specific customer
await integration.customerApp.sendPushNotification(customerId, {
  title: 'Ride Update',
  body: 'Your ride has been assigned a driver',
  type: 'ride_update',
  data: { ride_id: 'RIDE123' }
});

// Notify specific driver
await integration.driverApp.sendPushNotification(driverId, {
  title: 'New Ride Request',
  body: 'You have a new ride request nearby',
  type: 'new_ride',
  data: { ride_id: 'RIDE123' }
});
```

## Configuration Files

### 1. Environment Variables (.env)

```bash
# Shared across all apps
REACT_APP_API_BASE_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_MAPS_API_KEY=your_google_maps_key
REACT_APP_FCM_KEY=your_fcm_key

# Admin-specific
REACT_APP_ADMIN_ROLE=admin
REACT_APP_ADMIN_PERMISSIONS=all
```

### 2. API Configuration

Create a shared API configuration file:

```javascript
// config/api.js (shared across apps)
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  REFRESH: '/api/auth/refresh',
  
  // Rides
  RIDES: '/api/rides',
  RIDE_DETAILS: (id) => `/api/rides/${id}`,
  
  // Users
  PROFILE: '/api/profile',
  UPDATE_LOCATION: '/api/location',
  
  // Admin-specific
  ADMIN_STATS: '/api/admin/stats',
  ADMIN_USERS: '/api/admin/users',
  ADMIN_RIDES: '/api/admin/rides',
};

export const SOCKET_EVENTS = {
  // Rides
  RIDE_CREATED: 'ride_created',
  RIDE_UPDATED: 'ride_updated',
  RIDE_CANCELLED: 'ride_cancelled',
  
  // Drivers
  DRIVER_ONLINE: 'driver_online',
  DRIVER_OFFLINE: 'driver_offline',
  DRIVER_LOCATION: 'driver_location_update',
  
  // Customers
  CUSTOMER_ONLINE: 'customer_online',
  CUSTOMER_OFFLINE: 'customer_offline',
  
  // Admin
  ADMIN_BROADCAST: 'admin_broadcast',
  ADMIN_NOTIFICATION: 'admin_notification',
};
```

## Database Sync Scripts

### 1. User Status Sync

```javascript
// utils/userSync.js
export const syncUserStatus = async (userId, newStatus) => {
  try {
    // Update in database
    await db.query('UPDATE users SET status = ? WHERE id = ?', [newStatus, userId]);
    
    // Emit to all connected apps
    io.emit('user_status_update', { user_id: userId, status: newStatus });
    
    // Send push notification if needed
    if (newStatus === 'suspended') {
      await sendPushNotification(userId, {
        title: 'Account Status Update',
        body: 'Your account has been suspended'
      });
    }
  } catch (error) {
    console.error('User sync error:', error);
  }
};
```

### 2. Ride Status Sync

```javascript
// utils/rideSync.js
export const syncRideStatus = async (rideId, newStatus, updatedBy) => {
  try {
    // Update ride status
    await db.query('UPDATE rides SET status = ?, updated_by = ? WHERE id = ?', 
      [newStatus, updatedBy, rideId]);
    
    // Get ride details
    const ride = await db.query('SELECT * FROM rides WHERE id = ?', [rideId]);
    
    // Notify customer app
    io.to(`customer_${ride.customer_id}`).emit('ride_status_update', {
      ride_id: rideId,
      status: newStatus,
      updated_by: updatedBy
    });
    
    // Notify driver app
    if (ride.driver_id) {
      io.to(`driver_${ride.driver_id}`).emit('ride_status_update', {
        ride_id: rideId,
        status: newStatus,
        updated_by: updatedBy
      });
    }
    
    // Notify admin panel
    io.to('admin_room').emit('ride_updated', ride);
  } catch (error) {
    console.error('Ride sync error:', error);
  }
};
```

## Testing Integration

### 1. Test Real-time Updates

```javascript
// Test script for real-time updates
const testRealTimeSync = async () => {
  // Create a test ride from customer app
  const rideData = await createTestRide();
  
  // Verify admin panel receives the update
  expect(adminSocket.received('ride_created')).toBeTruthy();
  
  // Update ride status from admin panel
  await adminAPI.updateRideStatus(rideData.id, 'cancelled');
  
  // Verify customer and driver apps receive the update
  expect(customerSocket.received('ride_status_update')).toBeTruthy();
  expect(driverSocket.received('ride_status_update')).toBeTruthy();
};
```

### 2. Test Push Notifications

```javascript
// Test push notification integration
const testPushNotifications = async () => {
  const customerId = 'CUST123';
  const driverId = 'DRV456';
  
  // Send notification from admin panel
  await adminAPI.integration.customerApp.sendPushNotification(customerId, {
    title: 'Test Notification',
    body: 'This is a test from admin panel'
  });
  
  // Verify notification was sent
  const notifications = await getNotificationLog();
  expect(notifications.some(n => n.recipient_id === customerId)).toBeTruthy();
};
```

### 3. Test Database Sync

```javascript
// Test database synchronization
const testDatabaseSync = async () => {
  const driverId = 'DRV123';
  
  // Suspend driver from admin panel
  await adminAPI.drivers.updateDriverStatus(driverId, 'suspended');
  
  // Verify status is updated in shared database
  const driver = await db.query('SELECT status FROM users WHERE id = ?', [driverId]);
  expect(driver.status).toBe('suspended');
  
  // Verify driver app receives the update
  expect(driverSocket.received('status_update')).toBeTruthy();
};
```

## Deployment Configuration

### 1. Docker Compose Setup

```yaml
# docker-compose.yml
version: '3.8'

services:
  # Shared Backend API
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DB_CONNECTION_STRING=${DB_CONNECTION_STRING}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - database
      - redis

  # Admin Panel
  admin-panel:
    build: ./admin-panel
    ports:
      - "3001:3000"
    environment:
      - REACT_APP_API_BASE_URL=http://localhost:5000
      - REACT_APP_SOCKET_URL=http://localhost:5000
    depends_on:
      - backend

  # Customer App
  customer-app:
    build: ./customer-app
    ports:
      - "3002:3000"
    environment:
      - REACT_APP_API_BASE_URL=http://localhost:5000
      - REACT_APP_SOCKET_URL=http://localhost:5000
    depends_on:
      - backend

  # Driver App
  driver-app:
    build: ./driver-app
    ports:
      - "3003:3000"
    environment:
      - REACT_APP_API_BASE_URL=http://localhost:5000
      - REACT_APP_SOCKET_URL=http://localhost:5000
    depends_on:
      - backend

  # Shared Database
  database:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=${DB_ROOT_PASSWORD}
      - MYSQL_DATABASE=ride_hailing
    volumes:
      - db_data:/var/lib/mysql
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql

  # Redis for session management and caching
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"

volumes:
  db_data:
```

### 2. Nginx Configuration

```nginx
# nginx.conf
server {
    listen 80;
    server_name admin.yourdomain.com;

    location / {
        proxy_pass http://admin-panel:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support for Socket.IO
    location /socket.io/ {
        proxy_pass http://backend:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://backend:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Security Considerations

### 1. Role-Based Access Control

```javascript
// middleware/auth.js
export const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user.role;
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    next();
  };
};

// Usage in routes
app.get('/api/admin/users', 
  authenticateToken, 
  roleMiddleware(['admin', 'super_admin']), 
  getUsersController
);
```

### 2. API Rate Limiting

```javascript
// middleware/rateLimit.js
import rateLimit from 'express-rate-limit';

export const adminRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
});

export const publicRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});
```

### 3. Data Encryption

```javascript
// utils/encryption.js
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const ALGORITHM = 'aes-256-gcm';

export const encrypt = (text) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY);
  cipher.setAAD(Buffer.from('admin-panel'));
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
};

export const decrypt = (encryptedData) => {
  const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY);
  decipher.setAAD(Buffer.from('admin-panel'));
  decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
  
  let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};
```

## Monitoring and Analytics

### 1. Performance Monitoring

```javascript
// utils/monitoring.js
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/admin-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/admin-combined.log' })
  ]
});

export const logAdminAction = (adminId, action, details) => {
  logger.info({
    type: 'admin_action',
    admin_id: adminId,
    action: action,
    details: details,
    timestamp: new Date().toISOString(),
    ip_address: details.ip_address
  });
};

export const logAPICall = (endpoint, method, duration, statusCode) => {
  logger.info({
    type: 'api_call',
    endpoint: endpoint,
    method: method,
    duration: `${duration}ms`,
    status_code: statusCode,
    timestamp: new Date().toISOString()
  });
};
```

### 2. Real-time Dashboard Metrics

```javascript
// utils/metrics.js
export const collectMetrics = () => {
  return {
    api_calls_per_minute: getAPICallsPerMinute(),
    active_connections: getActiveConnections(),
    database_response_time: getDatabaseResponseTime(),
    memory_usage: process.memoryUsage(),
    cpu_usage: getCPUUsage(),
    active_rides: getActiveRidesCount(),
    online_drivers: getOnlineDriversCount(),
    pending_rides: getPendingRidesCount()
  };
};

// Send metrics to admin panel every 30 seconds
setInterval(() => {
  const metrics = collectMetrics();
  io.to('admin_room').emit('system_metrics', metrics);
}, 30000);
```

## Troubleshooting Guide

### Common Integration Issues

#### 1. Socket Connection Issues

```javascript
// Debug socket connection
socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
  
  // Check if it's an authentication error
  if (error.message.includes('Authentication')) {
    // Refresh token and retry
    refreshAuthToken().then(() => {
      socket.connect();
    });
  }
});
```

#### 2. API Authentication Issues

```javascript
// Debug API authentication
const debugAPICall = async (endpoint, method, data) => {
  const token = localStorage.getItem('admin_token');
  console.log('Making API call:', {
    endpoint,
    method,
    hasToken: !!token,
    tokenLength: token?.length
  });
  
  try {
    const response = await apiCall(endpoint, method, data);
    console.log('API call successful:', response);
    return response;
  } catch (error) {
    console.error('API call failed:', {
      endpoint,
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });
    throw error;
  }
};
```

#### 3. Database Sync Issues

```javascript
// Check database connection and sync status
const checkDatabaseSync = async () => {
  try {
    // Test connection
    await db.query('SELECT 1');
    console.log('Database connection: OK');
    
    // Check for pending sync operations
    const pendingSync = await db.query('SELECT COUNT(*) as count FROM sync_queue');
    console.log('Pending sync operations:', pendingSync.count);
    
    // Check last sync timestamp
    const lastSync = await db.query('SELECT MAX(updated_at) as last_sync FROM sync_log');
    console.log('Last sync:', lastSync.last_sync);
    
  } catch (error) {
    console.error('Database sync check failed:', error);
  }
};
```

## Best Practices

### 1. Error Handling

```javascript
// Centralized error handling
export const handleError = (error, context) => {
  console.error(`Error in ${context}:`, error);
  
  // Log to monitoring service
  logError(error, context);
  
  // Show user-friendly message
  if (error.response?.status === 401) {
    showNotification('Session expired. Please log in again.', 'error');
  } else if (error.response?.status === 403) {
    showNotification('Access denied. Contact administrator.', 'error');
  } else {
    showNotification('Something went wrong. Please try again.', 'error');
  }
};
```

### 2. Data Caching

```javascript
// Implement caching for frequently accessed data
import { useQuery } from 'react-query';

export const useDrivers = (filters) => {
  return useQuery(
    ['drivers', filters],
    () => api.drivers.getDrivers(filters),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchInterval: 30000 // Refetch every 30 seconds
    }
  );
};
```

### 3. Performance Optimization

```javascript
// Lazy load components for better performance
import { lazy, Suspense } from 'react';

const RideManagement = lazy(() => import('./components/RideManagement'));
const DriverManagement = lazy(() => import('./components/DriverManagement'));
const Analytics = lazy(() => import('./components/Analytics'));

// Use in routing
<Route path="/rides" element={
  <Suspense fallback={<LoadingSpinner />}>
    <RideManagement />
  </Suspense>
} />
```

This integration guide ensures your admin panel works seamlessly with your existing customer and driver applications, providing a unified system for managing your ride-hailing platform.