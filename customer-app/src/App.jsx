import React, { useEffect, useState, useCallback } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StripeProvider } from '@stripe/stripe-react-native';
import NetInfo from '@react-native-community/netinfo';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Redux Store
import { store, persistor } from './src/store/store';

// Navigation
import AppNavigator from './src/navigation/AppNavigator';
import AuthNavigator from './src/navigation/AuthNavigator';

// Components
import SplashScreen from './src/components/SplashScreen';
import LoadingOverlay from './src/components/LoadingOverlay';
import NetworkStatusBar from './src/components/NetworkStatusBar';
import UpdatePrompt from './src/components/UpdatePrompt';
import MaintenanceScreen from './src/components/MaintenanceScreen';
import ErrorBoundary from './src/components/ErrorBoundary';

// Services
import { initializeApp } from './src/services/AppService';
import { setupPushNotifications } from './src/services/PushNotificationService';
import { startLocationService } from './src/services/LocationService';
import { initializeSocket } from './src/services/SocketService';
import { checkForUpdates } from './src/services/UpdateService';

// Utils
import { requestPermissions } from './src/utils/PermissionUtils';
import { setupCrashReporting } from './src/utils/CrashReporting';
import { initializeAnalytics } from './src/utils/Analytics';

// Hooks
import { useAppDispatch, useAppSelector } from './src/hooks/redux';
import { useNetworkStatus } from './src/hooks/useNetworkStatus';
import { useAppState } from './src/hooks/useAppState';

// Actions
import {
  setIsAuthenticated,
  setUser,
  setAppInitialized,
  setNetworkStatus,
  setAppState,
  setMaintenanceMode
} from './src/store/slices/appSlice';

// Constants
import { STORAGE_KEYS, APP_CONFIG } from './src/utils/constants';

// Styles
import { toastConfig } from './src/components/ToastConfig';

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <PersistGate loading={<SplashScreen />} persistor={persistor}>
          <StripeProvider 
            publishableKey={APP_CONFIG.STRIPE_PUBLISHABLE_KEY}
            merchantIdentifier={APP_CONFIG.APPLE_MERCHANT_ID}
            urlScheme={APP_CONFIG.URL_SCHEME}
          >
            <SafeAreaProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <AppContent />
                <Toast config={toastConfig} />
              </GestureHandlerRootView>
            </SafeAreaProvider>
          </StripeProvider>
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  );
};

const AppContent = () => {
  const dispatch = useAppDispatch();
  
  // Redux State
  const {
    isAuthenticated,
    user,
    isAppInitialized,
    networkStatus,
    appState,
    maintenanceMode,
    forceUpdate
  } = useAppSelector((state) => state.app);

  // Local State
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState(null);

  // Custom Hooks
  const networkInfo = useNetworkStatus();
  const appStateStatus = useAppState();

  /**
   * Initialize the application
   */
  const initializeApplication = useCallback(async () => {
    try {
      setIsInitializing(true);
      setInitError(null);

      // 1. Setup crash reporting
      await setupCrashReporting();

      // 2. Initialize analytics
      await initializeAnalytics();

      // 3. Check for maintenance mode
      const maintenanceStatus = await checkMaintenanceMode();
      if (maintenanceStatus.isActive) {
        dispatch(setMaintenanceMode(maintenanceStatus));
        setIsInitializing(false);
        return;
      }

      // 4. Request necessary permissions
      await requestPermissions();

      // 5. Initialize core services
      await initializeApp();

      // 6. Check authentication status
      const authStatus = await checkAuthenticationStatus();
      dispatch(setIsAuthenticated(authStatus.isAuthenticated));
      
      if (authStatus.user) {
        dispatch(setUser(authStatus.user));
      }

      // 7. Initialize location services (if authenticated)
      if (authStatus.isAuthenticated) {
        await startLocationService();
      }

      // 8. Setup push notifications
      await setupPushNotifications();

      // 9. Initialize socket connection (if authenticated)
      if (authStatus.isAuthenticated) {
        await initializeSocket();
      }

      // 10. Check for app updates
      await checkForUpdates();

      // 11. Mark app as initialized
      dispatch(setAppInitialized(true));

      setIsInitializing(false);

    } catch (error) {
      console.error('App initialization failed:', error);
      setInitError(error);
      setIsInitializing(false);
    }
  }, [dispatch]);

  /**
   * Check authentication status from storage
   */
  const checkAuthenticationStatus = async () => {
    try {
      const [token, userData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.USER_DATA)
      ]);

      if (token && userData) {
        const user = JSON.parse(userData);
        
        // Validate token (you might want to verify with backend)
        const isValidToken = await validateAuthToken(token);
        
        if (isValidToken) {
          return { isAuthenticated: true, user };
        } else {
          // Clear invalid token
          await AsyncStorage.multiRemove([
            STORAGE_KEYS.AUTH_TOKEN,
            STORAGE_KEYS.USER_DATA
          ]);
        }
      }

      return { isAuthenticated: false, user: null };
    } catch (error) {
      console.error('Auth status check failed:', error);
      return { isAuthenticated: false, user: null };
    }
  };

  /**
   * Validate auth token with backend
   */
  const validateAuthToken = async (token) => {
    try {
      // Implement token validation logic
      // This could be a simple API call to verify token validity
      return true; // Simplified for now
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  };

  /**
   * Check maintenance mode status
   */
  const checkMaintenanceMode = async () => {
    try {
      // Check with backend for maintenance status
      // This could be a simple API call or check a config endpoint
      return { isActive: false, message: '', estimatedEndTime: null };
    } catch (error) {
      console.error('Maintenance check failed:', error);
      return { isActive: false, message: '', estimatedEndTime: null };
    }
  };

  /**
   * Handle network status changes
   */
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      dispatch(setNetworkStatus({
        isConnected: state.isConnected,
        type: state.type,
        isInternetReachable: state.isInternetReachable
      }));
    });

    return unsubscribe;
  }, [dispatch]);

  /**
   * Handle app state changes
   */
  useEffect(() => {
    dispatch(setAppState(appStateStatus));

    // Handle app becoming active
    if (appStateStatus === 'active' && isAppInitialized) {
      // Refresh critical data when app becomes active
      handleAppBecameActive();
    }

    // Handle app going to background
    if (appStateStatus === 'background') {
      handleAppWentToBackground();
    }
  }, [appStateStatus, isAppInitialized, dispatch]);

  /**
   * Handle app becoming active
   */
  const handleAppBecameActive = useCallback(async () => {
    try {
      // Check for app updates
      await checkForUpdates();

      // Refresh authentication if needed
      if (isAuthenticated) {
        // Refresh user data or validate token
        // await refreshUserData();
      }

      // Resume location services if needed
      if (isAuthenticated) {
        await startLocationService();
      }
    } catch (error) {
      console.error('App became active handler failed:', error);
    }
  }, [isAuthenticated]);

  /**
   * Handle app going to background
   */
  const handleAppWentToBackground = useCallback(() => {
    try {
      // Save any pending data
      // Stop location services to save battery
      // Cleanup resources
    } catch (error) {
      console.error('App went to background handler failed:', error);
    }
  }, []);

  /**
   * Initialize app on mount
   */
  useEffect(() => {
    initializeApplication();
  }, [initializeApplication]);

  /**
   * Render appropriate screen based on app state
   */
  const renderContent = () => {
    // Show maintenance screen if in maintenance mode
    if (maintenanceMode?.isActive) {
      return <MaintenanceScreen maintenanceInfo={maintenanceMode} />;
    }

    // Show loading screen during initialization
    if (isInitializing) {
      return <SplashScreen />;
    }

    // Show error screen if initialization failed
    if (initError) {
      return (
        <InitializationErrorScreen 
          error={initError} 
          onRetry={initializeApplication} 
        />
      );
    }

    // Show update prompt if force update required
    if (forceUpdate) {
      return <UpdatePrompt />;
    }

    // Show appropriate navigator based on authentication
    return (
      <NavigationContainer
        onReady={() => {
          // Navigation is ready
          console.log('Navigation ready');
        }}
        onStateChange={(state) => {
          // Track navigation state changes for analytics
          console.log('Navigation state changed:', state);
        }}
      >
        {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
      </NavigationContainer>
    );
  };

  return (
    <>
      {renderContent()}
      <NetworkStatusBar />
      <LoadingOverlay />
    </>
  );
};

/**
 * Error screen shown when app initialization fails
 */
const InitializationErrorScreen = ({ error, onRetry }) => {
  return (
    <div style={styles.errorContainer}>
      <div style={styles.errorContent}>
        <h2 style={styles.errorTitle}>Oops! Something went wrong</h2>
        <p style={styles.errorMessage}>
          We're having trouble starting the app. Please try again.
        </p>
        <button style={styles.retryButton} onClick={onRetry}>
          Try Again
        </button>
        <p style={styles.errorDetails}>
          {error?.message || 'Unknown error occurred'}
        </p>
      </div>
    </div>
  );
};

/**
 * Styles for error screen
 */
const styles = {
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa'
  },
  errorContent: {
    textAlign: 'center',
    maxWidth: 400
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#dc3545',
    marginBottom: 16
  },
  errorMessage: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 24,
    lineHeight: 1.5
  },
  retryButton: {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    padding: '12px 24px',
    fontSize: 16,
    fontWeight: '500',
    cursor: 'pointer',
    marginBottom: 16,
    transition: 'background-color 0.2s'
  },
  errorDetails: {
    fontSize: 12,
    color: '#adb5bd',
    fontFamily: 'monospace',
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 4,
    border: '1px solid #dee2e6'
  }
};

export default App;