import express from 'express';
import cors from 'cors';
import nasaRoutes from './src/routes/nasaRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/nasa', nasaRoutes);

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'NASA Power API',
    timestamp: new Date().toISOString()
  });
});

export default app;