import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';
import Employee from './Employee.js';

class Session extends Model {}

Session.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  employee_id: {
    type: DataTypes.STRING(10),
    allowNull: false,
    references: {
      model: 'employee',
      key: 'id_employee'
    }
  },
  expires_at: {
    type: DataTypes.DATE,
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
  modelName: 'Session',
  tableName: 'sessions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

Session.belongsTo(Employee, { 
  foreignKey: 'employee_id',
  targetKey: 'id_employee'
});
Employee.hasMany(Session, { 
  foreignKey: 'employee_id',
  sourceKey: 'id_employee'
});

export default Session; 