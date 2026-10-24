const Complaint = require('../models/Complaint');
const Location = require('../models/Location');

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private (Student/Admin)
exports.createComplaint = async (req, res) => {
  try {
    const { title, description, category, priority, locationId, qrCodeId } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and category are required',
      });
    }

    let targetLocationId = locationId;

    // Support submitting by qrCodeId directly
    if (!targetLocationId && qrCodeId) {
      const loc = await Location.findOne({ qrCodeId: qrCodeId.toUpperCase().trim() });
      if (!loc) {
        return res.status(404).json({
          success: false,
          message: `Location with QR code '${qrCodeId}' does not exist`,
        });
      }
      targetLocationId = loc._id;
    }

    if (!targetLocationId) {
      return res.status(400).json({
        success: false,
        message: 'A valid location is required to file a report',
      });
    }

    // Verify location exists
    const location = await Location.findById(targetLocationId);
    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Selected location was not found',
      });
    }

    const complaint = await Complaint.create({
      title,
      description,
      category,
      priority: priority || 'Medium',
      location: targetLocationId,
      submittedBy: req.user._id,
      status: 'Pending',
    });

    const populated = await Complaint.findById(complaint._id)
      .populate('location')
      .populate('submittedBy', 'name email studentId');

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      data: populated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get complaints for logged-in user
// @route   GET /api/complaints/my
// @access  Private
exports.getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ submittedBy: req.user._id })
      .populate('location')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: complaints.length,
      data: complaints,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all complaints with optional filtering (Admin)
// @route   GET /api/complaints
// @access  Private/Admin
exports.getAllComplaints = async (req, res) => {
  try {
    const { status, category, locationId, search } = req.query;
    let query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (locationId) {
      query.location = locationId;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const complaints = await Complaint.find(query)
      .populate('location')
      .populate('submittedBy', 'name email studentId department')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: complaints.length,
      data: complaints,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get complaint analytics and statistics
// @route   GET /api/complaints/stats
// @access  Private/Admin
exports.getComplaintStats = async (req, res) => {
  try {
    const total = await Complaint.countDocuments();
    const pending = await Complaint.countDocuments({ status: 'Pending' });
    const inProgress = await Complaint.countDocuments({ status: 'In Progress' });
    const resolved = await Complaint.countDocuments({ status: 'Resolved' });
    const rejected = await Complaint.countDocuments({ status: 'Rejected' });

    // Category breakdown
    const categoryStats = await Complaint.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Top locations with issues
    const locationStats = await Complaint.aggregate([
      {
        $group: {
          _id: '$location',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'locations',
          localField: '_id',
          foreignField: '_id',
          as: 'locationDetails',
        },
      },
      { $unwind: '$locationDetails' },
    ]);

    res.json({
      success: true,
      data: {
        totals: {
          total,
          pending,
          inProgress,
          resolved,
          rejected,
        },
        categoryStats,
        locationStats,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update complaint status & add admin remarks
// @route   PATCH /api/complaints/:id/status
// @access  Private/Admin
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { status, adminRemarks } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    if (status) {
      complaint.status = status;
      if (status === 'Resolved') {
        complaint.resolvedAt = new Date();
      }
    }

    if (adminRemarks !== undefined) {
      complaint.adminRemarks = adminRemarks;
    }

    complaint.updatedAt = new Date();
    await complaint.save();

    const updated = await Complaint.findById(complaint._id)
      .populate('location')
      .populate('submittedBy', 'name email studentId');

    res.json({
      success: true,
      message: 'Complaint status updated successfully',
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
