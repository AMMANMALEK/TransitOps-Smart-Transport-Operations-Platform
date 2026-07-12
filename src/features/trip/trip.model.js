const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      required: [true, 'Source is required'],
    },
    destination: {
      type: String,
      required: [true, 'Destination is required'],
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: [true, 'Vehicle is required'],
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      required: [true, 'Driver is required'],
    },
    cargoWeight: {
      type: Number,
      required: [true, 'Cargo weight is required'],
    },
    plannedDistance: {
      type: Number,
      required: [true, 'Planned distance is required'],
    },
    actualDistance: {
      type: Number,
      default: 0,
    },
    fuelConsumed: {
      type: Number,
      default: 0,
    },
    revenue: {
      type: Number,
    },
    status: {
      type: String,
      enum: ['Draft', 'Dispatched', 'Completed', 'Cancelled'],
      default: 'Draft',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'CreatedBy user is required'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Trip', tripSchema);
