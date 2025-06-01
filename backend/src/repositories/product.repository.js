import { BaseRepository } from './base.repository.js';
import { AccessControl } from '../utils/access-control.js';
import pool from '../config/database.js';

export class ProductRepository extends BaseRepository {
    constructor() {
        super('product');
        this.idField = 'id_product';
    }

    async create(data, userRole) {
        return super.create(data, userRole);
    }

    async update(id, data, userRole) {
        return super.update(id, data, this.idField, userRole);
    }

    async delete(id, userRole) {
        return super.delete(id, this.idField, userRole);
    }

    async findByCategory(categoryNumber) {
        const query = `
            SELECT p.*, c.category_name 
            FROM ${this.tableName} p
            JOIN category c ON p.category_number = c.category_number
            WHERE p.category_number = $1
        `;
        const { rows } = await pool.query(query, [categoryNumber]);
        return rows;
    }

    async findWithCategoryDetails() {
        const query = `
            SELECT p.*, c.category_name 
            FROM ${this.tableName} p
            JOIN category c ON p.category_number = c.category_number
        `;
        const { rows } = await pool.query(query);
        return rows;
    }
} 