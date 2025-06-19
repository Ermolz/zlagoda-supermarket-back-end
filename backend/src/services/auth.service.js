import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import { EmployeeRepository } from '../repositories/employee.repository.js';
import { logger } from '../utils/logger.js';

const employeeRepo = new EmployeeRepository();

export const register = async ({ 
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
}) => {
  const existing = await employeeRepo.findUserByEmail(email);
  if (existing) {
    throw new Error('User already exists');
  }

  const employeeData = {
    empl_surname: surname,
    empl_name: name,
    empl_patronymic: patronymic,
    empl_role: role,
    salary: parseFloat(salary),
    date_of_birth,
    date_of_start,
    phone_number,
    city,
    street,
    zip_code
  };

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await employeeRepo.create(employeeData);

  await employeeRepo.createAuth({
    id_employee: user.id_employee,
    email,
    password: hashedPassword
  });

  const token = jwt.sign(
    { 
      id_employee: user.id_employee,
      empl_role: role,
      email
    },
    config.jwtSecret,
    { expiresIn: '24h' }
  );

  return { token, user };
};

export const login = async ({ email, password }) => {
  logger.info('Login attempt', { email });

  try {
    const user = await employeeRepo.findUserByEmail(email);
    if (!user) {
      logger.warn('Login failed: User not found', { email });
      throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn('Login failed: Invalid password', { email });
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
      { 
        id_employee: user.id_employee,
        empl_role: user.empl_role,
        email: user.email
      },
      config.jwtSecret,
      { expiresIn: '24h' }
    );

    logger.info('Login successful', { 
      id_employee: user.id_employee,
      empl_role: user.empl_role,
      email: user.email
    });

    return { token, user };
  } catch (error) {
    logger.error('Login error', {
      error: error.message,
      email
    });
    throw error;
  }
};

export const validateToken = async (token) => {
  logger.debug('Validating token');

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    logger.info('Token validated successfully', { 
      userId: decoded.id_employee,
      role: decoded.empl_role
    });
    return decoded;
  } catch (error) {
    logger.warn('Token validation failed', { error: error.message });
    throw new Error('Invalid token');
  }
};

export const changePassword = async (userId, { oldPassword, newPassword }) => {
  logger.info('Password change attempt', { userId });

  try {
    const employee = await employeeRepo.findById(userId);
    if (!employee) {
      logger.warn('Password change failed: Employee not found', { userId });
      throw new Error('Employee not found');
    }

    const isValidPassword = await bcrypt.compare(oldPassword, employee.password);
    if (!isValidPassword) {
      logger.warn('Password change failed: Invalid old password', { userId });
      throw new Error('Invalid old password');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    logger.debug('New password hashed successfully', { userId });

    await employeeRepo.updateAuth(userId, { password: hashedPassword });
    logger.info('Password changed successfully', { userId });

    return { message: 'Password changed successfully' };
  } catch (error) {
    logger.error('Password change error', {
      error: error.message,
      userId
    });
    throw error;
  }
};
