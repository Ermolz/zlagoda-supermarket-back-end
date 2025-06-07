import request from 'supertest';
import app from '../app.js';
import { setupTestDatabase, cleanupTestDatabase, testCashier } from './setup.js';

let cashierToken;

// Database setup before all tests
beforeAll(async () => {
    await cleanupTestDatabase();
    await setupTestDatabase();
});

// Database cleanup after all tests
afterAll(async () => {
    await cleanupTestDatabase();
});

describe('API Tests', () => {
    describe('1. Authentication', () => {
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
    });

    describe('2. Cashier Product Operations', () => {
        test('Should get all products sorted by name', async () => {
            const response = await request(app)
                .get('/api/cashier/products')
                .set('Authorization', `Bearer ${cashierToken}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBeTruthy();
        });

        test('Should get all store products sorted by name', async () => {
            const response = await request(app)
                .get('/api/cashier/store-products')
                .set('Authorization', `Bearer ${cashierToken}`);

            expect(response.status).toBe(200);
        });

        test('Should search products by name', async () => {
            const response = await request(app)
                .get('/api/cashier/products/search')
                .query({ name: 'juice' })
                .set('Authorization', `Bearer ${cashierToken}`);

            expect(response.status).toBe(200);
        });
    });

    describe('3. Cashier Customer Operations', () => {
        test('Should get all customers sorted by surname', async () => {
            const response = await request(app)
                .get('/api/cashier/customers')
                .set('Authorization', `Bearer ${cashierToken}`);

            expect(response.status).toBe(200);
        });

        test('Should search customers by surname', async () => {
            const response = await request(app)
                .get('/api/cashier/customers/search')
                .query({ surname: 'Anderson' })
                .set('Authorization', `Bearer ${cashierToken}`);

            expect(response.status).toBe(200);
        });

        test('Should add new customer card', async () => {
            const newCustomer = {
                card_number: "987654321012",
                cust_surname: "Smith",
                cust_name: "Jane",
                cust_patronymic: "Patronymic",
                phone_number: "+380997654321",
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

    describe('4. Cashier Check Operations', () => {
        test('Should create new check with sales', async () => {
            const salesData = [
                {
                    UPC: "123456789012",
                    product_number: 2,
                    selling_price: 100.00
                }
            ];

            const total = salesData.reduce((sum, sale) => sum + sale.product_number * sale.selling_price, 0);
            const vat = total * 0.2;

            const checkData = {
                check_number: "CHECK002",
                id_employee: testCashier.id_employee,
                card_number: "123456789012",
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

        test('Should get today checks', async () => {
            const response = await request(app)
                .get('/api/cashier/checks/today')
                .set('Authorization', `Bearer ${cashierToken}`);

            expect(response.status).toBe(200);
        });

        test('Should get checks by date range', async () => {
            const response = await request(app)
                .get('/api/cashier/checks')
                .query({
                    startDate: '2024-03-01',
                    endDate: '2024-03-15'
                })
                .set('Authorization', `Bearer ${cashierToken}`);

            expect(response.status).toBe(200);
        });

        test('Should get check details', async () => {
            const response = await request(app)
                .get('/api/cashier/checks/CHECK001')
                .set('Authorization', `Bearer ${cashierToken}`);

            expect(response.status).toBe(200);
        });
    });

    describe('5. Cashier Store Product Operations', () => {
        test('Should get promotional products', async () => {
            const response = await request(app)
                .get('/api/cashier/store-products/promotional')
                .query({ sortBy: 'name' })
                .set('Authorization', `Bearer ${cashierToken}`);

            expect(response.status).toBe(200);
        });

        test('Should get non-promotional products', async () => {
            const response = await request(app)
                .get('/api/cashier/store-products/non-promotional')
                .query({ sortBy: 'quantity' })
                .set('Authorization', `Bearer ${cashierToken}`);

            expect(response.status).toBe(200);
        });

        test('Should get product details by UPC', async () => {
            const response = await request(app)
                .get('/api/cashier/store-products/123456789012')
                .set('Authorization', `Bearer ${cashierToken}`);

            expect(response.status).toBe(200);
        });
    });

    describe('6. Cashier Profile', () => {
        test('Should get cashier profile info', async () => {
            const response = await request(app)
                .get('/api/cashier/profile')
                .set('Authorization', `Bearer ${cashierToken}`);

            expect(response.status).toBe(200);
        });
    });
}); 