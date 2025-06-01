import request from 'supertest';
import app from '../app.js';
import { setupTestDatabase, cleanupTestDatabase, testCashier, testManager } from './setup.js';

let cashierToken;
let managerToken;

// Database setup before all tests
beforeAll(async () => {
    await setupTestDatabase();
});

// Database cleanup after all tests
afterAll(async () => {
    await cleanupTestDatabase();
});

describe('Authentication Tests', () => {
    test('Should login as cashier', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: testCashier.email,
                password: testCashier.password
            });
        
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
        cashierToken = response.body.token;
    });

    test('Should login as manager', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: testManager.email,
                password: testManager.password
            });
        
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
        managerToken = response.body.token;
    });
});

/*
=========CASHIER SERVICE TESTS=========
*/

describe('Cashier Product Operations', () => {
    // 1. Get all products sorted by name
    test('Should get all products sorted by name', async () => {
        const response = await request(app)
            .get('/api/cashier/products')
            .set('Authorization', `Bearer ${cashierToken}`);

        /* Expected response:
        [
            {
                "id_product": "1",
                "category_number": "1",
                "product_name": "Apple Juice",
                "characteristics": "1L bottle",
                "category_name": "Beverages"
            },
            // ... other products sorted by name
        ]
        */
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBeTruthy();
    });

    // 2. Get all store products sorted by name
    test('Should get all store products sorted by name', async () => {
        const response = await request(app)
            .get('/api/cashier/store-products')
            .set('Authorization', `Bearer ${cashierToken}`);

        /* Expected response:
        [
            {
                "UPC": "1234567890",
                "UPC_prom": null,
                "id_product": "1",
                "selling_price": 25.99,
                "products_number": 100,
                "promotional_product": false,
                "product_name": "Apple Juice"
            },
            // ... other store products
        ]
        */
        expect(response.status).toBe(200);
    });

    // 4. Search products by name
    test('Should search products by name', async () => {
        const response = await request(app)
            .get('/api/cashier/products/search')
            .query({ name: 'juice' })
            .set('Authorization', `Bearer ${cashierToken}`);

        /* Expected response:
        [
            {
                "id_product": "1",
                "product_name": "Apple Juice",
                "category_number": "1",
                "characteristics": "1L bottle"
            },
            // ... other products containing "juice" in name
        ]
        */
        expect(response.status).toBe(200);
    });
});

describe('Cashier Customer Operations', () => {
    // 3. Get all customers sorted by surname
    test('Should get all customers sorted by surname', async () => {
        const response = await request(app)
            .get('/api/cashier/customers')
            .set('Authorization', `Bearer ${cashierToken}`);

        /* Expected response:
        [
            {
                "card_number": "1234567890",
                "cust_surname": "Anderson",
                "cust_name": "John",
                "phone_number": "+380991234567",
                "city": "Kyiv",
                "street": "Main St",
                "zip_code": "01001",
                "percent": 10
            },
            // ... other customers
        ]
        */
        expect(response.status).toBe(200);
    });

    // 6. Search customers by surname
    test('Should search customers by surname', async () => {
        const response = await request(app)
            .get('/api/cashier/customers/search')
            .query({ surname: 'Anderson' })
            .set('Authorization', `Bearer ${cashierToken}`);

        /* Expected response: Same as getAllCustomers,
           but only with customers having "Anderson" in surname */
        expect(response.status).toBe(200);
    });

    // 8. Add new customer
    test('Should add new customer card', async () => {
        const newCustomer = {
            card_number: "9876543210123",  // 13 digits
            cust_surname: "Smith",
            cust_name: "Jane",
            cust_patronymic: "Patronymic",
            phone_number: "+380997654321",  // 13 chars
            city: "Kyiv",
            street: "Side St",
            zip_code: "01002",
            percent: 5
        };

        const response = await request(app)
            .post('/api/cashier/customer-cards')
            .send(newCustomer)
            .set('Authorization', `Bearer ${cashierToken}`);

        expect(response.status).toBe(201);
    });
});

describe('Cashier Check Operations', () => {
    // 7. Create new check (sale)
    test('Should create new check with sales', async () => {
        const salesData = [
            {
                UPC: "000000000001",  // Changed to match test data
                product_number: 2,
                selling_price: 25.99
            }
        ];

        const total = salesData.reduce((sum, sale) => sum + sale.product_number * sale.selling_price, 0);
        const vat = total * 0.2;

        const checkData = {
            check_number: "CHK0006",  // Changed to match format in test data
            id_employee: "E001",  // Changed to match test data
            card_number: "1234567890123",  // Changed to match test data
            print_date: new Date().toISOString(),
            sum_total: total,
            vat: vat
        };

        const response = await request(app)
            .post('/api/cashier/checks')
            .send({ check: checkData, sales: salesData })
            .set('Authorization', `Bearer ${cashierToken}`);

        expect(response.status).toBe(201);
    });

    // 9. Get today's checks
    test('Should get today checks', async () => {
        const response = await request(app)
            .get('/api/cashier/checks/today')
            .set('Authorization', `Bearer ${cashierToken}`);

        /* Expected response:
        [
            {
                "check_number": "CHECK001",
                "print_date": "2024-03-15T12:00:00.000Z",
                "sum_total": 100.50,
                "vat": 20.10
            },
            // ... other checks from today
        ]
        */
        expect(response.status).toBe(200);
    });

    // 10. Get checks by date range
    test('Should get checks by date range', async () => {
        const response = await request(app)
            .get('/api/cashier/checks')
            .query({
                startDate: '2024-03-01',
                endDate: '2024-03-15'
            })
            .set('Authorization', `Bearer ${cashierToken}`);

        /* Expected response: Same as getTodayChecks,
           but for the specified date range */
        expect(response.status).toBe(200);
    });

    // 11. Get detailed check information
    test('Should get check details', async () => {
        const response = await request(app)
            .get('/api/cashier/checks/CHK0001')  // Changed to match test data
            .set('Authorization', `Bearer ${cashierToken}`);

        expect(response.status).toBe(200);
    });
});

describe('Cashier Store Product Operations', () => {
    // 12. Get promotional products
    test('Should get promotional products', async () => {
        const response = await request(app)
            .get('/api/cashier/store-products/promotional')
            .query({ sortBy: 'name' })
            .set('Authorization', `Bearer ${cashierToken}`);

        /* Expected response:
        [
            {
                "UPC": "1234567890",
                "UPC_prom": "0987654321",
                "id_product": "1",
                "selling_price": 19.99,
                "products_number": 50,
                "promotional_product": true,
                "product_name": "Apple Juice"
            },
            // ... other promotional products
        ]
        */
        expect(response.status).toBe(200);
    });

    // 13. Get non-promotional products
    test('Should get non-promotional products', async () => {
        const response = await request(app)
            .get('/api/cashier/store-products/non-promotional')
            .query({ sortBy: 'quantity' })
            .set('Authorization', `Bearer ${cashierToken}`);

        /* Expected response: Similar to promotional products,
           but only with products where promotional_product = false */
        expect(response.status).toBe(200);
    });

    // 14. Get product details by UPC
    test('Should get product details by UPC', async () => {
        const response = await request(app)
            .get('/api/cashier/store-products/123456789012')
            .set('Authorization', `Bearer ${cashierToken}`);

        expect(response.status).toBe(200);
    });
});

describe('Cashier Profile', () => {
    // 15. Get cashier profile information
    test('Should get cashier profile info', async () => {
        const response = await request(app)
            .get('/api/cashier/profile')
            .set('Authorization', `Bearer ${cashierToken}`);

        /* Expected response:
        {
            "id_employee": "EMP001",
            "empl_surname": "Doe",
            "empl_name": "John",
            "empl_patronymic": "Smith",
            "role": "cashier",
            "salary": 15000,
            "date_of_birth": "1990-01-01",
            "date_of_start": "2023-01-01",
            "phone_number": "+380991234567",
            "city": "Kyiv",
            "street": "Main St",
            "zip_code": "01001"
        }
        */
        expect(response.status).toBe(200);
    });
});

/*
=========MANAGER SERVICE TESTS=========
*/

describe('Manager Employee Operations', () => {
    test('Should add new employee', async () => {
        const newEmployee = {
            id_employee: "E003",
            empl_surname: "Test",
            empl_name: "Employee",
            empl_patronymic: "Patronymic",
            empl_role: "cashier",
            salary: 12000,
            date_of_birth: "1990-01-01",
            date_of_start: "2024-01-01",
            phone_number: "+380991234567",
            city: "Kyiv",
            street: "Test St",
            zip_code: "01001",
            email: "test.employee@example.com",
            password: "password123"
        };

        const response = await request(app)
            .post('/api/manager/employees')
            .send(newEmployee)
            .set('Authorization', `Bearer ${managerToken}`);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id_employee', newEmployee.id_employee);
    });

    test('Should update employee', async () => {
        const updateData = {
            empl_surname: "Updated",
            empl_name: "Employee",
            empl_patronymic: "Patronymic",
            empl_role: "cashier",
            salary: 13000,
            date_of_birth: "1990-01-01",
            date_of_start: "2024-01-01",
            phone_number: "+380997654321",
            city: "Kyiv",
            street: "Test St",
            zip_code: "01001",
            email: "updated.employee@example.com",
            password: "newpassword123"
        };

        const response = await request(app)
            .put('/api/manager/employees/E003')
            .send(updateData)
            .set('Authorization', `Bearer ${managerToken}`);

        expect(response.status).toBe(200);
        expect(response.body.salary).toBe(updateData.salary);
    });

    test('Should delete employee', async () => {
        const response = await request(app)
            .delete('/api/manager/employees/E003')
            .set('Authorization', `Bearer ${managerToken}`);

        expect(response.status).toBe(204);
    });

    test('Should get employees sorted by surname', async () => {
        const response = await request(app)
            .get('/api/manager/employees')
            .set('Authorization', `Bearer ${managerToken}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBeTruthy();
    });

    test('Should get cashiers only', async () => {
        const response = await request(app)
            .get('/api/manager/employees/cashiers')
            .set('Authorization', `Bearer ${managerToken}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBeTruthy();
        expect(response.body.every(emp => emp.empl_role === 'cashier')).toBeTruthy();
    });
});

describe('Manager Category Operations', () => {
    test('Should add new category', async () => {
        const newCategory = {
            category_number: 4,
            category_name: "New Category"
        };

        const response = await request(app)
            .post('/api/manager/categories')
            .send(newCategory)
            .set('Authorization', `Bearer ${managerToken}`);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('category_number', newCategory.category_number);
    });

    test('Should update category', async () => {
        const updateData = {
            category_name: "Updated Category",
            category_number: 1
        };

        const response = await request(app)
            .put('/api/manager/categories/1')
            .send(updateData)
            .set('Authorization', `Bearer ${managerToken}`);

        expect(response.status).toBe(200);
        expect(response.body.category_name).toBe(updateData.category_name);
    });

    test('Should delete category', async () => {
        const response = await request(app)
            .delete('/api/manager/categories/4')
            .set('Authorization', `Bearer ${managerToken}`);

        expect(response.status).toBe(204);
    });

    test('Should get all categories', async () => {
        const response = await request(app)
            .get('/api/manager/categories')
            .set('Authorization', `Bearer ${managerToken}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBeTruthy();
    });
});

describe('Manager Product Operations', () => {
    test('Should add new product', async () => {
        const newProduct = {
            id_product: 111,
            category_number: 1,
            product_name: "New Product",
            characteristics: "New Characteristics",
            producer: "New Producer"
        };

        const response = await request(app)
            .post('/api/manager/products')
            .send(newProduct)
            .set('Authorization', `Bearer ${managerToken}`);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id_product', newProduct.id_product);
    });

    test('Should update product', async () => {
        const updateData = {
            category_number: 1,
            product_name: "Updated Product",
            characteristics: "Updated Characteristics",
            producer: "Updated Producer"
        };

        const response = await request(app)
            .put('/api/manager/products/101')
            .send(updateData)
            .set('Authorization', `Bearer ${managerToken}`);

        expect(response.status).toBe(200);
        expect(response.body.product_name).toBe(updateData.product_name);
    });

    test('Should delete product', async () => {
        const response = await request(app)
            .delete('/api/manager/products/111')
            .set('Authorization', `Bearer ${managerToken}`);

        expect(response.status).toBe(204);
    });

    test('Should get all products', async () => {
        const response = await request(app)
            .get('/api/manager/products')
            .set('Authorization', `Bearer ${managerToken}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBeTruthy();
    });

    test('Should get products by category', async () => {
        const response = await request(app)
            .get('/api/manager/products/category/1')
            .set('Authorization', `Bearer ${managerToken}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBeTruthy();
    });
});

describe('Manager Store Product Operations', () => {
    test('Should add new store product', async () => {
        const newStoreProduct = {
            UPC: "000000000011",
            UPC_prom: null,
            id_product: 101,
            selling_price: 150.00,
            products_number: 5,
            promotional_product: false
        };

        const response = await request(app)
            .post('/api/manager/store-products')
            .send(newStoreProduct)
            .set('Authorization', `Bearer ${managerToken}`);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('UPC', newStoreProduct.UPC);
    });

    test('Should update store product', async () => {
        const updateData = {
            id_product: 101,
            selling_price: 120.00,
            products_number: 15,
            promotional_product: false
        };

        const response = await request(app)
            .put('/api/manager/store-products/000000000001')
            .send(updateData)
            .set('Authorization', `Bearer ${managerToken}`);

        expect(response.status).toBe(200);
        expect(parseFloat(response.body.selling_price)).toBe(updateData.selling_price);
    });

    test('Should delete store product', async () => {
        const response = await request(app)
            .delete('/api/manager/store-products/000000000011')
            .set('Authorization', `Bearer ${managerToken}`);

        expect(response.status).toBe(204);
    });

    test('Should get all store products', async () => {
        const response = await request(app)
            .get('/api/manager/store-products')
            .set('Authorization', `Bearer ${managerToken}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBeTruthy();
    });
});

describe('Manager Customer Card Operations', () => {
    test('Should add new customer card', async () => {
        const newCustomer = {
            card_number: "2345678901234",
            cust_surname: "New",
            cust_name: "Customer",
            cust_patronymic: "Patronymic",
            phone_number: "+380997654321",
            city: "Kyiv",
            street: "New St",
            zip_code: "01002",
            percent: 15
        };

        const response = await request(app)
            .post('/api/manager/customer-cards')
            .send(newCustomer)
            .set('Authorization', `Bearer ${managerToken}`);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('card_number', newCustomer.card_number);
    });

    test('Should update customer card', async () => {
        const updateData = {
            cust_surname: "Updated",
            cust_name: "Customer",
            cust_patronymic: "Patronymic",
            phone_number: "+380991234567",
            city: "Kyiv",
            street: "Updated St",
            zip_code: "01001",
            percent: 20
        };

        const response = await request(app)
            .put('/api/manager/customer-cards/1234567890123')
            .send(updateData)
            .set('Authorization', `Bearer ${managerToken}`);

        expect(response.status).toBe(200);
        expect(response.body.percent).toBe(updateData.percent);
    });

    test('Should delete customer card', async () => {
        const response = await request(app)
            .delete('/api/manager/customer-cards/2345678901234')
            .set('Authorization', `Bearer ${managerToken}`);

        expect(response.status).toBe(204);
    });

    test('Should get all customer cards', async () => {
        const response = await request(app)
            .get('/api/manager/customer-cards')
            .set('Authorization', `Bearer ${managerToken}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBeTruthy();
    });

    test('Should get customers by percent', async () => {
        const response = await request(app)
            .get('/api/manager/customer-cards/percent/10')
            .set('Authorization', `Bearer ${managerToken}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBeTruthy();
    });
});

describe('Manager Reports', () => {
    test('Should get sales report by period', async () => {
        const response = await request(app)
            .get('/api/manager/reports/checks')
            .query({
                startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                endDate: new Date().toISOString()
            })
            .set('Authorization', `Bearer ${managerToken}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBeTruthy();
    });

    test('Should get employee performance report', async () => {
        const response = await request(app)
            .get(`/api/manager/reports/employee-performance/${testCashier.id_employee}`)
            .query({
                startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                endDate: new Date().toISOString()
            })
            .set('Authorization', `Bearer ${managerToken}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBeTruthy();
    });

    test('Should get product sales report', async () => {
        const response = await request(app)
            .get('/api/manager/reports/product-sales')
            .query({
                upc: '123456789012',
                startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                endDate: new Date().toISOString()
            })
            .set('Authorization', `Bearer ${managerToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('totalQuantity');
        expect(response.body).toHaveProperty('totalAmount');
        expect(response.body).toHaveProperty('sales');
    });

    test('Should get total sales by period', async () => {
        const response = await request(app)
            .get('/api/manager/reports/checks/total')
            .query({
                startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                endDate: new Date().toISOString()
            })
            .set('Authorization', `Bearer ${managerToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('total');
    });
}); 