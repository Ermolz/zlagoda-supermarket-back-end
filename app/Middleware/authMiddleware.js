import Session from '../Models/Session.js';
import Employee from '../Models/Employee.js';
import { Op } from 'sequelize';

export const requireAuth = async (req, res, next) => {
  try {
    const sessionId = req.cookies.sessionId;
    
    if (!sessionId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const session = await Session.findOne({
      where: {
        id: sessionId,
        expires_at: {
          [Op.gt]: new Date()
        }
      },
      include: [{
        model: Employee,
        attributes: ['id_employee', 'empl_surname', 'empl_name', 'empl_patronymic', 'empl_role', 'email']
      }]
    });

    if (!session) {
      return res.status(401).json({ message: 'Invalid or expired session' });
    }

    // Attach the employee to the request object
    req.employee = session.Employee;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.employee) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.employee.empl_role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
}; 