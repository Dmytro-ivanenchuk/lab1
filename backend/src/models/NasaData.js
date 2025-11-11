import mongoose from 'mongoose';

const NasaDataSchema = new mongoose.Schema({
  location: {
    type: String,
    required: true
  },
  coordinates: {
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    }
  },
  date: {
    type: Date,
    required: true
  },
  temperature: Number,
  humidity: Number,
  precipitation: Number,
  source: {
    type: String,
    default: 'nasa_power'
  }
}, {
  timestamps: true
});

export default mongoose.model('NasaData', NasaDataSchema);