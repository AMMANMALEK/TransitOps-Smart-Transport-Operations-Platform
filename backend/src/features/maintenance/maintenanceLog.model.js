const mongoose = require('mongoose');

const maintenanceLogSchema = new mongoose.Schema({
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'Vehicle is required']
  },
  description: {
    type: String,
    required: [true, 'Maintenance description is required'],
    trim: true
  },
  cost: {
    type: Number,
    required: [true, 'Maintenance cost is required'],
    min: [0, 'Maintenance cost cannot be negative']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
    default: Date.now
  },
  endDate: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: {
      values: ['Active', 'Closed'],
      message: 'Invalid maintenance status: {VALUE}'
    },
    default: 'Active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('MaintenanceLog', maintenanceLogSchema);
