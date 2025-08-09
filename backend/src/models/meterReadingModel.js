const mongoose = require('mongoose');

const meterReadingSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.ObjectId,
    ref: 'Customer',
    required: [true, 'Pencatatan meter harus terkait dengan pelanggan']
  },
  readingDate: {
    type: Date,
    required: [true, 'Tanggal pencatatan harus diisi'],
    default: Date.now
  },
  previousReading: {
    type: Number,
    required: [true, 'Angka meter sebelumnya harus diisi']
  },
  currentReading: {
    type: Number,
    required: [true, 'Angka meter saat ini harus diisi'],
    validate: {
      validator: function(val) {
        // Current reading must be greater than or equal to previous reading
        return val >= this.previousReading;
      },
      message: 'Angka meter saat ini harus lebih besar atau sama dengan angka meter sebelumnya'
    }
  },
  consumption: {
    type: Number,
    default: function() {
      return this.currentReading - this.previousReading;
    }
  },
  meterReader: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Petugas pencatat meter harus diisi']
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'disputed', 'corrected'],
    default: 'pending'
  },
  photo: {
    type: String
  },
  notes: String,
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  verifiedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  verifiedAt: Date,
  billingMonth: {
    type: String,
    required: [true, 'Bulan penagihan harus diisi']
  },
  billingYear: {
    type: Number,
    required: [true, 'Tahun penagihan harus diisi']
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  timestamps: true
});

// Index for geospatial queries
meterReadingSchema.index({ location: '2dsphere' });

// Index for efficient queries by customer and date
meterReadingSchema.index({ customer: 1, readingDate: -1 });
meterReadingSchema.index({ billingMonth: 1, billingYear: 1 });

// Populate customer and meter reader info when querying
meterReadingSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'customer',
    select: 'name customerId meterNumber tariffCategory powerCapacity'
  }).populate({
    path: 'meterReader',
    select: 'name'
  });
  
  next();
});

const MeterReading = mongoose.model('MeterReading', meterReadingSchema);

module.exports = MeterReading;