const axios = require('axios');

// Fallback regional climatological estimates for common cities when API key is unconfigured
const REGIONAL_CLIMATE_DEFAULTS = {
  pune: { temp: 26, condition: 'Partly Cloudy', humidity: 58, windSpeed: 11, rainProb: 15, airQuality: 'Moderate' },
  mumbai: { temp: 30, condition: 'Humid & Sunny', humidity: 76, windSpeed: 14, rainProb: 20, airQuality: 'Moderate' },
  delhi: { temp: 24, condition: 'Hazy Sun', humidity: 48, windSpeed: 8, rainProb: 5, airQuality: 'Unhealthy' },
  bengaluru: { temp: 23, condition: 'Pleasant Breeze', humidity: 62, windSpeed: 15, rainProb: 10, airQuality: 'Good' },
  bangalore: { temp: 23, condition: 'Pleasant Breeze', humidity: 62, windSpeed: 15, rainProb: 10, airQuality: 'Good' },
  chennai: { temp: 31, condition: 'Warm & Sunny', humidity: 79, windSpeed: 12, rainProb: 25, airQuality: 'Moderate' },
  hyderabad: { temp: 28, condition: 'Sunny', humidity: 55, windSpeed: 10, rainProb: 10, airQuality: 'Good' }
};

class WeatherService {
  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY;
    this.cache = new Map(); // Simple memory cache for 10 min
  }

  async getWeather(city = 'Pune', lat = null, lon = null) {
    const cacheKey = lat && lon ? `${lat.toFixed(2)},${lon.toFixed(2)}` : city.toLowerCase();
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < 10 * 60 * 1000) {
      return cached.data;
    }

    if (this.apiKey && this.apiKey.trim() !== '') {
      try {
        let url = `https://api.openweathermap.org/data/2.5/weather?appid=${this.apiKey}&units=metric`;
        if (lat && lon) {
          url += `&lat=${lat}&lon=${lon}`;
        } else {
          url += `&q=${encodeURIComponent(city)}`;
        }

        const response = await axios.get(url, { timeout: 4000 });
        const d = response.data;

        const liveData = {
          city: d.name || city,
          country: d.sys?.country || '',
          temp: Math.round(d.main.temp),
          feelsLike: Math.round(d.main.feels_like),
          tempMin: Math.round(d.main.temp_min),
          tempMax: Math.round(d.main.temp_max),
          condition: d.weather[0]?.main || 'Clear',
          description: d.weather[0]?.description || 'clear sky',
          icon: d.weather[0]?.icon ? `https://openweathermap.org/img/wn/${d.weather[0].icon}@2x.png` : null,
          humidity: d.main.humidity,
          windSpeed: Math.round(d.wind.speed * 3.6), // km/h
          pressure: d.main.pressure,
          coordinates: { lat: d.coord?.lat, lon: d.coord?.lon },
          isLiveApi: true,
          source: 'OpenWeather API Live Feed',
          timestamp: new Date().toISOString()
        };

        this.cache.set(cacheKey, { timestamp: Date.now(), data: liveData });
        return liveData;
      } catch (err) {
        console.warn(`OpenWeather API query failed (${err.message}). Using regional reference baseline.`);
      }
    }

    // Honest baseline fallback
    const normalized = city.toLowerCase();
    const def = REGIONAL_CLIMATE_DEFAULTS[normalized] || {
      temp: 27,
      condition: 'Clear Sky',
      humidity: 50,
      windSpeed: 10,
      rainProb: 10,
      airQuality: 'Good'
    };

    const fallbackData = {
      city: city.charAt(0).toUpperCase() + city.slice(1),
      country: 'IN',
      temp: def.temp,
      feelsLike: def.temp + 1,
      tempMin: def.temp - 4,
      tempMax: def.temp + 3,
      condition: def.condition,
      description: `Current regional standard conditions for ${city}`,
      humidity: def.humidity,
      windSpeed: def.windSpeed,
      pressure: 1012,
      coordinates: lat && lon ? { lat: Number(lat), lon: Number(lon) } : null,
      isLiveApi: false,
      source: 'Seasonal Urban Climate Reference Standard',
      sourceNote: 'Configure OPENWEATHER_API_KEY in server/.env for live meteorological satellite data',
      timestamp: new Date().toISOString()
    };

    this.cache.set(cacheKey, { timestamp: Date.now(), data: fallbackData });
    return fallbackData;
  }
}

module.exports = new WeatherService();
