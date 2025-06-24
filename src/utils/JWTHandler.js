import jwt from 'jsonwebtoken';

// local imports
import { config } from '../config/env.config.js';

export const SignToken = (data, expire) => {
  return jwt.sign(data, config.JWT_SECRET, expire && { expiresIn: expire });
};

export const VerifyToken = (token) => {
  return jwt.verify(token, config.JWT_SECRET);
};
