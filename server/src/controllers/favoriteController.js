const mongoose = require('mongoose');
const Favorite = require('../models/Favorite');
const Place = require('../models/Place');

exports.getFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.find({ userId: req.user._id })
      .populate('placeId')
      .sort({ createdAt: -1 });

    // Filter out deleted places if any
    const validFavorites = favorites
      .filter(f => f.placeId)
      .map(f => f.placeId);

    res.json({
      success: true,
      count: validFavorites.length,
      data: validFavorites
    });
  } catch (err) {
    next(err);
  }
};

exports.addFavorite = async (req, res, next) => {
  try {
    const { placeId } = req.params;

    if (!placeId || !mongoose.Types.ObjectId.isValid(placeId)) {
      return res.status(400).json({
        success: false,
        message: 'Live external OpenStreetMap places cannot be favorited.'
      });
    }

    const place = await Place.findById(placeId);
    if (!place) {
      return res.status(404).json({
        success: false,
        message: 'Place not found.'
      });
    }

    const existing = await Favorite.findOne({ userId: req.user._id, placeId });
    if (existing) {
      return res.json({
        success: true,
        message: 'Already saved in favorites.',
        data: existing
      });
    }

    const favorite = await Favorite.create({
      userId: req.user._id,
      placeId
    });

    res.status(201).json({
      success: true,
      message: 'Place added to favorites.',
      data: favorite
    });
  } catch (err) {
    next(err);
  }
};

exports.removeFavorite = async (req, res, next) => {
  try {
    const { placeId } = req.params;

    if (!placeId || !mongoose.Types.ObjectId.isValid(placeId)) {
      return res.json({
        success: true,
        message: 'Place removed from favorites.'
      });
    }

    await Favorite.findOneAndDelete({
      userId: req.user._id,
      placeId
    });

    res.json({
      success: true,
      message: 'Place removed from favorites.'
    });
  } catch (err) {
    next(err);
  }
};
