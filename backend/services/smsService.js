const twilio = require('twilio');
const nodemailer = require('nodemailer');

class SMSService {
  constructor() {
    // Twilio configuration
    this.twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    this.twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

    // SMS templates
    this.templates = {
      OTP_VERIFICATION: 'Your verification code is: {otp}. Valid for 10 minutes.',
      RIDE_BOOKED: 'Ride booked! Driver {driverName} will pick you up at {time}. Vehicle: {vehicle}',
      RIDE_ASSIGNED: 'New ride assigned! Pickup: {pickup} at {time}. Passenger: {passengerName}',
      RIDE_STARTED: 'Your ride has started. Driver: {driverName}, Vehicle: {vehicle}. Track: {trackingLink}',
      RIDE_COMPLETED: 'Ride completed! Amount: ${amount}. Thanks for using our service!',
      RIDE_CANCELLED: 'Your ride has been cancelled. Reason: {reason}',
      PAYMENT_SUCCESS: 'Payment of ${amount} processed successfully for ride #{rideId}',
      DRIVER_ARRIVED: 'Your driver {driverName} has arrived at the pickup location.',
      EMERGENCY_ALERT: 'Emergency alert activated for ride #{rideId}. Location: {location}',
      PROMO_CODE: 'Use promo code {promoCode} and get {discount}% off your next ride!'
    };

    // Rate limiting store (in production, use Redis)
    this.rateLimitStore = new Map();
    this.maxSMSPerHour = 10;
  }

  /**
   * Send SMS using Twilio
   */
  async sendSMS(phoneNumber, message, options = {}) {
    try {
      // Validate phone number format
      if (!this.isValidPhoneNumber(phoneNumber)) {
        throw new Error('Invalid phone number format');
      }

      // Check rate limiting
      if (!options.skipRateLimit && !this.checkRateLimit(phoneNumber)) {
        throw new Error('SMS rate limit exceeded');
      }

      // Format phone number
      const formattedPhone = this.formatPhoneNumber(phoneNumber);

      const messageOptions = {
        body: message,
        from: this.twilioPhoneNumber,
        to: formattedPhone
      };

      // Add additional options if provided
      if (options.mediaUrl) {
        messageOptions.mediaUrl = options.mediaUrl;
      }

      if (options.messagingServiceSid) {
        messageOptions.messagingServiceSid = options.messagingServiceSid;
        delete messageOptions.from;
      }

      const result = await this.twilioClient.messages.create(messageOptions);

      // Log SMS for tracking
      await this.logSMS({
        phoneNumber: formattedPhone,
        message,
        messageId: result.sid,
        status: result.status,
        direction: 'outbound',
        provider: 'twilio'
      });

      // Update rate limiting
      this.updateRateLimit(phoneNumber);

      return {
        success: true,
        messageId: result.sid,
        status: result.status
      };

    } catch (error) {
      console.error('SMS sending failed:', error);
      
      // Log failed SMS
      await this.logSMS({
        phoneNumber,
        message,
        error: error.message,
        status: 'failed',
        direction: 'outbound',
        provider: 'twilio'
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send OTP SMS
   */
  async sendOTP(phoneNumber, otp) {
    const message = this.templates.OTP_VERIFICATION.replace('{otp}', otp);
    return await this.sendSMS(phoneNumber, message, { priority: 'high' });
  }

  /**
   * Send ride booking confirmation
   */
  async sendRideBooked(phoneNumber, rideDetails) {
    const message = this.templates.RIDE_BOOKED
      .replace('{driverName}', rideDetails.driverName)
      .replace('{time}', rideDetails.pickupTime)
      .replace('{vehicle}', rideDetails.vehicle);

    return await this.sendSMS(phoneNumber, message);
  }

  /**
   * Send ride assignment to driver
   */
  async sendRideAssigned(driverPhone, rideDetails) {
    const message = this.templates.RIDE_ASSIGNED
      .replace('{pickup}', rideDetails.pickupLocation)
      .replace('{time}', rideDetails.pickupTime)
      .replace('{passengerName}', rideDetails.passengerName);

    return await this.sendSMS(driverPhone, message);
  }

  /**
   * Send ride started notification
   */
  async sendRideStarted(phoneNumber, rideDetails) {
    const message = this.templates.RIDE_STARTED
      .replace('{driverName}', rideDetails.driverName)
      .replace('{vehicle}', rideDetails.vehicle)
      .replace('{trackingLink}', rideDetails.trackingLink);

    return await this.sendSMS(phoneNumber, message);
  }

  /**
   * Send ride completion notification
   */
  async sendRideCompleted(phoneNumber, amount, rideId) {
    const message = this.templates.RIDE_COMPLETED
      .replace('{amount}', amount)
      .replace('{rideId}', rideId);

    return await this.sendSMS(phoneNumber, message);
  }

  /**
   * Send ride cancellation notification
   */
  async sendRideCancelled(phoneNumber, reason) {
    const message = this.templates.RIDE_CANCELLED.replace('{reason}', reason);
    return await this.sendSMS(phoneNumber, message);
  }

  /**
   * Send payment success notification
   */
  async sendPaymentSuccess(phoneNumber, amount, rideId) {
    const message = this.templates.PAYMENT_SUCCESS
      .replace('{amount}', amount)
      .replace('{rideId}', rideId);

    return await this.sendSMS(phoneNumber, message);
  }

  /**
   * Send driver arrival notification
   */
  async sendDriverArrived(phoneNumber, driverName) {
    const message = this.templates.DRIVER_ARRIVED.replace('{driverName}', driverName);
    return await this.sendSMS(phoneNumber, message);
  }

  /**
   * Send emergency alert
   */
  async sendEmergencyAlert(phoneNumber, rideId, location) {
    const message = this.templates.EMERGENCY_ALERT
      .replace('{rideId}', rideId)
      .replace('{location}', location);

    return await this.sendSMS(phoneNumber, message, { priority: 'emergency' });
  }

  /**
   * Send promotional SMS
   */
  async sendPromoCode(phoneNumber, promoCode, discount) {
    const message = this.templates.PROMO_CODE
      .replace('{promoCode}', promoCode)
      .replace('{discount}', discount);

    return await this.sendSMS(phoneNumber, message);
  }

  /**
   * Send bulk SMS
   */
  async sendBulkSMS(phoneNumbers, message, options = {}) {
    const results = [];
    const batchSize = options.batchSize || 10;
    
    for (let i = 0; i < phoneNumbers.length; i += batchSize) {
      const batch = phoneNumbers.slice(i, i + batchSize);
      const batchPromises = batch.map(phone => 
        this.sendSMS(phone, message, { ...options, skipRateLimit: true })
      );
      
      const batchResults = await Promise.allSettled(batchPromises);
      results.push(...batchResults);
      
      // Add delay between batches to avoid rate limiting
      if (i + batchSize < phoneNumbers.length) {
        await this.delay(1000);
      }
    }

    return results;
  }

  /**
   * Get SMS delivery status
   */
  async getSMSStatus(messageId) {
    try {
      const message = await this.twilioClient.messages(messageId).fetch();
      return {
        messageId: message.sid,
        status: message.status,
        errorCode: message.errorCode,
        errorMessage: message.errorMessage,
        dateCreated: message.dateCreated,
        dateSent: message.dateSent,
        dateUpdated: message.dateUpdated
      };
    } catch (error) {
      console.error('Failed to get SMS status:', error);
      return { error: error.message };
    }
  }

  /**
   * Validate phone number format
   */
  isValidPhoneNumber(phoneNumber) {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phoneNumber.replace(/[\s-()]/g, ''));
  }

  /**
   * Format phone number to E.164 format
   */
  formatPhoneNumber(phoneNumber) {
    // Remove all non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // Add country code if not present
    if (!phoneNumber.startsWith('+')) {
      // Assuming US/Canada if no country code (adjust for your region)
      if (cleaned.length === 10) {
        cleaned = '1' + cleaned;
      }
      cleaned = '+' + cleaned;
    } else {
      cleaned = phoneNumber;
    }

    return cleaned;
  }

  /**
   * Check rate limiting
   */
  checkRateLimit(phoneNumber) {
    const now = Date.now();
    const hourAgo = now - (60 * 60 * 1000);
    
    if (!this.rateLimitStore.has(phoneNumber)) {
      return true;
    }

    const userRequests = this.rateLimitStore.get(phoneNumber);
    const recentRequests = userRequests.filter(timestamp => timestamp > hourAgo);
    
    return recentRequests.length < this.maxSMSPerHour;
  }

  /**
   * Update rate limiting
   */
  updateRateLimit(phoneNumber) {
    const now = Date.now();
    const hourAgo = now - (60 * 60 * 1000);
    
    if (!this.rateLimitStore.has(phoneNumber)) {
      this.rateLimitStore.set(phoneNumber, []);
    }

    const userRequests = this.rateLimitStore.get(phoneNumber);
    const recentRequests = userRequests.filter(timestamp => timestamp > hourAgo);
    recentRequests.push(now);
    
    this.rateLimitStore.set(phoneNumber, recentRequests);
  }

  /**
   * Log SMS for tracking and analytics
   */
  async logSMS(smsData) {
    try {
      // In production, save to database
      const log = {
        ...smsData,
        timestamp: new Date(),
        cost: this.calculateSMSCost(smsData.phoneNumber, smsData.message)
      };

      // Save to database (implement based on your DB)
      // await SMSLog.create(log);
      
      console.log('SMS logged:', log);
    } catch (error) {
      console.error('Failed to log SMS:', error);
    }
  }

  /**
   * Calculate SMS cost (implement based on your pricing)
   */
  calculateSMSCost(phoneNumber, message) {
    const messageLength = message.length;
    const segments = Math.ceil(messageLength / 160);
    const costPerSegment = 0.0075; // Example cost in USD
    
    return segments * costPerSegment;
  }

  /**
   * Get SMS statistics
   */
  async getSMSStats(startDate, endDate) {
    try {
      // Implement based on your database
      // This is a placeholder for actual implementation
      return {
        totalSent: 0,
        delivered: 0,
        failed: 0,
        totalCost: 0,
        averageDeliveryTime: 0
      };
    } catch (error) {
      console.error('Failed to get SMS stats:', error);
      return null;
    }
  }

  /**
   * Utility delay function
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Handle incoming SMS webhooks
   */
  async handleIncomingSMS(webhookData) {
    try {
      const { From, Body, MessageSid } = webhookData;
      
      // Process incoming SMS based on content
      if (Body.toLowerCase().includes('stop')) {
        await this.handleUnsubscribe(From);
      } else if (Body.toLowerCase().includes('help')) {
        await this.sendHelpMessage(From);
      } else {
        // Forward to customer service or handle based on your logic
        await this.forwardToSupport(From, Body);
      }

      // Log incoming SMS
      await this.logSMS({
        phoneNumber: From,
        message: Body,
        messageId: MessageSid,
        direction: 'inbound',
        status: 'received'
      });

    } catch (error) {
      console.error('Failed to handle incoming SMS:', error);
    }
  }

  /**
   * Handle SMS unsubscribe
   */
  async handleUnsubscribe(phoneNumber) {
    // Add to unsubscribe list in database
    // await UnsubscribeList.create({ phoneNumber, date: new Date() });
    
    await this.sendSMS(phoneNumber, 'You have been unsubscribed from SMS notifications.');
  }

  /**
   * Send help message
   */
  async sendHelpMessage(phoneNumber) {
    const helpMessage = 'RideApp Help: Reply STOP to unsubscribe. For support, call 1-800-RIDE-APP';
    await this.sendSMS(phoneNumber, helpMessage);
  }

  /**
   * Forward message to support
   */
  async forwardToSupport(phoneNumber, message) {
    // Implement based on your support system
    console.log(`Support message from ${phoneNumber}: ${message}`);
  }
}

module.exports = new SMSService();