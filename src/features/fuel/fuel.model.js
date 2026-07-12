const mongoose = require('mongoose');

const fuelLogSchema = new mongoose.Schema(
  {
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: [true, 'Vehicle is required'],
    },
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
    },
    liters: {
      type: Number,
      required: [true, 'Liters is required'],
    },
    cost: {
      type: Number,
      required: [true, 'Cost is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FuelLog', fuelLogSchema);
