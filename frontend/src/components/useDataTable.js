import { useState, useEffect } from 'react';
import nasaApi from '../services/nasaApi';

export const useDataTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [serverStatus, setServerStatus] = useState('checking');

  useEffect(() => {
    checkServerStatus();
    loadData();
  }, []);

  const checkServerStatus = async () => {
    try {
      await nasaApi.healthCheck();
      setServerStatus('online');
    } catch (error) {
      setServerStatus('offline');
      setError('❌ Backend сервер не відповідає. Запустіть сервер на порті 3000');
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Завантаження даних...');
      
      const response = await nasaApi.getAllData();
      setData(response.data || []);
      
      console.log('✅ Дані завантажено:', response.data?.length || 0, 'записів');
    } catch (err) {
      console.error('❌ Помилка завантаження:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      console.log('🔄 Синхронізація з NASA...');
      
      const response = await nasaApi.syncData();
      setSuccess(response.message);

      setTimeout(() => {
        loadData();
      }, 2000);
      
    } catch (err) {
      console.error('❌ Помилка синхронізації:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    success,
    serverStatus,
    setError,
    setSuccess,
    setLoading, // ДОДАВ ЦЕ
    loadData,
    handleSync
  };
};