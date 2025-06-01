import jwt from 'jsonwebtoken';
import config from '../config/index.js';

export const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role }, // payload
    config.jwtSecret,
    { expiresIn: '1h' }
  );
};
