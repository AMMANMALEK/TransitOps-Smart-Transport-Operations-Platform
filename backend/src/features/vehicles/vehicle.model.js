const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  registrationNumber: {
    type: String,
    required: [true, 'Registration number is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  name: {
    type: String,
    required: [true, 'Vehicle name/model is required'],
    trim: true
  },
  model: {
    type: String,
    required: [true, 'Model is required'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Type is required'],
    trim: true
  },
  maxLoadCapacity: {
    type: Number,
    required: [true, 'Maximum load capacity is required'],
    min: [0, 'Maximum load capacity cannot be negative']
  },
  odometer: {
    type: Number,
    required: [true, 'Odometer reading is required'],
    min: [0, 'Odometer reading cannot be negative']
  },
  acquisitionCost: {
    type: Number,
    required: [true, 'Acquisition cost is required'],
    min: [0, 'Acquisition cost cannot be negative']
  },
  status: {
    type: String,
    enum: {
      values: ['Available', 'On Trip', 'In Shop', 'Retired'],
      message: 'Invalid vehicle status: {VALUE}'
    },
    default: 'Available'
  },
  region: {
    type: String,
    trim: true,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Vehicle', vehicleSchema);
