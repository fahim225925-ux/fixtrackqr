const Location = require('../models/Location');

// @desc    Get all locations
// @route   GET /api/locations
// @access  Public
exports.getLocations = async (req, res) => {
  try {
    const locations = await Location.find().sort({ building: 1, roomNumber: 1 });
    res.json({
      success: true,
      count: locations.length,
      data: locations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single location by QR code identifier
// @route   GET /api/locations/code/:qrCodeId
// @access  Public
exports.getLocationByQrCode = async (req, res) => {
  try {
    const { qrCodeId } = req.params;
    const location = await Location.findOne({
      qrCodeId: qrCodeId.toUpperCase().trim(),
    });

    if (!location) {
      return res.status(404).json({
        success: false,
        message: `Location with QR code '${qrCodeId}' was not found`,
      });
    }

    res.json({
      success: true,
      data: location,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create a new campus room/lab location
// @route   POST /api/locations
// @access  Private/Admin
exports.createLocation = async (req, res) => {
  try {
    const { building, floor, roomNumber, qrCodeId, description } = req.body;

    if (!building || !floor || !roomNumber) {
      return res.status(400).json({
        success: false,
        message: 'Building, floor, and room number are required',
      });
    }

    // Auto-generate a clean QR Code identifier if not provided
    const cleanQrId =
      qrCodeId && qrCodeId.trim()
        ? qrCodeId.toUpperCase().trim()
        : `LOC-${building.substring(0, 3).toUpperCase()}-${roomNumber.replace(/\s+/g, '-').toUpperCase()}`;

    const exists = await Location.findOne({ qrCodeId: cleanQrId });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: `A location with QR identifier '${cleanQrId}' already exists`,
      });
    }

    const location = await Location.create({
      building,
      floor,
      roomNumber,
      qrCodeId: cleanQrId,
      description: description || '',
    });

    res.status(201).json({
      success: true,
      data: location,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete a location
// @route   DELETE /api/locations/:id
// @access  Private/Admin
exports.deleteLocation = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);
    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found',
      });
    }

    await location.deleteOne();
    res.json({
      success: true,
      message: 'Location removed successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
