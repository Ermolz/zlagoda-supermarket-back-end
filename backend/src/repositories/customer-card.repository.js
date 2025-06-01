import { BaseRepository } from './base.repository.js';
import { AccessControl } from '../utils/access-control.js';
import pool from '../config/database.js';

export class CustomerCardRepository extends BaseRepository {
    constructor() {
        super('customer_card');
        this.idField = 'card_number';
    }

    async create(data, userRole) {
        if (!AccessControl.can(userRole, 'create', 'customer_card')) {
            throw new Error('Unauthorized');
        }

        // Validate required fields
        if (!data.card_number || !data.cust_surname || !data.cust_name || !data.phone_number || data.percent === undefined) {
            throw new Error('Missing required fields');
        }

        // Validate card number format
        if (!/^\d{12}$/.test(data.card_number)) {
            throw new Error('Card number must be 12 digits');
        }

        // Validate phone number format
        if (!/^\+380\d{9}$/.test(data.phone_number)) {
            throw new Error('Invalid phone number format');
        }

        // Validate percent
        if (isNaN(data.percent) || data.percent < 0 || data.percent > 100) {
            throw new Error('Percent must be between 0 and 100');
        }

        // Validate string lengths
        if (data.cust_surname.length > 50) {
            throw new Error('Customer surname is too long');
        }

        if (data.cust_name.length > 50) {
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

        return super.create(data, userRole);
    }

    async update(id, data, userRole) {
        if (!AccessControl.can(userRole, 'update', 'customer_card')) {
            throw new Error('Unauthorized');
        }

        // Validate required fields for update
        if (!data.cust_surname || !data.cust_name || !data.phone_number || data.percent === undefined) {
            throw new Error('Missing required fields');
        }

        // Validate phone number format
        if (!/^\+380\d{9}$/.test(data.phone_number)) {
            throw new Error('Invalid phone number format');
        }

        // Validate percent
        if (isNaN(data.percent) || data.percent < 0 || data.percent > 100) {
            throw new Error('Percent must be between 0 and 100');
        }

        // Validate string lengths
        if (data.cust_surname.length > 50) {
            throw new Error('Customer surname is too long');
        }

        if (data.cust_name.length > 50) {
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

        return super.update(id, data, this.idField, userRole);
    }

    async delete(id, userRole) {
        if (!AccessControl.can(userRole, 'delete', 'customer_card')) {
            throw new Error('Unauthorized');
        }
        return super.delete(id, this.idField, userRole);
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