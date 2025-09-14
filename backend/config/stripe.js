const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const stripeConfig = {
  apiVersion: '2023-10-16',
  currency: 'pkr',
  country: 'PK'
};

// Create payment intent
const createPaymentIntent = async (amount, metadata = {}) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to paisas
      currency: stripeConfig.currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      success: true,
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id
    };
  } catch (error) {
    console.error('Stripe payment intent error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Confirm payment
const confirmPayment = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return {
      success: true,
      status: paymentIntent.status,
      payment_intent: paymentIntent
    };
  } catch (error) {
    console.error('Stripe confirm payment error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Create customer
const createCustomer = async (email, name, phone) => {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      phone,
      metadata: {
        platform: 'ridepak'
      }
    });

    return {
      success: true,
      customer_id: customer.id
    };
  } catch (error) {
    console.error('Stripe create customer error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Create transfer to driver
const createTransfer = async (amount, driverStripeAccountId, metadata = {}) => {
  try {
    const transfer = await stripe.transfers.create({
      amount: Math.round(amount * 100),
      currency: stripeConfig.currency,
      destination: driverStripeAccountId,
      metadata
    });

    return {
      success: true,
      transfer_id: transfer.id
    };
  } catch (error) {
    console.error('Stripe transfer error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  stripe,
  stripeConfig,
  createPaymentIntent,
  confirmPayment,
  createCustomer,
  createTransfer
};