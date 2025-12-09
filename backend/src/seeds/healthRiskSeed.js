import mongoose from 'mongoose';
import HealthRisk from '../models/AnomalyData.js';
import calculateHealthRisk from '../utils/anomalyDetector.js';
import dotenv from 'dotenv';

dotenv.config();

const seedHealthRiskData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Очистити існуючі дані
    await HealthRisk.deleteMany({});
    
    const pollutants = ['PM2.5', 'PM10', 'NO2', 'SO2', 'CO', 'Pb', 'Cd', 'As'];
    const locations = ['Київ', 'Львів', 'Одеса', 'Харків', 'Дніпро'];
    
    const records = [];
    
    for (let i = 0; i < 30; i++) {
      const pollutant = pollutants[Math.floor(Math.random() * pollutants.length)];
      const medium = Math.random() > 0.3 ? 'air' : 'water';
      
      const params = {
        pollutant,
        medium,
        C: medium === 'air' 
          ? 0.005 + Math.random() * 0.245
          : 0.0005 + Math.random() * 0.0495,
        IR: 8 + Math.random() * 12,
        EF: 100 + Math.random() * 250,
        ED: 1 + Math.random() * 29,
        BW: 20 + Math.random() * 70,
        AT: 365 * (25 + Math.random() * 45),
        RfD: Math.pow(10, -4 + Math.random() * 3),
        SF: ['Pb', 'Cd', 'As'].includes(pollutant) 
          ? 0.1 + Math.random() * 19.9 
          : null,
        location: locations[Math.floor(Math.random() * locations.length)],
        notes: 'Тестові дані з seed файлу'
      };
      
      const results = calculateHealthRisk(params);
      
      records.push({
        ...params,
        ...results,
        userId: 'seed_script'
      });
    }
    
    await HealthRisk.insertMany(records);
    console.log(`✅ Згенеровано ${records.length} тестових записів для HealthRisk`);
    
    mongoose.disconnect();
  } catch (error) {
    console.error('❌ Помилка при генерації seed даних:', error);
    process.exit(1);
  }
};

seedHealthRiskData();