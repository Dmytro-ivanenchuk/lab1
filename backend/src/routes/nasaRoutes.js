import express from 'express';
import {
  syncNasaData,
  getAllData,
  getDataById,
  createData,
  updateData,
  deleteData
} from '../controllers/nasaController.js';

const router = express.Router();

router.get('/sync', syncNasaData);
router.get('/data', getAllData);
router.get('/data/:id', getDataById);
router.post('/data', createData);
router.put('/data/:id', updateData);
router.delete('/data/:id', deleteData);

export default router;