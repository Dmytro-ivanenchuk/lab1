import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Перевіряємо чи змінна існує
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI не вказано в .env файлі');
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB підключено: ${conn.connection.host}`);
    console.log(`📊 База даних: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ Помилка підключення до MongoDB:', error.message);
    process.exit(1);
  }
};

export default connectDB;