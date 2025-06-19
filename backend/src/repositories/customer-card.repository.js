import { BaseRepository } from './base.repository.js';
import { AccessControl } from '../utils/access-control.js';
import pool from '../config/database.js';

export class CustomerCardRepository extends BaseRepository {
    constructor() {
        super('customer_card');
        this.idField = 'card_number';
    }

    validateCustomerData(data, isUpdate = false) {
        // Validate required fields only for create operation
        if (!isUpdate && (!data.card_number || !data.cust_surname || !data.cust_name || !data.phone_number || data.percent === undefined)) {
            throw new Error('Missing required fields');
        }

        // Validate card number format only for create operation
        if (!isUpdate && data.card_number && !/^\d{13,}$/.test(data.card_number)) {
            throw new Error('Card number must be at least 13 digits');
        }

        // Validate phone number format if provided
        if (data.phone_number && !/^\+380\d{9}$/.test(data.phone_number)) {
            throw new Error('Invalid phone number format');
        }

        // Validate percent if provided
        if (data.percent !== undefined) {
            if (isNaN(data.percent) || data.percent < 0 || data.percent > 100) {
                throw new Error('Percent must be between 0 and 100');
            }
        }

        // Validate string lengths if provided
        if (data.cust_surname && data.cust_surname.length > 50) {
            throw new Error('Customer surname is too long');
        }

        if (data.cust_name && data.cust_name.length > 50) {
            throw new Error('Customer name is too long');
        }

        if (data.cust_patronymic && data.cust_patronymic.length > 50) {
            throw new Error('Customer patronymic is too long');
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
    }

    async create(data, userRole) {
        if (!AccessControl.can(userRole, 'create', 'customer_card')) {
            throw new Error('Unauthorized');
        }

        this.validateCustomerData(data);
        return super.create(data, userRole);
    }

    async update(id, data, userRole) {
        if (!AccessControl.can(userRole, 'update', 'customer_card')) {
            throw new Error('Unauthorized');
        }

        this.validateCustomerData(data, true);
        return super.update(id, data, this.idField, userRole);
    }

    async delete(id, userRole) {
        if (!AccessControl.can(userRole, 'delete', 'customer_card')) {
            throw new Error('Unauthorized');
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Check for associated checks
            const checkQuery = `
                SELECT COUNT(*) FROM checks
                WHERE card_number = $1
            `;
            const { rows } = await client.query(checkQuery, [id]);
            if (parseInt(rows[0].count) > 0) {
                throw new Error('Cannot delete customer card with associated checks');
            }

            const result = await super.delete(id, this.idField, userRole);
            await client.query('COMMIT');
            return result;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async findByPercent(percent) {
        const query = `
            SELECT *
            FROM ${this.tableName}
            WHERE percent = $1
        `;
        const { rows } = await pool.query(query, [percent]);
        return rows;
    }

    async searchByName(searchTerm) {
        const query = `
            SELECT *
            FROM ${this.tableName}
            WHERE cust_surname ILIKE $1
            OR cust_name ILIKE $1
            OR cust_patronymic ILIKE $1
        `;
        const { rows } = await pool.query(query, [`%${searchTerm}%`]);
        return rows;
    }
} 