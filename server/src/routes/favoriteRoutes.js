const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const { protect } = require('../middleware/auth');

router.get('/', protect, favoriteController.getFavorites);
router.post('/:placeId', protect, favoriteController.addFavorite);
router.delete('/:placeId', protect, favoriteController.removeFavorite);

module.exports = router;
