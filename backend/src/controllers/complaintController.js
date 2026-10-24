const Complaint = require('../models/Complaint');
const Location = require('../models/Location');
const store = require('../utils/dataStore');

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private
exports.createComplaint = async (req, res) => {
  try {
    const { title, description, category, priority, locationId, qrCodeId } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and category are required',
      });
    }

    if (global.useFallbackDb) {
      let targetLoc = null;
      if (locationId) {
        targetLoc = store.locations.find((l) => l._id === locationId);
      } else if (qrCodeId) {
        targetLoc = store.locations.find((l) => l.qrCodeId.toUpperCase() === qrCodeId.toUpperCase().trim());
      }

      if (!targetLoc) {
        return res.status(400).json({ success: false, message: 'Valid location is required to file a report' });
      }

      const newComplaint = {
        _id: 'cmp_' + Date.now(),
        title,
        description,
        category,
        priority: priority || 'Medium',
        location: targetLoc,
        submittedBy: {
          _id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          studentId: req.user.studentId || '',
          department: req.user.department || 'General',
        },
        status: 'Pending',
        adminRemarks: '',
        createdAt: new Date().toISOString(),
      };

      store.complaints.unshift(newComplaint);
      return res.status(201).json({ success: true, message: 'Complaint submitted successfully', data: newComplaint });
    }

    let targetLocationId = locationId;

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
    if (global.useFallbackDb) {
      const myComplaints = store.complaints.filter(
        (c) => c.submittedBy._id === req.user._id || c.submittedBy.email === req.user.email
      );
      return res.json({ success: true, count: myComplaints.length, data: myComplaints });
    }

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

    if (global.useFallbackDb) {
      let filtered = [...store.complaints];

      if (status && status !== 'all') {
        filtered = filtered.filter((c) => c.status === status);
      }
      if (category && category !== 'all') {
        filtered = filtered.filter((c) => c.category === category);
      }
      if (locationId) {
        filtered = filtered.filter((c) => c.location._id === locationId);
      }
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (c) => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
        );
      }

      return res.json({ success: true, count: filtered.length, data: filtered });
    }

    let query = {};
    if (status && status !== 'all') query.status = status;
    if (category && category !== 'all') query.category = category;
    if (locationId) query.location = locationId;
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
    if (global.useFallbackDb) {
      const total = store.complaints.length;
      const pending = store.complaints.filter((c) => c.status === 'Pending').length;
      const inProgress = store.complaints.filter((c) => c.status === 'In Progress').length;
      const resolved = store.complaints.filter((c) => c.status === 'Resolved').length;
      const rejected = store.complaints.filter((c) => c.status === 'Rejected').length;

      return res.json({
        success: true,
        data: {
          totals: { total, pending, inProgress, resolved, rejected },
          categoryStats: [],
          locationStats: [],
        },
      });
    }

    const total = await Complaint.countDocuments();
    const pending = await Complaint.countDocuments({ status: 'Pending' });
    const inProgress = await Complaint.countDocuments({ status: 'In Progress' });
    const resolved = await Complaint.countDocuments({ status: 'Resolved' });
    const rejected = await Complaint.countDocuments({ status: 'Rejected' });

    res.json({
      success: true,
      data: {
        totals: { total, pending, inProgress, resolved, rejected },
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

    if (global.useFallbackDb) {
      const complaint = store.complaints.find((c) => c._id === req.params.id);
      if (!complaint) {
        return res.status(404).json({ success: false, message: 'Complaint not found' });
      }

      if (status) complaint.status = status;
      if (adminRemarks !== undefined) complaint.adminRemarks = adminRemarks;
      complaint.updatedAt = new Date().toISOString();

      return res.json({ success: true, message: 'Status updated successfully', data: complaint });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    if (status) {
      complaint.status = status;
      if (status === 'Resolved') complaint.resolvedAt = new Date();
    }
    if (adminRemarks !== undefined) complaint.adminRemarks = adminRemarks;

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
