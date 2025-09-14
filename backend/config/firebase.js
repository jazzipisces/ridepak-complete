const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
  });
}

const messaging = admin.messaging();

// Send push notification to single device
const sendPushNotification = async (token, title, body, data = {}) => {
  try {
    const message = {
      notification: {
        title,
        body,
      },
      data: {
        ...data,
        click_action: 'FLUTTER_NOTIFICATION_CLICK'
      },
      token,
      android: {
        notification: {
          sound: 'default',
          priority: 'high',
          channelId: 'ridepak_notifications'
        },
        data: data
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1
          }
        }
      }
    };

    const response = await messaging.send(message);
    return {
      success: true,
      messageId: response
    };
  } catch (error) {
    console.error('Firebase push notification error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Send push notification to multiple devices
const sendMulticastNotification = async (tokens, title, body, data = {}) => {
  try {
    const message = {
      notification: {
        title,
        body,
      },
      data,
      tokens,
      android: {
        notification: {
          sound: 'default',
          priority: 'high'
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default'
          }
        }
      }
    };

    const response = await messaging.sendMulticast(message);
    return {
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount
    };
  } catch (error) {
    console.error('Firebase multicast notification error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Subscribe to topic
const subscribeToTopic = async (tokens, topic) => {
  try {
    const response = await messaging.subscribeToTopic(tokens, topic);
    return {
      success: true,
      successCount: response.successCount
    };
  } catch (error) {
    console.error('Firebase subscribe to topic error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  admin,
  messaging,
  sendPushNotification,
  sendMulticastNotification,
  subscribeToTopic
};