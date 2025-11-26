import React, { useState, useEffect } from 'react';
import axios from 'axios';
import WeatherForm from './WeatherForm';
import '../styles/DataTable.css';

const DataTableContainer = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const API_URL = 'http://localhost:3000/api/nasa';

  // Завантажити дані
  const loadData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/data`);
      setData(response.data.data || []);
      setFilteredData(response.data.data || []);
    } catch (err) {
      setError('Помилка завантаження даних: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Пошук за містом
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredData(data);
    } else {
      const filtered = data.filter(item => 
        item.location && item.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredData(filtered);
    }
  }, [searchTerm, data]);

  // Синхронізація з NASA
  const handleSync = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/sync`);
      setSuccess(response.data.message);
      setTimeout(loadData, 2000);
    } catch (err) {
      setError('Помилка синхронізації: ' + (err.response?.data?.message || err.message));
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
        setError('Помилка видалення: ' + (err.response?.data?.message || err.message));
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

  const handleFormError = (errorMessage) => {
    setError('Помилка збереження: ' + errorMessage);
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

      {/* Кнопки управління та пошук */}
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
        
        <div className="search-container">
          <input
            type="text"
            placeholder="Пошук за містом..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={loading}
          />
        </div>
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
          API_URL={API_URL}
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
            {filteredData.map((item) => (
              <tr key={item._id}>
                <td>{item.location}</td>
                <td>{new Date(item.date).toLocaleDateString('uk-UA')}</td>
                <td>{item.temperature}°C</td>
                <td>{item.humidity}%</td>
                <td>{item.precipitation}mm</td>
                <td>
                  <button onClick={() => startEditing(item)} disabled={loading}>✏️</button>
                  <button onClick={() => handleDelete(item._id, item.location)} disabled={loading}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredData.length === 0 && !loading && (
          <p>{searchTerm ? 'Немає результатів пошуку' : 'Немає даних'}</p>
        )}
      </div>

      {loading && <div className="loading">Завантаження...</div>}
    </div>
  );
};

export default DataTableContainer;