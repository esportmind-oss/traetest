const MeterReading = require('../models/meterReadingModel');
const Customer = require('../models/customerModel');

// Get all meter readings with pagination
exports.getAllMeterReadings = async (req, res) => {
  try {
    // Build query
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    // Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    
    let query = MeterReading.find(JSON.parse(queryStr));

    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-readingDate');
    }

    // Field limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }

    // Pagination
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    // Execute query
    const meterReadings = await query;

    // Send response
    res.status(200).json({
      status: 'success',
      results: meterReadings.length,
      data: {
        meterReadings
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Get meter reading by ID
exports.getMeterReading = async (req, res) => {
  try {
    const meterReading = await MeterReading.findById(req.params.id);

    if (!meterReading) {
      return res.status(404).json({
        status: 'fail',
        message: 'Pencatatan meter tidak ditemukan'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        meterReading
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Create new meter reading
exports.createMeterReading = async (req, res) => {
  try {
    // Add meter reader from logged in user
    if (!req.body.meterReader) req.body.meterReader = req.user.id;
    
    // Find customer to get previous reading
    const customer = await Customer.findById(req.body.customer);
    if (!customer) {
      return res.status(404).json({
        status: 'fail',
        message: 'Pelanggan tidak ditemukan'
      });
    }
    
    // Find the latest meter reading for this customer
    const latestReading = await MeterReading.findOne({ 
      customer: req.body.customer 
    }).sort('-readingDate');
    
    // Set previous reading if available
    if (latestReading) {
      req.body.previousReading = latestReading.currentReading;
    } else {
      // If no previous reading, use 0 or a default value
      req.body.previousReading = req.body.previousReading || 0;
    }
    
    // Calculate water usage
    req.body.consumption = req.body.currentReading - req.body.previousReading;
    
    // Set billing month and year
    const readingDate = new Date(req.body.readingDate || Date.now());
    req.body.billingMonth = readingDate.toLocaleString('default', { month: 'long' });
    req.body.billingYear = readingDate.getFullYear();
    
    const newMeterReading = await MeterReading.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        meterReading: newMeterReading
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Update meter reading
exports.updateMeterReading = async (req, res) => {
  try {
    // Don't allow changing customer or reading date
    if (req.body.customer || req.body.readingDate) {
      return res.status(400).json({
        status: 'fail',
        message: 'Pelanggan dan tanggal pencatatan tidak dapat diubah'
      });
    }
    
    // Recalculate water usage if currentReading is updated
    if (req.body.currentReading) {
      const meterReading = await MeterReading.findById(req.params.id);
      if (!meterReading) {
        return res.status(404).json({
          status: 'fail',
          message: 'Pencatatan meter tidak ditemukan'
        });
      }
      
      req.body.consumption = req.body.currentReading - meterReading.previousReading;
    }
    
    // If status is changed to verified, add verification info
    if (req.body.status === 'verified') {
      req.body.verifiedBy = req.user.id;
      req.body.verifiedAt = Date.now();
    }
    
    const meterReading = await MeterReading.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!meterReading) {
      return res.status(404).json({
        status: 'fail',
        message: 'Pencatatan meter tidak ditemukan'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        meterReading
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Delete meter reading
exports.deleteMeterReading = async (req, res) => {
  try {
    const meterReading = await MeterReading.findByIdAndDelete(req.params.id);

    if (!meterReading) {
      return res.status(404).json({
        status: 'fail',
        message: 'Pencatatan meter tidak ditemukan'
      });
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Get meter readings by month and year
exports.getMeterReadingsByPeriod = async (req, res) => {
  try {
    const { month, year } = req.params;
    
    const meterReadings = await MeterReading.find({
      billingMonth: month,
      billingYear: parseInt(year)
    });

    res.status(200).json({
      status: 'success',
      results: meterReadings.length,
      data: {
        meterReadings
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Verify meter reading
exports.verifyMeterReading = async (req, res) => {
  try {
    const meterReading = await MeterReading.findByIdAndUpdate(
      req.params.id,
      {
        status: 'verified',
        verifiedBy: req.user.id,
        verifiedAt: Date.now()
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!meterReading) {
      return res.status(404).json({
        status: 'fail',
        message: 'Pencatatan meter tidak ditemukan'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        meterReading
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Get meter readings by meter reader
exports.getMeterReadingsByReader = async (req, res) => {
  try {
    const meterReadings = await MeterReading.find({ meterReader: req.params.id });

    res.status(200).json({
      status: 'success',
      results: meterReadings.length,
      data: {
        meterReadings
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Get meter readings statistics
exports.getMeterReadingStats = async (req, res) => {
  try {
    const stats = await MeterReading.aggregate([
      {
        $match: { status: { $ne: 'disputed' } }
      },
      {
        $group: {
          _id: { $toUpper: '$billingMonth' },
          numReadings: { $sum: 1 },
          avgConsumption: { $avg: '$consumption' },
          minConsumption: { $min: '$consumption' },
          maxConsumption: { $max: '$consumption' },
          totalConsumption: { $sum: '$consumption' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};