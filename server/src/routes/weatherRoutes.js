const express = require('express');
const router = express.Router();
const weatherService = require('../services/weatherService');

router.get('/current', async (req, res, next) => {
  try {
    const { city = 'Pune', lat, lon } = req.query;
    const weather = await weatherService.getWeather(
      city,
      lat ? parseFloat(lat) : null,
      lon ? parseFloat(lon) : null
    );

    res.json({
      success: true,
      data: weather
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
