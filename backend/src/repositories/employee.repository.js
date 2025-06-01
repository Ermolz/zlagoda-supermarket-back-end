import { BaseRepository } from './base.repository.js';
import { AccessControl } from '../utils/access-control.js';
import pool from '../config/database.js';

export class EmployeeRepository extends BaseRepository {
    constructor() {
        super('employee');
        this.idField = 'id_employee';
    }

    async createWithAuth(data, userRole) {
        if (!AccessControl.can(userRole, 'create', 'employee')) {
            throw new Error('Unauthorized');
        }

        // Validate required fields
        if (!data.id_employee || !data.empl_surname || !data.empl_name || !data.empl_role ||
            !data.salary || !data.date_of_birth || !data.date_of_start || !data.phone_number ||
            !data.city || !data.street || !data.zip_code) {
            throw new Error('Missing required fields');
        }

        // Validate ID format
        if (!/^E\d{3}$/.test(data.id_employee)) {
            throw new Error('Employee ID must be in format E followed by 3 digits');
        }

        // Validate role
        if (!['cashier', 'manager'].includes(data.empl_role)) {
            throw new Error('Invalid role');
        }

        // Validate phone number format
        if (!/^\+380\d{9}$/.test(data.phone_number)) {
            throw new Error('Invalid phone number format');
        }

        // Validate dates
        try {
            const birthDate = new Date(data.date_of_birth);
            const startDate = new Date(data.date_of_start);
            const now = new Date();

            if (isNaN(birthDate.getTime()) || isNaN(startDate.getTime())) {
                throw new Error('Invalid date format');
            }

            if (birthDate > now || startDate > now) {
                throw new Error('Dates cannot be in the future');
            }

            // Check age (minimum 18 years)
            const age = Math.floor((now - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
            if (age < 18) {
                throw new Error('Employee must be at least 18 years old');
            }
        } catch (error) {
            throw new Error('Invalid date format');
        }

        // Validate salary
        if (isNaN(data.salary) || data.salary <= 0) {
            throw new Error('Salary must be a positive number');
        }

        // Validate string lengths
        if (data.empl_surname.length > 50) {
            throw new Error('Employee surname is too long');
        }

        if (data.empl_name.length > 50) {
            throw new Error('Employee name is too long');
        }

        if (data.empl_patronymic && data.empl_patronymic.length > 50) {
            throw new Error('Employee patronymic is too long');
        }

        if (data.city.length > 50) {
            throw new Error('City name is too long');
        }

        if (data.street.length > 50) {
            throw new Error('Street name is too long');
        }

        if (data.zip_code.length > 9) {
            throw new Error('ZIP code is too long');
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Create employee
            const employeeQuery = `
                INSERT INTO ${this.tableName} (
                    id_employee, empl_surname, empl_name, empl_patronymic,
                    empl_role, salary, date_of_birth, date_of_start,
                    phone_number, city, street, zip_code
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                RETURNING *
            `;
            const employeeResult = await client.query(employeeQuery, [
                data.id_employee, data.empl_surname, data.empl_name,
                data.empl_patronymic, data.empl_role, data.salary,
                data.date_of_birth, data.date_of_start,
                data.phone_number, data.city, data.street,
                data.zip_code
            ]);

            // Create authentication record
            const authQuery = `
                INSERT INTO employee_auth (id_employee, email, password)
                VALUES ($1, $2, $3)
                RETURNING *
            `;
            const authValues = [data.id_employee, data.email, data.password];
            await client.query(authQuery, authValues);

            await client.query('COMMIT');
            return employeeResult.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async create(data, userRole) {
        return this.createWithAuth(data, userRole);
    }

    async update(id, data, userRole) {
        if (!AccessControl.can(userRole, 'update', 'employee')) {
            throw new Error('Unauthorized');
        }

        // Validate role if provided
        if (data.empl_role && !['cashier', 'manager'].includes(data.empl_role)) {
            throw new Error('Invalid role');
        }

        // Validate phone number if provided
        if (data.phone_number && !/^\+380\d{9}$/.test(data.phone_number)) {
            throw new Error('Invalid phone number format');
        }

        // Validate dates if provided
        if (data.date_of_birth || data.date_of_start) {
            try {
                const birthDate = data.date_of_birth ? new Date(data.date_of_birth) : null;
                const startDate = data.date_of_start ? new Date(data.date_of_start) : null;
                const now = new Date();

                if (birthDate && isNaN(birthDate.getTime())) {
                    throw new Error('Invalid birth date format');
                }

                if (startDate && isNaN(startDate.getTime())) {
                    throw new Error('Invalid start date format');
                }

                if (birthDate && birthDate > now) {
                    throw new Error('Birth date cannot be in the future');
                }

                if (startDate && startDate > now) {
                    throw new Error('Start date cannot be in the future');
                }

                if (birthDate) {
                    // Check age (minimum 18 years)
                    const age = Math.floor((now - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
                    if (age < 18) {
                        throw new Error('Employee must be at least 18 years old');
                    }
                }
            } catch (error) {
                throw new Error('Invalid date format');
            }
        }

        // Validate salary if provided
        if (data.salary !== undefined && (isNaN(data.salary) || data.salary <= 0)) {
            throw new Error('Salary must be a positive number');
        }

        // Validate string lengths
        if (data.empl_surname && data.empl_surname.length > 50) {
            throw new Error('Employee surname is too long');
        }

        if (data.empl_name && data.empl_name.length > 50) {
            throw new Error('Employee name is too long');
        }

        if (data.empl_patronymic && data.empl_patronymic.length > 50) {
            throw new Error('Employee patronymic is too long');
        }

        if (data.city && data.city.length > 50) {
            throw new Error('City name is too long');
        }

        if (data.street && data.street.length > 50) {
            throw new Error('Street name is too long');
        }

        if (data.zip_code && data.zip_code.length > 9) {
            throw new Error('ZIP code is too long');
        }

        return super.update(id, data, this.idField, userRole);
    }

    async delete(id, userRole) {
        if (!AccessControl.can(userRole, 'delete', 'employee')) {
            throw new Error('Unauthorized');
        }
        return super.delete(id, this.idField, userRole);
    }

    async findByRole(role) {
        const query = `
            SELECT * FROM ${this.tableName}
            WHERE empl_role = $1
        `;
        const { rows } = await pool.query(query, [role]);
        return rows;
    }

    async findById(id) {
        return super.findById(id, this.idField);
    }

    async findUserByEmail(email) {
        const query = `
            SELECT e.*, ea.email, ea.password 
            FROM ${this.tableName} e
            JOIN employee_auth ea ON e.id_employee = ea.id_employee
            WHERE ea.email = $1
        `;
        const { rows } = await pool.query(query, [email]);
        return rows[0];
    }

    async createAuth(data) {
        const query = `
            INSERT INTO employee_auth (id_employee, email, password)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        const { rows } = await pool.query(query, [data.id_employee, data.email, data.password]);
        return rows[0];
    }

    async updateAuth(id, data) {
        const query = `
            UPDATE employee_auth
            SET ${Object.keys(data).map((key, i) => `${key} = $${i + 2}`).join(', ')}
            WHERE id_employee = $1
            RETURNING *
        `;
        const { rows } = await pool.query(query, [id, ...Object.values(data)]);
        return rows[0];
    }

    async deleteAuth(id) {
        const query = `
            DELETE FROM employee_auth
            WHERE id_employee = $1
        `;
        await pool.query(query, [id]);
    }
}
