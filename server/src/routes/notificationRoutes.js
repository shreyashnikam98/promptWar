const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      userId: req.user._id,
      readAt: null
    });

    res.json({
      success: true,
      unreadCount,
      data: notifications
    });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/read', async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { readAt: new Date() },
      { new: true }
    );

    res.json({
      success: true,
      data: notification
    });
  } catch (err) {
    next(err);
  }
});

router.post('/mark-all-read', async (req, res, next) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, readAt: null },
      { readAt: new Date() }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read.'
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
