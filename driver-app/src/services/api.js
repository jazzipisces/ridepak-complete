// API service for Driver App
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class DriverApiService {
  constructor() {
    this.token = localStorage.getItem('driverToken');
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Authentication APIs
  async login(phoneNumber, password) {
    const response = await this.request('/drivers/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, password }),
    });
    
    if (response.token) {
      this.token = response.token;
      localStorage.setItem('driverToken', response.token);
    }
    
    return response;
  }

  async register(driverData) {
    return this.request('/drivers/auth/register', {
      method: 'POST',
      body: JSON.stringify(driverData),
    });
  }

  async logout() {
    this.token = null;
    localStorage.removeItem('driverToken');
    return this.request('/drivers/auth/logout', { method: 'POST' });
  }

  // Driver Profile APIs
  async getDriverProfile() {
    return this.request('/drivers/profile');
  }

  async updateDriverProfile(profileData) {
    return this.request('/drivers/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async updateDriverStatus(status) {
    return this.request('/drivers/status', {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async updateDriverLocation(location) {
    return this.request('/drivers/location', {
      method: 'PUT',
      body: JSON.stringify(location),
    });
  }

  // Ride Management APIs
  async getRideRequests() {
    return this.request('/drivers/ride-requests');
  }

  async acceptRideRequest(requestId) {
    return this.request(`/drivers/ride-requests/${requestId}/accept`, {
      method: 'POST',
    });
  }

  async declineRideRequest(requestId, reason = '') {
    return this.request(`/drivers/ride-requests/${requestId}/decline`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async updateRideStatus(rideId, status, data = {}) {
    return this.request(`/rides/${rideId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, ...data }),
    });
  }

  async startRide(rideId, otp) {
    return this.request(`/rides/${rideId}/start`, {
      method: 'POST',
      body: JSON.stringify({ otp }),
    });
  }

  async completeRide(rideId, completionData) {
    return this.request(`/rides/${rideId}/complete`, {
      method: 'POST',
      body: JSON.stringify(completionData),
    });
  }

  async cancelRide(rideId, reason) {
    return this.request(`/rides/${rideId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async getRideHistory(page = 1, limit = 20) {
    const params = new URLSearchParams({ page, limit });
    return this.request(`/drivers/rides?${params}`);
  }

  // Earnings APIs
  async getEarnings(period = 'today') {
    return this.request(`/drivers/earnings?period=${period}`);
  }

  async getEarningsBreakdown(startDate, endDate) {
    const params = new URLSearchParams({ startDate, endDate });
    return this.request(`/drivers/earnings/breakdown?${params}`);
  }

  async requestWithdrawal(amount, accountId) {
    return this.request('/drivers/earnings/withdraw', {
      method: 'POST',
      body: JSON.stringify({ amount, accountId }),
    });
  }

  async getWithdrawalHistory() {
    return this.request('/drivers/earnings/withdrawals');
  }

  // Vehicle APIs
  async updateVehicleInfo(vehicleData) {
    return this.request('/drivers/vehicle', {
      method: 'PUT',
      body: JSON.stringify(vehicleData),
    });
  }

  async uploadVehiclePhoto(photoType, imageFile) {
    const formData = new FormData();
    formData.append('photo', imageFile);
    formData.append('type', photoType);
    
    return this.request('/drivers/vehicle/photos', {
      method: 'POST',
      body: formData,
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        // Don't set Content-Type for FormData
      },
    });
  }

  // Document APIs
  async uploadDocument(documentType, file) {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('type', documentType);
    
    return this.request('/drivers/documents/upload', {
      method: 'POST',
      body: formData,
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        // Don't set Content-Type for FormData
      },
    });
  }

  async getDocuments() {
    return this.request('/drivers/documents');
  }

  async deleteDocument(documentId) {
    return this.request(`/drivers/documents/${documentId}`, {
      method: 'DELETE',
    });
  }

  // Communication APIs
  async sendMessageToCustomer(rideId, message) {
    return this.request(`/rides/${rideId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message, sender: 'driver' }),
    });
  }

  async getRideMessages(rideId) {
    return this.request(`/rides/${rideId}/messages`);
  }

  // Emergency APIs
  async reportEmergency(rideId, emergencyData) {
    return this.request('/drivers/emergency', {
      method: 'POST',
      body: JSON.stringify({ rideId, ...emergencyData }),
    });
  }

  // Rating APIs
  async rateCustomer(rideId, rating, feedback = '') {
    return this.request(`/rides/${rideId}/rate-customer`, {
      method: 'POST',
      body: JSON.stringify({ rating, feedback }),
    });
  }

  async getDriverRatings() {
    return this.request('/drivers/ratings');
  }

  // Support APIs
  async createSupportTicket(ticketData) {
    return this.request('/drivers/support/tickets', {
      method: 'POST',
      body: JSON.stringify(ticketData),
    });
  }

  async getSupportTickets() {
    return this.request('/drivers/support/tickets');
  }

  // Notification APIs
  async markNotificationAsRead(notificationId) {
    return this.request(`/drivers/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  async getNotifications(page = 1, limit = 20) {
    const params = new URLSearchParams({ page, limit });
    return this.request(`/drivers/notifications?${params}`);
  }

  // Analytics APIs
  async getDriverAnalytics(period = 'week') {
    return this.request(`/drivers/analytics?period=${period}`);
  }

  async getPerformanceMetrics() {
    return this.request('/drivers/performance');
  }

  // Settings APIs
  async updateNotificationSettings(settings) {
    return this.request('/drivers/settings/notifications', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  async getDriverSettings() {
    return this.request('/drivers/settings');
  }

  async updateDriverSettings(settings) {
    return this.request('/drivers/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // Bank Account APIs
  async addBankAccount(accountData) {
    return this.request('/drivers/bank-accounts', {
      method: 'POST',
      body: JSON.stringify(accountData),
    });
  }

  async getBankAccounts() {
    return this.request('/drivers/bank-accounts');
  }

  async setDefaultBankAccount(accountId) {
    return this.request(`/drivers/bank-accounts/${accountId}/set-default`, {
      method: 'PUT',
    });
  }

  // Promotional APIs
  async getActivePromotions() {
    return this.request('/drivers/promotions/active');
  }

  async claimPromotion(promotionId) {
    return this.request(`/drivers/promotions/${promotionId}/claim`, {
      method: 'POST',
    });
  }

  // Location APIs
  async getNearbyHotspots() {
    return this.request('/drivers/hotspots/nearby');
  }

  async getTrafficInfo(coordinates) {
    const params = new URLSearchParams({
      lat: coordinates.lat,
      lng: coordinates.lng
    });
    return this.request(`/drivers/traffic-info?${params}`);
  }
}

// Create and export a singleton instance
const driverApiService = new DriverApiService();
export default driverApiService;

// Export individual methods for easier imports
export const {
  login,
  register,
  logout,
  getDriverProfile,
  updateDriverProfile,
  updateDriverStatus,
  acceptRideRequest,
  declineRideRequest,
  startRide,
  completeRide,
  cancelRide,
  getEarnings,
  uploadDocument,
  sendMessageToCustomer,
  reportEmergency,
  rateCustomer
} = driverApiService;