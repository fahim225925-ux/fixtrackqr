const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema(
  {
    building: {
      type: String,
      required: [true, 'Please specify the building name'],
      trim: true,
    },
    floor: {
      type: String,
      required: [true, 'Please specify the floor level'],
      trim: true,
    },
    roomNumber: {
      type: String,
      required: [true, 'Please specify the room number/lab name'],
      trim: true,
    },
    qrCodeId: {
      type: String,
      required: [true, 'QR identifier is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for formatted label
locationSchema.virtual('fullLocation').get(function () {
  return `${this.building} (${this.floor}) - ${this.roomNumber}`;
});

locationSchema.set('toJSON', { virtuals: true });
locationSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Location', locationSchema);
