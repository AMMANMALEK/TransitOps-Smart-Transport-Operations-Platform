import api from './axios';

export const reportsAPI = {
  getDashboard: async () => {
    const response = await api.get('/reports/dashboard');
    return response.data;
  },

  getVehicleROI: async () => {
    const response = await api.get('/reports/vehicle-roi');
    return response.data;
  },

  exportCSV: async (reportType, startDate, endDate) => {
    const params = { reportType };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await api.get('/reports/export-csv', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },
};
