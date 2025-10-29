import axios from 'axios';

class NasaService {
  constructor() {
    this.baseURL = 'https://power.larc.nasa.gov/api/temporal/daily/point';
  }

  async getClimateData(latitude, longitude, startDate, endDate) {
    try {
      const params = {
        parameters: 'T2M,RH2M,PRECTOTCORR',
        community: 'RE',
        longitude: longitude,
        latitude: latitude,
        start: this.formatDate(startDate),
        end: this.formatDate(endDate),
        format: 'JSON'
      };

      const response = await axios.get(this.baseURL, { 
        params: params,
        timeout: 30000
      });

      if (response.data && response.data.properties) {
        return this.parseNasaData(response.data, latitude, longitude);
      } else {
        throw new Error('Некоректна відповідь від NASA POWER API');
      }

    } catch (error) {
      console.error('Помилка при отриманні даних з NASA POWER:', error.message);
      throw new Error(`Не вдалося отримати дані: ${error.message}`);
    }
  }

  formatDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  parseNasaData(nasaData, latitude, longitude) {
    const { properties } = nasaData;
    const parsedData = [];

    const dates = Object.keys(properties.parameter.T2M);

    for (const dateStr of dates) {
      const dataPoint = {
        coordinates: { latitude, longitude },
        date: new Date(
          dateStr.substring(0, 4),
          dateStr.substring(4, 6) - 1,
          dateStr.substring(6, 8)
        )
      };

      
      Object.entries(properties.parameter).forEach(([paramName, paramData]) => {
        const value = paramData[dateStr];
        if (value !== undefined && value !== null) {
          switch(paramName) {
            case 'T2M':
              dataPoint.temperature = value;
              break;
            case 'RH2M':
              dataPoint.humidity = value;
              break;
            case 'PRECTOTCORR':
              dataPoint.precipitation = value;
              break;
          }
        }
      });

      parsedData.push(dataPoint);
    }

    return parsedData;
  }
}

export default new NasaService();