const MeterReading = require('../models/meterReadingModel');
const Customer = require('../models/customerModel');

// Generate monthly water usage report
exports.getMonthlyConsumptionReport = async (req, res) => {
  try {
    const { month, year } = req.params;
    
    // Validate month and year
    if (!month || !year) {
      return res.status(400).json({
        status: 'fail',
        message: 'Bulan dan tahun harus disediakan'
      });
    }
    
    // Get all meter readings for the specified month and year
    const meterReadings = await MeterReading.find({
      billingMonth: month,
      billingYear: parseInt(year),
      status: { $in: ['verified', 'corrected'] }
    }).populate({
      path: 'customer',
      select: 'name customerId meterNumber tariffCategory powerCapacity'
    });
    
    // Calculate total consumption
    const totalConsumption = meterReadings.reduce((total, reading) => total + reading.consumption, 0);
    
    // Group by tariff category
    const consumptionByTariff = {};
    meterReadings.forEach(reading => {
      if (reading.customer && reading.customer.tariffCategory) {
        const tariff = reading.customer.tariffCategory;
        if (!consumptionByTariff[tariff]) {
          consumptionByTariff[tariff] = {
            count: 0,
            totalConsumption: 0
          };
        }
        consumptionByTariff[tariff].count += 1;
        consumptionByTariff[tariff].totalConsumption += reading.consumption;
      }
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        month,
        year,
        totalReadings: meterReadings.length,
        totalConsumption,
        consumptionByTariff,
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

// Generate yearly water usage report
exports.getYearlyConsumptionReport = async (req, res) => {
  try {
    const { year } = req.params;
    
    // Validate year
    if (!year) {
      return res.status(400).json({
        status: 'fail',
        message: 'Tahun harus disediakan'
      });
    }
    
    // Aggregate monthly consumption for the year
    const monthlyConsumption = await MeterReading.aggregate([
      {
        $match: {
          billingYear: parseInt(year),
          status: { $in: ['verified', 'corrected'] }
        }
      },
      {
        $group: {
          _id: '$billingMonth',
          totalConsumption: { $sum: '$consumption' },
          count: { $sum: 1 },
          avgConsumption: { $avg: '$consumption' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    // Calculate total yearly consumption
    const totalYearlyConsumption = monthlyConsumption.reduce(
      (total, month) => total + month.totalConsumption, 0
    );
    
    res.status(200).json({
      status: 'success',
      data: {
        year,
        totalYearlyConsumption,
        monthlyConsumption
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Generate customer water usage history report
exports.getCustomerConsumptionHistory = async (req, res) => {
  try {
    const { customerId } = req.params;
    
    // Find customer
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        status: 'fail',
        message: 'Pelanggan tidak ditemukan'
      });
    }
    
    // Get all meter readings for this customer, sorted by date
    const meterReadings = await MeterReading.find({
      customer: customerId,
      status: { $in: ['verified', 'corrected'] }
    }).sort('readingDate');
    
    // Calculate monthly consumption trend
    const consumptionByMonth = {};
    meterReadings.forEach(reading => {
      const key = `${reading.billingMonth} ${reading.billingYear}`;
      consumptionByMonth[key] = reading.consumption;
    });
    
    // Calculate average consumption
    const totalConsumption = meterReadings.reduce((total, reading) => total + reading.consumption, 0);
    const avgConsumption = meterReadings.length > 0 ? totalConsumption / meterReadings.length : 0;
    
    res.status(200).json({
      status: 'success',
      data: {
        customer: {
          id: customer._id,
          name: customer.name,
          customerId: customer.customerId,
          meterNumber: customer.meterNumber,
          tariffCategory: customer.tariffCategory,
          powerCapacity: customer.powerCapacity
        },
        totalReadings: meterReadings.length,
        totalConsumption,
        avgConsumption,
        consumptionByMonth,
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

// Generate performance report for meter readers
exports.getMeterReaderPerformance = async (req, res) => {
  try {
    const { month, year } = req.params;
    
    // Validate month and year
    if (!month || !year) {
      return res.status(400).json({
        status: 'fail',
        message: 'Bulan dan tahun harus disediakan'
      });
    }
    
    // Aggregate readings by meter reader
    const readerPerformance = await MeterReading.aggregate([
      {
        $match: {
          billingMonth: month,
          billingYear: parseInt(year)
        }
      },
      {
        $group: {
          _id: '$meterReader',
          totalReadings: { $sum: 1 },
          verifiedReadings: {
            $sum: {
              $cond: [{ $eq: ['$status', 'verified'] }, 1, 0]
            }
          },
          disputedReadings: {
            $sum: {
              $cond: [{ $eq: ['$status', 'disputed'] }, 1, 0]
            }
          },
          pendingReadings: {
            $sum: {
              $cond: [{ $eq: ['$status', 'pending'] }, 1, 0]
            }
          },
          avgConsumption: { $avg: '$consumption' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'readerInfo'
        }
      },
      {
        $unwind: '$readerInfo'
      },
      {
        $project: {
          _id: 1,
          readerName: '$readerInfo.name',
          totalReadings: 1,
          verifiedReadings: 1,
          disputedReadings: 1,
          pendingReadings: 1,
          verificationRate: {
            $divide: ['$verifiedReadings', '$totalReadings']
          },
          disputeRate: {
            $divide: ['$disputedReadings', '$totalReadings']
          },
          avgConsumption: 1
        }
      },
      {
        $sort: { totalReadings: -1 }
      }
    ]);
    
    res.status(200).json({
      status: 'success',
      data: {
        month,
        year,
        readerPerformance
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Generate anomaly detection report
exports.getAnomalyReport = async (req, res) => {
  try {
    const { month, year, threshold } = req.params;
    const anomalyThreshold = threshold ? parseFloat(threshold) : 50; // Default 50% change
    
    // Get all meter readings for the specified month and year
    const currentReadings = await MeterReading.find({
      billingMonth: month,
      billingYear: parseInt(year),
      status: { $in: ['verified', 'corrected', 'pending'] }
    }).populate({
      path: 'customer',
      select: 'name customerId meterNumber tariffCategory powerCapacity'
    });
    
    // Find anomalies by comparing with previous readings
    const anomalies = [];
    
    for (const reading of currentReadings) {
      // Find previous reading for this customer
      const previousReadings = await MeterReading.find({
        customer: reading.customer._id,
        readingDate: { $lt: reading.readingDate }
      }).sort('-readingDate').limit(3);
      
      if (previousReadings.length > 0) {
        // Calculate average of previous readings
        const avgPreviousConsumption = previousReadings.reduce(
          (sum, prev) => sum + prev.consumption, 0
        ) / previousReadings.length;
        
        // Calculate percentage change
        const percentChange = avgPreviousConsumption > 0 ?
          ((reading.consumption - avgPreviousConsumption) / avgPreviousConsumption) * 100 : 0;
        
        // Check if change exceeds threshold
        if (Math.abs(percentChange) > anomalyThreshold) {
          anomalies.push({
            reading,
            percentChange,
            avgPreviousConsumption,
            previousReadings
          });
        }
      }
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        month,
        year,
        anomalyThreshold,
        totalAnomalies: anomalies.length,
        anomalies
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};