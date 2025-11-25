import React from 'react';
import { useDataTable } from './useDataTable';
import { useDataForm } from './useDataForm';
import Header from './components/Header';
import ControlPanel from './components/ControlPanel';
import Messages from './components/Messages';
import DataForm from './components/DataForm';
import DataTable from './components/DataTable';
import InfoPanel from './components/InfoPanel';
import './DataTable.css';

const DataTableContainer = () => {
  const {
    data,
    loading,
    error,
    success,
    serverStatus,
    setError,
    setSuccess,
    setLoading, 
    loadData,
    handleSync
  } = useDataTable();

  const {
    editingId,
    isCreating,
    formData,
    handleCreate,
    handleEdit,
    handleDelete,
    handleSave,
    handleCancel,
    handleInputChange
  } = useDataForm(loadData, setSuccess, setError, setLoading); 

  return (
    <div className="data-table-container">
      <Header serverStatus={serverStatus} />
      
      <ControlPanel
        onSync={handleSync}
        onRefresh={loadData}
        onCreate={handleCreate}
        loading={loading}
        serverStatus={serverStatus}
      />

      <Messages 
        error={error} 
        success={success} 
        onErrorClose={() => setError(null)} 
        onSuccessClose={() => setSuccess(null)} 
      />

      <DataForm
        isCreating={isCreating}
        editingId={editingId}
        formData={formData}
        onInputChange={handleInputChange}
        onSave={handleSave}
        onCancel={handleCancel}
        loading={loading}
      />

      <div className="main-content">
        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <p>Завантаження даних...</p>
          </div>
        )}

        <DataTable
          data={data}
          loading={loading}
          editingId={editingId}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <InfoPanel data={data} />
      </div>
    </div>
  );
};

export default DataTableContainer;