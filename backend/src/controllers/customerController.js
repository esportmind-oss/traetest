const Customer = require('../models/customerModel');
const MeterReading = require('../models/meterReadingModel');

// Get all customers with pagination
exports.getAllCustomers = async (req, res) => {
  try {
    // Build query
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    // Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    
    let query = Customer.find(JSON.parse(queryStr));

    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
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
    const customers = await query;

    // Send response
    res.status(200).json({
      status: 'success',
      results: customers.length,
      data: {
        customers
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Get customer by ID
exports.getCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        status: 'fail',
        message: 'Pelanggan tidak ditemukan'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        customer
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Create new customer
exports.createCustomer = async (req, res) => {
  try {
    const newCustomer = await Customer.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        customer: newCustomer
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Update customer
exports.updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!customer) {
      return res.status(404).json({
        status: 'fail',
        message: 'Pelanggan tidak ditemukan'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        customer
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Delete customer (set active to false)
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, { active: false });

    if (!customer) {
      return res.status(404).json({
        status: 'fail',
        message: 'Pelanggan tidak ditemukan'
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

// Get customer meter readings
exports.getCustomerMeterReadings = async (req, res) => {
  try {
    const meterReadings = await MeterReading.find({ customer: req.params.id });

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

// Search customers
exports.searchCustomers = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        status: 'fail',
        message: 'Parameter pencarian diperlukan'
      });
    }

    const customers = await Customer.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { customerId: { $regex: query, $options: 'i' } },
        { meterNumber: { $regex: query, $options: 'i' } },
        { address: { $regex: query, $options: 'i' } },
        { phoneNumber: { $regex: query, $options: 'i' } }
      ]
    });

    res.status(200).json({
      status: 'success',
      results: customers.length,
      data: {
        customers
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Get customers by location (within radius)
exports.getCustomersWithin = async (req, res) => {
  try {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    if (!lat || !lng) {
      return res.status(400).json({
        status: 'fail',
        message: 'Silakan berikan latitude dan longitude dalam format lat,lng.'
      });
    }

    // Convert distance to radians (divide by Earth radius)
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    const customers = await Customer.find({
      location: {
        $geoWithin: { $centerSphere: [[lng, lat], radius] }
      }
    });

    res.status(200).json({
      status: 'success',
      results: customers.length,
      data: {
        customers
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};