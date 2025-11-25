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

const formatNumber = (value, decimals = 1) => {
  if (value === null || value === undefined) return '-';
  return Number(value).toFixed(decimals);
};

const DataTable = ({ data, loading, editingId, onEdit, onDelete }) => {
  return (
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
              <th>⚙️ Дії</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && !loading ? (
              <tr>
                <td colSpan="6" className="no-data">
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
                  <td className="cell-actions">
                    <button
                      onClick={() => onEdit(item)}
                      className="btn-action btn-edit"
                      title="Редагувати"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => onDelete(item._id, item.location)}
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
  );
};

export default DataTable;