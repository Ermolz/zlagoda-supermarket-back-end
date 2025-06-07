import { ManagerService } from '../services/manager.service.js';

export class ManagerController {
    constructor() {
        this.managerService = new ManagerService();
    }

    // CRUD operations for employees
    async addEmployee(req, res) {
        try {
            console.log('Creating employee with data:', req.body);
            const employee = await this.managerService.addEmployee(req.body);
            res.status(201).json(employee);
        } catch (error) {
            console.error('Error adding employee:', error);
            console.error('Error stack:', error.stack);
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

    async updateEmployee(req, res) {
        try {
            const employee = await this.managerService.updateEmployee(req.params.id_employee, req.body);
            if (!employee) {
                return res.status(404).json({ error: 'Employee not found' });
            }
            res.json(employee);
        } catch (error) {
            console.error('Error updating employee:', error);
            if (error.message.includes('not found')) {
                res.status(404).json({ error: error.message });
            } else if (error.message.includes('validation')) {
                res.status(400).json({ error: error.message });
            } else if (error.message.includes('Unauthorized')) {
                res.status(403).json({ error: error.message });
            } else if (error.message.includes('already in use')) {
                res.status(409).json({ error: error.message });
            } else {
                res.status(500).json({ error: error.message });
            }
        }
    }

    async deleteEmployee(req, res) {
        try {
            const result = await this.managerService.deleteEmployee(req.params.id_employee);
            if (!result) {
                return res.status(404).json({ error: 'Employee not found' });
            }
            res.status(204).send();
        } catch (error) {
            console.error('Error deleting employee:', error);
            if (error.message.includes('not found')) {
                res.status(404).json({ error: error.message });
            } else if (error.message.includes('Unauthorized')) {
                res.status(403).json({ error: error.message });
            } else if (error.message.includes('foreign key')) {
                res.status(409).json({ error: 'Cannot delete employee with associated records' });
            } else {
                res.status(500).json({ error: error.message });
            }
        }
    }

    // Reports and employee search
    async getEmployeesSortedBySurname(req, res) {
        try {
            const employees = await this.managerService.getAllEmployeesSortedBySurname();
            res.json(employees);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getCashiers(req, res) {
        try {
            const cashiers = await this.managerService.getCashiers();
            res.json(cashiers);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getEmployeeContacts(req, res) {
        try {
            const contacts = await this.managerService.getEmployeeContactsByName(req.params.surname);
            if (!contacts) {
                return res.status(404).json({ error: 'Employee not found' });
            }
            res.json(contacts);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Categories
    async getAllCategoriesSortedByName(req, res) {
        try {
            const categories = await this.managerService.getAllCategoriesSortedByName();
            res.json(categories);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async addCategory(req, res) {
        try {
            const category = await this.managerService.addCategory(req.body);
            res.status(201).json(category);
        } catch (error) {
            if (error.message.includes('already exists')) {
                res.status(409).json({ error: error.message });
            } else {
                res.status(400).json({ error: error.message });
            }
        }
    }

    async updateCategory(req, res) {
        try {
            const category = await this.managerService.updateCategory(req.params.category_number, req.body);
            if (!category) {
                return res.status(404).json({ error: 'Category not found' });
            }
            res.json(category);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async deleteCategory(req, res) {
        try {
            const result = await this.managerService.deleteCategory(req.params.category_number);
            if (!result) {
                return res.status(404).json({ error: 'Category not found' });
            }
            res.status(204).send();
        } catch (error) {
            if (error.message.includes('foreign key')) {
                res.status(409).json({ error: 'Cannot delete category with associated products' });
            } else {
                res.status(400).json({ error: error.message });
            }
        }
    }

    // Products
    async getAllProductsSortedByName(req, res) {
        try {
            const products = await this.managerService.getAllProductsSortedByName();
            res.json(products);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getProductsByCategory(req, res) {
        try {
            const products = await this.managerService.getProductsByCategory(req.params.category_number);
            res.json(products);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async addProduct(req, res) {
        try {
            const product = await this.managerService.addProduct(req.body);
            res.status(201).json(product);
        } catch (error) {
            if (error.message.includes('foreign key')) {
                res.status(409).json({ error: 'Invalid category number' });
            } else {
                res.status(400).json({ error: error.message });
            }
        }
    }

    async updateProduct(req, res) {
        try {
            const product = await this.managerService.updateProduct(req.params.id_product, req.body);
            if (!product) {
                return res.status(404).json({ error: 'Product not found' });
            }
            res.json(product);
        } catch (error) {
            console.error('Error updating product:', error);
            if (error.message.includes('not found')) {
                res.status(404).json({ error: error.message });
            } else if (error.message.includes('validation')) {
                res.status(400).json({ error: error.message });
            } else if (error.message.includes('Unauthorized')) {
                res.status(403).json({ error: error.message });
            } else if (error.message.includes('foreign key')) {
                res.status(409).json({ error: 'Invalid category number' });
            } else {
                res.status(500).json({ error: error.message });
            }
        }
    }

    async deleteProduct(req, res) {
        try {
            const result = await this.managerService.deleteProduct(req.params.id_product);
            if (!result) {
                return res.status(404).json({ error: 'Product not found' });
            }
            res.status(204).send();
        } catch (error) {
            if (error.message.includes('foreign key')) {
                res.status(409).json({ error: 'Cannot delete product with associated store products' });
            } else {
                res.status(400).json({ error: error.message });
            }
        }
    }

    // Products in store
    async getAllStoreProductsSortedByQuantity(req, res) {
        try {
            const products = await this.managerService.getAllStoreProductsSortedByQuantity();
            res.json(products);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getStoreProductByUPC(req, res) {
        try {
            const product = await this.managerService.getStoreProductByUPC(req.params.upc);
            if (!product) {
                return res.status(404).json({ error: 'Store product not found' });
            }
            res.json(product);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async addStoreProduct(req, res) {
        try {
            const product = await this.managerService.addStoreProduct(req.body);
            res.status(201).json(product);
        } catch (error) {
            if (error.message.includes('foreign key')) {
                res.status(409).json({ error: 'Invalid product ID' });
            } else if (error.message.includes('already exists')) {
                res.status(409).json({ error: error.message });
            } else {
                res.status(400).json({ error: error.message });
            }
        }
    }

    async updateStoreProduct(req, res) {
        try {
            const product = await this.managerService.updateStoreProduct(req.params.upc, req.body);
            if (!product) {
                return res.status(404).json({ error: 'Store product not found' });
            }
            res.json(product);
        } catch (error) {
            console.error('Error updating store product:', error);
            if (error.message.includes('not found')) {
                res.status(404).json({ error: error.message });
            } else if (error.message.includes('validation')) {
                res.status(400).json({ error: error.message });
            } else if (error.message.includes('Unauthorized')) {
                res.status(403).json({ error: error.message });
            } else if (error.message.includes('foreign key')) {
                res.status(409).json({ error: 'Invalid product ID' });
            } else {
                res.status(500).json({ error: error.message });
            }
        }
    }

    async deleteStoreProduct(req, res) {
        try {
            const result = await this.managerService.deleteStoreProduct(req.params.upc);
            if (!result) {
                return res.status(404).json({ error: 'Store product not found' });
            }
            res.status(204).send();
        } catch (error) {
            if (error.message.includes('foreign key')) {
                res.status(409).json({ error: 'Cannot delete store product with associated sales' });
            } else {
                res.status(400).json({ error: error.message });
            }
        }
    }

    async getPromotionalProducts(req, res) {
        try {
            const products = await this.managerService.getPromotionalProducts(req.query.sortBy);
            res.json(products);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Customer cards
    async getAllCustomersSortedBySurname(req, res) {
        try {
            const customers = await this.managerService.getAllCustomersSortedBySurname();
            res.json(customers);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getCustomersByPercent(req, res) {
        try {
            const percent = parseInt(req.params.percent);
            if (isNaN(percent) || percent < 0 || percent > 100) {
                return res.status(400).json({ error: 'Invalid percent value' });
            }
            const customers = await this.managerService.getCustomersByPercent(percent);
            res.json(customers);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async addCustomerCard(req, res) {
        try {
            const card = await this.managerService.addCustomerCard(req.body);
            res.status(201).json(card);
        } catch (error) {
            if (error.message.includes('already exists')) {
                res.status(409).json({ error: error.message });
            } else {
                res.status(400).json({ error: error.message });
            }
        }
    }

    async updateCustomerCard(req, res) {
        try {
            const card = await this.managerService.updateCustomerCard(req.params.card_number, req.body);
            if (!card) {
                return res.status(404).json({ error: 'Customer card not found' });
            }
            res.json(card);
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

    async deleteCustomerCard(req, res) {
        try {
            const result = await this.managerService.deleteCustomerCard(req.params.card_number);
            if (!result) {
                return res.status(404).json({ error: 'Customer card not found' });
            }
            res.status(204).send();
        } catch (error) {
            if (error.message.includes('foreign key')) {
                res.status(409).json({ error: 'Cannot delete customer card with associated checks' });
            } else {
                res.status(400).json({ error: error.message });
            }
        }
    }

    // Checks
    async getChecksByEmployee(req, res) {
        try {
            const { startDate, endDate } = req.query;
            const checks = await this.managerService.getChecksByEmployee(
                req.params.id_employee,
                startDate ? new Date(startDate) : undefined,
                endDate ? new Date(endDate) : undefined
            );
            res.json(checks);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getTotalSales(req, res) {
        try {
            const { startDate, endDate } = req.query;
            const total = await this.managerService.getTotalSumByDateRange(
                startDate ? new Date(startDate) : undefined,
                endDate ? new Date(endDate) : undefined
            );
            res.json({ total });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getProductSalesStats(req, res) {
        try {
            const { upc, startDate, endDate } = req.query;
            if (!upc) {
                return res.status(400).json({ error: 'UPC is required' });
            }

            // Convert date strings to Date objects or undefined
            const start = startDate ? new Date(startDate) : undefined;
            const end = endDate ? new Date(endDate) : undefined;

            // Check dates validity
            if (startDate && isNaN(start.getTime())) {
                return res.status(400).json({ error: 'Invalid start date format' });
            }
            if (endDate && isNaN(end.getTime())) {
                return res.status(400).json({ error: 'Invalid end date format' });
            }

            const stats = await this.managerService.getProductSalesInPeriod(upc, start, end);
            res.json(stats);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async deleteCheck(req, res) {
        try {
            const result = await this.managerService.deleteCheck(req.params.check_number);
            if (!result) {
                return res.status(404).json({ error: 'Check not found' });
            }
            res.status(204).send();
        } catch (error) {
            if (error.message.includes('foreign key')) {
                res.status(409).json({ error: 'Cannot delete check with associated sales' });
            } else {
                res.status(400).json({ error: error.message });
            }
        }
    }

    async getEmployeePerformance(req, res) {
        try {
            const { id_employee } = req.params;
            const { startDate, endDate } = req.query;
            const performance = await this.managerService.getEmployeePerformance(
                id_employee,
                startDate,
                endDate
            );
            res.json(performance);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getChecksByPeriod(req, res) {
        try {
            const { startDate, endDate } = req.query;
            const checks = await this.managerService.getChecksByPeriod(startDate, endDate);
            res.json(checks);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
} 