import React, { useState, useEffect } from 'react';
import axios from 'axios';
import WeatherForm from './WeatherForm';
import '../styles/DataTable.css';

const DataTableContainer = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  const API_URL = 'http://localhost:3000/api/nasa';

  // Завантажити дані
  const loadData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/data`);
      setData(response.data.data || []);
    } catch (err) {
      setError('Помилка завантаження даних');
    } finally {
      setLoading(false);
    }
  };

  // Синхронізація з NASA
  const handleSync = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/sync`);
      setSuccess(response.data.message);
      setTimeout(loadData, 2000);
    } catch (err) {
      setError('Помилка синхронізації');
      setLoading(false);
    }
  };

  // Видалити запис
  const handleDelete = async (id, location) => {
    if (window.confirm(`Видалити "${location}"?`)) {
      try {
        setLoading(true);
        await axios.delete(`${API_URL}/data/${id}`);
        setSuccess('Запис видалено');
        await loadData();
      } catch (err) {
        setError('Помилка видалення');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFormSuccess = () => {
    setSuccess(isCreating ? 'Запис створено' : 'Запис оновлено');
    resetForm();
    loadData();
  };

  const handleFormError = () => {
    setError('Помилка збереження');
  };

  const resetForm = () => {
    setEditingId(null);
    setIsCreating(false);
  };

  const startEditing = (item) => {
    setEditingId(item._id);
    setIsCreating(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="data-table-container">
      {/* Header */}
      <div className="header">
        <h1>🌍 Система моніторингу NASA POWER</h1>
      </div>

      {/* Кнопки управління */}
      <div className="control-panel">
        <button onClick={handleSync} disabled={loading}>
          {loading ? 'Синхронізація...' : 'Синхронізувати з NASA'}
        </button>
        <button onClick={loadData} disabled={loading}>
          Оновити дані
        </button>
        <button onClick={() => setIsCreating(true)} disabled={loading}>
          Додати запис
        </button>
      </div>

      {/* Повідомлення */}
      {error && (
        <div className="message error">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}
      {success && (
        <div className="message success">
          {success}
          <button onClick={() => setSuccess(null)}>×</button>
        </div>
      )}

      {/* Форма */}
      {(isCreating || editingId) && (
        <WeatherForm
          editingId={editingId}
          isCreating={isCreating}
          onSaveSuccess={handleFormSuccess}
          onSaveError={handleFormError}
          onCancel={resetForm}
          initialData={editingId ? data.find(item => item._id === editingId) : null}
          loading={loading}
          setLoading={setLoading}
        />
      )}

      {/* Таблиця */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Місто</th>
              <th>Дата</th>
              <th>Темп.</th>
              <th>Волог.</th>
              <th>Опади</th>
              <th>Дії</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item._id}>
                <td>{item.location}</td>
                <td>{new Date(item.date).toLocaleDateString('uk-UA')}</td>
                <td>{item.temperature}°C</td>
                <td>{item.humidity}%</td>
                <td>{item.precipitation}mm</td>
                <td>
                  <button onClick={() => startEditing(item)}>✏️</button>
                  <button onClick={() => handleDelete(item._id, item.location)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && !loading && <p>Немає даних</p>}
      </div>

      {loading && <div className="loading">Завантаження...</div>}
    </div>
  );
};

export default DataTableContainer;