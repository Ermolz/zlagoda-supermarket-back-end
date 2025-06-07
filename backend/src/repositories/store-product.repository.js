import { BaseRepository } from './base.repository.js';
import { AccessControl } from '../utils/access-control.js';
import pool from '../config/database.js';

export class StoreProductRepository extends BaseRepository {
    constructor() {
        super('store_in_product');
        this.idField = 'UPC';
    }

    formatRow(row) {
        if (!row) return row;
        const formatted = {};
        for (const [key, value] of Object.entries(row)) {
            // Convert snake_case to camelCase and preserve case for UPC
            const formattedKey = key.toLowerCase() === 'upc' ? 'UPC' : 
                               key.toLowerCase() === 'upc_prom' ? 'UPC_prom' : 
                               key;
            formatted[formattedKey] = value;
        }
        return formatted;
    }

    async create(data, userRole) {
        if (!AccessControl.can(userRole, 'create', 'store_in_product')) {
            throw new Error('Unauthorized');
        }

        // Validate UPC format
        if (!data.UPC || !/^\d{12}$/.test(data.UPC)) {
            throw new Error('UPC must be 12 digits');
        }

        // Validate UPC_prom format if provided
        if (data.UPC_prom && !/^\d{12}$/.test(data.UPC_prom)) {
            throw new Error('UPC_prom must be 12 digits');
        }

        // Validate numeric fields
        if (isNaN(data.selling_price) || data.selling_price < 0) {
            throw new Error('Selling price must be a non-negative number');
        }

        if (isNaN(data.product_number) || data.product_number < 0) {
            throw new Error('Product number must be a non-negative number');
        }

        return super.create(data, userRole);
    }

    async update(id, data, userRole) {
        if (!AccessControl.can(userRole, 'update', 'store_in_product')) {
            throw new Error('Unauthorized');
        }

        // Validate UPC_prom format if provided
        if (data.UPC_prom && !/^\d{12}$/.test(data.UPC_prom)) {
            throw new Error('UPC_prom must be 12 digits');
        }

        // Validate numeric fields if provided
        if (data.selling_price !== undefined && (isNaN(data.selling_price) || data.selling_price < 0)) {
            throw new Error('Selling price must be a non-negative number');
        }

        if (data.product_number !== undefined && (isNaN(data.product_number) || data.product_number < 0)) {
            throw new Error('Product number must be a non-negative number');
        }

        // Get existing record to preserve UPC case
        const existing = await this.findById(id);
        if (!existing) {
            throw new Error('Store product not found');
        }

        return super.update(id, data, this.idField, userRole);
    }

    async delete(id, userRole) {
        if (!AccessControl.can(userRole, 'delete', 'store_in_product')) {
            throw new Error('Unauthorized');
        }
        return super.delete(id, this.idField, userRole);
    }

    async findWithProductDetails() {
        const query = `
            SELECT sp.upc as "UPC", sp.upc_prom as "UPC_prom", 
                   sp.id_product, sp.selling_price, sp.product_number,
                   sp.promotional_product,
                   p.product_name, p.producer, p.characteristics,
                   c.category_name, c.category_number
            FROM ${this.tableName} sp
            JOIN product p ON sp.id_product = p.id_product
            JOIN category c ON p.category_number = c.category_number
        `;
        const { rows } = await pool.query(query);
        return rows;
    }

    async findPromotionalProducts() {
        const query = `
            SELECT sp.upc as "UPC", sp.upc_prom as "UPC_prom",
                   sp.id_product, sp.selling_price, sp.product_number,
                   sp.promotional_product,
                   p.product_name, p.producer
            FROM ${this.tableName} sp
            JOIN product p ON sp.id_product = p.id_product
            WHERE sp.promotional_product = true
        `;
        const { rows } = await pool.query(query);
        return rows;
    }

    async updateStock(upc, quantity, userRole) {
        AccessControl.checkAccess(userRole, [AccessControl.ROLES.MANAGER]);
        
        const query = `
            UPDATE ${this.tableName}
            SET product_number = product_number + $2
            WHERE UPC = $1
            RETURNING *
        `;
        const { rows } = await pool.query(query, [upc, quantity]);
        return rows[0];
    }
} 