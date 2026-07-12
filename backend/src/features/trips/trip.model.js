const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  source: {
    type: String,
    required: [true, 'Source location is required'],
    trim: true
  },
  destination: {
    type: String,
    required: [true, 'Destination location is required'],
    trim: true
  },
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'Vehicle is required']
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: [true, 'Driver is required']
  },
  cargoWeight: {
    type: Number,
    required: [true, 'Cargo weight is required'],
    min: [0, 'Cargo weight cannot be negative']
  },
  plannedDistance: {
    type: Number,
    required: [true, 'Planned distance is required'],
    min: [0, 'Planned distance cannot be negative']
  },
  actualDistance: {
    type: Number,
    default: 0,
    min: [0, 'Actual distance cannot be negative']
  },
  fuelConsumed: {
    type: Number,
    default: 0,
    min: [0, 'Fuel consumed cannot be negative']
  },
  revenue: {
    type: Number,
    default: null,
    min: [0, 'Revenue cannot be negative']
  },
  status: {
    type: String,
    enum: {
      values: ['Draft', 'Dispatched', 'Completed', 'Cancelled'],
      message: 'Invalid trip status: {VALUE}'
    },
    default: 'Draft'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by user is required']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Trip', tripSchema);
