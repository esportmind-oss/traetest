const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const meterReadingRoutes = require('./routes/meterReadingRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.send('PDAM Meter Reading API is running');
});

// Routes
app.use('/api', meterReadingRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pdam-meter')
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; // For testing purposes