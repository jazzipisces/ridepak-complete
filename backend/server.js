const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: '🚗 Welcome to RidePak API',
    version: '1.0.0',
    status: 'Running',
    endpoints: {
      health: '/health',
      api: '/api'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'RidePak API is healthy',
    timestamp: new Date().toISOString() 
  });
});

app.get('/api', (req, res) => {
  res.json({ 
    message: 'RidePak API endpoints',
    features: [
      'User Authentication',
      'Ride Management', 
      'Payment Processing',
      'Real-time Tracking',
      'Driver Management'
    ]
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚗 RidePak API Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 API info: http://localhost:${PORT}/api`);
});