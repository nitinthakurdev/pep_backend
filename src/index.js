import express from 'express';
import { Start } from './server.js';

const InitServer = () => {
  const app = express();
  Start(app);
};

InitServer();
