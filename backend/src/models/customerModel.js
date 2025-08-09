const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  customerId: {
    type: String,
    required: [true, 'ID Pelanggan harus diisi'],
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Nama pelanggan harus diisi'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Alamat harus diisi']
  },
  phoneNumber: {
    type: String,
    required: [true, 'Nomor telepon harus diisi']
  },
  email: {
    type: String,
    lowercase: true
  },
  meterType: {
    type: String,
    enum: ['pascabayar', 'prabayar'],
    default: 'pascabayar'
  },
  tariffCategory: {
    type: String,
    required: [true, 'Kategori tarif harus diisi'],
    enum: ['R1', 'R2', 'R3', 'B1', 'B2', 'I1', 'I2', 'P1']
  },
  powerCapacity: {
    type: Number,
    required: [true, 'Kapasitas air harus diisi']
  },
  meterNumber: {
    type: String,
    required: [true, 'Nomor meter harus diisi'],
    unique: true
  },
  active: {
    type: Boolean,
    default: true
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
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
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  timestamps: true
});

// Index for geospatial queries
customerSchema.index({ location: '2dsphere' });

// Virtual populate with meter readings
customerSchema.virtual('meterReadings', {
  ref: 'MeterReading',
  foreignField: 'customer',
  localField: '_id'
});

// Only return active customers
customerSchema.pre(/^find/, function(next) {
  this.find({ active: { $ne: false } });
  next();
});

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;