import { useState } from 'react';
import { nasaApi } from '../services/nasaApi';

export const useDataForm = (loadData, setSuccess, setError, setLoading) => {
  const [editingId, setEditingId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    location: '',
    temperature: '',
    humidity: '',
    precipitation: '',
  });

  const handleCreate = () => {
    setIsCreating(true);
    setEditingId(null);
    setFormData({ location: '', temperature: '', humidity: '', precipitation: '' });
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setIsCreating(false);
    setFormData({
      location: item.location,
      temperature: item.temperature,
      humidity: item.humidity,
      precipitation: item.precipitation,
    });
  };

  const handleDelete = async (id, location) => {
    if (window.confirm(`Видалити "${location}"?`)) {
      try {
        setLoading(true);
        await nasaApi.deleteData(id);
        setSuccess('Запис видалено');
        await loadData();
      } catch (err) {
        setError('Помилка видалення');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      if (isCreating) {
        await nasaApi.createData({
          ...formData,
          date: new Date().toISOString()
        });
        setSuccess('Запис створено');
      } else {
        await nasaApi.updateData(editingId, formData);
        setSuccess('Запис оновлено');
      }
      resetForm();
      await loadData();
    } catch (err) {
      setError('Помилка збереження');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setIsCreating(false);
    setEditingId(null);
    setFormData({ location: '', temperature: '', humidity: '', precipitation: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return {
    editingId,
    isCreating,
    formData,
    handleCreate,
    handleEdit,
    handleDelete,
    handleSave,
    resetForm,
    handleInputChange
  };
};