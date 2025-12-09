/**
 * Генератор синтетичних даних для аналізу аномалій
 */

const generateSyntheticData = (params = {}) => {
  const {
    pollutant = 'PM2.5',
    days = 7,
    measurementInterval = 15, // хвилин
    stationId = 'station_1'
  } = params;

  // Діапазони значень для різних забруднювачів (в μg/m³)
  const pollutantRanges = {
    'PM2.5': { min: 2, max: 150, baseline: 15 },
    'NO2': { min: 5, max: 400, baseline: 25 },
    'SO2': { min: 3, max: 200, baseline: 10 },
    'O3': { min: 10, max: 250, baseline: 40 },
    'CO': { min: 0.1, max: 10, baseline: 0.5 },
    'PM10': { min: 10, max: 300, baseline: 30 }
  };

  const range = pollutantRanges[pollutant] || pollutantRanges['PM2.5'];
  const dataPoints = [];
  const totalMinutes = days * 24 * 60;
  const totalPoints = Math.floor(totalMinutes / measurementInterval);

  let currentTime = new Date();
  currentTime.setHours(0, 0, 0, 0);
  currentTime.setDate(currentTime.getDate() - days);

  // Генерація базового фону з добовою циклічністю
  for (let i = 0; i < totalPoints; i++) {
    const minutesOfDay = (currentTime.getHours() * 60 + currentTime.getMinutes());
    
    // Добова циклічність: вищі значення вдень, нижчі вночі
    const dailyPattern = Math.sin((minutesOfDay - 420) * Math.PI / 720) * 0.5 + 0.5;
    
    // Базове значення з денним паттерном
    let value = range.baseline + (dailyPattern * (range.max - range.baseline) * 0.3);
    
    // Додаємо випадковий шум
    const noise = (Math.random() - 0.5) * range.baseline * 0.5;
    value += noise;
    
    // Додаємо випадкові піки (гамма-розподіл)
    if (Math.random() < 0.01) { // 1% ймовірність піку
      const peakIntensity = Math.random() * (range.max - value) * 0.8;
      const peakDuration = Math.floor(Math.random() * 8) + 1; // 1-8 точок
      
      for (let j = 0; j < peakDuration && i + j < totalPoints; j++) {
        const decayFactor = Math.exp(-j * 0.5);
        const peakValue = value + peakIntensity * decayFactor;
        const timestamp = new Date(currentTime);
        
        if (i + j < dataPoints.length) {
          dataPoints[i + j].value = peakValue;
        } else {
          dataPoints.push({
            stationId,
            pollutant,
            timestamp: new Date(timestamp),
            value: peakValue,
            units: 'μg/m³',
            measurementInterval,
            isSynthetic: true
          });
        }
        
        timestamp.setMinutes(timestamp.getMinutes() + measurementInterval);
      }
      
      i += peakDuration - 1;
      currentTime.setMinutes(currentTime.getMinutes() + measurementInterval * peakDuration);
      continue;
    }

    // Додаємо поступове збільшення (наприклад, ранковий годинник пік)
    if (minutesOfDay >= 420 && minutesOfDay <= 540) { // 7:00-9:00
      const rushHourFactor = (minutesOfDay - 420) / 120; // 0 до 1
      value += rushHourFactor * range.baseline * 0.8;
    }

    // Обмежуємо значення в діапазоні
    value = Math.max(range.min, Math.min(range.max, value));

    dataPoints.push({
      stationId,
      pollutant,
      timestamp: new Date(currentTime),
      value: parseFloat(value.toFixed(2)),
      units: 'μg/m³',
      measurementInterval,
      isSynthetic: true
    });

    currentTime.setMinutes(currentTime.getMinutes() + measurementInterval);
  }

  // Додаємо декілька явних аномалій для тестування
  addTestAnomalies(dataPoints, range);

  return dataPoints;
};

const addTestAnomalies = (data, range) => {
  // 1. Різкий сплеск (спайк)
  const spikeIndex = Math.floor(data.length * 0.3);
  for (let i = 0; i < 4; i++) {
    if (spikeIndex + i < data.length) {
      data[spikeIndex + i].value = range.max * 0.9 + Math.random() * range.max * 0.2;
      data[spikeIndex + i].isTestAnomaly = 'spike';
    }
  }

  // 2. Тривала висока концентрація
  const persistentIndex = Math.floor(data.length * 0.6);
  const persistentDuration = 12; // 12 точок (3 години при інтервалі 15 хв)
  for (let i = 0; i < persistentDuration; i++) {
    if (persistentIndex + i < data.length) {
      data[persistentIndex + i].value = range.max * 0.7 + Math.random() * range.max * 0.3;
      data[persistentIndex + i].isTestAnomaly = 'persistent';
    }
  }

  // 3. Поступове збільшення з подальшим спадом
  const gradualIndex = Math.floor(data.length * 0.8);
  for (let i = 0; i < 8; i++) {
    if (gradualIndex + i < data.length) {
      const factor = 1 - Math.abs(i - 4) / 4; // Парабола
      data[gradualIndex + i].value = range.baseline + factor * (range.max - range.baseline) * 0.6;
      data[gradualIndex + i].isTestAnomaly = 'gradual';
    }
  }
};

export { generateSyntheticData };