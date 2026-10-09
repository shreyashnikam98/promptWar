import api from './api';

export const weatherService = {
  async getCurrentWeather(city = 'Pune', lat = null, lon = null) {
    const res = await api.get('/weather/current', {
      params: { city, ...(lat && { lat }), ...(lon && { lon }) }
    });
    return res.data;
  }
};
