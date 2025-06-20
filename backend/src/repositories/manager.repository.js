import { BaseRepository } from './base.repository.js';
import pool from '../config/database.js';

export class ManagerRepository extends BaseRepository {
    constructor() {
        super('employee');
    }

    // ... existing code ...

    async getSalesByCashierAndPeriod(employeeId, startDate, endDate) {
        const query = `
            SELECT 
                e.id_employee,
                e.empl_surname || ' ' || e.empl_name || COALESCE(' ' || e.empl_patronymic, '') AS cashier_name,
                SUM(s.selling_price * s.product_number) AS total_sales_amount,
                COUNT(DISTINCT ch.check_number) AS total_checks
            FROM 
                employee e
            JOIN checks ch ON e.id_employee = ch.id_employee
            JOIN sale s ON ch.check_number = s.check_number
            WHERE 
                e.id_employee = $1
                AND ch.print_date >= $2
                AND ch.print_date <= $3
            GROUP BY 
                e.id_employee, cashier_name
        `;
        
        const { rows } = await pool.query(query, [employeeId, startDate, endDate]);
        return rows[0];
    }

    async getAllCashiersSalesByPeriod(startDate, endDate) {
        const query = `
            SELECT 
                e.id_employee,
                e.empl_surname || ' ' || e.empl_name || COALESCE(' ' || e.empl_patronymic, '') AS cashier_name,
                SUM(s.selling_price * s.product_number) AS total_sales_amount,
                COUNT(DISTINCT ch.check_number) AS total_checks
            FROM 
                employee e
            JOIN checks ch ON e.id_employee = ch.id_employee
            JOIN sale s ON ch.check_number = s.check_number
            WHERE 
                e.empl_role = 'cashier'
                AND ch.print_date >= $1
                AND ch.print_date <= $2
            GROUP BY 
                e.id_employee, cashier_name
            ORDER BY 
                total_sales_amount DESC
        `;
        
        const { rows } = await pool.query(query, [startDate, endDate]);
        return rows;
    }

    async getProductSalesByPeriod(productId, startDate, endDate) {
        const query = `
            SELECT 
                p.id_product,
                p.product_name,
                p.characteristics,
                SUM(s.product_number) AS total_quantity,
                COUNT(DISTINCT ch.check_number) AS total_checks,
                SUM(s.selling_price * s.product_number) AS total_amount
            FROM 
                product p
            JOIN store_in_product sip ON p.id_product = sip.id_product
            JOIN sale s ON sip.UPC = s.UPC
            JOIN checks ch ON s.check_number = ch.check_number
            WHERE 
                p.id_product = $1
                AND ch.print_date >= $2
                AND ch.print_date <= $3
            GROUP BY 
                p.id_product, p.product_name, p.characteristics
        `;
        
        const { rows } = await pool.query(query, [productId, startDate, endDate]);
        return rows[0];
    }
} 