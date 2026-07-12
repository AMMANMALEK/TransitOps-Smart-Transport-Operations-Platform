import api from './axios';

export const maintenanceAPI = {
  getAll: async () => {
    const response = await api.get('/maintenance');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/maintenance/${id}`);
    return response.data;
  },

  create: async (maintenanceData) => {
    const response = await api.post('/maintenance', maintenanceData);
    return response.data;
  },

  close: async (id, closeData) => {
    const response = await api.put(`/maintenance/${id}/close`, closeData);
    return response.data;
  },
};
