import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api/nasa';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export const nasaApi = {
  getAllData: () => apiClient.get('/data'),
  syncData: () => apiClient.get('/sync'),
  createData: (data) => apiClient.post('/data', data),
  updateData: (id, data) => apiClient.put(`/data/${id}`, data),
  deleteData: (id) => apiClient.delete(`/data/${id}`),
};