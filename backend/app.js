import express from 'express';
import cors from 'cors';
import anomalyRoutes from './src/routes/anomalyRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'NASA Power API',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/anomaly', anomalyRoutes);

export default app;