import React, { useState, useEffect } from 'react';
import nasaApi from '../services/nasaApi';
import './DataTable.css';

const DataTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [serverStatus, setServerStatus] = useState('checking');

  const [formData, setFormData] = useState({
    location: '',
    temperature: '',
    humidity: '',
    precipitation: '',
    solar_radiation: '',
    wind_speed: '',
    pressure: ''
  });

  // Завантажити дані при завантаженні компонента
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
      
      // Очікуємо 2 секунди і завантажуємо оновлені дані
      setTimeout(() => {
        loadData();
      }, 2000);
      
    } catch (err) {
      console.error('❌ Помилка синхронізації:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingId(null);
    setFormData({
      location: '',
      temperature: '',
      humidity: '',
      precipitation: '',
      solar_radiation: '',
      wind_speed: '',
      pressure: ''
    });
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setIsCreating(false);
    setFormData({
      location: item.location || '',
      temperature: item.temperature || '',
      humidity: item.humidity || '',
      precipitation: item.precipitation || '',
      solar_radiation: item.solar_radiation || '',
      wind_speed: item.wind_speed || '',
      pressure: item.pressure || ''
    });
  };

  const handleDelete = async (id, location) => {
    if (window.confirm(`Ви впевнені, що хочете видалити запис для "${location}"?`)) {
      try {
        setLoading(true);
        await nasaApi.deleteData(id);
        setSuccess('✅ Запис успішно видалено');
        await loadData();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      if (isCreating) {
        await nasaApi.createData({
          ...formData,
          coordinates: { latitude: 50.45, longitude: 30.52 },
          date: new Date().toISOString()
        });
        setSuccess('✅ Новий запис успішно створено');
      } else {
        await nasaApi.updateData(editingId, formData);
        setSuccess('✅ Запис успішно оновлено');
      }

      setIsCreating(false);
      setEditingId(null);
      setFormData({
        location: '',
        temperature: '',
        humidity: '',
        precipitation: '',
        solar_radiation: '',
        wind_speed: '',
        pressure: ''
      });

      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    setFormData({
      location: '',
      temperature: '',
      humidity: '',
      precipitation: '',
      solar_radiation: '',
      wind_speed: '',
      pressure: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Форматування дати
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('uk-UA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  // Форматування чисел
  const formatNumber = (value, decimals = 1) => {
    if (value === null || value === undefined) return '-';
    return Number(value).toFixed(decimals);
  };

  return (
    <div className="data-table-container">
      {/* Заголовок та статус */}
      <div className="header">
        <div className="header-content">
          <h1>🌍 Система моніторингу NASA POWER</h1>
          <p className="subtitle">Реальні дані про погоду з NASA API</p>
        </div>
        <div className="status-indicator">
          <div className={`status-dot ${serverStatus}`}></div>
          <span>Backend: {serverStatus === 'online' ? '🟢 Онлайн' : '🔴 Офлайн'}</span>
        </div>
      </div>

      {/* Панель керування */}
      <div className="control-panel">
        <div className="control-group">
          <button 
            onClick={handleSync} 
            className="btn btn-sync"
            disabled={loading || serverStatus === 'offline'}
          >
            <span className="btn-icon">🔄</span>
            {loading ? 'Синхронізація...' : 'Синхронізувати з NASA'}
          </button>
          <button 
            onClick={loadData} 
            className="btn btn-refresh"
            disabled={loading}
          >
            <span className="btn-icon">📥</span>
            Оновити дані
          </button>
        </div>
        <div className="control-group">
          <button 
            onClick={handleCreate} 
            className="btn btn-create"
            disabled={loading}
          >
            <span className="btn-icon">➕</span>
            Додати запис
          </button>
        </div>
      </div>

      {/* Повідомлення */}
      {success && (
        <div className="message success">
          <span className="message-icon">✅</span>
          {success}
          <button onClick={() => setSuccess(null)} className="message-close">×</button>
        </div>
      )}

      {error && (
        <div className="message error">
          <span className="message-icon">❌</span>
          {error}
          <button onClick={() => setError(null)} className="message-close">×</button>
        </div>
      )}

      {/* Форма створення/редагування */}
      {(isCreating || editingId) && (
        <div className="form-panel">
          <h3>{isCreating ? '➕ Створення нового запису' : '✏️ Редагування запису'}</h3>
          <div className="form-grid">
            <input
              type="text"
              name="location"
              placeholder="Назва міста"
              value={formData.location}
              onChange={handleInputChange}
              className="form-input"
            />
            <input
              type="number"
              name="temperature"
              placeholder="Температура (°C)"
              value={formData.temperature}
              onChange={handleInputChange}
              className="form-input"
            />
            <input
              type="number"
              name="humidity"
              placeholder="Вологість (%)"
              value={formData.humidity}
              onChange={handleInputChange}
              className="form-input"
            />
            <input
              type="number"
              name="precipitation"
              placeholder="Опади (mm)"
              value={formData.precipitation}
              onChange={handleInputChange}
              className="form-input"
            />
            <input
              type="number"
              name="solar_radiation"
              placeholder="Сонячна радіація"
              value={formData.solar_radiation}
              onChange={handleInputChange}
              className="form-input"
            />
            <input
              type="number"
              name="wind_speed"
              placeholder="Швидкість вітру (m/s)"
              value={formData.wind_speed}
              onChange={handleInputChange}
              className="form-input"
            />
            <input
              type="number"
              name="pressure"
              placeholder="Тиск (kPa)"
              value={formData.pressure}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>
          <div className="form-actions">
            <button onClick={handleSave} className="btn btn-save" disabled={loading}>
              <span className="btn-icon">💾</span>
              Зберегти
            </button>
            <button onClick={handleCancel} className="btn btn-cancel">
              <span className="btn-icon">❌</span>
              Скасувати
            </button>
          </div>
        </div>
      )}

      {/* Основний вміст */}
      <div className="main-content">
        {/* Завантаження */}
        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <p>Завантаження даних...</p>
          </div>
        )}

        {/* Таблиця з даними */}
        <div className="table-container">
          <div className="table-header">
            <h3>📊 Дані моніторингу</h3>
            <div className="table-stats">
              <span className="stat">Знайдено записів: <strong>{data.length}</strong></span>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>📍 Місто</th>
                  <th>📅 Дата та час</th>
                  <th>🌡️ Темп.</th>
                  <th>💧 Волог.</th>
                  <th>🌧️ Опади</th>
                  <th>☀️ Радіація</th>
                  <th>💨 Вітер</th>
                  <th>📊 Тиск</th>
                  <th>⚙️ Дії</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 && !loading ? (
                  <tr>
                    <td colSpan="9" className="no-data">
                      <div className="no-data-content">
                        <span className="no-data-icon">📝</span>
                        <div>
                          <p>Немає даних для відображення</p>
                          <small>Натисніть "Синхронізувати з NASA" для отримання даних</small>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  data.map((item) => (
                    <tr key={item._id} className={editingId === item._id ? 'editing' : ''}>
                      <td className="cell-location">
                        <span className="location-icon">📍</span>
                        {item.location}
                      </td>
                      <td className="cell-date">{formatDate(item.date)}</td>
                      <td className="cell-temperature">
                        {formatNumber(item.temperature)}°C
                      </td>
                      <td className="cell-humidity">
                        {formatNumber(item.humidity)}%
                      </td>
                      <td className="cell-precipitation">
                        {formatNumber(item.precipitation, 2)}mm
                      </td>
                      <td className="cell-radiation">
                        {formatNumber(item.solar_radiation, 2)}
                      </td>
                      <td className="cell-wind">
                        {formatNumber(item.wind_speed)}m/s
                      </td>
                      <td className="cell-pressure">
                        {formatNumber(item.pressure)}kPa
                      </td>
                      <td className="cell-actions">
                        <button
                          onClick={() => handleEdit(item)}
                          className="btn-action btn-edit"
                          title="Редагувати"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(item._id, item.location)}
                          className="btn-action btn-delete"
                          title="Видалити"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Інформаційна панель */}
        <div className="info-panel">
          <div className="info-card">
            <h4>ℹ️ Про систему</h4>
            <p>Ця система отримує реальні дані про погоду з NASA POWER API. Дані оновлюються в реальному часі.</p>
          </div>
          <div className="info-card">
            <h4>📈 Статистика</h4>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-value">{data.length}</span>
                <span className="stat-label">Записів</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">
                  {[...new Set(data.map(item => item.location))].length}
                </span>
                <span className="stat-label">Міст</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">
                  {data.length > 0 ? formatDate(data[0].date) : '-'}
                </span>
                <span className="stat-label">Останнє оновлення</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataTable;