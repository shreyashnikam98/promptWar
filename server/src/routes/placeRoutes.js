const express = require('express');
const router = express.Router();
const placeController = require('../controllers/placeController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

router.get('/', placeController.getPlaces);
router.get('/nearby', placeController.getNearbyPlaces);
router.get('/search', placeController.searchPlaces);
router.post('/route', placeController.getSaferRoute);
router.get('/:id', placeController.getPlaceById);

// Admin & Moderator routes
router.post('/', protect, authorize('admin', 'moderator'), placeController.createPlace);
router.patch('/:id', protect, authorize('admin', 'moderator'), placeController.updatePlace);
router.delete('/:id', protect, authorize('admin'), placeController.deletePlace);

module.exports = router;
