import { BaseRepository } from './base.repository.js';
import { AccessControl } from '../utils/access-control.js';
import pool from '../config/database.js';

export class CategoryRepository extends BaseRepository {
    constructor() {
        super('category');
        this.idField = 'category_number';
    }

    async getNextCategoryNumber() {
        const query = `
            SELECT COALESCE(MAX(category_number), 0) + 1 as next_number
            FROM ${this.tableName}
        `;
        const { rows } = await pool.query(query);
        return rows[0].next_number;
    }

    async create(data, userRole) {
        if (!AccessControl.can(userRole, 'create', 'category')) {
            throw new Error('Unauthorized');
        }

        // Валидация данных
        if (!data.category_name || typeof data.category_name !== 'string') {
            throw new Error('Category name is required and must be a string');
        }

        if (data.category_name.length > 50) {
            throw new Error('Category name must not exceed 50 characters');
        }

        // Получаем следующий номер категории
        const categoryNumber = await this.getNextCategoryNumber();

        const query = `
            INSERT INTO ${this.tableName} (category_number, category_name)
            VALUES ($1, $2)
            RETURNING *
        `;

        const { rows } = await pool.query(query, [categoryNumber, data.category_name]);
        return rows[0];
    }

    async update(id, data, userRole) {
        if (!AccessControl.can(userRole, 'update', 'category')) {
            throw new Error('Unauthorized');
        }

        // Валидация данных
        if (data.category_name) {
            if (typeof data.category_name !== 'string') {
                throw new Error('Category name must be a string');
            }
            if (data.category_name.length > 50) {
                throw new Error('Category name must not exceed 50 characters');
            }
        }

        return super.update(id, data, this.idField, userRole);
    }

    async delete(id, userRole) {
        if (!AccessControl.can(userRole, 'delete', 'category')) {
            throw new Error('Unauthorized');
        }
        return super.delete(id, this.idField, userRole);
    }

    async findById(id) {
        return super.findById(id, this.idField);
    }

    async findAll() {
        const query = `
            SELECT *
            FROM ${this.tableName}
            ORDER BY category_name ASC
        `;
        const { rows } = await pool.query(query);
        return rows;
    }

    async findByName(name) {
        const query = `
            SELECT *
            FROM ${this.tableName}
            WHERE category_name ILIKE $1
        `;
        const { rows } = await pool.query(query, [`%${name}%`]);
        return rows;
    }
} 