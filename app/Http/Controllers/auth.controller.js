import bcrypt from 'bcrypt';
import Employee from '../../Models/Employee.js';
import EmployeeAuth from '../../Models/EmployeeAuth.js';
import Session from '../../Models/Session.js';
import { Op } from 'sequelize';

export const register = async (req, res) => {
  try {
    const {
      email,
      password,
      empl_surname,
      empl_name,
      empl_patronymic,
      empl_role,
      salary,
      date_of_birth,
      date_of_start,
      phone_number,
      city,
      street,
      zip_code
    } = req.body;

    // Перевіряємо чи існує користувач з таким email
    const existingAuth = await EmployeeAuth.findOne({ where: { email } });
    if (existingAuth) {
      return res.status(400).json({ message: 'Employee with this email already exists' });
    }

    // Генеруємо ID працівника
    const lastEmployee = await Employee.findOne({
      order: [['id_employee', 'DESC']]
    });
    const lastId = lastEmployee ? parseInt(lastEmployee.id_employee.substring(1)) : 0;
    const newId = `E${String(lastId + 1).padStart(3, '0')}`;

    // Хешуємо пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Створюємо нового працівника
    const employee = await Employee.create({
      id_employee: newId,
      empl_surname,
      empl_name,
      empl_patronymic,
      empl_role,
      salary,
      date_of_birth,
      date_of_start,
      phone_number,
      city,
      street,
      zip_code
    });

    // Створюємо запис автентифікації
    await EmployeeAuth.create({
      id_employee: newId,
      email,
      password: hashedPassword
    });

    // Створюємо сесію
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1);

    const session = await Session.create({
      employee_id: employee.id_employee,
      expires_at: expiresAt
    });

    // Встановлюємо кукі
    res.cookie('sessionId', session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: expiresAt,
      path: '/'
    });

    // Повертаємо дані без паролю
    const { password: _, ...employeeData } = employee.toJSON();
    res.status(201).json({
      message: 'Registration successful',
      employee: employeeData
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Шукаємо дані автентифікації
    const auth = await EmployeeAuth.findOne({ 
      where: { email },
      include: [{
        model: Employee,
        attributes: ['id_employee', 'empl_surname', 'empl_name', 'empl_patronymic', 'empl_role']
      }]
    });

    if (!auth) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, auth.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Видаляємо старі сесії
    await Session.destroy({
      where: {
        employee_id: auth.Employee.id_employee,
        expires_at: {
          [Op.gt]: new Date()
        }
      }
    });

    // Створюємо нову сесію
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1);

    const session = await Session.create({
      employee_id: auth.Employee.id_employee,
      expires_at: expiresAt
    });

    // Встановлюємо кукі
    res.cookie('sessionId', session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: expiresAt,
      path: '/'
    });

    // Повертаємо дані без паролю
    const { password: _, ...employeeData } = auth.Employee.toJSON();
    res.json({
      message: 'Login successful',
      employee: employeeData
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const logout = async (req, res) => {
  try {
    const sessionId = req.cookies.sessionId;
    
    if (sessionId) {
      await Session.destroy({
        where: { id: sessionId }
      });
    }

    res.clearCookie('sessionId');
    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    if (!req.employee) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const employeeData = req.employee.toJSON();
    res.json({ employee: employeeData });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 