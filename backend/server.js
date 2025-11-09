import 'dotenv/config';
import app from './app.js';
import connectDB from './src/config/database.js';

const PORT = process.env.PORT

const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`🚀 Сервер працює на порті ${PORT}`);
      console.log(`🌐 http://localhost:${PORT}`);
      console.log(`📊 API: http://localhost:${PORT}/api/nasa`);
    });
  } catch (error) {
    console.error('❌ Помилка запуску сервера:', error.message);
    process.exit(1);
  }
};

startServer();