import priceService from './price.service.js';
import pool from '../config/database.js';

class CheckService {
    calculateCheckTotal(items) {
        if (!Array.isArray(items)) {
            throw new Error('Items must be an array');
        }

        // Calculate total sum
        const totalSum = items.reduce((sum, item) => {
            if (!item.selling_price || !item.product_number) {
                throw new Error('Each item must have selling_price and product_number');
            }
            return sum + (item.selling_price * item.product_number);
        }, 0);

        // Calculate VAT
        const vat = priceService.calculateVAT(totalSum);

        return {
            totalSum,
            vat,
            totalWithVAT: totalSum + vat
        };
    }

    calculateCheckTotalWithDiscount(items, customerCard) {
        if (!customerCard || typeof customerCard.percent !== 'number') {
            throw new Error('Valid customer card with discount percentage is required');
        }

        // First calculate regular total with VAT
        const { totalWithVAT } = this.calculateCheckTotal(items);

        // Apply customer discount
        const finalTotal = priceService.calculateCustomerDiscount(totalWithVAT, customerCard.percent);

        return {
            originalTotal: totalWithVAT,
            discount: customerCard.percent,
            finalTotal
        };
    }

    validateCheckStorageDuration(checkDate) {
        const date = new Date(checkDate);
        if (isNaN(date.getTime())) {
            throw new Error('Invalid date');
        }

        const threeYearsAgo = new Date();
        threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

        return date >= threeYearsAgo;
    }

    async archiveOldChecks() {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Find checks older than 3 years
            const threeYearsAgo = new Date();
            threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

            // Get old checks with their sales
            const oldChecksQuery = `
                SELECT c.*, s.UPC, s.product_number, s.selling_price,
                       e.empl_surname, e.empl_name,
                       cc.card_number, cc.cust_surname, cc.cust_name
                FROM checks c
                LEFT JOIN sale s ON c.check_number = s.check_number
                LEFT JOIN employee e ON c.id_employee = e.id_employee
                LEFT JOIN customer_card cc ON c.card_number = cc.card_number
                WHERE c.print_date < $1
            `;
            const { rows: oldChecks } = await client.query(oldChecksQuery, [threeYearsAgo]);

            // Group checks by check_number for better organization
            const archivedChecks = oldChecks.reduce((acc, row) => {
                if (!acc[row.check_number]) {
                    acc[row.check_number] = {
                        check_number: row.check_number,
                        print_date: row.print_date,
                        sum_total: row.sum_total,
                        vat: row.vat,
                        cashier: {
                            id: row.id_employee,
                            name: row.empl_name,
                            surname: row.empl_surname
                        },
                        customer: row.card_number ? {
                            card_number: row.card_number,
                            name: row.cust_name,
                            surname: row.cust_surname
                        } : null,
                        sales: []
                    };
                }
                if (row.UPC) {
                    acc[row.check_number].sales.push({
                        UPC: row.UPC,
                        product_number: row.product_number,
                        selling_price: row.selling_price
                    });
                }
                return acc;
            }, {});

            // Delete old checks and their sales
            const deleteOldSalesQuery = `
                DELETE FROM sale
                WHERE check_number IN (
                    SELECT check_number
                    FROM checks
                    WHERE print_date < $1
                )
            `;
            await client.query(deleteOldSalesQuery, [threeYearsAgo]);

            const deleteOldChecksQuery = `
                DELETE FROM checks
                WHERE print_date < $1
            `;
            await client.query(deleteOldChecksQuery, [threeYearsAgo]);

            await client.query('COMMIT');

            // Return archived data for potential external storage
            return Object.values(archivedChecks);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }


    async getCheckStatistics(startDate, endDate) {
        const client = await pool.connect();
        try {
            // Convert dates to proper format
            const start = startDate ? new Date(startDate) : new Date(0);
            const end = endDate ? new Date(endDate) : new Date();

            // Total sum for each cashier in date range
            const cashierStatsQuery = `
                SELECT 
                    e.id_employee,
                    e.empl_surname,
                    e.empl_name,
                    COUNT(DISTINCT c.check_number) as total_checks,
                    SUM(c.sum_total) as total_sum,
                    SUM(c.vat) as total_vat
                FROM checks c
                JOIN employee e ON c.id_employee = e.id_employee
                WHERE c.print_date BETWEEN $1 AND $2
                GROUP BY e.id_employee, e.empl_surname, e.empl_name
                ORDER BY total_sum DESC
            `;
            const { rows: cashierStats } = await client.query(cashierStatsQuery, [start, end]);

            // Total sum for all cashiers
            const totalStatsQuery = `
                SELECT 
                    COUNT(DISTINCT check_number) as total_checks,
                    SUM(sum_total) as total_sum,
                    SUM(vat) as total_vat
                FROM checks
                WHERE print_date BETWEEN $1 AND $2
            `;
            const { rows: [totalStats] } = await client.query(totalStatsQuery, [start, end]);

            // Product sales statistics
            const productStatsQuery = `
                SELECT 
                    p.product_name,
                    p.producer,
                    SUM(s.product_number) as total_quantity,
                    SUM(s.product_number * s.selling_price) as total_revenue
                FROM sale s
                JOIN store_in_product sp ON s.UPC = sp.UPC
                JOIN product p ON sp.id_product = p.id_product
                JOIN checks c ON s.check_number = c.check_number
                WHERE c.print_date BETWEEN $1 AND $2
                GROUP BY p.product_name, p.producer
                ORDER BY total_revenue DESC
            `;
            const { rows: productStats } = await client.query(productStatsQuery, [start, end]);

            return {
                period: {
                    start: start.toISOString(),
                    end: end.toISOString()
                },
                totalStats,
                cashierStats,
                productStats
            };
        } finally {
            client.release();
        }
    }
}

export default new CheckService(); 