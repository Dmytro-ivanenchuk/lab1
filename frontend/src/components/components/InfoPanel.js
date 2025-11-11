import React from 'react';

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

const InfoPanel = ({ data }) => {
  return (
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
  );
};

export default InfoPanel;