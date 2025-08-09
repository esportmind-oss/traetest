const MeterReading = require('../models/MeterReading');

// Membuat pencatatan meter baru
exports.createReading = async (req, res) => {
  try {
    const reading = new MeterReading(req.body);
    await reading.save();
    res.status(201).json(reading);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Mendapatkan semua pencatatan meter
exports.getAllReadings = async (req, res) => {
  try {
    const readings = await MeterReading.find();
    res.json(readings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mendapatkan pencatatan meter berdasarkan ID
exports.getReadingById = async (req, res) => {
  try {
    const reading = await MeterReading.findById(req.params.id);
    if (reading) {
      res.json(reading);
    } else {
      res.status(404).json({ message: 'Pencatatan meter tidak ditemukan' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mengupdate status pencatatan meter
exports.updateReadingStatus = async (req, res) => {
  try {
    const reading = await MeterReading.findById(req.params.id);
    if (reading) {
      reading.status = req.body.status;
      reading.notes = req.body.notes;
      const updatedReading = await reading.save();
      res.json(updatedReading);
    } else {
      res.status(404).json({ message: 'Pencatatan meter tidak ditemukan' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};