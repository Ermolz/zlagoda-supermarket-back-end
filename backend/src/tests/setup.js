import bcrypt from 'bcrypt';
import { EmployeeRepository } from '../repositories/employee.repository.js';
import pool from '../config/database.js';

const employeeRepo = new EmployeeRepository();

export const testCashier = {
    id_employee: "E001",
    email: "cashier@test.com",
    password: "password123",
    empl_surname: "Test",
    empl_name: "Cashier",
    empl_patronymic: "Patronymic",
    empl_role: "cashier",
    salary: 10000,
    date_of_birth: "1990-01-01",
    date_of_start: "2023-01-01",
    phone_number: "+380991234567",
    city: "Kyiv",
    street: "Test St",
    zip_code: "01001"
};

export const testManager = {
    id_employee: "E002",
    email: "manager@test.com",
    password: "password123",
    empl_surname: "Test",
    empl_name: "Manager",
    empl_patronymic: "Patronymic",
    empl_role: "manager",
    salary: 15000,
    date_of_birth: "1985-01-01",
    date_of_start: "2022-01-01",
    phone_number: "+380997654321",
    city: "Kyiv",
    street: "Test St",
    zip_code: "01001"
};

export const setupTestDatabase = async (skipCleanup = false) => {
    try {
        if (!skipCleanup) {
            await cleanupTestDatabase();
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Hash passwords
            const cashierPassword = await bcrypt.hash(testCashier.password, 10);
            const managerPassword = await bcrypt.hash(testManager.password, 10);

            // 1. Create or update employees
            await client.query(`
                INSERT INTO employee (
                    id_employee, empl_surname, empl_name, empl_patronymic,
                    empl_role, salary, date_of_birth, date_of_start,
                    phone_number, city, street, zip_code
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                ON CONFLICT (id_employee) DO UPDATE SET
                    empl_surname = EXCLUDED.empl_surname,
                    empl_name = EXCLUDED.empl_name,
                    empl_patronymic = EXCLUDED.empl_patronymic,
                    empl_role = EXCLUDED.empl_role,
                    salary = EXCLUDED.salary,
                    date_of_birth = EXCLUDED.date_of_birth,
                    date_of_start = EXCLUDED.date_of_start,
                    phone_number = EXCLUDED.phone_number,
                    city = EXCLUDED.city,
                    street = EXCLUDED.street,
                    zip_code = EXCLUDED.zip_code
            `, [
                testCashier.id_employee, testCashier.empl_surname, testCashier.empl_name,
                testCashier.empl_patronymic, testCashier.empl_role, testCashier.salary,
                testCashier.date_of_birth, testCashier.date_of_start,
                testCashier.phone_number, testCashier.city, testCashier.street,
                testCashier.zip_code
            ]);

            await client.query(`
                INSERT INTO employee (
                    id_employee, empl_surname, empl_name, empl_patronymic,
                    empl_role, salary, date_of_birth, date_of_start,
                    phone_number, city, street, zip_code
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                ON CONFLICT (id_employee) DO UPDATE SET
                    empl_surname = EXCLUDED.empl_surname,
                    empl_name = EXCLUDED.empl_name,
                    empl_patronymic = EXCLUDED.empl_patronymic,
                    empl_role = EXCLUDED.empl_role,
                    salary = EXCLUDED.salary,
                    date_of_birth = EXCLUDED.date_of_birth,
                    date_of_start = EXCLUDED.date_of_start,
                    phone_number = EXCLUDED.phone_number,
                    city = EXCLUDED.city,
                    street = EXCLUDED.street,
                    zip_code = EXCLUDED.zip_code
            `, [
                testManager.id_employee, testManager.empl_surname, testManager.empl_name,
                testManager.empl_patronymic, testManager.empl_role, testManager.salary,
                testManager.date_of_birth, testManager.date_of_start,
                testManager.phone_number, testManager.city, testManager.street,
                testManager.zip_code
            ]);

            // 1.1 Create authentication records
            await client.query(`
                INSERT INTO employee_auth (id_employee, email, password)
                VALUES ($1, $2, $3), ($4, $5, $6)
                ON CONFLICT (id_employee) DO UPDATE SET
                    email = EXCLUDED.email,
                    password = EXCLUDED.password
            `, [
                testCashier.id_employee, testCashier.email, cashierPassword,
                testManager.id_employee, testManager.email, managerPassword
            ]);

            // 2. Create test category
            await client.query(`
                INSERT INTO category (category_number, category_name)
                VALUES (1, 'Test Category')
                ON CONFLICT (category_number) DO UPDATE SET
                    category_name = EXCLUDED.category_name
            `);

            // 3. Create test product
            await client.query(`
                INSERT INTO product (id_product, category_number, product_name, characteristics, producer)
                VALUES (1, 1, 'Test Product', 'Test Characteristics', 'Test Producer')
                ON CONFLICT (id_product) DO UPDATE SET
                    category_number = EXCLUDED.category_number,
                    product_name = EXCLUDED.product_name,
                    characteristics = EXCLUDED.characteristics,
                    producer = EXCLUDED.producer
            `);

            // 4. Create test store item
            await client.query(`
                INSERT INTO store_in_product (UPC, UPC_prom, id_product, selling_price, product_number, promotional_product)
                VALUES ('123456789012', NULL, 1, 100.00, 10, false)
                ON CONFLICT (UPC) DO UPDATE SET
                    id_product = EXCLUDED.id_product,
                    selling_price = EXCLUDED.selling_price,
                    product_number = EXCLUDED.product_number,
                    promotional_product = EXCLUDED.promotional_product
            `);

            // 5. Create test customer card
            await client.query(`
                INSERT INTO customer_card (card_number, cust_surname, cust_name, cust_patronymic, phone_number, city, street, zip_code, percent)
                VALUES ('123456789012', 'Test', 'Customer', 'Patronymic', '+380991234567', 'Kyiv', 'Test St', '01001', 10)
                ON CONFLICT (card_number) DO UPDATE SET
                    cust_surname = EXCLUDED.cust_surname,
                    cust_name = EXCLUDED.cust_name,
                    cust_patronymic = EXCLUDED.cust_patronymic,
                    phone_number = EXCLUDED.phone_number,
                    city = EXCLUDED.city,
                    street = EXCLUDED.street,
                    zip_code = EXCLUDED.zip_code,
                    percent = EXCLUDED.percent
            `);

            // 6. Create test receipt
            await client.query(`
                INSERT INTO checks (check_number, id_employee, card_number, print_date, sum_total, vat)
                VALUES ('CHECK001', $1, '123456789012', NOW(), 100.00, 20.00)
                ON CONFLICT (check_number) DO UPDATE SET
                    id_employee = EXCLUDED.id_employee,
                    card_number = EXCLUDED.card_number,
                    print_date = EXCLUDED.print_date,
                    sum_total = EXCLUDED.sum_total,
                    vat = EXCLUDED.vat
            `, [testCashier.id_employee]);

            // 7. Create test sale
            await client.query(`
                INSERT INTO sale (UPC, check_number, product_number, selling_price)
                VALUES ('123456789012', 'CHECK001', 1, 100.00)
                ON CONFLICT (UPC, check_number) DO UPDATE SET
                    product_number = EXCLUDED.product_number,
                    selling_price = EXCLUDED.selling_price
            `);

            await client.query('COMMIT');
            console.log('Test database setup completed');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error setting up test database:', error);
        throw error;
    }
};

export const cleanupTestDatabase = async () => {
    try {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Delete test data in correct order (considering dependencies)
            
            // 1. First delete sales as they reference receipts and items
            await client.query('DELETE FROM sale');
            
            // 2. Delete receipts as they reference employees and customer cards
            await client.query('DELETE FROM checks');
            
            // 3. Delete store items as they reference products
            await client.query('DELETE FROM store_in_product');
            
            // 4. Delete products as they reference categories
            await client.query('DELETE FROM product');
            
            // 5. Now we can delete categories
            await client.query('DELETE FROM category');
            
            // 6. Delete customer cards
            await client.query('DELETE FROM customer_card');
            
            // 7. Delete authentication records
            await client.query('DELETE FROM employee_auth');
            
            // 8. Finally delete employees
            await client.query('DELETE FROM employee');

            // Reset sequences if any
            await client.query('ALTER SEQUENCE IF EXISTS category_category_number_seq RESTART WITH 1');
            await client.query('ALTER SEQUENCE IF EXISTS product_id_product_seq RESTART WITH 1');

            await client.query('COMMIT');
            console.log('Test database cleanup completed');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error cleaning up test database:', error);
        throw error;
    }
};