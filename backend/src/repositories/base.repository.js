import pool from '../config/database.js';
import { AccessControl } from '../utils/access-control.js';

export class BaseRepository {
    constructor(tableName) {
        this.tableName = tableName;
        this.idField = 'id';
    }

    validateData(data) {
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid data: must be an object');
        }

        // Check that all values are defined (null is allowed)
        for (const [key, value] of Object.entries(data)) {
            if (value === undefined) {
                throw new Error(`Invalid data: ${key} is undefined`);
            }
        }

        return true;
    }

    async findAll() {
        const query = `SELECT * FROM ${this.tableName}`;
        const { rows } = await pool.query(query);
        return rows;
    }

    async findById(id) {
        const query = `
            SELECT * FROM ${this.tableName}
            WHERE ${this.idField} = $1
        `;
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    }

    formatRows(rows) {
        if (!rows) return rows;
        if (Array.isArray(rows)) {
            return rows.map(row => this.formatRow(row));
        }
        return this.formatRow(rows);
    }

    formatRow(row) {
        if (!row) return row;
        const formatted = {};
        for (const [key, value] of Object.entries(row)) {
            // Convert snake_case to camelCase and preserve case for UPC
            const formattedKey = key === 'upc' ? 'UPC' : 
                               key === 'upc_prom' ? 'UPC_prom' : 
                               key;
            formatted[formattedKey] = value;
        }
        return formatted;
    }

    async create(data, userRole) {
        if (!AccessControl.can(userRole, 'create', this.tableName)) {
            throw new Error('Unauthorized');
        }

        const fields = Object.keys(data);
        const values = Object.values(data);
        const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

        const query = `
            INSERT INTO ${this.tableName} (${fields.join(', ')})
            VALUES (${placeholders})
            RETURNING *
        `;

        const { rows } = await pool.query(query, values);
        return rows[0];
    }

    async update(id, data, idField = this.idField, userRole) {
        if (!AccessControl.can(userRole, 'update', this.tableName)) {
            throw new Error('Unauthorized');
        }

        const fields = Object.keys(data);
        const values = Object.values(data);
        const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');

        const query = `
            UPDATE ${this.tableName}
            SET ${setClause}
            WHERE ${idField} = $${fields.length + 1}
            RETURNING *
        `;

        const { rows } = await pool.query(query, [...values, id]);
        return rows[0];
    }

    async delete(id, idField = this.idField, userRole) {
        if (!AccessControl.can(userRole, 'delete', this.tableName)) {
            throw new Error('Unauthorized');
        }

        const query = `
            DELETE FROM ${this.tableName}
            WHERE ${idField} = $1
            RETURNING *
        `;

        const { rows } = await pool.query(query, [id]);
        return rows[0];
    }
} 