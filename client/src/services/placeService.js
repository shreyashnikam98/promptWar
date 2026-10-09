import api from './api';

export const placeService = {
  async getPlaces(params = {}) {
    const res = await api.get('/places', { params });
    return res.data;
  },

  async getPlaceById(id) {
    const res = await api.get(`/places/${id}`);
    return res.data;
  },

  async getNearby(lat, lng, radius = 5000, category = null) {
    const res = await api.get('/places/nearby', {
      params: { lat, lng, radius, ...(category && { category }) }
    });
    return res.data;
  },

  async searchPlaces(q, city = null, nearLat = null, nearLng = null) {
    const res = await api.get('/places/search', {
      params: { q, ...(city && { city }), ...(nearLat && { nearLat }), ...(nearLng && { nearLng }) }
    });
    return res.data;
  },

  async createPlace(data) {
    const res = await api.post('/places', data);
    return res.data;
  },

  async updatePlace(id, data) {
    const res = await api.patch(`/places/${id}`, data);
    return res.data;
  },

  async deletePlace(id) {
    const res = await api.delete(`/places/${id}`);
    return res.data;
  },

  async getSaferRoute(startLng, startLat, endLng, endLat, mode = 'driving') {
    const res = await api.post('/places/route', { startLng, startLat, endLng, endLat, mode });
    return res.data;
  },

  // Favorites
  async getFavorites() {
    const res = await api.get('/favorites');
    return res.data;
  },

  async addFavorite(placeId) {
    const res = await api.post(`/favorites/${placeId}`);
    return res.data;
  },

  async removeFavorite(placeId) {
    const res = await api.delete(`/favorites/${placeId}`);
    return res.data;
  },

  // Reviews
  async getReviews(placeId) {
    const res = await api.get(`/reviews/places/${placeId}/reviews`);
    return res.data;
  },

  async submitReview(placeId, rating, comment) {
    const res = await api.post('/reviews', { placeId, rating, comment });
    return res.data;
  }
};
