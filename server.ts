import dotenv from 'dotenv';
dotenv.config(); // Load environment variables

import app from './src2/app.js';
import mongoose from 'mongoose';

import cookieParser from "cookie-parser";

app.use(cookieParser());


const PORT = process.env.PORT || 5004;
const MONGO_URI = process.env.MONGO_URI; // Get MongoDB URI

if (!MONGO_URI) {
  console.error("❌ MONGO_URI is not defined in .env file");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ Database connected');

    
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err);
  });
