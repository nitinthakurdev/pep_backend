import mongoose from 'mongoose';
import { config } from '../config/env.config.js';

export const DBConnection = async () => {
  let isConnected = false;
  do {
    try {
      const Connect = await mongoose.connect(config.MONGODB_URI, {
        dbName: 'Pathshala',
      });
      console.log(
        'MongoDB connected successfully and host is :',
        Connect.connection.host
      );
      isConnected = true;
    } catch (error) {
      console.log('MongoDB connection error:', error);
      console.log('Retrying connection in 5 seconds...');
    }
  } while (!isConnected);
};
