import React from 'react';

const Header = ({ serverStatus }) => {
  return (
    <div className="header">
      <div className="header-content">
        <h1><span className="emoji">🌍</span> Система моніторингу NASA POWER</h1>
        <p className="subtitle">Реальні дані про погоду з NASA API</p>
      </div>
      <div className="status-indicator">
        <div className={`status-dot ${serverStatus}`}></div>
        <span>Backend: {serverStatus === 'online' ? '🟢 Онлайн' : '🔴 Офлайн'}</span>
      </div>
    </div>
  );
};

export default Header;