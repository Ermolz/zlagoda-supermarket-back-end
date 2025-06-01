import jwt from 'jsonwebtoken';
import config from '../config/index.js';

export const generateToken = (user) => {
  return jwt.sign(
    { 
      id_employee: user.id_employee, 
      role: user.empl_role,
      email: user.email
    },
    config.jwtSecret,
    { expiresIn: '24h' }
  );
};
