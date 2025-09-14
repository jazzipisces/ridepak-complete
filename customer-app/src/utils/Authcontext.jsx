import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/Api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('customer_token');
      const userData = localStorage.getItem('customer_user');

      if (!token || !userData) {
        setLoading(false);
        return;
      }

      // Verify token with server
      const response = await api.get('/auth/verify', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
      } else {
        // Token is invalid
        localStorage.removeItem('customer_token');
        localStorage.removeItem('customer_user');
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth verification failed:', error);
      localStorage.removeItem('customer_token');
      localStorage.removeItem('customer_user');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/login', credentials);

      if (response.data.success) {
        const { token, user: userData } = response.data;
        
        // Store token and user data
        localStorage.setItem('customer_token', token);
        localStorage.setItem('customer_user', JSON.stringify(userData));
        
        setUser(userData);
        setIsAuthenticated(true);
        
        return { success: true, user: userData };
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/register', userData);

      if (response.data.success) {
        return { 
          success: true, 
          message: 'Registration successful. Please verify your account.',
          data: response.data 
        };
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('customer_token');
      
      if (token) {
        // Notify server about logout
        await api.post('/auth/logout', {}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage and state
      localStorage.removeItem('customer_token');
      localStorage.removeItem('customer_user');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const verifyOTP = async (otpData) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/verify-otp', otpData);

      if (response.data.success) {
        const { token, user: userData } = response.data;
        
        // Store token and user data
        localStorage.setItem('customer_token', token);
        localStorage.setItem('customer_user', JSON.stringify(userData));
        
        setUser(userData);
        setIsAuthenticated(true);
        
        return { success: true, user: userData };
      } else {
        throw new Error(response.data.message || 'OTP verification failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'OTP verification failed';
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async (contactInfo) => {
    try {
      const response = await api.post('/auth/resend-otp', contactInfo);

      if (response.data.success) {
        return { success: true, message: 'OTP sent successfully' };
      } else {
        throw new Error(response.data.message || 'Failed to send OTP');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send OTP';
      return { success: false, error: errorMessage };
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });

      if (response.data.success) {
        return { success: true, message: 'Password reset link sent to your email' };
      } else {
        throw new Error(response.data.message || 'Failed to send password reset link');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send password reset link';
      return { success: false, error: errorMessage };
    }
  };

  const resetPassword = async (resetData) => {
    try {
      const response = await api.post('/auth/reset-password', resetData);

      if (response.data.success) {
        return { success: true, message: 'Password reset successfully' };
      } else {
        throw new Error(response.data.message || 'Password reset failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Password reset failed';
      return { success: false, error: errorMessage };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('customer_token');
      const response = await api.put('/auth/profile', profileData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        const updatedUser = response.data.user;
        localStorage.setItem('customer_user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        return { success: true, user: updatedUser };
      } else {
        throw new Error(response.data.message || 'Profile update failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Profile update failed';
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (passwordData) => {
    try {
      const token = localStorage.getItem('customer_token');
      const response = await api.put('/auth/change-password', passwordData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        return { success: true, message: 'Password changed successfully' };
      } else {
        throw new Error(response.data.message || 'Password change failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Password change failed';
      return { success: false, error: errorMessage };
    }
  };

  const deleteAccount = async () => {
    try {
      const token = localStorage.getItem('customer_token');
      const response = await api.delete('/auth/delete-account', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        // Clear local data
        localStorage.removeItem('customer_token');
        localStorage.removeItem('customer_user');
        setUser(null);
        setIsAuthenticated(false);
        
        return { success: true, message: 'Account deleted successfully' };
      } else {
        throw new Error(response.data.message || 'Account deletion failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Account deletion failed';
      return { success: false, error: errorMessage };
    }
  };

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('customer_refresh_token');
      if (!refreshToken) throw new Error('No refresh token found');

      const response = await api.post('/auth/refresh-token', {
        refreshToken
      });

      if (response.data.success) {
        const { token } = response.data;
        localStorage.setItem('customer_token', token);
        return { success: true };
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      // Refresh failed, logout user
      logout();
      return { success: false };
    }
  };

  // Social login methods
  const googleLogin = async (googleToken) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/google', { token: googleToken });

      if (response.data.success) {
        const { token, user: userData } = response.data;
        
        localStorage.setItem('customer_token', token);
        localStorage.setItem('customer_user', JSON.stringify(userData));
        
        setUser(userData);
        setIsAuthenticated(true);
        
        return { success: true, user: userData };
      } else {
        throw new Error(response.data.message || 'Google login failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Google login failed';
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const facebookLogin = async (facebookToken) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/facebook', { token: facebookToken });

      if (response.data.success) {
        const { token, user: userData } = response.data;
        
        localStorage.setItem('customer_token', token);
        localStorage.setItem('customer_user', JSON.stringify(userData));
        
        setUser(userData);
        setIsAuthenticated(true);
        
        return { success: true, user: userData };
      } else {
        throw new Error(response.data.message || 'Facebook login failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Facebook login failed';
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    signup,
    logout,
    verifyOTP,
    resendOTP,
    forgotPassword,
    resetPassword,
    updateProfile,
    changePassword,
    deleteAccount,
    refreshToken,
    googleLogin,
    facebookLogin,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};