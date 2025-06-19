import { ProductRepository } from '../repositories/product.repository.js';
import { StoreProductRepository } from '../repositories/store-product.repository.js';
import { CustomerCardRepository } from '../repositories/customer-card.repository.js';
import { CheckRepository } from '../repositories/check.repository.js';
import { SaleRepository } from '../repositories/sale.repository.js';
import { EmployeeRepository } from '../repositories/employee.repository.js';
import { EmployeeService } from './employee.service.js';

export class CashierService {
    constructor() {
        this.productRepo = new ProductRepository();
        this.storeProductRepo = new StoreProductRepository();
        this.customerCardRepo = new CustomerCardRepository();
        this.checkRepo = new CheckRepository();
        this.saleRepo = new SaleRepository();
        this.employeeRepo = new EmployeeRepository();
        this.employeeService = new EmployeeService();
    }

    // 1. Отримати інформацію про усі товари, відсортовані за назвою
    async getAllProductsSortedByName() {
        const products = await this.productRepo.findWithCategoryDetails();
        return products.sort((a, b) => a.product_name.localeCompare(b.product_name));
    }

    // 2. Отримати інформацію про усі товари у магазині, відсортовані за назвою
    async getAllStoreProductsSortedByName() {
        const products = await this.storeProductRepo.findWithProductDetails();
        return products.sort((a, b) => a.product_name.localeCompare(b.product_name));
    }

    // 3. Отримати інформацію про усіх постійних клієнтів, відсортованих за прізвищем
    async getAllCustomersSortedBySurname() {
        const customers = await this.customerCardRepo.findAll();
        return customers.sort((a, b) => a.cust_surname.localeCompare(b.cust_surname));
    }

    // 4. Здійснити пошук товарів за назвою
    async searchProductsByName(name) {
        if (!name) {
            return [];
        }
        const products = await this.productRepo.findWithCategoryDetails();
        return products.filter(p => 
            p.product_name.toLowerCase().includes(name.toLowerCase())
        ).sort((a, b) => a.product_name.localeCompare(b.product_name));
    }

    // 5. Здійснити пошук товарів, що належать певній категорії
    async getProductsByCategory(categoryNumber) {
        const products = await this.productRepo.findByCategory(categoryNumber);
        return products.sort((a, b) => a.product_name.localeCompare(b.product_name));
    }

    // 6. Здійснити пошук постійних клієнтів за прізвищем
    async searchCustomersBySurname(surname) {
        if (!surname) {
            return [];
        }
        const customers = await this.customerCardRepo.findAll();
        return customers.filter(c => 
            c.cust_surname.toLowerCase().includes(surname.toLowerCase())
        ).sort((a, b) => a.cust_surname.localeCompare(b.cust_surname));
    }

    // 7. Здійснювати продаж товарів (додавання чеків)
    async createCheck(checkData, salesData) {
        // Check check number format
        if (!checkData.check_number || !/^CHK\d+$/.test(checkData.check_number)) {
            throw new Error('Check number must be in format CHK followed by digits');
        }

        // Check products availability and quantity
        for (const sale of salesData) {
            const storeProduct = await this.storeProductRepo.findById(sale.UPC);
            if (!storeProduct) {
                throw new Error(`Product with UPC ${sale.UPC} not found`);
            }
            if (storeProduct.product_number < sale.product_number) {
                throw new Error(`Not enough quantity for product with UPC ${sale.UPC}`);
            }
        }

        // Check customer card if provided
        if (checkData.card_number) {
            const customer = await this.customerCardRepo.findById(checkData.card_number);
            if (!customer) {
                throw new Error('Customer card not found');
            }
        }

        return this.checkRepo.createWithSales(checkData, salesData, 'cashier');
    }

    // 8. Додавати/редагувати інформацію про постійних клієнтів
    async addCustomerCard(data) {
        // Check card number uniqueness
        const existingCard = await this.customerCardRepo.findById(data.card_number);
        if (existingCard) {
            throw new Error('Customer card with this number already exists');
        }

        return this.customerCardRepo.create(data, 'cashier');
    }

    async updateCustomerCard(id, data) {
        // Check if card exists
        const existingCard = await this.customerCardRepo.findById(id);
        if (!existingCard) {
            throw new Error('Customer card not found');
        }

        return this.customerCardRepo.update(id, data, 'cashier');
    }

    // 9. Переглянути список усіх чеків, що створив касир за цей день
    async getTodayChecks(cashierId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        return this.checkRepo.findByDateRange(today, tomorrow)
            .then(checks => checks.filter(check => check.id_employee === cashierId));
    }

    // 10. Переглянути список усіх чеків, що створив касир за певний період часу
    async getChecksByDateRange(cashierId, startDate, endDate) {
        return this.checkRepo.findByDateRange(startDate, endDate)
            .then(checks => checks.filter(check => check.id_employee === cashierId));
    }

    // 11. За номером чеку вивести усю інформацію про даний чек
    async getCheckDetails(checkNumber) {
        // Check if check exists
        const check = await this.checkRepo.findWithDetails(checkNumber);
        if (!check || check.length === 0) {
            throw new Error('Check not found');
        }

        // Format the response
        const sales = check.map(row => ({
            UPC: row.UPC,
            product_name: row.product_name,
            characteristics: row.characteristics,
            product_number: row.product_number,
            selling_price: row.selling_price
        }));

        return {
            check_number: check[0].check_number,
            print_date: check[0].print_date,
            sum_total: check[0].sum_total,
            vat: check[0].vat,
            cashier: {
                id_employee: check[0].id_employee,
                surname: check[0].empl_surname,
                name: check[0].empl_name
            },
            customer: check[0].card_number ? {
                card_number: check[0].card_number,
                surname: check[0].cust_surname,
                name: check[0].cust_name
            } : null,
            sales
        };
    }

    // 12. Отримати інформацію про усі акційні товари
    async getPromotionalProducts(sortBy = 'quantity') {
        const products = await this.storeProductRepo.findPromotionalProducts();
        return sortBy === 'quantity' 
            ? products.sort((a, b) => b.product_number - a.product_number)
            : products.sort((a, b) => a.product_name.localeCompare(b.product_name));
    }

    // 13. Отримати інформацію про усі не акційні товари
    async getNonPromotionalProducts(sortBy = 'quantity') {
        const products = await this.storeProductRepo.findWithProductDetails();
        const nonPromotional = products.filter(p => !p.promotional_product);
        return sortBy === 'quantity'
            ? nonPromotional.sort((a, b) => b.product_number - a.product_number)
            : nonPromotional.sort((a, b) => a.product_name.localeCompare(b.product_name));
    }

    // 14. За UPC-товару знайти ціну продажу товару, кількість наявних одиниць товару
    async getProductDetailsByUPC(UPC) {
        const product = await this.storeProductRepo.findWithProductDetails()
            .then(products => products.find(p => p.UPC === UPC));
            
        if (!product) {
            throw new Error('Product not found');
        }
        
        return product;
    }

    // 15. Можливість отримати усю інформацію про себе
    async getCashierInfo(employeeId) {
        const employee = await this.employeeRepo.findById(employeeId);
        if (!employee) {
            throw new Error('Employee not found');
        }
        return employee;
    }
} 