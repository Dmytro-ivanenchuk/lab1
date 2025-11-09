import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/nasa';

// Створюємо екземпляр axios з базовими налаштуваннями
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

class NasaApiService {
  // Отримати всі дані
  async getAllData() {
    try {
      console.log('📡 Запит до API: отримати всі дані');
      const response = await apiClient.get('/data');
      console.log('✅ Дані отримані:', response.data.data?.length || 0, 'записів');
      return response.data;
    } catch (error) {
      console.error('❌ Помилка при отриманні даних:', error.message);
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Не вдається підключитися до сервера. Перевірте, чи запущений backend на порті 3000');
      }
      throw new Error(error.response?.data?.message || 'Не вдалося завантажити дані з сервера');
    }
  }

  // Синхронізувати дані з NASA
  async syncData() {
    try {
      console.log('📡 Запит до API: синхронізація з NASA');
      const response = await apiClient.get('/sync');
      console.log('✅ Синхронізація успішна:', response.data.message);
      return response.data;
    } catch (error) {
      console.error('❌ Помилка синхронізації:', error.message);
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Не вдається підключитися до сервера. Перевірте, чи запущений backend');
      }
      throw new Error(error.response?.data?.message || 'Не вдалося синхронізувати дані з NASA API');
    }
  }

  // Створити новий запис
  async createData(data) {
    try {
      console.log('📡 Запит до API: створення запису');
      const response = await apiClient.post('/data', data);
      console.log('✅ Запис створено:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Помилка при створенні запису:', error);
      throw new Error(error.response?.data?.message || 'Помилка при створенні запису');
    }
  }

  // Оновити запис
  async updateData(id, data) {
    try {
      console.log('📡 Запит до API: оновлення запису', id);
      const response = await apiClient.put(`/data/${id}`, data);
      console.log('✅ Запис оновлено:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Помилка при оновленні запису:', error);
      throw new Error(error.response?.data?.message || 'Помилка при оновленні запису');
    }
  }

  // Видалити запис
  async deleteData(id) {
    try {
      console.log('📡 Запит до API: видалення запису', id);
      const response = await apiClient.delete(`/data/${id}`);
      console.log('✅ Запис видалено:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Помилка при видаленні запису:', error);
      throw new Error(error.response?.data?.message || 'Помилка при видаленні запису');
    }
  }

  // Перевірити здоров'я сервера
  async healthCheck() {
    try {
      const response = await axios.get('http://localhost:3000/api/health');
      return response.data;
    } catch (error) {
      throw new Error('Сервер не відповідає');
    }
  }
}

export default new NasaApiService();