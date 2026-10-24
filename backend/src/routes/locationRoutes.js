const express = require('express');
const router = express.Router();
const {
  getLocations,
  getLocationByQrCode,
  createLocation,
  deleteLocation,
} = require('../controllers/locationController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', getLocations);
router.get('/code/:qrCodeId', getLocationByQrCode);
router.post('/', protect, adminOnly, createLocation);
router.delete('/:id', protect, adminOnly, deleteLocation);

module.exports = router;
