import { BaseRepository } from './base.repository.js';
import { AccessControl } from '../utils/access-control.js';
import pool from '../config/database.js';
import bcrypt from 'bcrypt';

export class EmployeeRepository extends BaseRepository {
    constructor() {
        super('employee');
        this.idField = 'id_employee';
    }

    async createWithAuth(data, userRole) {
        if (!AccessControl.can(userRole, 'create', this.tableName)) {
            throw new Error('Unauthorized');
        }

        // Validate required fields
        if (!data.id_employee || !data.empl_surname || !data.empl_name || !data.empl_role || 
            !data.salary || !data.phone_number || !data.city || !data.street || !data.zip_code ||
            !data.date_of_birth || !data.date_of_start || !data.email || !data.password) {
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

        // Validate phone number
        if (!/^\+380\d{9}$/.test(data.phone_number)) {
            throw new Error('Invalid phone number format');
        }

        // Validate email
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            throw new Error('Invalid email format');
        }

        // Validate password
        if (data.password.length < 8) {
            throw new Error('Password must be at least 8 characters long');
        }

        // Validate dates
        try {
            const birthDate = new Date(data.date_of_birth);
            const startDate = new Date(data.date_of_start);
            const now = new Date();

            if (isNaN(birthDate.getTime())) {
                throw new Error('Invalid birth date format');
            }

            if (isNaN(startDate.getTime())) {
                throw new Error('Invalid start date format');
            }

            if (birthDate > now) {
                throw new Error('Birth date cannot be in the future');
            }

            if (startDate > now) {
                throw new Error('Start date cannot be in the future');
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

        // Validate zip code
        if (data.zip_code.length > 9) {
            throw new Error('ZIP code is too long');
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Check if employee with this ID already exists
            const existingEmployee = await client.query(
                `SELECT id_employee FROM ${this.tableName} WHERE id_employee = $1`,
                [data.id_employee]
            );

            if (existingEmployee.rows.length > 0) {
                throw new Error('Employee with this ID already exists');
            }

            // Check if email is already in use
            const existingEmail = await client.query(
                `SELECT id_employee FROM employee_auth WHERE email = $1`,
                [data.email]
            );

            if (existingEmail.rows.length > 0) {
                throw new Error('Email is already in use');
            }

            // Create employee record
            const employeeData = { ...data };
            delete employeeData.email;
            delete employeeData.password;

            const fields = Object.keys(employeeData);
            const values = fields.map(field => employeeData[field]);
            const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');

            const employeeQuery = `
                INSERT INTO ${this.tableName} (${fields.join(', ')})
                VALUES (${placeholders})
                RETURNING *
            `;

            const employeeResult = await client.query(employeeQuery, values);

            // Hash password and create auth record
            const hashedPassword = await bcrypt.hash(data.password, 10);
            const authQuery = `
                INSERT INTO employee_auth (id_employee, email, password)
                VALUES ($1, $2, $3)
            `;

            await client.query(authQuery, [data.id_employee, data.email, hashedPassword]);

            await client.query('COMMIT');
            return this.formatRow(employeeResult.rows[0]);
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
        if (!AccessControl.can(userRole, 'update', this.tableName)) {
            throw new Error('Unauthorized');
        }

        // Validate ID format if provided
        if (data.id_employee && !/^E\d{3}$/.test(data.id_employee)) {
            throw new Error('Employee ID must be in format E followed by 3 digits');
        }

        // Validate role if provided
        if (data.empl_role && !['cashier', 'manager'].includes(data.empl_role)) {
            throw new Error('Invalid role');
        }

        // Validate phone number if provided
        if (data.phone_number && !/^\+380\d{9}$/.test(data.phone_number)) {
            throw new Error('Invalid phone number format');
        }

        // Validate email if provided
        if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            throw new Error('Invalid email format');
        }

        // Validate password if provided
        if (data.password && data.password.length < 8) {
            throw new Error('Password must be at least 8 characters long');
        }

        // Validate dates if provided
        if (data.date_of_birth || data.date_of_start) {
            try {
                const now = new Date();

                if (data.date_of_birth) {
                    const birthDate = new Date(data.date_of_birth);
                    if (isNaN(birthDate.getTime())) {
                        throw new Error('Invalid birth date format');
                    }
                    if (birthDate > now) {
                        throw new Error('Birth date cannot be in the future');
                    }
                    // Check age (minimum 18 years)
                    const age = Math.floor((now - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
                    if (age < 18) {
                        throw new Error('Employee must be at least 18 years old');
                    }
                }

                if (data.date_of_start) {
                    const startDate = new Date(data.date_of_start);
                    if (isNaN(startDate.getTime())) {
                        throw new Error('Invalid start date format');
                    }
                    if (startDate > now) {
                        throw new Error('Start date cannot be in the future');
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

        // Validate zip code if provided
        if (data.zip_code && data.zip_code.length > 9) {
            throw new Error('ZIP code is too long');
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Check if employee exists
            const existingEmployee = await client.query(
                `SELECT id_employee FROM ${this.tableName} WHERE id_employee = $1`,
                [id]
            );

            if (existingEmployee.rows.length === 0) {
                throw new Error('Employee not found');
            }

            // Check if email is already in use by another employee
            if (data.email) {
                const existingEmail = await client.query(
                    `SELECT id_employee FROM employee_auth WHERE email = $1 AND id_employee != $2`,
                    [data.email, id]
                );

                if (existingEmail.rows.length > 0) {
                    throw new Error('Email is already in use');
                }
            }

            // Update employee record
            const employeeData = { ...data };
            delete employeeData.email;
            delete employeeData.password;

            if (Object.keys(employeeData).length > 0) {
                const fields = Object.keys(employeeData);
                const values = fields.map(field => employeeData[field]);
                const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');

                const employeeQuery = `
                    UPDATE ${this.tableName}
                    SET ${setClause}
                    WHERE id_employee = $${fields.length + 1}
                    RETURNING *
                `;

                const employeeResult = await client.query(employeeQuery, [...values, id]);
                var result = employeeResult.rows[0];
            } else {
                const employeeResult = await client.query(
                    `SELECT * FROM ${this.tableName} WHERE id_employee = $1`,
                    [id]
                );
                var result = employeeResult.rows[0];
            }

            // Update auth record if email or password changed
            if (data.email || data.password) {
                const authFields = [];
                const authValues = [];

                if (data.email) {
                    authFields.push('email');
                    authValues.push(data.email);
                }

                if (data.password) {
                    authFields.push('password');
                    authValues.push(data.password);
                }

                if (authFields.length > 0) {
                    const setClause = authFields.map((field, i) => `${field} = $${i + 1}`).join(', ');
                    const authQuery = `
                        UPDATE employee_auth
                        SET ${setClause}
                        WHERE id_employee = $${authFields.length + 1}
                    `;

                    await client.query(authQuery, [...authValues, id]);
                }
            }

            await client.query('COMMIT');
            return this.formatRow(result);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async delete(id, userRole) {
        if (!AccessControl.can(userRole, 'delete', this.tableName)) {
            throw new Error('Unauthorized');
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Check if employee exists
            const existingEmployee = await client.query(
                `SELECT id_employee FROM ${this.tableName} WHERE id_employee = $1`,
                [id]
            );

            if (existingEmployee.rows.length === 0) {
                throw new Error('Employee not found');
            }

            // Check for associated checks
            const checkQuery = `
                SELECT COUNT(*) FROM checks
                WHERE id_employee = $1
            `;
            const { rows } = await client.query(checkQuery, [id]);
            if (parseInt(rows[0].count) > 0) {
                throw new Error('Cannot delete employee with associated checks');
            }

            // Delete auth record first (due to foreign key constraint)
            await client.query(
                `DELETE FROM employee_auth WHERE id_employee = $1`,
                [id]
            );

            // Delete employee record
            const result = await client.query(
                `DELETE FROM ${this.tableName} WHERE id_employee = $1 RETURNING *`,
                [id]
            );

            await client.query('COMMIT');
            return this.formatRow(result.rows[0]);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
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
