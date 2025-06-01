import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';
import Employee from './Employee.js';

class EmployeeAuth extends Model {}

EmployeeAuth.init({
  id_employee: {
    type: DataTypes.STRING(10),
    primaryKey: true,
    references: {
      model: 'employee',
      key: 'id_employee'
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'EmployeeAuth',
  tableName: 'employee_auth',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Зв'язок з таблицею employee
EmployeeAuth.belongsTo(Employee, { 
  foreignKey: 'id_employee',
  targetKey: 'id_employee'
});
Employee.hasOne(EmployeeAuth, { 
  foreignKey: 'id_employee',
  sourceKey: 'id_employee'
});

export default EmployeeAuth; 