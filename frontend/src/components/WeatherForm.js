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
  setLoading,
  API_URL
}) => {
  const [formData, setFormData] = useState({
    location: '',
    temperature: '',
    humidity: '',
    precipitation: ''
  });

  // Ініціалізація форми при редагуванні
  useEffect(() => {
    if (initialData) {
      setFormData({
        location: initialData.location || '',
        temperature: initialData.temperature || '',
        humidity: initialData.humidity || '',
        precipitation: initialData.precipitation || ''
      });
    } else {
      setFormData({
        location: '',
        temperature: '',
        humidity: '',
        precipitation: ''
      });
    }
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Валідація
    if (!formData.location || !formData.temperature || !formData.humidity || !formData.precipitation) {
      onSaveError('Всі поля обов\'язкові для заповнення');
      return;
    }

    try {
      setLoading(true);
      
      const dataToSend = {
        location: formData.location,
        temperature: parseFloat(formData.temperature),
        humidity: parseFloat(formData.humidity),
        precipitation: parseFloat(formData.precipitation)
      };

      let response;
      if (isCreating) {
        response = await axios.post(`${API_URL}/data`, dataToSend);
      } else {
        response = await axios.put(`${API_URL}/data/${editingId}`, dataToSend);
      }

      if (response.data.success) {
        onSaveSuccess();
      } else {
        onSaveError(response.data.message || 'Невідома помилка');
      }
    } catch (err) {
      console.error('Помилка збереження:', err);
      onSaveError(err.response?.data?.message || err.message || 'Помилка збереження');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="weather-form">
      <h3>{isCreating ? 'Додати запис' : 'Редагувати запис'}</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Місто:</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            required
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label>Температура (°C):</label>
          <input
            type="number"
            step="0.1"
            name="temperature"
            value={formData.temperature}
            onChange={handleInputChange}
            required
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label>Вологість (%):</label>
          <input
            type="number"
            step="0.1"
            name="humidity"
            value={formData.humidity}
            onChange={handleInputChange}
            required
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label>Опади (mm):</label>
          <input
            type="number"
            step="0.1"
            name="precipitation"
            value={formData.precipitation}
            onChange={handleInputChange}
            required
            disabled={loading}
          />
        </div>
        
        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Збереження...' : (isCreating ? 'Створити' : 'Оновити')}
          </button>
          <button type="button" onClick={onCancel} disabled={loading} className="btn-secondary">
            Скасувати
          </button>
        </div>
      </form>
    </div>
  );
};

export default WeatherForm;