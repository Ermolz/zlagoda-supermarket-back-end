import bcrypt from 'bcrypt';
import { generateToken } from '../utils/generateToken.js';

import { findUserByEmail, createUser } from '../repositories/employee.repository.js';

export const register = async ({ email, password, fullName }) => {
  const existing = await findUserByEmail(email);
  if (existing) {
    throw new Error('User already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await createUser({ email, password: hashedPassword, fullName });

  const token = generateToken(user);
  return { token, user };
};

export const login = async ({ email, password }) => {
  const user = await findUserByEmail(email);
  if (!user) throw new Error('User not found');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error('Invalid credentials');

  const token = generateToken(user);
  return { token, user };
};
