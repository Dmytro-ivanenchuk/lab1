import express from 'express';
import {
  analyzeData,
  generateData,
  getData,
  addDataPoint,
  getStatistics
} from '../controllers/anomalyController.js';

const router = express.Router();

router.post('/analyze', analyzeData);
router.post('/generate', generateData);
router.get('/data', getData);
router.post('/data', addDataPoint);
router.get('/statistics', getStatistics);

export default router;