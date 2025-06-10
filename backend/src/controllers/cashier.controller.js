import { CashierService } from '../services/cashier.service.js';

import priceService from '../services/price.service.js';
import checkService from '../services/check.service.js';
import storeProductService from '../services/store-product.service.js';

export class CashierController {
    constructor() {
        this.cashierService = new CashierService();
    }

    // 1. Get information about all products, sorted by name
    async getAllProducts(req, res) {
        try {
            const products = await this.cashierService.getAllProductsSortedByName();
            res.json(products);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    // 2. Get information about all products in the store, sorted by name
    async getAllStoreProducts(req, res) {
        try {
            const products = await this.cashierService.getAllStoreProductsSortedByName();
            res.json(products);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    // 3. Get information about all regular customers, sorted by surname
    async getAllCustomers(req, res) {
        try {
            const customers = await this.cashierService.getAllCustomersSortedBySurname();
            res.json(customers);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    // 4. Search for products by name
    async searchProducts(req, res) {
        try {
            const { name } = req.query;
            const products = await this.cashierService.searchProductsByName(name);
            res.json(products);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    // 5. Search for products that belong to a specific category
    async getProductsByCategory(req, res) {
        try {
            const products = await this.cashierService.getProductsByCategory(req.params.categoryId);
            res.json(products);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    // 6. Search for regular customers by surname
    async searchCustomers(req, res) {
        try {
            const { surname } = req.query;
            const customers = await this.cashierService.searchCustomersBySurname(surname);
            res.json(customers);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    // 7. Sell products (create checks)
    async createCheck(req, res) {
        try {
            const { check, sales } = req.body;
            
            // Check required data
            if (!check || !sales || !Array.isArray(sales)) {
                return res.status(400).json({ error: 'Invalid request format. Expected { check: {...}, sales: [...] }' });
            }

            // Add cashier ID from token
            const checkData = {
                ...check,
                id_employee: req.user.id_employee,
                print_date: check.print_date || new Date().toISOString()
            };

            const result = await this.cashierService.createCheck(checkData, sales);
            res.status(201).json(result);
        } catch (error) {
            if (error.message.includes('not found')) {
                res.status(404).json({ error: error.message });
            } else if (error.message.includes('Not enough quantity')) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(400).json({ error: error.message });
            }
        }
    }

    // 8. Add/edit information about regular customers
    async addCustomerCard(req, res) {
        try {
            // Check card number format
            if (!/^\d{12}$/.test(req.body.card_number)) {
                return res.status(400).json({ error: 'Card number must be 12 digits' });
            }

            const customer = await this.cashierService.addCustomerCard(req.body);
            res.status(201).json(customer);
        } catch (error) {
            console.error('Error adding customer card:', error);
            if (error.message.includes('already exists')) {
                res.status(409).json({ error: error.message });
            } else if (error.message.includes('validation')) {
                res.status(400).json({ error: error.message });
            } else if (error.message.includes('Unauthorized')) {
                res.status(403).json({ error: error.message });
            } else {
                res.status(500).json({ error: error.message });
            }
        }
    }

    async updateCustomerCard(req, res) {
        try {
            const customer = await this.cashierService.updateCustomerCard(req.params.card_number, req.body);
            if (!customer) {
                return res.status(404).json({ error: 'Customer card not found' });
            }
            res.json(customer);
        } catch (error) {
            console.error('Error updating customer card:', error);
            if (error.message.includes('not found')) {
                res.status(404).json({ error: error.message });
            } else if (error.message.includes('validation')) {
                res.status(400).json({ error: error.message });
            } else if (error.message.includes('Unauthorized')) {
                res.status(403).json({ error: error.message });
            } else {
                res.status(500).json({ error: error.message });
            }
        }
    }

    // 9. View list of all checks created by the cashier for this day
    async getTodayChecks(req, res) {
        try {
            const checks = await this.cashierService.getTodayChecks(req.user.id);
            res.json(checks);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    // 10. View list of all checks created by the cashier for a certain period of time
    async getChecksByDateRange(req, res) {
        try {
            const { startDate, endDate } = req.query;
            const checks = await this.cashierService.getChecksByDateRange(
                req.user.id,
                new Date(startDate),
                new Date(endDate)
            );
            res.json(checks);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    // 11. View full information about a check by check number
    async getCheckDetails(req, res) {
        try {
            const { checkNumber } = req.params;
            
            // Check format of check number
            if (!/^CHECK\d{3}$/.test(checkNumber)) {
                return res.status(400).json({ error: 'Check number must be in format CHECK followed by 3 digits' });
            }

            const check = await this.cashierService.getCheckDetails(checkNumber);
            if (!check) {
                return res.status(404).json({ error: 'Check not found' });
            }
            res.json(check);
        } catch (error) {
            console.error('Error getting check details:', error);
            if (error.message.includes('not found')) {
                res.status(404).json({ error: error.message });
            } else if (error.message.includes('Unauthorized')) {
                res.status(403).json({ error: error.message });
            } else {
                res.status(500).json({ error: error.message });
            }
        }
    }

    // 12. Get information about all promotional products
    async getPromotionalProducts(req, res) {
        try {
            const { sortBy } = req.query;
            const products = await this.cashierService.getPromotionalProducts(sortBy);
            res.json(products);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    // 13. Get information about all non-promotional products
    async getNonPromotionalProducts(req, res) {
        try {
            const { sortBy } = req.query;
            const products = await this.cashierService.getNonPromotionalProducts(sortBy);
            res.json(products);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    // 14. Find the price of a product sold by UPC, quantity of available units of the product
    async getProductDetailsByUPC(req, res) {
        try {
            // Check UPC format
            if (!/^\d{12}$/.test(req.params.upc)) {
                return res.status(400).json({ error: 'UPC must be 12 digits' });
            }

            const product = await this.cashierService.getProductDetailsByUPC(req.params.upc);
            if (!product) {
                return res.status(404).json({ error: 'Product not found' });
            }
            res.json(product);
        } catch (error) {
            if (error.message.includes('not found')) {
                res.status(404).json({ error: error.message });
            } else {
                res.status(400).json({ error: error.message });
            }
        }
    }

    // 15. Ability to get full information about yourself
    async getCashierInfo(req, res) {
        try {
            const cashier = await this.cashierService.getCashierInfo(req.user.id_employee);
            res.json(cashier);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
} 