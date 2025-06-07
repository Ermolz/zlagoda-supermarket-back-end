import request from 'supertest';
import app from '../app.js';
import { setupTestDatabase, cleanupTestDatabase, testManager } from './setup.js';

let managerToken;

// Database setup before all tests
beforeAll(async () => {
    await cleanupTestDatabase();
    await setupTestDatabase();
    // Login as manager to get token
    const response = await request(app)
        .post('/api/auth/login')
        .send({
            email: testManager.email,
            password: testManager.password
        });
    managerToken = response.body.token;
});

// Database cleanup after all tests
afterAll(async () => {
    await cleanupTestDatabase();
});

describe('Manager API Tests', () => {
    describe('1. Manager Create Operations', () => {
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

        test('Should add new product', async () => {
            const newProduct = {
                id_product: 111,
                category_number: 4,
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

        test('Should add new store product', async () => {
            const newStoreProduct = {
                UPC: "123456789013",
                UPC_prom: null,
                id_product: 111,
                selling_price: 150.00,
                product_number: 5,
                promotional_product: false
            };

            const response = await request(app)
                .post('/api/manager/store-products')
                .send(newStoreProduct)
                .set('Authorization', `Bearer ${managerToken}`);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('UPC', newStoreProduct.UPC);
        });

        test('Should add new customer card', async () => {
            const newCustomer = {
                card_number: "123456789014",
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
    });

    describe('2. Manager Update Operations', () => {
        test('Should update category', async () => {
            const updateData = {
                category_name: "Updated Category",
                category_number: 4
            };

            const response = await request(app)
                .put('/api/manager/categories/4')
                .send(updateData)
                .set('Authorization', `Bearer ${managerToken}`);

            expect(response.status).toBe(200);
            expect(response.body.category_name).toBe(updateData.category_name);
        });

        test('Should update product', async () => {
            const updateData = {
                category_number: 4,
                product_name: "Updated Product",
                characteristics: "Updated Characteristics",
                producer: "Updated Producer"
            };

            const response = await request(app)
                .put('/api/manager/products/111')
                .send(updateData)
                .set('Authorization', `Bearer ${managerToken}`);

            expect(response.status).toBe(200);
            expect(response.body.product_name).toBe(updateData.product_name);
        });

        test('Should update store product', async () => {
            const updateData = {
                selling_price: 120.00,
                product_number: 15,
                promotional_product: false
            };

            const response = await request(app)
                .put('/api/manager/store-products/123456789013')
                .send(updateData)
                .set('Authorization', `Bearer ${managerToken}`);

            expect(response.status).toBe(200);
            expect(parseFloat(response.body.selling_price)).toBe(updateData.selling_price);
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
                .put('/api/manager/customer-cards/123456789014')
                .send(updateData)
                .set('Authorization', `Bearer ${managerToken}`);

            expect(response.status).toBe(200);
            expect(response.body.percent).toBe(updateData.percent);
        });
    });

    describe('3. Manager Read Operations', () => {
        test('Should get all categories', async () => {
            const response = await request(app)
                .get('/api/manager/categories')
                .set('Authorization', `Bearer ${managerToken}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBeTruthy();
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
                .get('/api/manager/products/category/4')
                .set('Authorization', `Bearer ${managerToken}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBeTruthy();
        });

        test('Should get all store products', async () => {
            const response = await request(app)
                .get('/api/manager/store-products')
                .set('Authorization', `Bearer ${managerToken}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBeTruthy();
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
                .get('/api/manager/customer-cards/percent/15')
                .set('Authorization', `Bearer ${managerToken}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBeTruthy();
        });
    });

    describe('4. Manager Reports', () => {
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
                .get(`/api/manager/reports/employee-performance/${testManager.id_employee}`)
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
                    upc: '123456789013',
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

    describe('5. Manager Delete Operations', () => {
        test('Should delete store product', async () => {
            const response = await request(app)
                .delete('/api/manager/store-products/123456789013')
                .set('Authorization', `Bearer ${managerToken}`);

            expect(response.status).toBe(204);
        });

        test('Should delete product', async () => {
            const response = await request(app)
                .delete('/api/manager/products/111')
                .set('Authorization', `Bearer ${managerToken}`);

            expect(response.status).toBe(204);
        });

        test('Should delete category', async () => {
            const response = await request(app)
                .delete('/api/manager/categories/4')
                .set('Authorization', `Bearer ${managerToken}`);

            expect(response.status).toBe(204);
        });

        test('Should delete customer card', async () => {
            const response = await request(app)
                .delete('/api/manager/customer-cards/123456789014')
                .set('Authorization', `Bearer ${managerToken}`);

            expect(response.status).toBe(204);
        });
    });
}); 