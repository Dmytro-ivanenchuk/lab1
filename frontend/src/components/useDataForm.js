import { useState } from 'react';
import nasaApi from '../services/nasaApi';

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
    setFormData({
      location: '',
      temperature: '',
      humidity: '',
      precipitation: '',
    });
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setIsCreating(false);
    setFormData({
      location: item.location || '',
      temperature: item.temperature || '',
      humidity: item.humidity || '',
      precipitation: item.precipitation || '',
    });
  };

  const handleDelete = async (id, location) => {
    if (window.confirm(`Ви впевнені, що хочете видалити запис для "${location}"?`)) {
      try {
        setLoading(true);
        await nasaApi.deleteData(id);
        setSuccess('✅ Запис успішно видалено');
        await loadData();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      if (isCreating) {
        await nasaApi.createData({
          ...formData,
          coordinates: { latitude: 50.45, longitude: 30.52 },
          date: new Date().toISOString()
        });
        setSuccess('✅ Новий запис успішно створено');
      } else {
        await nasaApi.updateData(editingId, formData);
        setSuccess('✅ Запис успішно оновлено');
      }

      setIsCreating(false);
      setEditingId(null);
      setFormData({
        location: '',
        temperature: '',
        humidity: '',
        precipitation: '',
      });

      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    setFormData({
      location: '',
      temperature: '',
      humidity: '',
      precipitation: '',
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return {
    editingId,
    isCreating,
    formData,
    handleCreate,
    handleEdit,
    handleDelete,
    handleSave,
    handleCancel,
    handleInputChange
  };
};