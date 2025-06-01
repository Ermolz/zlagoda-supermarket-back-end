import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

class Employee extends Model {}

Employee.init({
  id_employee: {
    type: DataTypes.STRING(10),
    primaryKey: true
  },
  empl_surname: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  empl_name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  empl_patronymic: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  empl_role: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      isIn: [['manager', 'cashier']]
    }
  },
  salary: {
    type: DataTypes.DECIMAL(13, 4),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  date_of_birth: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  date_of_start: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  phone_number: {
    type: DataTypes.STRING(13),
    allowNull: false
  },
  city: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  street: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  zip_code: {
    type: DataTypes.STRING(9),
    allowNull: false
  },
  // Додаткові поля для автентифікації
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Employee',
  tableName: 'employee',
  timestamps: false
});

export default Employee; 