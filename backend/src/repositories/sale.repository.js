import { BaseRepository } from './base.repository.js';
import pool from '../config/database.js';

export class SaleRepository extends BaseRepository {
    constructor() {
        super('sale');
    }

    async findByCheckNumber(checkNumber) {
        const query = `
            SELECT s.*, p.product_name, p.producer
            FROM ${this.tableName} s
            JOIN store_in_product sp ON s.UPC = sp.UPC
            JOIN product p ON sp.id_product = p.id_product
            WHERE s.check_number = $1
        `;
        const { rows } = await pool.query(query, [checkNumber]);
        return rows;
    }

    async createSale(saleData) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const insertQuery = `
                INSERT INTO ${this.tableName} (UPC, check_number, product_number, selling_price)
                VALUES ($1, $2, $3, $4)
                RETURNING *
            `;

            const updateStockQuery = `
                UPDATE store_in_product
                SET product_number = product_number - $2
                WHERE UPC = $1 AND product_number >= $2
                RETURNING *
            `;

            const { UPC, check_number, product_number, selling_price } = saleData;

            const updatedStock = await client.query(updateStockQuery, [UPC, product_number]);
            if (updatedStock.rows.length === 0) {
                throw new Error('Insufficient stock');
            }

            const result = await client.query(insertQuery, [UPC, check_number, product_number, selling_price]);
            await client.query('COMMIT');
            return result.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async findSalesByDateRange(startDate, endDate) {
        const query = `
            SELECT s.*, p.product_name, c.print_date,
                   e.empl_surname, e.empl_name
            FROM ${this.tableName} s
            JOIN checks c ON s.check_number = c.check_number
            JOIN employee e ON c.id_employee = e.id_employee
            JOIN store_in_product sp ON s.UPC = sp.UPC
            JOIN product p ON sp.id_product = p.id_product
            WHERE c.print_date BETWEEN $1 AND $2
        `;
        const { rows } = await pool.query(query, [startDate, endDate]);
        return rows;
    }
} 