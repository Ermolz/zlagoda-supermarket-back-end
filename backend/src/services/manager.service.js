import { EmployeeRepository } from '../repositories/employee.repository.js';
import { CustomerCardRepository } from '../repositories/customer-card.repository.js';
import { CategoryRepository } from '../repositories/category.repository.js';
import { ProductRepository } from '../repositories/product.repository.js';
import { StoreProductRepository } from '../repositories/store-product.repository.js';
import { CheckRepository } from '../repositories/check.repository.js';
import { SaleRepository } from '../repositories/sale.repository.js';
import { EmployeeService } from './employee.service.js';

export class ManagerService {
    constructor() {
        this.employeeRepo = new EmployeeRepository();
        this.customerCardRepo = new CustomerCardRepository();
        this.categoryRepo = new CategoryRepository();
        this.productRepo = new ProductRepository();
        this.storeProductRepo = new StoreProductRepository();
        this.checkRepo = new CheckRepository();
        this.saleRepo = new SaleRepository();
        this.employeeService = new EmployeeService();
    }

    // 1. Додавання даних
    async addEmployee(data) {
        return this.employeeRepo.createWithAuth(data, 'manager');
    }

    async addCustomerCard(data) {
        return this.customerCardRepo.create(data, 'manager');
    }

    async addCategory(data) {
        return this.categoryRepo.create(data, 'manager');
    }

    async addProduct(data) {
        return this.productRepo.create(data, 'manager');
    }

    async addStoreProduct(data) {
        return this.storeProductRepo.create(data, 'manager');
    }

    // 2. Редагування даних
    async updateEmployee(id, data) {
        return this.employeeRepo.update(id, data, 'manager');
    }

    async updateCustomerCard(id, data) {
        return this.customerCardRepo.update(id, data, 'manager');
    }

    async updateCategory(id, data) {
        return this.categoryRepo.update(id, data, 'manager');
    }

    async updateProduct(id, data) {
        return this.productRepo.update(id, data, 'manager');
    }

    async updateStoreProduct(id, data) {
        return this.storeProductRepo.update(id, data, 'manager');
    }

    // 3. Видалення даних
    async deleteEmployee(id) {
        return this.employeeRepo.delete(id, 'manager');
    }

    async deleteCustomerCard(id) {
        return this.customerCardRepo.delete(id, 'manager');
    }

    async deleteCategory(id) {
        return this.categoryRepo.delete(id, 'manager');
    }

    async deleteProduct(id) {
        return this.productRepo.delete(id, 'manager');
    }

    async deleteStoreProduct(id) {
        return this.storeProductRepo.delete(id, 'manager');
    }

    async deleteCheck(id) {
        return this.checkRepo.delete(id, 'manager');
    }

    // 4-8. Отримання інформації про працівників
    async getAllEmployeesSortedBySurname() {
        const employees = await this.employeeRepo.findAll();
        return employees.sort((a, b) => a.empl_surname.localeCompare(b.empl_surname));
    }

    async getCashiers() {
        const employees = await this.employeeRepo.findAll();
        return employees
            .filter(e => e.empl_role === 'cashier')
            .sort((a, b) => a.empl_surname.localeCompare(b.empl_surname));
    }

    async getEmployeeContactsByName(surname) {
        const employees = await this.employeeRepo.findAll();
        const employee = employees.find(e => e.empl_surname.toLowerCase() === surname.toLowerCase());
        if (!employee) return null;
        return {
            phone_number: employee.phone_number,
            address: `${employee.city}, ${employee.street}, ${employee.zip_code}`
        };
    }

    // 9-10. Отримання інформації про клієнтів
    async getAllCustomersSortedBySurname() {
        const customers = await this.customerCardRepo.findAll();
        return customers.sort((a, b) => a.cust_surname.localeCompare(b.cust_surname));
    }

    async getCustomersByPercent(percent) {
        const customers = await this.customerCardRepo.findByPercent(percent);
        return customers.sort((a, b) => a.cust_surname.localeCompare(b.cust_surname));
    }

    // 11-13. Отримання інформації про категорії та товари
    async getAllCategoriesSortedByName() {
        const categories = await this.categoryRepo.findAll();
        return categories.sort((a, b) => a.category_name.localeCompare(b.category_name));
    }

    async getAllProductsSortedByName() {
        const products = await this.productRepo.findWithCategoryDetails();
        return products.sort((a, b) => a.product_name.localeCompare(b.product_name));
    }

    async getProductsByCategory(categoryNumber) {
        const products = await this.productRepo.findByCategory(categoryNumber);
        return products.sort((a, b) => a.product_name.localeCompare(b.product_name));
    }

    async searchProducts(name) {
        if (!name) {
            return [];
        }
        const products = await this.productRepo.findWithCategoryDetails();
        return products.filter(p => 
            p.product_name.toLowerCase().includes(name.toLowerCase())
        ).sort((a, b) => a.product_name.localeCompare(b.product_name));
    }

    async searchEmployees(surname) {
        if (!surname) {
            return [];
        }
        return this.employeeRepo.searchBySurname(surname);
    }

    // 14-16. Отримання інформації про товари в магазині
    async getAllStoreProductsSortedByQuantity() {
        const products = await this.storeProductRepo.findWithProductDetails();
        return products.sort((a, b) => b.product_number - a.product_number);
    }

    async getStoreProductByUPC(UPC) {
        return this.storeProductRepo.findById(UPC);
    }

    async getPromotionalProducts(sortBy = 'quantity') {
        const products = await this.storeProductRepo.findPromotionalProducts();
        return sortBy === 'quantity' 
            ? products.sort((a, b) => b.product_number - a.product_number)
            : products.sort((a, b) => a.product_name.localeCompare(b.product_name));
    }

    async getNonPromotionalProducts(sortBy = 'quantity') {
        const products = await this.storeProductRepo.findWithProductDetails();
        const nonPromotional = products.filter(p => !p.promotional_product);
        return sortBy === 'quantity'
            ? nonPromotional.sort((a, b) => b.product_number - a.product_number)
            : nonPromotional.sort((a, b) => a.product_name.localeCompare(b.product_name));
    }

    // 17-21. Отримання інформації про чеки та продажі
    async getChecksByEmployee(employeeId, startDate, endDate) {
        return this.checkRepo.findByEmployeeAndDateRange(
            employeeId,
            startDate || new Date(0),
            endDate || new Date()
        );
    }

    async getAllChecksByDateRange(startDate, endDate) {
        return this.checkRepo.findByDateRange(startDate, endDate);
    }

    async getTotalSumByEmployee(employeeId, startDate, endDate) {
        const checks = await this.getChecksByEmployee(employeeId, startDate, endDate);
        return checks.reduce((sum, check) => sum + Number(check.sum_total), 0);
    }

    async getTotalSumByDateRange(startDate, endDate) {
        const checks = await this.getAllChecksByDateRange(startDate, endDate);
        return checks.reduce((sum, check) => sum + Number(check.sum_total), 0);
    }

    async getProductSalesInPeriod(UPC, startDate, endDate) {
        const sales = await this.saleRepo.findSalesByDateRange(startDate, endDate);
        const productSales = sales.filter(sale => sale.UPC === UPC);
        return {
            totalQuantity: productSales.reduce((sum, sale) => sum + sale.product_number, 0),
            sales: productSales
        };
    }

    async getEmployeePerformance(employeeId, startDate, endDate) {
        const checks = await this.checkRepo.findByEmployee(employeeId);
        if (!checks || checks.length === 0) {
            return [];
        }

        const filteredChecks = checks.filter(check => {
            const checkDate = new Date(check.print_date);
            return (!startDate || checkDate >= new Date(startDate)) &&
                   (!endDate || checkDate <= new Date(endDate));
        });

        return filteredChecks.map(check => ({
            check_number: check.check_number,
            print_date: check.print_date,
            sum_total: check.sum_total,
            vat: check.vat,
            empl_surname: check.empl_surname,
            empl_name: check.empl_name,
            customer: check.card_number ? {
                surname: check.cust_surname,
                name: check.cust_name
            } : null
        }));
    }

    async getChecksByPeriod(startDate, endDate) {
        const checks = await this.checkRepo.findByDateRange(
            startDate ? new Date(startDate) : new Date(0),
            endDate ? new Date(endDate) : new Date()
        );

        return checks.map(check => ({
            check_number: check.check_number,
            print_date: check.print_date,
            sum_total: check.sum_total,
            vat: check.vat,
            empl_surname: check.empl_surname,
            empl_name: check.empl_name
        }));
    }

    async getProductSalesInPeriod(upc, startDate, endDate) {
        const sales = await this.saleRepo.findSalesByDateRange(
            startDate ? new Date(startDate) : new Date(0),
            endDate ? new Date(endDate) : new Date()
        );

        const productSales = sales.filter(sale => sale.upc === upc);
        const totalQuantity = productSales.reduce((sum, sale) => sum + parseInt(sale.product_number), 0);
        const totalAmount = productSales.reduce((sum, sale) => sum + parseFloat(sale.selling_price) * parseInt(sale.product_number), 0);

        return {
            totalQuantity,
            totalAmount,
            sales: productSales.map(sale => ({
                check_number: sale.check_number,
                print_date: sale.print_date,
                quantity: parseInt(sale.product_number),
                price: parseFloat(sale.selling_price),
                total: parseFloat(sale.selling_price) * parseInt(sale.product_number),
                cashier: {
                    surname: sale.empl_surname,
                    name: sale.empl_name
                }
            }))
        };
    }
} 