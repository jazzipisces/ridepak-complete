const admin = require('firebase-admin');
const apn = require('apn');

class PushNotificationService {
  constructor() {
    // Initialize Firebase Admin SDK
    this.initializeFirebase();
    
    // Initialize Apple Push Notification service
    this.initializeAPN();

    // Notification templates
    this.templates = {
      RIDE_BOOKED: {
        title: 'Ride Confirmed!',
        body: 'Your ride is booked. Driver: {driverName}',
        icon: 'ride_icon',
        sound: 'default'
      },
      DRIVER_ASSIGNED: {
        title: 'Driver Assigned',
        body: '{driverName} is on the way. ETA: {eta} minutes',
        icon: 'driver_icon',
        sound: 'default'
      },
      DRIVER_ARRIVED: {
        title: 'Driver Arrived',
        body: 'Your driver has arrived at the pickup location',
        icon: 'arrival_icon',
        sound: 'arrival_sound'
      },
      RIDE_STARTED: {
        title: 'Ride Started',
        body: 'Your journey has begun. Enjoy your ride!',
        icon: 'journey_icon',
        sound: 'default'
      },
      RIDE_COMPLETED: {
        title: 'Ride Completed',
        body: 'Thanks for riding with us! Amount: ${amount}',
        icon: 'success_icon',
        sound: 'success_sound'
      },
      RIDE_CANCELLED: {
        title: 'Ride Cancelled',
        body: 'Your ride has been cancelled. {reason}',
        icon: 'cancel_icon',
        sound: 'default'
      },
      PAYMENT_SUCCESS: {
        title: 'Payment Successful',
        body: 'Payment of ${amount} processed successfully',
        icon: 'payment_icon',
        sound: 'success_sound'
      },
      PAYMENT_FAILED: {
        title: 'Payment Failed',
        body: 'Payment could not be processed. Please try again',
        icon: 'error_icon',
        sound: 'error_sound'
      },
      NEW_RIDE_REQUEST: {
        title: 'New Ride Request',
        body: 'Ride request from {location}. Tap to accept',
        icon: 'request_icon',
        sound: 'notification_sound'
      },
      PROMO_NOTIFICATION: {
        title: 'Special Offer!',
        body: 'Get {discount}% off your next ride. Use code: {promoCode}',
        icon: 'promo_icon',
        sound: 'default'
      },
      EMERGENCY_ALERT: {
        title: 'Emergency Alert',
        body: 'Emergency services have been notified',
        icon: 'emergency_icon',
        sound: 'emergency_sound'
      },
      RATING_REQUEST: {
        title: 'Rate Your Ride',
        body: 'How was your experience? Tap to rate',
        icon: 'star_icon',
        sound: 'default'
      }
    };
  }

  /**
   * Initialize Firebase Admin SDK
   */
  initializeFirebase() {
    try {
      if (!admin.apps.length) {
        const serviceAccount = {
          type: process.env.FIREBASE_TYPE,
          project_id: process.env.FIREBASE_PROJECT_ID,
          private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
          private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          client_email: process.env.FIREBASE_CLIENT_EMAIL,
          client_id: process.env.FIREBASE_CLIENT_ID,
          auth_uri: process.env.FIREBASE_AUTH_URI,
          token_uri: process.env.FIREBASE_TOKEN_URI,
          auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
          client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
        };

        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          databaseURL: process.env.FIREBASE_DATABASE_URL
        });
      }

      this.messaging = admin.messaging();
      console.log('Firebase Admin initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Firebase:', error);
    }
  }

  /**
   * Initialize Apple Push Notification service
   */
  initializeAPN() {
    try {
      const apnOptions = {
        token: {
          key: process.env.APN_KEY_PATH,
          keyId: process.env.APN_KEY_ID,
          teamId: process.env.APN_TEAM_ID
        },
        production: process.env.NODE_ENV === 'production'
      };

      this.apnProvider = new apn.Provider(apnOptions);
      console.log('APN initialized successfully');
    } catch (error) {
      console.error('Failed to initialize APN:', error);
    }
  }

  /**
   * Send push notification to a single device
   */
  async sendToDevice(deviceToken, templateKey, data = {}, options = {}) {
    try {
      const template = this.templates[templateKey];
      if (!template) {
        throw new Error(`Template ${templateKey} not found`);
      }

      // Replace placeholders in template
      const notification = {
        title: this.replacePlaceholders(template.title, data),
        body: this.replacePlaceholders(template.body, data),
        icon: template.icon,
        sound: template.sound
      };

      const message = {
        token: deviceToken,
        notification,
        data: {
          type: templateKey,
          ...data
        },
        android: {
          priority: options.priority || 'normal',
          notification: {
            icon: template.icon,
            color: '#007bff',
            sound: template.sound,
            clickAction: options.clickAction || 'FLUTTER_NOTIFICATION_CLICK'
          }
        },
        apns: {
          payload: {
            aps: {
              alert: {
                title: notification.title,
                body: notification.body
              },
              sound: template.sound,
              badge: options.badge || 1
            }
          }
        }
      };

      const result = await this.messaging.send(message);
      
      // Log notification
      await this.logNotification({
        deviceToken,
        templateKey,
        title: notification.title,
        body: notification.body,
        data,
        messageId: result,
        status: 'sent',
        platform: 'android'
      });

      return { success: true, messageId: result };

    } catch (error) {
      console.error('Failed to send push notification:', error);
      
      // Log failed notification
      await this.logNotification({
        deviceToken,
        templateKey,
        error: error.message,
        status: 'failed'
      });

      return { success: false, error: error.message };
    }
  }

  /**
   * Send push notification to multiple devices
   */
  async sendToMultipleDevices(deviceTokens, templateKey, data = {}, options = {}) {
    try {
      const template = this.templates[templateKey];
      if (!template) {
        throw new Error(`Template ${templateKey} not found`);
      }

      const notification = {
        title: this.replacePlaceholders(template.title, data),
        body: this.replacePlaceholders(template.body, data)
      };

      const message = {
        tokens: deviceTokens,
        notification,
        data: {
          type: templateKey,
          ...data
        },
        android: {
          priority: options.priority || 'normal',
          notification: {
            icon: template.icon,
            color: '#007bff',
            sound: template.sound
          }
        },
        apns: {
          payload: {
            aps: {
              alert: notification,
              sound: template.sound,
              badge: options.badge || 1
            }
          }
        }
      };

      const response = await this.messaging.sendMulticast(message);
      
      // Log batch notification
      await this.logBatchNotification({
        deviceTokens,
        templateKey,
        successCount: response.successCount,
        failureCount: response.failureCount,
        responses: response.responses
      });

      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
        responses: response.responses
      };

    } catch (error) {
      console.error('Failed to send multicast notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send notification to topic (broadcast)
   */
  async sendToTopic(topic, templateKey, data = {}, options = {}) {
    try {
      const template = this.templates[templateKey];
      if (!template) {
        throw new Error(`Template ${templateKey} not found`);
      }

      const notification = {
        title: this.replacePlaceholders(template.title, data),
        body: this.replacePlaceholders(template.body, data)
      };

      const message = {
        topic,
        notification,
        data: {
          type: templateKey,
          ...data
        },
        android: {
          priority: options.priority || 'normal',
          notification: {
            icon: template.icon,
            color: '#007bff',
            sound: template.sound
          }
        },
        apns: {
          payload: {
            aps: {
              alert: notification,
              sound: template.sound
            }
          }
        }
      };

      const result = await this.messaging.send(message);
      
      // Log topic notification
      await this.logNotification({
        topic,
        templateKey,
        title: notification.title,
        body: notification.body,
        messageId: result,
        status: 'sent',
        type: 'topic'
      });

      return { success: true, messageId: result };

    } catch (error) {
      console.error('Failed to send topic notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Subscribe device to topic
   */
  async subscribeToTopic(deviceTokens, topic) {
    try {
      const tokens = Array.isArray(deviceTokens) ? deviceTokens : [deviceTokens];
      const response = await this.messaging.subscribeToTopic(tokens, topic);
      
      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
        errors: response.errors
      };
    } catch (error) {
      console.error('Failed to subscribe to topic:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Unsubscribe device from topic
   */
  async unsubscribeFromTopic(deviceTokens, topic) {
    try {
      const tokens = Array.isArray(deviceTokens) ? deviceTokens : [deviceTokens];
      const response = await this.messaging.unsubscribeFromTopic(tokens, topic);
      
      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
        errors: response.errors
      };
    } catch (error) {
      console.error('Failed to unsubscribe from topic:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send iOS notification using APNs
   */
  async sendAPNSNotification(deviceToken, templateKey, data = {}) {
    try {
      if (!this.apnProvider) {
        throw new Error('APN not initialized');
      }

      const template = this.templates[templateKey];
      const notification = new apn.Notification();
      
      notification.expiry = Math.floor(Date.now() / 1000) + 3600; // 1 hour
      notification.badge = 1;
      notification.sound = template.sound;
      notification.alert = {
        title: this.replacePlaceholders(template.title, data),
        body: this.replacePlaceholders(template.body, data)
      };
      notification.payload = { type: templateKey, ...data };
      notification.topic = process.env.APN_BUNDLE_ID;

      const result = await this.apnProvider.send(notification, deviceToken);
      
      if (result.failed.length > 0) {
        console.error('APN send failed:', result.failed);
        return { success: false, errors: result.failed };
      }

      return { success: true, sent: result.sent };

    } catch (error) {
      console.error('Failed to send APN notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Specific notification methods for different events
   */

  async notifyRideBooked(deviceToken, rideData) {
    return await this.sendToDevice(deviceToken, 'RIDE_BOOKED', {
      driverName: rideData.driverName,
      rideId: rideData.rideId
    });
  }

  async notifyDriverAssigned(deviceToken, driverData) {
    return await this.sendToDevice(deviceToken, 'DRIVER_ASSIGNED', {
      driverName: driverData.name,
      eta: driverData.eta
    });
  }

  async notifyDriverArrived(deviceToken) {
    return await this.sendToDevice(deviceToken, 'DRIVER_ARRIVED', {}, {
      priority: 'high',
      clickAction: 'OPEN_RIDE_TRACKING'
    });
  }

  async notifyRideStarted(deviceToken) {
    return await this.sendToDevice(deviceToken, 'RIDE_STARTED');
  }

  async notifyRideCompleted(deviceToken, amount) {
    return await this.sendToDevice(deviceToken, 'RIDE_COMPLETED', { amount });
  }

  async notifyRideCancelled(deviceToken, reason) {
    return await this.sendToDevice(deviceToken, 'RIDE_CANCELLED', { reason });
  }

  async notifyPaymentSuccess(deviceToken, amount) {
    return await this.sendToDevice(deviceToken, 'PAYMENT_SUCCESS', { amount });
  }

  async notifyPaymentFailed(deviceToken) {
    return await this.sendToDevice(deviceToken, 'PAYMENT_FAILED', {}, {
      priority: 'high',
      clickAction: 'OPEN_PAYMENT_SCREEN'
    });
  }

  async notifyNewRideRequest(deviceToken, location) {
    return await this.sendToDevice(deviceToken, 'NEW_RIDE_REQUEST', { location }, {
      priority: 'high',
      clickAction: 'OPEN_RIDE_REQUEST'
    });
  }

  async sendPromoNotification(deviceTokens, promoData) {
    return await this.sendToMultipleDevices(deviceTokens, 'PROMO_NOTIFICATION', {
      discount: promoData.discount,
      promoCode: promoData.code
    });
  }

  async sendEmergencyAlert(deviceToken, rideId) {
    return await this.sendToDevice(deviceToken, 'EMERGENCY_ALERT', { rideId }, {
      priority: 'high'
    });
  }

  async requestRating(deviceToken, rideId) {
    return await this.sendToDevice(deviceToken, 'RATING_REQUEST', { rideId }, {
      clickAction: 'OPEN_RATING_SCREEN'
    });
  }

  /**
   * Broadcast notifications
   */
  async broadcastToAllUsers(templateKey, data = {}) {
    return await this.sendToTopic('all_users', templateKey, data);
  }

  async broadcastToDrivers(templateKey, data = {}) {
    return await this.sendToTopic('drivers', templateKey, data);
  }

  async broadcastToPassengers(templateKey, data = {}) {
    return await this.sendToTopic('passengers', templateKey, data);
  }

  /**
   * Utility functions
   */
  replacePlaceholders(text, data) {
    return text.replace(/\{(\w+)\}/g, (match, key) => {
      return data[key] || match;
    });
  }

  /**
   * Validate device token
   */
  async validateToken(deviceToken) {
    try {
      // Send a test message to validate token
      const message = {
        token: deviceToken,
        data: { test: 'true' },
        dryRun: true // Don't actually send
      };

      await this.messaging.send(message);
      return { valid: true };
    } catch (error) {
      return { valid: false, error: error.code };
    }
  }

  /**
   * Log notification for analytics
   */
  async logNotification(notificationData) {
    try {
      const log = {
        ...notificationData,
        timestamp: new Date()
      };

      // Save to database (implement based on your DB)
      // await NotificationLog.create(log);
      
      console.log('Notification logged:', log);
    } catch (error) {
      console.error('Failed to log notification:', error);
    }
  }

  /**
   * Log batch notification
   */
  async logBatchNotification(batchData) {
    try {
      const log = {
        ...batchData,
        timestamp: new Date(),
        type: 'batch'
      };

      // Save to database
      console.log('Batch notification logged:', log);
    } catch (error) {
      console.error('Failed to log batch notification:', error);
    }
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(startDate, endDate) {
    try {
      // Implement based on your database
      return {
        totalSent: 0,
        totalDelivered: 0,
        totalFailed: 0,
        deliveryRate: 0,
        platforms: {
          android: 0,
          ios: 0
        },
        templates: {}
      };
    } catch (error) {
      console.error('Failed to get notification stats:', error);
      return null;
    }
  }

  /**
   * Schedule notification (requires job queue like Bull/Agenda)
   */
  async scheduleNotification(deviceToken, templateKey, data, scheduleTime) {
    try {
      // This would integrate with your job queue system
      const job = {
        deviceToken,
        templateKey,
        data,
        scheduleTime,
        status: 'scheduled'
      };

      // Add to job queue
      // await notificationQueue.add('send-notification', job, {
      //   delay: scheduleTime - Date.now()
      // });

      console.log('Notification scheduled:', job);
      return { success: true, jobId: 'scheduled_job_id' };

    } catch (error) {
      console.error('Failed to schedule notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Handle notification delivery reports
   */
  async handleDeliveryReport(reportData) {
    try {
      // Update notification status in database
      // await NotificationLog.updateOne(
      //   { messageId: reportData.messageId },
      //   { status: reportData.status, deliveredAt: new Date() }
      // );

      console.log('Delivery report processed:', reportData);
    } catch (error) {
      console.error('Failed to handle delivery report:', error);
    }
  }

  /**
   * Get user notification preferences
   */
  async getUserPreferences(userId) {
    try {
      // Fetch from database
      // const preferences = await UserNotificationPreference.findOne({ userId });
      
      // Default preferences
      return {
        rideUpdates: true,
        promotions: true,
        emergencyAlerts: true,
        paymentNotifications: true,
        sounds: true,
        vibration: true
      };
    } catch (error) {
      console.error('Failed to get user preferences:', error);
      return null;
    }
  }

  /**
   * Update user notification preferences
   */
  async updateUserPreferences(userId, preferences) {
    try {
      // Update in database
      // await UserNotificationPreference.updateOne(
      //   { userId },
      //   preferences,
      //   { upsert: true }
      // );

      console.log(`Preferences updated for user ${userId}:`, preferences);
      return { success: true };
    } catch (error) {
      console.error('Failed to update user preferences:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Clean up invalid tokens
   */
  async cleanupInvalidTokens() {
    try {
      // Get all device tokens from database
      // const tokens = await DeviceToken.find({});
      
      const invalidTokens = [];
      
      // Validate tokens in batches
      // for (const token of tokens) {
      //   const validation = await this.validateToken(token.token);
      //   if (!validation.valid) {
      //     invalidTokens.push(token.token);
      //   }
      // }

      // Remove invalid tokens from database
      // if (invalidTokens.length > 0) {
      //   await DeviceToken.deleteMany({ token: { $in: invalidTokens } });
      // }

      console.log(`Cleaned up ${invalidTokens.length} invalid tokens`);
      return { cleanedUp: invalidTokens.length };

    } catch (error) {
      console.error('Failed to cleanup invalid tokens:', error);
      return { error: error.message };
    }
  }

  /**
   * Send silent notification (data only)
   */
  async sendSilentNotification(deviceToken, data) {
    try {
      const message = {
        token: deviceToken,
        data,
        android: {
          priority: 'high'
        },
        apns: {
          headers: {
            'apns-push-type': 'background',
            'apns-priority': '5'
          },
          payload: {
            aps: {
              'content-available': 1
            }
          }
        }
      };

      const result = await this.messaging.send(message);
      return { success: true, messageId: result };

    } catch (error) {
      console.error('Failed to send silent notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send rich notification with image
   */
  async sendRichNotification(deviceToken, templateKey, data, imageUrl) {
    try {
      const template = this.templates[templateKey];
      const notification = {
        title: this.replacePlaceholders(template.title, data),
        body: this.replacePlaceholders(template.body, data),
        image: imageUrl
      };

      const message = {
        token: deviceToken,
        notification,
        data: {
          type: templateKey,
          ...data
        },
        android: {
          notification: {
            imageUrl,
            icon: template.icon,
            color: '#007bff'
          }
        },
        apns: {
          payload: {
            aps: {
              alert: {
                title: notification.title,
                body: notification.body
              },
              'mutable-content': 1
            }
          },
          fcm_options: {
            image: imageUrl
          }
        }
      };

      const result = await this.messaging.send(message);
      return { success: true, messageId: result };

    } catch (error) {
      console.error('Failed to send rich notification:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new PushNotificationService();