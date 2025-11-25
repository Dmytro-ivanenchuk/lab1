
const ControlPanel = ({ onSync, onRefresh, onCreate, loading, serverStatus }) => {
  return (
    <div className="control-panel">
      <div className="control-group">
        <button 
          onClick={onSync} 
          className="btn btn-sync"
          disabled={loading || serverStatus === 'offline'}
        >
          <span className="btn-icon">🔄</span>
          {loading ? 'Синхронізація...' : 'Синхронізувати з NASA'}
        </button>
        <button 
          onClick={onRefresh} 
          className="btn btn-refresh"
          disabled={loading}
        >
          <span className="btn-icon">📥</span>
          Оновити дані
        </button>
      </div>
      <div className="control-group">
        <button 
          onClick={onCreate} 
          className="btn btn-create"
          disabled={loading}
        >
          <span className="btn-icon">➕</span>
          Додати запис
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;