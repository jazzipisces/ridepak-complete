import axios from 'axios';
import { APP_CONFIG, STORAGE_KEYS, ERROR_MESSAGES } from '../constants';
import { getStoredToken, removeStoredTokens, setStoredTokens } from '../utils/storage';
import toast from 'react-hot-toast';

// Create axios instance
const apiClient = axios.create({
  baseURL: APP_CONFIG.apiBaseUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = getStoredToken(STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request timestamp
    config.metadata = { startTime: new Date() };
    
    if (process.env.NODE_ENV === 'development') {
      console.log('API Request:', config.method?.toUpperCase(), config.url, config.data);
    }
    
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
apiClient.interceptors.response.use(
  (response) => {
    // Log response time in development
    if (process.env.NODE_ENV === 'development') {
      const duration = new Date() - response.config.metadata.startTime;
      console.log('API Response:', response.config.url, `${duration}ms`);
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle token expiration
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = getStoredToken(STORAGE_KEYS.REFRESH_TOKEN);
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        const response = await axios.post(`${APP_CONFIG.apiBaseUrl}/auth/refresh`, {
          refreshToken,
        });
        
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        setStoredTokens(accessToken, newRefreshToken);
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        removeStoredTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    // Handle different error types
    const errorMessage = getErrorMessage(error);
    
    // Don't show toast for certain endpoints or if explicitly disabled
    if (!originalRequest.skipErrorToast) {
      toast.error(errorMessage);
    }
    
    console.error('API Error:', error.response?.status, errorMessage);
    
    return Promise.reject(error);
  }
);

// Helper function to extract error messages
const getErrorMessage = (error) => {
  if (!error.response) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }
  
  const { status, data } = error.response;
  
  switch (status) {
    case 400:
      return data?.message || 'Bad request';
    case 401:
      return ERROR_MESSAGES.SESSION_EXPIRED;
    case 403:
      return 'Access denied';
    case 404:
      return 'Resource not found';
    case 422:
      return data?.message || 'Validation error';
    case 429:
      return 'Too many requests. Please try again later.';
    case 500:
      return 'Server error. Please try again later.';
    case 503:
      return 'Service temporarily unavailable';
    default:
      return data?.message || ERROR_MESSAGES.GENERIC_ERROR;
  }
};

// API wrapper functions
export const api = {
  // Generic HTTP methods
  get: (url, config = {}) => apiClient.get(url, config),
  post: (url, data, config = {}) => apiClient.post(url, data, config),
  put: (url, data, config = {}) => apiClient.put(url, data, config),
  patch: (url, data, config = {}) => apiClient.patch(url, data, config),
  delete: (url, config = {}) => apiClient.delete(url, config),
  
  // File upload
  uploadFile: (url, file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return apiClient.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const progress = (progressEvent.loaded / progressEvent.total) * 100;
          onProgress(Math.round(progress));
        }
      },
    });
  },
  
  // Batch requests
  batch: (requests) => {
    return Promise.allSettled(requests);
  },
  
  // Request with retry logic
  retry: async (requestFn, maxRetries = 3, delay = 1000) => {
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error;
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        }
      }
    }
    
    throw lastError;
  },
};

// Specific API endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

export const driverAPI = {
  getProfile: () => api.get('/driver/profile'),
  updateProfile: (data) => api.put('/driver/profile', data),
  updateStatus: (status) => api.patch('/driver/status', { status }),
  updateLocation: (location) => api.post('/driver/location', location),
  getDocuments: () => api.get('/driver/documents'),
  uploadDocument: (type, file, onProgress) => 
    api.uploadFile(`/driver/documents/${type}`, file, onProgress),
  updateVehicle: (vehicleData) => api.put('/driver/vehicle', vehicleData),
};

export const ridesAPI = {
  getRides: (params) => api.get('/rides', { params }),
  getRide: (id) => api.get(`/rides/${id}`),
  acceptRide: (id) => api.post(`/rides/${id}/accept`),
  startRide: (id) => api.post(`/rides/${id}/start`),
  completeRide: (id, data) => api.post(`/rides/${id}/complete`, data),
  cancelRide: (id, reason) => api.post(`/rides/${id}/cancel`, { reason }),
  updateRideLocation: (id, location) => api.patch(`/rides/${id}/location`, location),
};

export const earningsAPI = {
  getEarnings: (params) => api.get('/earnings', { params }),
  getEarningSummary: (period) => api.get('/earnings/summary', { params: { period } }),
  getPayouts: () => api.get('/earnings/payouts'),
  requestPayout: (amount) => api.post('/earnings/payout', { amount }),
};

export const supportAPI = {
  getTickets: () => api.get('/support/tickets'),
  createTicket: (data) => api.post('/support/tickets', data),
  getTicket: (id) => api.get(`/support/tickets/${id}`),
  updateTicket: (id, data) => api.patch(`/support/tickets/${id}`, data),
};

export const notificationsAPI = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  updateSettings: (settings) => api.put('/notifications/settings', settings),
};

// Request/Response helpers
export const createFormData = (data) => {
  const formData = new FormData();
  Object.keys(data).forEach(key => {
    if (data[key] !== null && data[key] !== undefined) {
      formData.append(key, data[key]);
    }
  });
  return formData;
};

export const handleApiError = (error, customMessage) => {
  const message = customMessage || getErrorMessage(error);
  console.error('API Error:', error);
  return { error: true, message };
};

export const handleApiSuccess = (response, customMessage) => {
  const message = customMessage || 'Operation successful';
  return { 
    error: false, 
    message, 
    data: response.data 
  };
};

export default apiClient;