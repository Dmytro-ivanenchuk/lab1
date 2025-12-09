import mongoose from 'mongoose';

const AnomalyDataSchema = new mongoose.Schema({
  stationId: {
    type: String,
    required: true,
    default: 'station_1'
  },
  pollutant: {
    type: String,
    required: true,
    enum: ['PM2.5', 'NO2', 'SO2', 'O3', 'CO', 'PM10'],
    default: 'PM2.5'
  },
  timestamp: {
    type: Date,
    required: true,
    index: true
  },
  value: {
    type: Number,
    required: true
  },
  // Результати аналізу
  isAnomaly: {
    type: Boolean,
    default: false
  },
  anomalyType: {
    type: String,
    enum: ['spike', 'persistent_high', 'pattern_deviation', null],
    default: null
  },
  movingAverage: Number,
  movingStd: Number,
  upperThreshold: Number,
  p95Value: Number,
  windowSize: Number,
  // Метадані
  measurementInterval: {
    type: Number,
    default: 15 // хвилин
  },
  units: {
    type: String,
    default: 'μg/m³'
  }
}, {
  timestamps: true
});

// Індекс для швидкого пошуку за датою та забруднювачем
AnomalyDataSchema.index({ timestamp: 1, pollutant: 1 });
AnomalyDataSchema.index({ stationId: 1, timestamp: 1 });

export default mongoose.model('AnomalyData', AnomalyDataSchema);