import * as authService from '../services/auth.service.js';

export const register = async (req, res) => {
  try {
    const { 
      email, 
      password, 
      role,
      surname,
      name,
      patronymic,
      salary,
      date_of_birth,
      date_of_start,
      phone_number,
      city,
      street,
      zip_code
    } = req.body;

    const result = await authService.register({ 
      email, 
      password, 
      role,
      surname,
      name,
      patronymic,
      salary,
      date_of_birth,
      date_of_start,
      phone_number,
      city,
      street,
      zip_code
    });
    
    res.status(201).json(result);
  } catch (error) {
    if (error.message.includes('already exists')) {
      res.status(409).json({ message: error.message });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    res.json(result);
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};
