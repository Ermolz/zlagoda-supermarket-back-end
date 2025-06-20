import { BaseRepository } from './base.repository.js';
import pool from '../config/database.js';
import { logger } from '../utils/logger.js';

export class StatisticsRepository extends BaseRepository {
    constructor() {
        super('check');
    }

    // ======================   Ermol   ======================
    
    async getCustomerPurchasesByCity(cityName) {
        const query = `
            SELECT 
                cc.card_number,
                cc.cust_surname || ' ' || cc.cust_name AS full_name,
                SUM(s.product_number) AS total_items_bought
            FROM 
                customer_card cc
            JOIN 
                checks ch ON cc.card_number = ch.card_number
            JOIN 
                sale s ON ch.check_number = s.check_number
            WHERE 
                cc.city = $1
            GROUP BY 
                cc.card_number, full_name
        `;
        
        const { rows } = await pool.query(query, [cityName]);
        return rows;
    }

    async getCashiersWithoutAuth() {
        const query = `
            SELECT 
                e.id_employee,
                e.empl_surname || ' ' || e.empl_name || COALESCE(' ' || e.empl_patronymic, '') AS full_name,
                e.city,
                e.salary,
                COUNT(DISTINCT ch.check_number) AS total_checks,
                COALESCE(SUM(ch.sum_total), 0) AS total_sales,
                STRING_AGG(DISTINCT c.category_name, ', ') AS sold_categories
            FROM 
                employee e
            LEFT JOIN employee_auth ea ON e.id_employee = ea.id_employee
            LEFT JOIN checks ch ON e.id_employee = ch.id_employee
            LEFT JOIN sale s ON ch.check_number = s.check_number
            LEFT JOIN store_in_product sip ON s.upc = sip.upc
            LEFT JOIN product p ON sip.id_product = p.id_product
            LEFT JOIN category c ON p.category_number = c.category_number
            WHERE 
                e.empl_role = 'cashier'
                AND ea.id_employee IS NULL
                AND NOT EXISTS (
                    SELECT 1
                    FROM checks ch_sub
                    JOIN customer_card cc ON ch_sub.card_number = cc.card_number
                    WHERE 
                        ch_sub.id_employee = e.id_employee
                        AND cc.percent > 10
                )
            GROUP BY 
                e.id_employee, full_name, e.city, e.salary
            ORDER BY 
                total_sales DESC
        `;
        
        const { rows } = await pool.query(query);
        return rows;
    }

    // ======================   Zahorui   ======================
    async getCategorySalesByEmployeeAndDate(employeeId, startDate, endDate) {
        const query = `
            SELECT 
                c.category_name AS "Назва категорії",
                COUNT(s.product_number) AS "Кількість проданих товарів",
                SUM(s.selling_price * s.product_number) AS "Загальна сума продажів",
                AVG(s.selling_price) AS "Середня ціна товару"
            FROM sale s
            INNER JOIN store_in_product sip ON s.UPC = sip.UPC
            INNER JOIN product p ON sip.id_product = p.id_product
            INNER JOIN category c ON p.category_number = c.category_number
            INNER JOIN checks ch ON s.check_number = ch.check_number
            INNER JOIN employee e ON ch.id_employee = e.id_employee
            WHERE e.id_employee = $1
              AND ch.print_date >= $2
              AND ch.print_date <= $3
            GROUP BY c.category_number, c.category_name
            HAVING SUM(s.selling_price * s.product_number) > 0
            ORDER BY SUM(s.selling_price * s.product_number) DESC
        `;

        const { rows } = await pool.query(query, [employeeId, startDate, endDate]);
        return rows;
    }

    async getCustomersOnlyBeverages() {
        const query = `
            SELECT DISTINCT 
                cc.card_number AS "Номер картки",
                cc.cust_surname AS "Прізвище",
                cc.cust_name AS "Ім'я",
                cc.cust_patronymic AS "По батькові",
                cc.phone_number AS "Телефон"
            FROM customer_card cc
            WHERE NOT EXISTS (
                SELECT 1
                FROM checks ch
                INNER JOIN sale s ON ch.check_number = s.check_number
                INNER JOIN store_in_product sip ON s.UPC = sip.UPC
                INNER JOIN product p ON sip.id_product = p.id_product
                INNER JOIN category c ON p.category_number = c.category_number
                WHERE ch.card_number = cc.card_number
                    AND NOT EXISTS (
                        SELECT 1
                        FROM category c2
                        WHERE c2.category_name = 'Напої'
                            AND c.category_number = c2.category_number
                    )
            )
            ORDER BY cc.cust_surname, cc.cust_name
        `;

        const { rows } = await pool.query(query);
        return rows;
    }

    // ======================   Kostenko   ======================
    
    async getCustomerStatsByCity(cityName) {
        const query = `
            SELECT 
                cc.card_number,
                cc.cust_surname || ' ' || cc.cust_name AS full_name,
                cc.city,
                COUNT(DISTINCT ch.check_number) AS total_checks,
                SUM(ch.sum_total) AS total_amount,
                STRING_AGG(DISTINCT c.category_name, ', ') AS categories_bought
            FROM 
                customer_card cc
            JOIN checks ch ON cc.card_number = ch.card_number
            JOIN sale s ON ch.check_number = s.check_number
            JOIN store_in_product sip ON s.upc = sip.upc
            JOIN product p ON sip.id_product = p.id_product
            JOIN category c ON p.category_number = c.category_number
            WHERE 
                cc.city = $1
            GROUP BY 
                cc.card_number, full_name, cc.city
        `;
        
        const { rows } = await pool.query(query, [cityName]);
        return rows;
    }

    async getCustomersWithoutManagerAndDairy() {
        const query = `
            SELECT 
                cc.card_number,
                cc.cust_surname || ' ' || cc.cust_name || COALESCE(' ' || cc.cust_patronymic, '') AS full_name,
                cc.city,
                COUNT(DISTINCT ch.check_number) AS total_checks
            FROM 
                customer_card cc
            LEFT JOIN checks ch ON cc.card_number = ch.card_number
            WHERE 
                NOT EXISTS (
                    SELECT 1
                    FROM checks ch2
                    JOIN employee e ON ch2.id_employee = e.id_employee
                    WHERE 
                        ch2.card_number = cc.card_number
                        AND e.empl_role = 'manager'
                )
                AND NOT EXISTS (
                    SELECT 1
                    FROM checks ch3
                    JOIN sale s ON ch3.check_number = s.check_number
                    JOIN store_in_product sip ON s.upc = sip.upc
                    JOIN product p ON sip.id_product = p.id_product
                    WHERE 
                        ch3.card_number = cc.card_number
                        AND p.producer = 'Молочна ферма'
                )
            GROUP BY 
                cc.card_number, full_name, cc.city
        `;
        
        const { rows } = await pool.query(query);
        return rows;
    }

    async getTotalSalesByCashierAndPeriod(employeeId, startDate, endDate) {
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
        return rows[0]; // Return 1 result for specific cashier
    }

    async getTotalSalesAllCashiersByPeriod(startDate, endDate) {
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

    async getTotalProductQuantityByPeriod(productId, startDate, endDate) {
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
        return rows[0]; // Return 1 result for specific product
    }
} 