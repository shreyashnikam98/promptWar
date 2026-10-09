const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.post('/', protect, reviewController.createReview);
router.get('/places/:placeId/reviews', reviewController.getReviewsByPlace);
router.patch('/:id', protect, reviewController.updateReview);
router.delete('/:id', protect, reviewController.deleteReview);

module.exports = router;
