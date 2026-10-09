const Report = require('../models/Report');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const Place = require('../models/Place');
const Review = require('../models/Review');

exports.getAdminReports = async (req, res, next) => {
  try {
    const { status, category, city, duplicateOnly, page = 1, limit = 50 } = req.query;
    const query = {};

    if (status && status !== 'all') query.status = status;
    if (category) query.category = category;
    if (city) query.city = new RegExp(`^${city}$`, 'i');
    if (duplicateOnly === 'true') query.isDuplicateCandidate = true;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const [reports, total] = await Promise.all([
      Report.find(query)
        .populate('reporterId', 'name email')
        .populate('verification.verifiedBy', 'name role')
        .sort({ reportedAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Report.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: reports,
      pagination: {
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.updateReportStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    if (!['pending', 'under_review', 'verified', 'rejected', 'resolved'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value.'
      });
    }

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found.'
      });
    }

    const oldStatus = report.status;
    report.status = status;

    if (status === 'verified') {
      report.verification = {
        verifiedBy: req.user._id,
        verifiedAt: new Date(),
        notes: note || 'Verified by municipal officer',
        confidenceScore: 0.98
      };
    }

    report.moderationNotes.push({
      author: `${req.user.name} (${req.user.role})`,
      action: `STATUS_UPDATE_${oldStatus}_TO_${status}`,
      note: note || `Moderator marked status as ${status}`
    });

    await report.save();

    await AuditLog.create({
      actorId: req.user._id,
      action: 'REPORT_STATUS_CHANGE',
      resourceType: 'Report',
      resourceId: report._id.toString(),
      metadata: { from: oldStatus, to: status, note }
    });

    if (report.reporterId) {
      await Notification.create({
        userId: report.reporterId,
        title: `Report Updated to ${status.toUpperCase()}`,
        message: `Your report #${report._id.toString().slice(-6)} has been updated to "${status}". Note: ${note || 'No notes attached.'}`,
        type: 'report_update'
      });
    }

    res.json({
      success: true,
      data: report
    });
  } catch (err) {
    next(err);
  }
};

exports.verifyReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes, confidenceScore = 0.95 } = req.body;

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found.'
      });
    }

    report.status = 'verified';
    report.verification = {
      verifiedBy: req.user._id,
      verifiedAt: new Date(),
      notes: notes || 'Officially verified hazard',
      confidenceScore: parseFloat(confidenceScore)
    };

    report.moderationNotes.push({
      author: `${req.user.name} (${req.user.role})`,
      action: 'REPORT_VERIFIED',
      note: notes || 'Official verification completed'
    });

    await report.save();

    await AuditLog.create({
      actorId: req.user._id,
      action: 'REPORT_VERIFY',
      resourceType: 'Report',
      resourceId: report._id.toString(),
      metadata: { notes, confidenceScore }
    });

    res.json({
      success: true,
      data: report
    });
  } catch (err) {
    next(err);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    next(err);
  }
};

exports.updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'moderator', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Valid roles are: user, moderator, admin.'
      });
    }

    // Prevent demoting oneself
    if (id === req.user._id.toString() && role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'You cannot remove your own admin privileges.'
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select('-passwordHash');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    await AuditLog.create({
      actorId: req.user._id,
      action: 'USER_ROLE_CHANGE',
      resourceType: 'User',
      resourceId: id,
      metadata: { newRole: role }
    });

    res.json({
      success: true,
      data: updatedUser
    });
  } catch (err) {
    next(err);
  }
};

exports.getAuditLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.find()
      .populate('actorId', 'name email role')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (err) {
    next(err);
  }
};
