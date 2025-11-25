const DataForm = ({ isCreating, editingId, formData, onInputChange, onSave, onCancel, loading }) => {
  if (!isCreating && !editingId) return null;

  return (
    <div className="form-panel">
      <h3>{isCreating ? '➕ Створення нового запису' : '✏️ Редагування запису'}</h3>
      <div className="form-grid">
        <input
          type="text"
          name="location"
          placeholder="Назва міста"
          value={formData.location}
          onChange={onInputChange}
          className="form-input"
        />
        <input
          type="number"
          name="temperature"
          placeholder="Температура (°C)"
          value={formData.temperature}
          onChange={onInputChange}
          className="form-input"
        />
        <input
          type="number"
          name="humidity"
          placeholder="Вологість (%)"
          value={formData.humidity}
          onChange={onInputChange}
          className="form-input"
        />
        <input
          type="number"
          name="precipitation"
          placeholder="Опади (mm)"
          value={formData.precipitation}
          onChange={onInputChange}
          className="form-input"
        />
      </div>
      <div className="form-actions">
        <button onClick={onSave} className="btn btn-save" disabled={loading}>
          <span className="btn-icon">💾</span>
          Зберегти
        </button>
        <button onClick={onCancel} className="btn btn-cancel">
          <span className="btn-icon">❌</span>
          Скасувати
        </button>
      </div>
    </div>
  );
};

export default DataForm;