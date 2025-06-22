/* eslint-disable no-undef */
import dotenv from 'dotenv';

dotenv.config();

class Config {
  NODE_ENV;
  MONGODB_URI;
  JWT_SECRET;
  LOCAL_CLIENT_URL;
  LOCAL_APP_IP;
  CLIENT_URL;
  APP_IP;
  BACKEND_URL;
  constructor() {
    this.NODE_ENV = process.env.NODE_ENV;
    this.MONGODB_URI = process.env.MONGODB_URI;
    this.JWT_SECRET = process.env.JWT_SECRET;
    this.LOCAL_CLIENT_URL = process.env.LOCAL_CLIENT_URL;
    this.LOCAL_APP_IP = process.env.LOCAL_APP_IP;
    this.CLIENT_URL = process.env.CLIENT_URL;
    this.APP_IP = process.env.APP_IP;
    this.BACKEND_URL = process.env.BACKEND_URL;
  }
}

export const config = new Config();
