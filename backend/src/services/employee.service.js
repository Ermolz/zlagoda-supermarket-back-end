import { EmployeeRepository } from '../repositories/employee.repository.js';
import bcrypt from 'bcrypt';
import { logger } from '../utils/logger.js';

export class EmployeeService {
    constructor() {
        this.employeeRepo = new EmployeeRepository();
    }

    async create(data) {
        logger.info('Creating new employee', {
            email: data.email,
            role: data.empl_role,
            name: `${data.empl_surname} ${data.empl_name}`
        });

        try {
            // Hash password
            const hashedPassword = await bcrypt.hash(data.password, 10);
            logger.debug('Password hashed successfully');

            // Create employee data
            const employeeData = {
                empl_surname: data.empl_surname,
                empl_name: data.empl_name,
                empl_patronymic: data.empl_patronymic,
                empl_role: data.empl_role,
                salary: data.salary,
                date_of_birth: data.date_of_birth,
                date_of_start: data.date_of_start,
                phone_number: data.phone_number,
                city: data.city,
                street: data.street,
                zip_code: data.zip_code
            };

            // Create employee (ID will be generated in repository)
            const employee = await this.employeeRepo.create(employeeData, 'manager');
            logger.info('Employee record created', { id: employee.id_employee });

            // Create auth data
            await this.employeeRepo.createAuth({
                id_employee: employee.id_employee,
                email: data.email,
                password: hashedPassword
            });
            logger.info('Employee auth record created', { id: employee.id_employee });

            return employee;
        } catch (error) {
            logger.error('Failed to create employee', {
                error: error.message,
                stack: error.stack,
                employeeData: {
                    ...data,
                    password: '[REDACTED]'
                }
            });
            throw error;
        }
    }

    async update(id, data) {
        logger.info('Updating employee', { id, updatedFields: Object.keys(data) });

        try {
            if (data.password) {
                data.password = await bcrypt.hash(data.password, 10);
                logger.debug('Password hashed for update', { id });
            }

            const employee = await this.employeeRepo.update(id, data, 'manager');
            logger.info('Employee updated successfully', { id });
            return employee;
        } catch (error) {
            logger.error('Failed to update employee', {
                error: error.message,
                id,
                updatedFields: Object.keys(data)
            });
            throw error;
        }
    }

    async delete(id) {
        logger.info('Deleting employee', { id });

        try {
            const result = await this.employeeRepo.delete(id, 'manager');
            logger.info('Employee deleted successfully', { id });
            return result;
        } catch (error) {
            logger.error('Failed to delete employee', {
                error: error.message,
                id
            });
            throw error;
        }
    }

    async findAll() {
        return this.employeeRepo.findAll();
    }

    async findByRole(role) {
        logger.debug('Finding employees by role', { role });

        try {
            const employees = await this.employeeRepo.findByRole(role);
            logger.info('Found employees by role', { 
                role, 
                count: employees.length 
            });
            return employees;
        } catch (error) {
            logger.error('Failed to find employees by role', {
                error: error.message,
                role
            });
            throw error;
        }
    }

    async findById(id) {
        logger.debug('Finding employee by ID', { id });

        try {
            const employee = await this.employeeRepo.findById(id);
            if (employee) {
                logger.info('Found employee by ID', { id });
            } else {
                logger.warn('Employee not found', { id });
            }
            return employee;
        } catch (error) {
            logger.error('Failed to find employee by ID', {
                error: error.message,
                id
            });
            throw error;
        }
    }
}
