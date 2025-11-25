import React, { useState, useEffect } from 'react';
import axios from 'axios';

const WeatherForm = ({ 
  editingId, 
  isCreating, 
  onSaveSuccess, 
  onSaveError, 
  onCancel, 
  initialData,
  loading,
  setLoading 
}) => {
  const [formData, setFormData] = useState({ 
    location: '', 
    temperature: '', 
    humidity: '', 
    precipitation: '' 
  });

  const API_URL = 'http://localhost:3001/api/nasa';

  // Заповнити форму даними при редагуванні
  useEffect(() => {
    if (initialData && !isCreating) {
      setFormData({
        location: initialData.location || '',
        temperature: initialData.temperature || '',
        humidity: initialData.humidity || '',
        precipitation: initialData.precipitation || ''
      });
    } else {
      setFormData({ location: '', temperature: '', humidity: '', precipitation: '' });
    }
  }, [initialData, isCreating]);

  // Зберегти форму
  const handleSave = async () => {
    try {
      setLoading(true);
      if (isCreating) {
        await axios.post(`${API_URL}/data`, {
          ...formData,
          date: new Date().toISOString()
        });
      } else {
        await axios.put(`${API_URL}/data/${editingId}`, formData);
      }
      onSaveSuccess();
    } catch (err) {
      onSaveError();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-panel">
      <h3>{isCreating ? 'Створення запису' : 'Редагування запису'}</h3>
      <div className="form-grid">
        <input
          type="text"
          placeholder="Місто"
          value={formData.location}
          onChange={(e) => setFormData({...formData, location: e.target.value})}
        />
        <input
          type="number"
          placeholder="Температура (°C)"
          value={formData.temperature}
          onChange={(e) => setFormData({...formData, temperature: e.target.value})}
        />
        <input
          type="number"
          placeholder="Вологість (%)"
          value={formData.humidity}
          onChange={(e) => setFormData({...formData, humidity: e.target.value})}
        />
        <input
          type="number"
          placeholder="Опади (mm)"
          value={formData.precipitation}
          onChange={(e) => setFormData({...formData, precipitation: e.target.value})}
        />
      </div>
      <div className="form-actions">
        <button onClick={handleSave} disabled={loading}>
          {loading ? 'Збереження...' : 'Зберегти'}
        </button>
        <button onClick={onCancel}>Скасувати</button>
      </div>
    </div>
  );
};

export default WeatherForm;