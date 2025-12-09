import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './AnomalyDetector.css'; 

const AnomalyDetector = () => {
  const [data, setData] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [settings, setSettings] = useState({
    pollutant: 'PM2.5',
    windowSize: 120,
    thresholdFactor: 3,
    minDuration: 30,
    days: 7,
    measurementInterval: 15
  });

  const notificationPermissionRef = useRef(null);

  // Запит дозволу на сповіщення
  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        notificationPermissionRef.current = permission;
      });
    }
  }, []);

  // Функція для сповіщення
  const showNotification = (title, message) => {
    if (notificationPermissionRef.current === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/favicon.ico'
      });
    }
  };

  // Генерація синтетичних даних
  const handleGenerateData = async () => {
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:3000/api/anomaly/generate', settings);
      
      setSuccess(response.data.message);
      setTimeout(() => {
        fetchData();
      }, 1000);
      
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Завантаження даних
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/api/anomaly/data', {
        params: {
          pollutant: settings.pollutant,
          days: settings.days
        }
      });
      
      setData(response.data.data || []);
      setAnomalies([]);
      
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Аналіз даних
  const handleAnalyze = async () => {
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:3000/api/anomaly/analyze', settings);
      
      const analysis = response.data.data;
      setData(analysis.data || []);
      setAnomalies(analysis.anomalies || []);
      
      // Сповіщення про знайдені аномалії
      if (analysis.anomalies?.length > 0) {
        const anomalyCount = analysis.anomalies.length;
        const maxAnomaly = Math.max(...analysis.anomalies.map(a => a.maxValue));
        
        setSuccess(`Знайдено ${anomalyCount} аномалій! Максимальне значення: ${maxAnomaly.toFixed(2)}`);
        showNotification(
          'Виявлено аномалії',
          `Знайдено ${anomalyCount} аномалій у даних ${settings.pollutant}`
        );
      } else {
        setSuccess('Аномалій не знайдено');
      }
      
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Обробка зміни налаштувань
  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Ефект для автоматичного завантаження даних при зміні забруднювача
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.pollutant]);

  // Простий графік без Chart.js
  const renderSimpleChart = () => {
    if (data.length === 0) {
      return (
        <div className="no-data">
          <p>Немає даних для відображення</p>
          <button onClick={handleGenerateData}>Згенерувати тестові дані</button>
        </div>
      );
    }

    // Підготовка даних для простого графіка
    const recentData = data.slice(-50); // Беремо останні 50 точок
    const maxValue = Math.max(...recentData.map(d => d.value));
    
    return (
      <div className="simple-chart">
        <div className="chart-bars">
          {recentData.map((item, index) => {
            const height = (item.value / maxValue) * 100;
            const isAnomaly = item.isAnomaly;
            
            return (
              <div 
                key={index}
                className="chart-bar"
                title={`${new Date(item.timestamp).toLocaleTimeString()}: ${item.value.toFixed(2)}`}
                style={{
                  height: `${height}%`,
                  backgroundColor: isAnomaly ? '#f44336' : '#4CAF50',
                  border: isAnomaly ? '2px solid #d32f2f' : '1px solid #388e3c'
                }}
              >
                {isAnomaly && '⚠️'}
              </div>
            );
          })}
        </div>
        <div className="chart-labels">
          <span>Мін: {Math.min(...recentData.map(d => d.value)).toFixed(2)}</span>
          <span>Макс: {maxValue.toFixed(2)}</span>
          <span>Аномалій: {recentData.filter(d => d.isAnomaly).length}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="anomaly-detector">
      <div className="anomaly-header">
        <h1>⚠️ Система виявлення аномальних викидів</h1>
        <p>Аналіз часових рядів забруднення повітря</p>
      </div>

      {/* Панель керування */}
      <div className="control-panel">
        <div className="settings-grid">
          <div className="setting">
            <label>Забруднювач:</label>
            <select
              value={settings.pollutant}
              onChange={(e) => handleSettingChange('pollutant', e.target.value)}
            >
              <option value="PM2.5">PM2.5 (2-200 μg/m³)</option>
              <option value="NO2">NO₂ (5-400 μg/m³)</option>
              <option value="SO2">SO₂ (3-200 μg/m³)</option>
              <option value="O3">O₃ (10-250 μg/m³)</option>
              <option value="CO">CO (0.1-10 mg/m³)</option>
              <option value="PM10">PM10 (10-300 μg/m³)</option>
            </select>
          </div>

          <div className="setting">
            <label>Вікно аналізу (хв):</label>
            <input
              type="range"
              min="30"
              max="240"
              step="15"
              value={settings.windowSize}
              onChange={(e) => handleSettingChange('windowSize', parseInt(e.target.value))}
            />
            <span>{settings.windowSize} хв</span>
          </div>

          <div className="setting">
            <label>Поріг (σ):</label>
            <select
              value={settings.thresholdFactor}
              onChange={(e) => handleSettingChange('thresholdFactor', parseFloat(e.target.value))}
            >
              <option value="2">2σ (менш чутливий)</option>
              <option value="3">3σ (стандарт)</option>
              <option value="4">4σ (більш строгий)</option>
            </select>
          </div>

          <div className="setting">
            <label>Мін. тривалість (хв):</label>
            <input
              type="number"
              min="10"
              max="120"
              step="5"
              value={settings.minDuration}
              onChange={(e) => handleSettingChange('minDuration', parseInt(e.target.value))}
            />
          </div>

          <div className="setting">
            <label>Днів даних:</label>
            <select
              value={settings.days}
              onChange={(e) => handleSettingChange('days', parseInt(e.target.value))}
            >
              <option value="1">1 день</option>
              <option value="3">3 дні</option>
              <option value="7">7 днів</option>
              <option value="14">14 днів</option>
              <option value="30">30 днів</option>
            </select>
          </div>
        </div>

        <div className="anomaly-actions">
          <button onClick={handleGenerateData} disabled={loading}>
            {loading ? 'Генерація...' : 'Генерувати дані'}
          </button>
          <button onClick={fetchData} disabled={loading}>
            Оновити дані
          </button>
          <button 
            onClick={handleAnalyze} 
            disabled={loading || data.length === 0}
            className="analyze-btn"
          >
            {loading ? 'Аналіз...' : 'Виявити аномалії'}
          </button>
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

      {/* Графік */}
      <div className="chart-container">
        <div className="chart-header">
          <h3>Графік концентрації {settings.pollutant}</h3>
          <div className="chart-stats">
            <span>Точок: {data.length}</span>
            <span>Аномалій: {anomalies.length}</span>
          </div>
        </div>
        
        <div className="chart-wrapper">
          {renderSimpleChart()}
        </div>
      </div>

      {/* Список аномалій */}
      {anomalies.length > 0 && (
        <div className="anomalies-list">
          <h3>Знайдені аномалії ({anomalies.length})</h3>
          <div className="anomalies-grid">
            {anomalies.map((anomaly, index) => (
              <div key={index} className="anomaly-card">
                <div className="anomaly-card-header">
                  <span className="anomaly-index">#{index + 1}</span>
                  <span className="anomaly-type">
                    {anomaly.triggerType === '3sigma' ? 'Спайк (3σ)' : 'Високий P95'}
                  </span>
                </div>
                <div className="anomaly-details">
                  <div>
                    <strong>Початок:</strong> {new Date(anomaly.startTime).toLocaleString('uk-UA')}
                  </div>
                  <div>
                    <strong>Тривалість:</strong> {anomaly.duration} хв
                  </div>
                  <div>
                    <strong>Макс. значення:</strong> {anomaly.maxValue.toFixed(2)} μg/m³
                  </div>
                  <div>
                    <strong>Середнє:</strong> {anomaly.averageValue?.toFixed(2) || 'N/A'} μg/m³
                  </div>
                  <div>
                    <strong>Точок:</strong> {anomaly.dataPoints?.length || 0}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Інформаційна панель */}
      <div className="anomaly-info-panel">
        <h3>ℹ️ Пояснення методів</h3>
        <ul>
          <li>
            <strong>Ковзне середнє (μ)</strong> - середнє значення у вікні {settings.windowSize} хв
          </li>
          <li>
            <strong>Стандартне відхилення (σ)</strong> - мінливість у вікні
          </li>
          <li>
            <strong>Поріг</strong> - μ + {settings.thresholdFactor}σ
          </li>
          <li>
            <strong>P95</strong> - 95-й процентиль добових значень
          </li>
          <li>
            <strong>Тривалість</strong> - мінімум {settings.minDuration} хв
          </li>
        </ul>
      </div>

      {loading && <div className="anomaly-loading">Завантаження...</div>}
    </div>
  );
};

export default AnomalyDetector;