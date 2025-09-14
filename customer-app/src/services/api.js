// API service for handling all backend communications
// This would connect to your actual backend API

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  // Helper method to make HTTP requests
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
  async login(phoneNumber, otp) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, otp }),
    });
    
    if (response.token) {
      this.token = response.token;
      localStorage.setItem('authToken', response.token);
    }
    
    return response;
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async sendOTP(phoneNumber) {
    return this.request('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber }),
    });
  }

  async logout() {
    this.token = null;
    localStorage.removeItem('authToken');
    return this.request('/auth/logout', { method: 'POST' });
  }

  // User APIs
  async getUserProfile() {
    return this.request('/user/profile');
  }

  async updateUserProfile(userData) {
    return this.request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async uploadProfileImage(imageFile) {
    const formData = new FormData();
    formData.append('profileImage', imageFile);
    
    return this.request('/user/profile-image', {
      method: 'POST',
      body: formData,
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
    });
  }

  // Booking APIs
  async createBooking(bookingData) {
    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async getBookings(page = 1, limit = 10, status = null) {
    const params = new URLSearchParams({ page, limit });
    if (status) params.append('status', status);
    
    return this.request(`/bookings?${params}`);
  }

  async getBookingById(bookingId) {
    return this.request(`/bookings/${bookingId}`);
  }

  async cancelBooking(bookingId) {
    return this.request(`/bookings/${bookingId}/cancel`, {
      method: 'PUT',
    });
  }

  async rateRide(bookingId, rating, feedback = '') {
    return this.request(`/bookings/${bookingId}/rate`, {
      method: 'POST',
      body: JSON.stringify({ rating, feedback }),
    });
  }

  // Location APIs
  async searchLocations(query) {
    const params = new URLSearchParams({ q: query });
    return this.request(`/locations/search?${params}`);
  }

  async getEstimatedFare(fromLocation, toLocation, serviceType, vehicleType) {
    return this.request('/bookings/estimate-fare', {
      method: 'POST',
      body: JSON.stringify({
        fromLocation,
        toLocation,
        serviceType,
        vehicleType,
      }),
    });
  }

  async getNearbyDrivers(latitude, longitude, serviceType) {
    const params = new URLSearchParams({ lat: latitude, lng: longitude, type: serviceType });
    return this.request(`/drivers/nearby?${params}`);
  }

  // Payment APIs
  async getWalletBalance() {
    return this.request('/payments/wallet/balance');
  }

  async addMoneyToWallet(amount, paymentMethodId) {
    return this.request('/payments/wallet/add', {
      method: 'POST',
      body: JSON.stringify({ amount, paymentMethodId }),
    });
  }

  async getPaymentMethods() {
    return this.request('/payments/methods');
  }

  async addPaymentMethod(paymentMethodData) {
    return this.request('/payments/methods', {
      method: 'POST',
      body: JSON.stringify(paymentMethodData),
    });
  }

  async getTransactionHistory(page = 1, limit = 10) {
    const params = new URLSearchParams({ page, limit });
    return this.request(`/payments/transactions?${params}`);
  }

  // Promo Code APIs
  async validatePromoCode(promoCode, bookingAmount) {
    return this.request('/promo/validate', {
      method: 'POST',
      body: JSON.stringify({ promoCode, bookingAmount }),
    });
  }

  async getAvailablePromoCodes() {
    return this.request('/promo/available');
  }

  // Emergency APIs
  async addEmergencyContact(contactData) {
    return this.request('/user/emergency-contacts', {
      method: 'POST',
      body: JSON.stringify(contactData),
    });
  }

  async getEmergencyContacts() {
    return this.request('/user/emergency-contacts');
  }

  async triggerEmergencyAlert(bookingId, location) {
    return this.request('/emergency/alert', {
      method: 'POST',
      body: JSON.stringify({ bookingId, location }),
    });
  }

  // Support APIs
  async submitSupportTicket(ticketData) {
    return this.request('/support/tickets', {
      method: 'POST',
      body: JSON.stringify(ticketData),
    });
  }

  async getSupportTickets() {
    return this.request('/support/tickets');
  }

  // Real-time tracking (would use WebSocket in real implementation)
  async getBookingStatus(bookingId) {
    return this.request(`/bookings/${bookingId}/status`);
  }

  async getDriverLocation(bookingId) {
    return this.request(`/bookings/${bookingId}/driver-location`);
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;

// Export individual methods for easier imports
export const {
  login,
  register,
  sendOTP,
  logout,
  getUserProfile,
  updateUserProfile,
  createBooking,
  getBookings,
  cancelBooking,
  getWalletBalance,
  addMoneyToWallet,
  getPaymentMethods,
  validatePromoCode,
  addEmergencyContact,
  submitSupportTicket,
} = apiService;