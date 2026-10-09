const Report = require('../models/Report');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const aiService = require('../services/aiService');

// Create citizen report
exports.createReport = async (req, res, next) => {
  try {
    const { title, description, category, severity, city, address, lng, lat, reportedAt, voiceNoteDuration } = req.body;

    if (!title || !description || !category || !city || lng === undefined || lat === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, category, city, and location coordinates [lng, lat] are required.'
      });
    }

    // Process uploaded files if any
    const images = [];
    let voiceNoteUrl = null;

    if (req.files) {
      if (req.files.images) {
        req.files.images.forEach(f => images.push(`/uploads/${f.filename}`));
      }
      if (req.files.voiceNote && req.files.voiceNote[0]) {
        voiceNoteUrl = `/uploads/${req.files.voiceNote[0].filename}`;
      }
    }

    // Run automated NLP classification & priority triage
    const nlpClassification = await aiService.classifyReport(title, description);
    const triage = aiService.estimatePriority(category, severity || 'medium', description);

    // Look for duplicate candidates in the vicinity
    const recentReports = await Report.find({
      city: new RegExp(`^${city}$`, 'i'),
      reportedAt: { $gte: new Date(Date.now() - 48 * 3600 * 1000) }
    }).limit(50);

    const newReportStub = {
      title,
      description,
      category,
      reportedAt: reportedAt ? new Date(reportedAt) : new Date(),
      location: { coordinates: [parseFloat(lng), parseFloat(lat)] }
    };

    const duplicateCandidates = aiService.findDuplicateCandidates(newReportStub, recentReports);
    const isDuplicate = duplicateCandidates.length > 0;

    const report = await Report.create({
      title,
      description,
      category,
      severity: severity || 'medium',
      location: {
        type: 'Point',
        coordinates: [parseFloat(lng), parseFloat(lat)]
      },
      address: address || 'Geolocated area',
      city,
      images,
      voiceNoteUrl,
      voiceNoteDuration: voiceNoteDuration ? Number(voiceNoteDuration) : 0,
      reportedAt: reportedAt ? new Date(reportedAt) : new Date(),
      status: 'pending',
      priority: triage.priority,
      classification: {
        predictedCategory: nlpClassification.predictedCategory,
        confidence: nlpClassification.confidence,
        isAutomated: true
      },
      reporterId: req.user ? req.user._id : null,
      reporterName: req.user ? req.user.name : 'Anonymous Citizen',
      isDuplicateCandidate: isDuplicate,
      duplicateOfReportId: isDuplicate ? duplicateCandidates[0].existingReportId : null,
      moderationNotes: isDuplicate ? [{
        author: 'AI Safety Triage Engine',
        action: 'DUPLICATE_FLAG',
        note: `Potential duplicate of report #${duplicateCandidates[0].existingReportId} (${duplicateCandidates[0].distanceMeters}m away, ${Math.round(duplicateCandidates[0].textSimilarity * 100)}% text similarity). Moderator inspection advised.`
      }] : []
    });

    // Notify user if authenticated
    if (req.user) {
      await Notification.create({
        userId: req.user._id,
        title: 'Report Submitted Successfully',
        message: `Your report "${title}" has been registered (#${report._id.toString().slice(-6)}) and is currently pending review by municipal moderators.`,
        type: 'report_update'
      });
    }

    res.status(201).json({
      success: true,
      data: report,
      triageRecommendation: triage,
      aiClassification: nlpClassification,
      duplicateCandidates
    });
  } catch (err) {
    next(err);
  }
};

// Get reports with filters
exports.getReports = async (req, res, next) => {
  try {
    const {
      city,
      category,
      severity,
      status,
      lat,
      lng,
      radius = 10000,
      page = 1,
      limit = 30
    } = req.query;

    const query = {};

    if (city) {
      query.city = new RegExp(`^${city}$`, 'i');
    }

    if (category) {
      query.category = category;
    }

    if (severity) {
      query.severity = severity;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (lat && lng) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(radius, 10)
        }
      };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = Math.min(parseInt(limit, 10) || 30, 100);
    const skip = (pageNum - 1) * limitNum;

    const [reports, total] = await Promise.all([
      Report.find(query).sort({ reportedAt: -1 }).skip(skip).limit(limitNum),
      Report.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: reports,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (err) {
    next(err);
  }
};

// Get single report
exports.getReportById = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('reporterId', 'name email')
      .populate('verification.verifiedBy', 'name role');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found.'
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

// Get current user's submitted reports
exports.getMyReports = async (req, res, next) => {
  try {
    const reports = await Report.find({ reporterId: req.user._id }).sort({ reportedAt: -1 });

    res.json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (err) {
    next(err);
  }
};

// Update report (Reporter or Moderator)
exports.updateReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found.'
      });
    }

    const isOwner = req.user && report.reporterId && report.reporterId.toString() === req.user._id.toString();
    const isStaff = req.user && ['moderator', 'admin'].includes(req.user.role);

    if (!isOwner && !isStaff) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this report.'
      });
    }

    const { title, description, category, severity, status, moderationNote } = req.body;

    if (isOwner && !isStaff) {
      // Owner can only edit title/description/category if status is still pending
      if (report.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Reports that have entered review or verification cannot be edited by users.'
        });
      }
      if (title) report.title = title;
      if (description) report.description = description;
      if (category) report.category = category;
      if (severity) report.severity = severity;
    }

    if (isStaff) {
      if (status) {
        const oldStatus = report.status;
        report.status = status;

        if (status === 'verified') {
          report.verification = {
            verifiedBy: req.user._id,
            verifiedAt: new Date(),
            notes: moderationNote || 'Verified by municipal safety officer',
            confidenceScore: 0.95
          };
        }

        report.moderationNotes.push({
          author: `${req.user.name} (${req.user.role})`,
          action: `STATUS_CHANGE_${oldStatus}_TO_${status}`,
          note: moderationNote || `Status updated from ${oldStatus} to ${status}`
        });

        // Notify reporter if exists
        if (report.reporterId) {
          await Notification.create({
            userId: report.reporterId,
            title: `Report Status Updated: ${status.toUpperCase()}`,
            message: `Your report "${report.title}" status has been changed to ${status}. Notes: ${moderationNote || 'None'}`,
            type: 'report_update'
          });
        }
      }
    }

    await report.save();

    res.json({
      success: true,
      data: report
    });
  } catch (err) {
    next(err);
  }
};

// Community confirmation / feedback on report
exports.submitReportFeedback = async (req, res, next) => {
  try {
    const { feedbackType, comment } = req.body; // e.g. 'accuracy_confirm', 'hazard_cleared'
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found.'
      });
    }

    if (feedbackType === 'accuracy_confirm') {
      const userId = req.user ? req.user._id : null;
      if (userId && !report.communityConfirmations.confirmedUsers.includes(userId)) {
        report.communityConfirmations.confirmedUsers.push(userId);
        report.communityConfirmations.count += 1;
      } else if (!userId) {
        report.communityConfirmations.count += 1;
      }
    }

    if (comment) {
      report.moderationNotes.push({
        author: req.user ? req.user.name : 'Citizen Community Member',
        action: 'COMMUNITY_FEEDBACK',
        note: `[Feedback: ${feedbackType}] ${comment}`
      });
    }

    await report.save();

    res.json({
      success: true,
      message: 'Community confirmation recorded.',
      confirmations: report.communityConfirmations.count
    });
  } catch (err) {
    next(err);
  }
};

// Delete report (Admin or original author if pending)
exports.deleteReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found.'
      });
    }

    const isOwner = req.user && report.reporterId && report.reporterId.toString() === req.user._id.toString();
    const isAdmin = req.user && req.user.role === 'admin';

    if (!isAdmin && (!isOwner || report.status !== 'pending')) {
      return res.status(403).json({
        success: false,
        message: 'Only administrators or the author of a pending report can remove this report.'
      });
    }

    await Report.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Report removed.'
    });
  } catch (err) {
    next(err);
  }
};
