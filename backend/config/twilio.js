const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

const twilioConfig = {
  fromNumber: process.env.TWILIO_PHONE_NUMBER,
  serviceSid: process.env.TWILIO_VERIFY_SERVICE_SID
};

// Send OTP
const sendOTP = async (phoneNumber) => {
  try {
    const verification = await client.verify.v2
      .services(twilioConfig.serviceSid)
      .verifications
      .create({
        to: phoneNumber,
        channel: 'sms'
      });

    return {
      success: true,
      status: verification.status,
      sid: verification.sid
    };
  } catch (error) {
    console.error('Twilio send OTP error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Verify OTP
const verifyOTP = async (phoneNumber, code) => {
  try {
    const verificationCheck = await client.verify.v2
      .services(twilioConfig.serviceSid)
      .verificationChecks
      .create({
        to: phoneNumber,
        code: code
      });

    return {
      success: verificationCheck.status === 'approved',
      status: verificationCheck.status
    };
  } catch (error) {
    console.error('Twilio verify OTP error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Send SMS notification
const sendSMS = async (to, body) => {
  try {
    const message = await client.messages.create({
      body,
      from: twilioConfig.fromNumber,
      to
    });

    return {
      success: true,
      sid: message.sid,
      status: message.status
    };
  } catch (error) {
    console.error('Twilio send SMS error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  client,
  twilioConfig,
  sendOTP,
  verifyOTP,
  sendSMS
};const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

const twilioConfig = {
  fromNumber: process.env.TWILIO_PHONE_NUMBER,
  serviceSid: process.env.TWILIO_VERIFY_SERVICE_SID
};

// Send OTP
const sendOTP = async (phoneNumber) => {
  try {
    const verification = await client.verify.v2
      .services(twilioConfig.serviceSid)
      .verifications
      .create({
        to: phoneNumber,
        channel: 'sms'
      });

    return {
      success: true,
      status: verification.status,
      sid: verification.sid
    };
  } catch (error) {
    console.error('Twilio send OTP error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Verify OTP
const verifyOTP = async (phoneNumber, code) => {
  try {
    const verificationCheck = await client.verify.v2
      .services(twilioConfig.serviceSid)
      .verificationChecks
      .create({
        to: phoneNumber,
        code: code
      });

    return {
      success: verificationCheck.status === 'approved',
      status: verificationCheck.status
    };
  } catch (error) {
    console.error('Twilio verify OTP error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Send SMS notification
const sendSMS = async (to, body) => {
  try {
    const message = await client.messages.create({
      body,
      from: twilioConfig.fromNumber,
      to
    });

    return {
      success: true,
      sid: message.sid,
      status: message.status
    };
  } catch (error) {
    console.error('Twilio send SMS error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  client,
  twilioConfig,
  sendOTP,
  verifyOTP,
  sendSMS
};