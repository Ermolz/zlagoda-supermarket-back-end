import priceService from './price.service.js';
import { StoreProductRepository } from '../repositories/store-product.repository.js';
import pool from '../config/database.js';

class StoreProductService {
    constructor() {
        this.storeProductRepo = new StoreProductRepository();
    }

    async recalculatePriceForNewBatch(productId, newBatchPrice, newBatchQuantity) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Get current product details
            const query = `
                SELECT sp.*, p.product_name
                FROM store_in_product sp
                JOIN product p ON sp.id_product = p.id_product
                WHERE sp.id_product = $1
            `;
            const { rows } = await client.query(query, [productId]);
            if (rows.length === 0) {
                throw new Error('Product not found');
            }

            const currentProduct = rows[0];
            const oldPrice = currentProduct.selling_price;

            // Update price for all products of this type
            const updateQuery = `
                UPDATE store_in_product
                SET selling_price = $1,
                    product_number = product_number + $2
                WHERE id_product = $3
                RETURNING *
            `;
            await client.query(updateQuery, [newBatchPrice, newBatchQuantity, productId]);

            // Record price change in price history
            const historyQuery = `
                INSERT INTO price_history (
                    id_product,
                    old_price,
                    new_price,
                    change_date,
                    batch_quantity
                )
                VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4)
            `;
            await client.query(historyQuery, [
                productId,
                oldPrice,
                newBatchPrice,
                newBatchQuantity
            ]);

            await client.query('COMMIT');
            return { success: true, message: 'Price updated and batch added successfully' };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async setPromotionalPrice(productId) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Get current product
            const query = `
                SELECT *
                FROM store_in_product
                WHERE id_product = $1 AND promotional_product = false
            `;
            const { rows } = await client.query(query, [productId]);
            if (rows.length === 0) {
                throw new Error('Regular product not found');
            }

            const regularProduct = rows[0];
            const promotionalPrice = priceService.calculatePromotionalPrice(regularProduct.selling_price);

            // Generate promotional UPC (add 'P' prefix to regular UPC)
            const promotionalUPC = 'P' + regularProduct.UPC.slice(1);

            // Check if promotional version already exists
            const existingPromoQuery = `
                SELECT * FROM store_in_product
                WHERE UPC = $1 OR UPC_prom = $1
            `;
            const existingPromo = await client.query(existingPromoQuery, [promotionalUPC]);
            
            if (existingPromo.rows.length > 0) {
                // Update existing promotional product
                const updateQuery = `
                    UPDATE store_in_product
                    SET selling_price = $1,
                        product_number = $2,
                        promotional_product = true
                    WHERE UPC = $3
                    RETURNING *
                `;
                await client.query(updateQuery, [
                    promotionalPrice,
                    regularProduct.product_number,
                    promotionalUPC
                ]);
            } else {
                // Create new promotional product
                const insertQuery = `
                    INSERT INTO store_in_product (
                        UPC,
                        UPC_prom,
                        id_product,
                        selling_price,
                        product_number,
                        promotional_product
                    )
                    VALUES ($1, $2, $3, $4, $5, true)
                    RETURNING *
                `;
                await client.query(insertQuery, [
                    promotionalUPC,
                    regularProduct.UPC,
                    productId,
                    promotionalPrice,
                    regularProduct.product_number
                ]);
            }

            await client.query('COMMIT');
            return { success: true, message: 'Promotional price set successfully' };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async getSortedProducts(sortBy = 'name', isPromotional = false) {
        let query = `
            SELECT sp.*, p.product_name, p.producer, p.characteristics,
                   c.category_name
            FROM store_in_product sp
            JOIN product p ON sp.id_product = p.id_product
            JOIN category c ON p.category_number = c.category_number
            WHERE sp.promotional_product = $1
        `;

        // Add sorting
        switch (sortBy.toLowerCase()) {
            case 'name':
                query += ' ORDER BY p.product_name';
                break;
            case 'quantity':
                query += ' ORDER BY sp.product_number';
                break;
            case 'price':
                query += ' ORDER BY sp.selling_price';
                break;
            default:
                query += ' ORDER BY p.product_name';
        }

        const { rows } = await pool.query(query, [isPromotional]);
        return rows;
    }

    async addNewBatch(productId, quantity, price) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Add batch record
            const batchQuery = `
                INSERT INTO product_batch (
                    id_product,
                    quantity,
                    arrival_date,
                    price
                )
                VALUES ($1, $2, CURRENT_TIMESTAMP, $3)
                RETURNING *
            `;
            const batchResult = await client.query(batchQuery, [productId, quantity, price]);

            // Update product price and quantity
            await this.recalculatePriceForNewBatch(productId, price, quantity);

            await client.query('COMMIT');
            return batchResult.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async getProductStatistics() {
        const client = await pool.connect();
        try {
            // Most sold products (last 30 days)
            const mostSoldQuery = `
                SELECT p.product_name, sp.id_product,
                       SUM(s.product_number) as total_sold,
                       sp.product_number as current_stock
                FROM sale s
                JOIN store_in_product sp ON s.UPC = sp.UPC
                JOIN product p ON sp.id_product = p.id_product
                JOIN checks c ON s.check_number = c.check_number
                WHERE c.print_date >= CURRENT_DATE - INTERVAL '30 days'
                GROUP BY p.product_name, sp.id_product, sp.product_number
                ORDER BY total_sold DESC
                LIMIT 10
            `;
            const mostSold = await client.query(mostSoldQuery);

            // Products running low on stock (less than 10 units)
            const lowStockQuery = `
                SELECT p.product_name, sp.product_number,
                       sp.selling_price
                FROM store_in_product sp
                JOIN product p ON sp.id_product = p.id_product
                WHERE sp.product_number < 10
                ORDER BY sp.product_number
            `;
            const lowStock = await client.query(lowStockQuery);

            // Recent price changes (last 7 days)
            const priceChangesQuery = `
                SELECT p.product_name, ph.old_price,
                       ph.new_price, ph.change_date,
                       ph.batch_quantity
                FROM price_history ph
                JOIN product p ON ph.id_product = p.id_product
                WHERE ph.change_date >= CURRENT_DATE - INTERVAL '7 days'
                ORDER BY ph.change_date DESC
            `;
            const priceChanges = await client.query(priceChangesQuery);

            return {
                mostSoldProducts: mostSold.rows,
                lowStockProducts: lowStock.rows,
                recentPriceChanges: priceChanges.rows
            };
        } finally {
            client.release();
        }
    }

    async getProductDetailsByUPC(upc) {
        const product = await this.storeProductRepo.findByUPCWithDetails(upc);
        if (!product) {
            throw new Error('Product not found');
        }
        return {
            UPC: product.UPC,
            price: product.selling_price,
            quantity: product.quantity,
            name: product.name,
            characteristics: product.characteristics
        };
    }
}

export default new StoreProductService(); 