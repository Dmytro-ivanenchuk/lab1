import express from 'express';
import {
  analyzeData,
  generateData,
  getData,
  addDataPoint,
  getStatistics
} from '../controllers/anomalyController.js';

const router = express.Router();

// Аналіз даних на наявність аномалій
router.post('/analyze', analyzeData);

// Генерація синтетичних даних
router.post('/generate', generateData);

// Отримання даних
router.get('/data', getData);

// Додавання точки даних
router.post('/data', addDataPoint);

// Статистика
router.get('/statistics', getStatistics);

export default router;