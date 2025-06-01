import bcrypt from 'bcrypt';
import { generateToken } from '../utils/generateToken.js';
import { EmployeeRepository } from '../repositories/employee.repository.js';

const employeeRepo = new EmployeeRepository();

export const register = async ({ email, password, fullName }) => {
  const existing = await employeeRepo.findUserByEmail(email);
  if (existing) {
    throw new Error('User already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await employeeRepo.create({
    email,
    password: hashedPassword,
    empl_name: fullName,
    // Add required fields
    id_employee: `E${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
    empl_surname: fullName.split(' ')[0],
    empl_role: 'cashier', // Default value
    salary: 8000, // Default value
    phone_number: '',
    city: '',
    street: '',
    zip_code: ''
  });

  const token = generateToken(user);
  return { token, user };
};

export const login = async ({ email, password }) => {
  const user = await employeeRepo.findUserByEmail(email);
  if (!user) throw new Error('User not found');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error('Invalid credentials');

  const token = generateToken({
    id_employee: user.id_employee,
    empl_role: user.empl_role,
    email: user.email
  });
  
  return { token, user };
};
