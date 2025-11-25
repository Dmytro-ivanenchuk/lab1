import { useState, useEffect } from 'react';
import { nasaApi } from '../services/nasaApi';

export const useDataTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await nasaApi.getAllData();
      setData(response.data.data || []);
    } catch (err) {
      setError('Помилка завантаження даних');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setLoading(true);
      const response = await nasaApi.syncData();
      setSuccess(response.data.message);
      setTimeout(loadData, 2000);
    } catch (err) {
      setError('Помилка синхронізації');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    data,
    loading,
    error,
    success,
    setError,
    setSuccess,
    loadData,
    handleSync
  };
};