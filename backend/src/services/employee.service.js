import { EmployeeRepository } from '../repositories/employee.repository.js';
import bcrypt from 'bcrypt';

export class EmployeeService {
    constructor() {
        this.employeeRepo = new EmployeeRepository();
    }

    async create(data) {
        // Hash password
        const hashedPassword = await bcrypt.hash(data.password, 10);

        // Create employee data
        const employeeData = {
            id_employee: data.id_employee,
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

        // Create employee
        const employee = await this.employeeRepo.create(employeeData, 'manager');

        // Create auth data
        await this.employeeRepo.createAuth({
            id_employee: data.id_employee,
            email: data.email,
            password: hashedPassword
        });

        return employee;
    }

    async update(id, data) {
        // If password is provided, hash it
        let authData = null;
        if (data.password) {
            const hashedPassword = await bcrypt.hash(data.password, 10);
            authData = {
                email: data.email,
                password: hashedPassword
            };
        } else if (data.email) {
            authData = {
                email: data.email
            };
        }

        // Update employee data
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

        // Remove undefined fields
        Object.keys(employeeData).forEach(key => {
            if (employeeData[key] === undefined) {
                delete employeeData[key];
            }
        });

        // Update employee
        const employee = await this.employeeRepo.update(id, employeeData, 'manager');

        // Update auth data if provided
        if (authData) {
            await this.employeeRepo.updateAuth(id, authData);
        }

        return employee;
    }

    async delete(id) {
        return this.employeeRepo.delete(id, 'manager');
    }

    async findAll() {
        return this.employeeRepo.findAll();
    }

    async findByRole(role) {
        return this.employeeRepo.findByRole(role);
    }

    async findById(id) {
        return this.employeeRepo.findById(id);
    }
}
