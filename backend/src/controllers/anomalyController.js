import AnomalyData from '../models/AnomalyData.js';
import detectAnomalies from '../utils/anomalyDetector.js';
import { generateSyntheticData } from '../utils/syntheticDataGenerator.js';

// Аналіз існуючих даних
export const analyzeData = async (req, res) => {
  try {
    const {
      pollutant = 'PM2.5',
      startDate,
      endDate,
      windowSize = 120, // хвилин
      thresholdFactor = 3,
      minDuration = 30, // хвилин
      stationId = 'station_1'
    } = req.body;

    // Формуємо фільтр для запиту
    const filter = {
      pollutant,
      stationId
    };

    if (startDate) filter.timestamp = { $gte: new Date(startDate) };
    if (endDate) {
      filter.timestamp = filter.timestamp || {};
      filter.timestamp.$lte = new Date(endDate);
    }

    // Отримуємо дані з бази
    const rawData = await AnomalyData.find(filter)
      .sort({ timestamp: 1 })
      .lean();

    if (rawData.length < 24) {
      return res.status(400).json({
        success: false,
        message: `Недостатньо даних для аналізу. Мінімум 24 точки, отримано: ${rawData.length}`
      });
    }

    // Підготовка даних для аналізу
    const dataForAnalysis = rawData.map(item => ({
      timestamp: new Date(item.timestamp),
      value: item.value
    }));

    // Виявлення аномалій
    const analysisResult = detectAnomalies(dataForAnalysis, {
      windowSize,
      thresholdFactor,
      minDuration,
      measurementInterval: rawData[0]?.measurementInterval || 15
    });

    // Оновлюємо дані з позначками аномалій
    const updatePromises = analysisResult.data.map((item, index) => {
      if (item.isAnomaly) {
        return AnomalyData.findOneAndUpdate(
          {
            timestamp: item.timestamp,
            pollutant,
            stationId
          },
          {
            isAnomaly: true,
            anomalyType: item.anomalyType,
            movingAverage: item.movingAverage,
            movingStd: item.movingStd,
            upperThreshold: item.upperThreshold
          },
          { new: true }
        );
      }
      return Promise.resolve();
    });

    await Promise.all(updatePromises);

    res.json({
      success: true,
      data: analysisResult
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Генерація синтетичних даних
export const generateData = async (req, res) => {
  try {
    const {
      pollutant = 'PM2.5',
      days = 7,
      measurementInterval = 15,
      stationId = 'station_1'
    } = req.body;

    // Генеруємо синтетичні дані
    const syntheticData = generateSyntheticData({
      pollutant,
      days,
      measurementInterval,
      stationId
    });

    // Очищаємо старі дані для цієї станції та забруднювача
    await AnomalyData.deleteMany({
      stationId,
      pollutant,
      isSynthetic: true
    });

    // Зберігаємо нові дані
    const savedData = await AnomalyData.insertMany(syntheticData);

    res.json({
      success: true,
      message: `Згенеровано ${savedData.length} синтетичних записів для ${pollutant}`,
      count: savedData.length,
      data: savedData.slice(0, 10) // Повертаємо перші 10 записів для перевірки
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Отримання даних
export const getData = async (req, res) => {
  try {
    const {
      pollutant,
      startDate,
      endDate,
      limit = 1000,
      stationId = 'station_1',
      onlyAnomalies = false
    } = req.query;

    const filter = { stationId };
    
    if (pollutant) filter.pollutant = pollutant;
    if (startDate) filter.timestamp = { $gte: new Date(startDate) };
    if (endDate) {
      filter.timestamp = filter.timestamp || {};
      filter.timestamp.$lte = new Date(endDate);
    }
    if (onlyAnomalies === 'true') filter.isAnomaly = true;

    const data = await AnomalyData.find(filter)
      .sort({ timestamp: 1 })
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      count: data.length,
      data
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Додавання окремої точки даних
export const addDataPoint = async (req, res) => {
  try {
    const {
      stationId,
      pollutant,
      timestamp,
      value,
      measurementInterval = 15
    } = req.body;

    // Валідація
    if (!pollutant || !timestamp || value === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Необхідно вказати pollutant, timestamp та value'
      });
    }

    const dataPoint = new AnomalyData({
      stationId: stationId || 'station_1',
      pollutant,
      timestamp: new Date(timestamp),
      value: parseFloat(value),
      measurementInterval,
      units: 'μg/m³'
    });

    await dataPoint.save();

    res.status(201).json({
      success: true,
      data: dataPoint
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Отримання статистики
export const getStatistics = async (req, res) => {
  try {
    const { pollutant, stationId = 'station_1', days = 7 } = req.query;
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const filter = {
      stationId,
      timestamp: { $gte: startDate, $lte: endDate }
    };
    
    if (pollutant) filter.pollutant = pollutant;

    const data = await AnomalyData.find(filter).sort({ timestamp: 1 }).lean();

    if (data.length === 0) {
      return res.json({
        success: true,
        statistics: {
          totalPoints: 0,
          anomalyCount: 0,
          averageValue: 0,
          maxValue: 0,
          minValue: 0
        }
      });
    }

    const values = data.map(d => d.value);
    const anomalies = data.filter(d => d.isAnomaly);

    // Обчислюємо P95
    const sortedValues = [...values].sort((a, b) => a - b);
    const p95Index = Math.ceil(0.95 * sortedValues.length) - 1;
    const p95Value = sortedValues[p95Index];

    // Обчислюємо ковзні статистики для останніх 24 точок
    const recentData = data.slice(-24);
    const recentValues = recentData.map(d => d.value);
    const recentMean = recentValues.reduce((sum, val) => sum + val, 0) / recentValues.length;
    const recentStd = Math.sqrt(
      recentValues.map(val => Math.pow(val - recentMean, 2))
        .reduce((sum, val) => sum + val, 0) / recentValues.length
    );

    res.json({
      success: true,
      statistics: {
        totalPoints: data.length,
        anomalyCount: anomalies.length,
        averageValue: values.reduce((sum, val) => sum + val, 0) / values.length,
        maxValue: Math.max(...values),
        minValue: Math.min(...values),
        p95Value,
        recentMean,
        recentStd,
        upperThreshold: recentMean + (3 * recentStd),
        timeRange: {
          start: startDate,
          end: endDate,
          days: parseInt(days)
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};