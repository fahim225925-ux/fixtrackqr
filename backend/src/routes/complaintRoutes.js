const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  getComplaintStats,
  updateComplaintStatus,
} = require('../controllers/complaintController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Student & Authenticated routes
router.post('/', protect, createComplaint);
router.get('/my', protect, getMyComplaints);

// Admin-only management & analytics routes
router.get('/', protect, adminOnly, getAllComplaints);
router.get('/stats', protect, adminOnly, getComplaintStats);
router.patch('/:id/status', protect, adminOnly, updateComplaintStatus);

module.exports = router;
