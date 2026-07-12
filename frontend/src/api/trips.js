import api from './axios';

export const tripsAPI = {
  getAll: async () => {
    const response = await api.get('/trips');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/trips/${id}`);
    return response.data;
  },

  create: async (tripData) => {
    const response = await api.post('/trips', tripData);
    return response.data;
  },

  dispatch: async (id) => {
    const response = await api.put(`/trips/${id}/dispatch`);
    return response.data;
  },

  complete: async (id, completionData) => {
    const response = await api.put(`/trips/${id}/complete`, completionData);
    return response.data;
  },

  cancel: async (id, reason) => {
    const response = await api.put(`/trips/${id}/cancel`, { reason });
    return response.data;
  },
};
