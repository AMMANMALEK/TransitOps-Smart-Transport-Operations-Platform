const mongoose = require('mongoose');

const fuelLogSchema = new mongoose.Schema({
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'Vehicle is required']
  },
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    default: null
  },
  liters: {
    type: Number,
    required: [true, 'Liters is required'],
    min: [0, 'Liters cannot be negative']
  },
  cost: {
    type: Number,
    required: [true, 'Fuel cost is required'],
    min: [0, 'Fuel cost cannot be negative']
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('FuelLog', fuelLogSchema);
