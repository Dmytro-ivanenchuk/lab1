
const detectAnomalies = (data, params = {}) => {
  const {
    windowSize = 120, // хвилин (2 години)
    thresholdFactor = 3, // 3σ
    minDuration = 30, // хвилин
    measurementInterval = 15 // хвилин між вимірами
  } = params;

  const sortedData = [...data].sort((a, b) => 
    new Date(a.timestamp) - new Date(b.timestamp)
  );

  if (sortedData.length < 24) {
    throw new Error(`Недостатньо даних для аналізу. Мінімум 24 точки, отримано: ${sortedData.length}`);
  }

  // Обчислюємо ковзне середнє та стандартне відхилення
  const results = calculateMovingStats(sortedData, windowSize, measurementInterval);
  
  // Обчислюємо добовий P95 (95-й процентиль)
  const dailyP95 = calculateDailyP95(sortedData);
  
  // Виявляємо аномалії
  const anomalies = detectAnomalyEvents(results, {
    thresholdFactor,
    minDuration,
    measurementInterval,
    dailyP95
  });

  // Позначаємо аномалії в даних
  const markedData = markAnomaliesInData(sortedData, anomalies);

  return {
    data: markedData,
    anomalies,
    statistics: {
      windowSize,
      thresholdFactor,
      minDuration,
      totalPoints: sortedData.length,
      anomalyCount: anomalies.length,
      dailyP95,
      movingAvgRange: {
        min: Math.min(...results.map(r => r.movingAverage).filter(v => v !== null)),
        max: Math.max(...results.map(r => r.movingAverage).filter(v => v !== null)),
        avg: results.reduce((sum, r) => sum + (r.movingAverage || 0), 0) / results.length
      }
    }
  };
};

const calculateMovingStats = (data, windowSize, interval) => {
  const results = [];
  const windowPoints = Math.ceil(windowSize / interval);

  for (let i = 0; i < data.length; i++) {
    const startIdx = Math.max(0, i - windowPoints + 1);
    const endIdx = i + 1;
    const window = data.slice(startIdx, endIdx).map(d => d.value);

    let movingAverage = null;
    let movingStd = null;
    let upperThreshold = null;

    if (window.length >= 12) { 
      movingAverage = calculateMean(window);
      movingStd = calculateStandardDeviation(window, movingAverage);
      upperThreshold = movingAverage + (3 * movingStd);
    }

    results.push({
      timestamp: data[i].timestamp,
      value: data[i].value,
      movingAverage,
      movingStd,
      upperThreshold,
      windowSize: window.length
    });
  }

  return results;
};

const calculateDailyP95 = (data) => {
  // Групуємо дані по днях
  const dailyValues = {};
  
  data.forEach(point => {
    const date = new Date(point.timestamp).toISOString().split('T')[0];
    if (!dailyValues[date]) {
      dailyValues[date] = [];
    }
    dailyValues[date].push(point.value);
  });

  // Обчислюємо P95 для кожного дня
  const dailyP95s = Object.values(dailyValues).map(values => {
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil(0.95 * sorted.length) - 1;
    return sorted[index];
  });

  // Повертаємо середнє P95 по всіх днях
  return dailyP95s.length > 0 ? calculateMean(dailyP95s) : null;
};

const detectAnomalyEvents = (statsData, params) => {
  const { thresholdFactor, minDuration, measurementInterval, dailyP95 } = params;
  const anomalies = [];
  let currentEvent = null;

  for (let i = 0; i < statsData.length; i++) {
    const point = statsData[i];
    
    // Перевірка двох умов:
    // 1. Значення > μ + 3σ
    // 2. Значення > добового P95 (якщо P95 доступний)
    const isSpike = point.upperThreshold && point.value > point.upperThreshold;
    const isAboveP95 = dailyP95 && point.value > dailyP95;
    
    if (isSpike || isAboveP95) {
      if (!currentEvent) {
        currentEvent = {
          startIndex: i,
          startTime: point.timestamp,
          maxValue: point.value,
          triggerType: isSpike ? '3sigma' : 'p95',
          dataPoints: [point]
        };
      } else {
        currentEvent.dataPoints.push(point);
        if (point.value > currentEvent.maxValue) {
          currentEvent.maxValue = point.value;
        }
      }
    } else if (currentEvent) {
      // Завершення події
      const duration = (currentEvent.dataPoints.length * measurementInterval);
      if (duration >= minDuration) {
        currentEvent.endTime = point.timestamp;
        currentEvent.duration = duration;
        currentEvent.averageValue = calculateMean(currentEvent.dataPoints.map(p => p.value));
        anomalies.push(currentEvent);
      }
      currentEvent = null;
    }
  }

  // Обробляємо подію, якщо вона триває до кінця даних
  if (currentEvent) {
    const duration = (currentEvent.dataPoints.length * measurementInterval);
    if (duration >= minDuration) {
      currentEvent.endTime = statsData[statsData.length - 1].timestamp;
      currentEvent.duration = duration;
      currentEvent.averageValue = calculateMean(currentEvent.dataPoints.map(p => p.value));
      anomalies.push(currentEvent);
    }
  }

  return anomalies;
};

const markAnomaliesInData = (data, anomalies) => {
  const markedData = [...data];
  
  anomalies.forEach(anomaly => {
    anomaly.dataPoints.forEach(anomalyPoint => {
      const index = markedData.findIndex(d => 
        d.timestamp.getTime() === anomalyPoint.timestamp.getTime()
      );
      if (index !== -1) {
        markedData[index] = {
          ...markedData[index],
          isAnomaly: true,
          anomalyType: anomaly.triggerType === '3sigma' ? 'spike' : 'persistent_high',
          movingAverage: anomalyPoint.movingAverage,
          movingStd: anomalyPoint.movingStd,
          upperThreshold: anomalyPoint.upperThreshold
        };
      }
    });
  });

  return markedData;
};

// Допоміжні функції
const calculateMean = (values) => {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
};

const calculateStandardDeviation = (values, mean) => {
  if (values.length < 2) return 0;
  const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  return Math.sqrt(variance);
};

export default detectAnomalies;