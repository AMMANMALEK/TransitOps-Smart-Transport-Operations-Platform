import api from './axios';

export const financeAPI = {
  getAllFuelLogs: async () => {
    const response = await api.get('/finance/fuel');
    return response.data;
  },

  createFuelLog: async (fuelData) => {
    const response = await api.post('/finance/fuel', fuelData);
    return response.data;
  },

  getAllExpenses: async () => {
    const response = await api.get('/finance/expenses');
    return response.data;
  },

  createExpense: async (expenseData) => {
    const response = await api.post('/finance/expense', expenseData);
    return response.data;
  },

  getOperationalCosts: async (startDate, endDate) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await api.get('/finance/operational-costs', { params });
    return response.data;
  },
};
