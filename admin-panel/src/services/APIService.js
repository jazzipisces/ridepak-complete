import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create API context
const APIContext = createContext();

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const APIProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Generic API call function
  const apiCall = async (endpoint, method = 'GET', data = null, params = null) => {
    try {
      setLoading(true);
      setError(null);

      const config = {
        method,
        url: endpoint,
        ...(data && { data }),
        ...(params && { params }),
      };

      const response = await apiClient(config);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Authentication APIs
  const authAPI = {
    login: (credentials) => apiCall('/api/admin/auth/login', 'POST', credentials),
    logout: () => apiCall('/api/admin/auth/logout', 'POST'),
    refreshToken: () => apiCall('/api/admin/auth/refresh', 'POST'),
    getProfile: () => apiCall('/api/admin/auth/profile', 'GET'),
  };

  // Dashboard APIs
  const dashboardAPI = {
    getStats: () => apiCall('/api/admin/dashboard/stats', 'GET'),
    getRevenueData: (timeRange) => apiCall('/api/admin/dashboard/revenue', 'GET', null, { range: timeRange }),
    getRideStatusData: () => apiCall('/api/admin/dashboard/ride-status', 'GET'),
    getDriverActivity: () => apiCall('/api/admin/dashboard/driver-activity', 'GET'),
  };

  // Ride Management APIs
  const rideAPI = {
    getRides: (filters) => apiCall('/api/admin/rides', 'GET', null, filters),
    getRideById: (rideId) => apiCall(`/api/admin/rides/${rideId}`, 'GET'),
    updateRideStatus: (rideId, status) => apiCall(`/api/admin/rides/${rideId}/status`, 'PUT', { status }),
    assignDriver: (rideId, driverId) => apiCall(`/api/admin/rides/${rideId}/assign`, 'POST', { driver_id: driverId }),
    cancelRide: (rideId, reason) => apiCall(`/api/admin/rides/${rideId}/cancel`, 'POST', { reason }),
    getRideHistory: (rideId) => apiCall(`/api/admin/rides/${rideId}/history`, 'GET'),
    exportRides: (filters) => apiCall('/api/admin/rides/export', 'GET', null, filters),
  };

  // Driver Management APIs
  const driverAPI = {
    getDrivers: (filters) => apiCall('/api/admin/drivers', 'GET', null, filters),
    getDriverById: (driverId) => apiCall(`/api/admin/drivers/${driverId}`, 'GET'),
    createDriver: (driverData) => apiCall('/api/admin/drivers', 'POST', driverData),
    updateDriver: (driverId, driverData) => apiCall(`/api/admin/drivers/${driverId}`, 'PUT', driverData),
    updateDriverStatus: (driverId, status) => apiCall(`/api/admin/drivers/${driverId}/status`, 'PUT', { status }),
    getDriverDocuments: (driverId) => apiCall(`/api/admin/drivers/${driverId}/documents`, 'GET'),
    approveDriver: (driverId) => apiCall(`/api/admin/drivers/${driverId}/approve`, 'POST'),
    suspendDriver: (driverId, reason) => apiCall(`/api/admin/drivers/${driverId}/suspend`, 'POST', { reason }),
    getDriverEarnings: (driverId, period) => apiCall(`/api/admin/drivers/${driverId}/earnings`, 'GET', null, { period }),
    exportDrivers: (filters) => apiCall('/api/admin/drivers/export', 'GET', null, filters),
  };

  // Customer Management APIs
  const customerAPI = {
    getCustomers: (filters) => apiCall('/api/admin/customers', 'GET', null, filters),
    getCustomerById: (customerId) => apiCall(`/api/admin/customers/${customerId}`, 'GET'),
    updateCustomer: (customerId, customerData) => apiCall(`/api/admin/customers/${customerId}`, 'PUT', customerData),
    updateCustomerStatus: (customerId, status) => apiCall(`/api/admin/customers/${customerId}/status`, 'PUT', { status }),
    getCustomerRides: (customerId) => apiCall(`/api/admin/customers/${customerId}/rides`, 'GET'),
    banCustomer: (customerId, reason) => apiCall(`/api/admin/customers/${customerId}/ban`, 'POST', { reason }),
    unbanCustomer: (customerId) => apiCall(`/api/admin/customers/${customerId}/unban`, 'POST'),
    exportCustomers: (filters) => apiCall('/api/admin/customers/export', 'GET', null, filters),
  };

  // Analytics APIs
  const analyticsAPI = {
    getAnalytics: (period, metrics) => apiCall('/api/admin/analytics', 'GET', null, { period, metrics }),
    getRevenueAnalytics: (period) => apiCall('/api/admin/analytics/revenue', 'GET', null, { period }),
    getPerformanceMetrics: () => apiCall('/api/admin/analytics/performance', 'GET'),
    getGeographicData: () => apiCall('/api/admin/analytics/geographic', 'GET'),
    getPeakHours: () => apiCall('/api/admin/analytics/peak-hours', 'GET'),
    getDriverPerformance: (driverId) => apiCall('/api/admin/analytics/driver-performance', 'GET', null, { driver_id: driverId }),
  };

  // Financial APIs
  const financeAPI = {
    getFinancialSummary: (period) => apiCall('/api/admin/finance/summary', 'GET', null, { period }),
    getPayments: (filters) => apiCall('/api/admin/finance/payments', 'GET', null, filters),
    getPayouts: (filters) => apiCall('/api/admin/finance/payouts', 'GET', null, filters),
    processPayouts: (driverIds) => apiCall('/api/admin/finance/payouts/process', 'POST', { driver_ids: driverIds }),
    getTransactions: (filters) => apiCall('/api/admin/finance/transactions', 'GET', null, filters),
    generateInvoice: (transactionId) => apiCall(`/api/admin/finance/transactions/${transactionId}/invoice`, 'GET'),
  };

  // System APIs
  const systemAPI = {
    getSystemStatus: () => apiCall('/api/admin/system/status', 'GET'),
    getSystemLogs: (filters) => apiCall('/api/admin/system/logs', 'GET', null, filters),
    getSystemSettings: () => apiCall('/api/admin/system/settings', 'GET'),
    updateSystemSettings: (settings) => apiCall('/api/admin/system/settings', 'PUT', settings),
    sendNotification: (notification) => apiCall('/api/admin/system/notifications', 'POST', notification),
    getNotifications: (filters) => apiCall('/api/admin/system/notifications', 'GET', null, filters),
    markNotificationRead: (notificationId) => apiCall(`/api/admin/system/notifications/${notificationId}/read`, 'PUT'),
    clearCache: () => apiCall('/api/admin/system/cache/clear', 'POST'),
    backupData: () => apiCall('/api/admin/system/backup', 'POST'),
  };

  // Reports APIs
  const reportAPI = {
    generateReport: (reportType, params) => apiCall('/api/admin/reports/generate', 'POST', { type: reportType, params }),
    getReportStatus: (reportId) => apiCall(`/api/admin/reports/${reportId}/status`, 'GET'),
    downloadReport: (reportId) => apiCall(`/api/admin/reports/${reportId}/download`, 'GET'),
    getScheduledReports: () => apiCall('/api/admin/reports/scheduled', 'GET'),
    scheduleReport: (reportConfig) => apiCall('/api/admin/reports/schedule', 'POST', reportConfig),
    cancelScheduledReport: (reportId) => apiCall(`/api/admin/reports/scheduled/${reportId}`, 'DELETE'),
  };

  // Integration APIs for Customer and Driver Apps
  const integrationAPI = {
    // Customer App Integration
    customerApp: {
      sendPushNotification: (customerId, notification) => 
        apiCall('/api/admin/integration/customer/push', 'POST', { customer_id: customerId, ...notification }),
      updateCustomerAppSettings: (settings) => 
        apiCall('/api/admin/integration/customer/settings', 'PUT', settings),
      getCustomerAppMetrics: () => 
        apiCall('/api/admin/integration/customer/metrics', 'GET'),
    },
    
    // Driver App Integration  
    driverApp: {
      sendPushNotification: (driverId, notification) => 
        apiCall('/api/admin/integration/driver/push', 'POST', { driver_id: driverId, ...notification }),
      updateDriverAppSettings: (settings) => 
        apiCall('/api/admin/integration/driver/settings', 'PUT', settings),
      getDriverAppMetrics: () => 
        apiCall('/api/admin/integration/driver/metrics', 'GET'),
      broadcastMessage: (message) => 
        apiCall('/api/admin/integration/driver/broadcast', 'POST', message),
    },

    // Real-time Location Updates
    location: {
      getDriverLocations: () => apiCall('/api/admin/integration/locations/drivers', 'GET'),
      getActiveRideLocations: () => apiCall('/api/admin/integration/locations/rides', 'GET'),
      updateGeofences: (geofences) => apiCall('/api/admin/integration/locations/geofences', 'PUT', geofences),
    },

    // Payment Integration
    payment: {
      processRefund: (paymentId, amount, reason) => 
        apiCall('/api/admin/integration/payment/refund', 'POST', { payment_id: paymentId, amount, reason }),
      getPaymentStatus: (paymentId) => 
        apiCall(`/api/admin/integration/payment/${paymentId}/status`, 'GET'),
      updatePaymentSettings: (settings) => 
        apiCall('/api/admin/integration/payment/settings', 'PUT', settings),
    }
  };

  const value = {
    // Core functionality
    apiCall,
    loading,
    error,
    
    // API modules
    auth: authAPI,
    dashboard: dashboardAPI,
    rides: rideAPI,
    drivers: driverAPI,
    customers: customerAPI,
    analytics: analyticsAPI,
    finance: financeAPI,
    system: systemAPI,
    reports: reportAPI,
    integration: integrationAPI,
  };

  return (
    <APIContext.Provider value={value}>
      {children}
    </APIContext.Provider>
  );
};

export const useAPI = () => {
  const context = useContext(APIContext);
  if (!context) {
    throw new Error('useAPI must be used within an APIProvider');
  }
  return context;
};