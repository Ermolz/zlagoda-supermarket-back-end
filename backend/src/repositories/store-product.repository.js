import { BaseRepository } from './base.repository.js';
import { AccessControl } from '../utils/access-control.js';
import pool from '../config/database.js';

export class StoreProductRepository extends BaseRepository {
    constructor() {
        super('store_in_product');
        this.idField = 'UPC';
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