const mongoose = require('mongoose');

const meterReadingSchema = new mongoose.Schema({
  customerId: {
    type: String,
    required: true
  },
  meterNumber: {
    type: String,
    required: true
  },
  previousReading: {
    type: Number,
    required: true
  },
  currentReading: {
    type: Number,
    required: true
  },
  readingDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  notes: String,
  photo: String
});

module.exports = mongoose.model('MeterReading', meterReadingSchema);