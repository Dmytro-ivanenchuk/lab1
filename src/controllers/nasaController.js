import NasaData from '../models/NasaData.js';
import nasaService from '../services/nasaService.js';

// Синхронізація даних для кількох міст
export const syncNasaData = async (req, res) => {
  try {
    const cities = [
      { name: "Київ", lat: 50.4501, lng: 30.5234 },
      { name: "Львів", lat: 49.8397, lng: 24.0297 },
      { name: "Одеса", lat: 46.4825, lng: 30.7233 },
      { name: "Харків", lat: 49.9935, lng: 36.2304 },
      { name: "Дніпро", lat: 48.4647, lng: 35.0462 }
    ];

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    let totalSaved = 0;

    for (const city of cities) {
      try {
        const nasaData = await nasaService.getClimateData(city.lat, city.lng, startDate, endDate);

        for (const dataPoint of nasaData) {
          dataPoint.location = city.name;

          const existing = await NasaData.findOne({
            'coordinates.latitude': city.lat,
            'coordinates.longitude': city.lng,
            date: dataPoint.date
          });

          if (existing) {
            await NasaData.findByIdAndUpdate(existing._id, dataPoint);
          } else {
            const newRecord = new NasaData(dataPoint);
            await newRecord.save();
            totalSaved++;
          }
        }
      } catch (error) {
        console.error(`Помилка для міста ${city.name}:`, error.message);
      }
    }

    res.json({
      success: true,
      message: `Синхронізація завершена. Додано ${totalSaved} нових записів`
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Отримати всі дані
export const getAllData = async (req, res) => {
  try {
    const data = await NasaData.find();
    res.json({
      success: true,
      count: data.length,
      data: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Отримати дані за ID
export const getDataById = async (req, res) => {
  try {
    const data = await NasaData.findById(req.params.id);
    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Запис не знайдено'
      });
    }
    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Створити новий запис (вручну)
export const createData = async (req, res) => {
  try {
    const newRecord = new NasaData(req.body);
    await newRecord.save();
    res.status(201).json({
      success: true,
      data: newRecord
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Оновити запис
export const updateData = async (req, res) => {
  try {
    const data = await NasaData.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Запис не знайдено'
      });
    }
    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Видалити запис
export const deleteData = async (req, res) => {
  try {
    const data = await NasaData.findByIdAndDelete(req.params.id);
    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Запис не знайдено'
      });
    }
    res.json({
      success: true,
      message: 'Запис видалено'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};