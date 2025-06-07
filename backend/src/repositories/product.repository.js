import { BaseRepository } from './base.repository.js';
import { AccessControl } from '../utils/access-control.js';
import pool from '../config/database.js';

export class ProductRepository extends BaseRepository {
    constructor() {
        super('product');
        this.idField = 'id_product';
    }

    validateProductData(data, isUpdate = false) {
        // Validate required fields for create
        if (!isUpdate && (!data.id_product || !data.category_number || !data.product_name)) {
            throw new Error('Missing required fields');
        }

        // Validate string lengths if provided
        if (data.product_name && data.product_name.length > 50) {
            throw new Error('Product name is too long');
        }

        if (data.characteristics && data.characteristics.length > 100) {
            throw new Error('Characteristics is too long');
        }

        if (data.producer && data.producer.length > 50) {
            throw new Error('Producer name is too long');
        }

        // Validate category number if provided
        if (data.category_number !== undefined) {
            if (isNaN(data.category_number) || data.category_number < 0) {
                throw new Error('Invalid category number');
            }
        }
    }

    async create(data, userRole) {
        if (!AccessControl.can(userRole, 'create', 'product')) {
            throw new Error('Unauthorized');
        }

        this.validateProductData(data);
        return super.create(data, userRole);
    }

    async update(id, data, userRole) {
        if (!AccessControl.can(userRole, 'update', 'product')) {
            throw new Error('Unauthorized');
        }

        // Get existing product to verify it exists
        const existing = await this.findById(id);
        if (!existing) {
            throw new Error('Product not found');
        }

        this.validateProductData(data, true);
        return super.update(id, data, this.idField, userRole);
    }

    async delete(id, userRole) {
        if (!AccessControl.can(userRole, 'delete', 'product')) {
            throw new Error('Unauthorized');
        }

        // Check for associated store products
        const query = `
            SELECT COUNT(*) FROM store_in_product
            WHERE id_product = $1
        `;
        const { rows } = await pool.query(query, [id]);
        if (parseInt(rows[0].count) > 0) {
            throw new Error('Cannot delete product with associated store products');
        }

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