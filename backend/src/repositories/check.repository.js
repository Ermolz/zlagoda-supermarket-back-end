import { BaseRepository } from './base.repository.js';
import { AccessControl } from '../utils/access-control.js';
import pool from '../config/database.js';

export class CheckRepository extends BaseRepository {
    constructor() {
        super('checks');
        this.idField = 'check_number';
    }

    async createWithSales(checkData, salesData, userRole) {
        if (!AccessControl.can(userRole, 'create', 'check')) {
            throw new Error('Unauthorized');
        }

        // Validate required fields
        if (!checkData.check_number || !checkData.id_employee || !checkData.print_date || 
            checkData.sum_total === undefined || checkData.vat === undefined) {
            throw new Error('Missing required check fields');
        }

        // Validate check number format
        if (!/^CHECK\d{3}$/.test(checkData.check_number)) {
            throw new Error('Check number must be in format CHECK followed by 3 digits');
        }

        // Validate employee ID format
        if (!/^E\d{3}$/.test(checkData.id_employee)) {
            throw new Error('Employee ID must be in format E followed by 3 digits');
        }

        // Validate print date
        try {
            const printDate = new Date(checkData.print_date);
            if (isNaN(printDate.getTime())) {
                throw new Error('Invalid print date format');
            }
        } catch (error) {
            throw new Error('Invalid print date format');
        }

        // Validate sum and VAT
        if (isNaN(checkData.sum_total) || checkData.sum_total < 0) {
            throw new Error('Sum total must be a non-negative number');
        }

        if (isNaN(checkData.vat) || checkData.vat < 0) {
            throw new Error('VAT must be a non-negative number');
        }

        // Validate sales data
        if (!Array.isArray(salesData) || salesData.length === 0) {
            throw new Error('Sales data must be a non-empty array');
        }

        for (const sale of salesData) {
            if (!sale.UPC || sale.product_number === undefined || sale.selling_price === undefined) {
                throw new Error('Missing required sale fields');
            }

            // Validate UPC format
            if (!/^\d{12}$/.test(sale.UPC)) {
                throw new Error('UPC must be 12 digits');
            }

            // Validate product number
            if (isNaN(sale.product_number) || sale.product_number <= 0) {
                throw new Error('Product number must be a positive number');
            }

            // Validate selling price
            if (isNaN(sale.selling_price) || sale.selling_price < 0) {
                throw new Error('Selling price must be a non-negative number');
            }
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Validate stock availability
            for (const sale of salesData) {
                const stockQuery = `
                    SELECT product_number
                    FROM store_in_product
                    WHERE UPC = $1
                    FOR UPDATE
                `;
                const { rows } = await client.query(stockQuery, [sale.UPC]);
                
                if (rows.length === 0) {
                    throw new Error(`Product with UPC ${sale.UPC} not found`);
                }
                
                if (rows[0].product_number < sale.product_number) {
                    throw new Error(`Not enough quantity for product with UPC ${sale.UPC}`);
                }
            }

            // Create check
            const checkQuery = `
                INSERT INTO ${this.tableName} (check_number, id_employee, card_number, print_date, sum_total, vat)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *
            `;
            const checkResult = await client.query(checkQuery, [
                checkData.check_number,
                checkData.id_employee,
                checkData.card_number || null,
                checkData.print_date,
                checkData.sum_total,
                checkData.vat
            ]);

            // Create sales
            for (const sale of salesData) {
                // Create sale
                const saleQuery = `
                    INSERT INTO sale (UPC, check_number, product_number, selling_price)
                    VALUES ($1, $2, $3, $4)
                `;
                await client.query(saleQuery, [
                    sale.UPC,
                    checkData.check_number,
                    sale.product_number,
                    sale.selling_price
                ]);

                // Update stock
                const updateStockQuery = `
                    UPDATE store_in_product
                    SET product_number = product_number - $1
                    WHERE UPC = $2
                `;
                await client.query(updateStockQuery, [sale.product_number, sale.UPC]);
            }

            await client.query('COMMIT');
            return checkResult.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async create(data, userRole) {
        return super.create(data, userRole, [AccessControl.ROLES.CASHIER]);
    }

    async update(id, data, userRole) {
        return super.update(id, data, this.idField, userRole);
    }

    async delete(id, userRole) {
        return super.delete(id, this.idField, userRole);
    }

    async findByEmployee(employeeId) {
        const query = `
            SELECT c.*, e.empl_surname, e.empl_name,
                   cc.cust_surname, cc.cust_name
            FROM ${this.tableName} c
            JOIN employee e ON c.id_employee = e.id_employee
            LEFT JOIN customer_card cc ON c.card_number = cc.card_number
            WHERE c.id_employee = $1
        `;
        const { rows } = await pool.query(query, [employeeId]);
        return rows;
    }

    async findByDateRange(startDate, endDate) {
        const query = `
            SELECT c.*, e.empl_surname, e.empl_name,
                   cc.cust_surname, cc.cust_name
            FROM ${this.tableName} c
            JOIN employee e ON c.id_employee = e.id_employee
            LEFT JOIN customer_card cc ON c.card_number = cc.card_number
            WHERE c.print_date BETWEEN $1 AND $2
        `;
        const { rows } = await pool.query(query, [startDate, endDate]);
        return rows;
    }

    async findByEmployeeAndDateRange(employeeId, startDate, endDate) {
        const query = `
            SELECT c.*, e.empl_surname, e.empl_name,
                   cc.cust_surname, cc.cust_name
            FROM ${this.tableName} c
            JOIN employee e ON c.id_employee = e.id_employee
            LEFT JOIN customer_card cc ON c.card_number = cc.card_number
            WHERE c.id_employee = $1 AND c.print_date BETWEEN $2 AND $3
        `;
        const { rows } = await pool.query(query, [employeeId, startDate, endDate]);
        return rows;
    }

    async findWithDetails(checkNumber) {
        const query = `
            SELECT c.*, e.empl_surname, e.empl_name,
                   cc.cust_surname, cc.cust_name,
                   s.UPC, s.product_number, s.selling_price,
                   p.product_name, p.characteristics
            FROM ${this.tableName} c
            JOIN employee e ON c.id_employee = e.id_employee
            LEFT JOIN customer_card cc ON c.card_number = cc.card_number
            JOIN sale s ON c.check_number = s.check_number
            JOIN store_in_product sp ON s.UPC = sp.UPC
            JOIN product p ON sp.id_product = p.id_product
            WHERE c.check_number = $1
        `;
        const { rows } = await pool.query(query, [checkNumber]);
        return rows;
    }
} 