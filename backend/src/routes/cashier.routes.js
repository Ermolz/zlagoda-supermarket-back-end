import { Router } from 'express';
import { CashierController } from '../controllers/cashier.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleMiddleware } from '../middlewares/role.middleware.js';
import { validateCheck, validateCustomerCard } from '../middlewares/validation.middleware.js';

/**
 * @swagger
 * tags:
 *   name: Cashier
 *   description: Cashier operations
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         id_product:
 *           type: integer
 *         product_name:
 *           type: string
 *         characteristics:
 *           type: string
 *         producer:
 *           type: string
 *     StoreProduct:
 *       type: object
 *       properties:
 *         UPC:
 *           type: string
 *         UPC_prom:
 *           type: string
 *         selling_price:
 *           type: number
 *         product_number:
 *           type: integer
 *         promotional_product:
 *           type: boolean
 *     CustomerCard:
 *       type: object
 *       properties:
 *         card_number:
 *           type: string
 *         cust_surname:
 *           type: string
 *         cust_name:
 *           type: string
 *         phone_number:
 *           type: string
 *         percent:
 *           type: integer
 */

const router = Router();
const cashierController = new CashierController();

// Middleware
router.use(authMiddleware);
router.use(roleMiddleware(['cashier']));

// 1. Отримати інформацію про усі товари, відсортовані за назвою
/**
 * @swagger
 * /api/cashier/products:
 *   get:
 *     summary: Get all products sorted by name
 *     tags: [Cashier]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
router.get('/products', cashierController.getAllProducts.bind(cashierController));

// 2. Отримати інформацію про усі товари у магазині, відсортовані за назвою
/**
 * @swagger
 * /api/cashier/store-products:
 *   get:
 *     summary: Get all store products sorted by name
 *     tags: [Cashier]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of store products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/StoreProduct'
 */
router.get('/store-products', cashierController.getAllStoreProducts.bind(cashierController));

// 3. Отримати інформацію про усіх постійних клієнтів, відсортованих за прізвищем
/**
 * @swagger
 * /api/cashier/customers:
 *   get:
 *     summary: Get all customers sorted by surname
 *     tags: [Cashier]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of customer cards
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CustomerCard'
 */
router.get('/customers', cashierController.getAllCustomers.bind(cashierController));

// 4. Здійснити пошук товарів за назвою
/**
 * @swagger
 * /api/cashier/products/search:
 *   get:
 *     summary: Search products by name
 *     tags: [Cashier]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         required: true
 *         description: Product name to search for
 *     responses:
 *       200:
 *         description: List of matching products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
router.get('/products/search', cashierController.searchProducts.bind(cashierController));

// 5. Здійснити пошук товарів, що належать певній категорії
/**
 * @swagger
 * /api/cashier/products/category/{categoryId}:
 *   get:
 *     summary: Get products by category
 *     tags: [Cashier]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Category ID
 *     responses:
 *       200:
 *         description: List of products in category
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
router.get('/products/category/:categoryId', cashierController.getProductsByCategory.bind(cashierController));

// 6. Здійснити пошук постійних клієнтів за прізвищем
/**
 * @swagger
 * /api/cashier/customers/search:
 *   get:
 *     summary: Search customers by surname
 *     tags: [Cashier]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: surname
 *         schema:
 *           type: string
 *         required: true
 *         description: Customer surname to search for
 *     responses:
 *       200:
 *         description: List of matching customers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CustomerCard'
 */
router.get('/customers/search', cashierController.searchCustomers.bind(cashierController));

// 7. Здійснювати продаж товарів (додавання чеків)
/**
 * @swagger
 * /api/cashier/checks:
 *   post:
 *     summary: Create new sales check
 *     tags: [Cashier]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - check
 *               - sales
 *             properties:
 *               check:
 *                 type: object
 *                 properties:
 *                   check_number:
 *                     type: string
 *                   card_number:
 *                     type: string
 *                   print_date:
 *                     type: string
 *                     format: date-time
 *                   sum_total:
 *                     type: number
 *                   vat:
 *                     type: number
 *               sales:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     UPC:
 *                       type: string
 *                     product_number:
 *                       type: integer
 *                     selling_price:
 *                       type: number
 *     responses:
 *       201:
 *         description: Check created successfully
 */
router.post('/checks', validateCheck, cashierController.createCheck.bind(cashierController));

// 8. Додавати/редагувати інформацію про постійних клієнтів
/**
 * @swagger
 * /api/cashier/customer-cards:
 *   post:
 *     summary: Create new customer card
 *     tags: [Cashier]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CustomerCard'
 *     responses:
 *       201:
 *         description: Customer card created successfully
 */
router.post('/customer-cards', validateCustomerCard, cashierController.addCustomerCard.bind(cashierController));

/**
 * @swagger
 * /api/cashier/customer-cards/{card_number}:
 *   put:
 *     summary: Update customer card
 *     tags: [Cashier]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: card_number
 *         schema:
 *           type: string
 *         required: true
 *         description: Customer card number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CustomerCard'
 *     responses:
 *       200:
 *         description: Customer card updated successfully
 */
router.put('/customer-cards/:card_number', validateCustomerCard, cashierController.updateCustomerCard.bind(cashierController));

// 9. Переглянути список усіх чеків, що створив касир за цей день
/**
 * @swagger
 * /api/cashier/checks/today:
 *   get:
 *     summary: Get today's checks
 *     tags: [Cashier]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of today's checks
 */
router.get('/checks/today', cashierController.getTodayChecks.bind(cashierController));

// 10. Переглянути список усіх чеків, що створив касир за певний період часу
/**
 * @swagger
 * /api/cashier/checks:
 *   get:
 *     summary: Get checks by date range
 *     tags: [Cashier]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Start date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: End date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: List of checks within date range
 */
router.get('/checks', cashierController.getChecksByDateRange.bind(cashierController));

// 11. За номером чеку вивести усю інформацію про даний чек
/**
 * @swagger
 * /api/cashier/checks/{checkNumber}:
 *   get:
 *     summary: Get check details
 *     tags: [Cashier]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: checkNumber
 *         schema:
 *           type: string
 *         required: true
 *         description: Check number
 *     responses:
 *       200:
 *         description: Check details
 */
router.get('/checks/:checkNumber', cashierController.getCheckDetails.bind(cashierController));

// 12. Отримати інформацію про усі акційні товари
/**
 * @swagger
 * /api/cashier/store-products/promotional:
 *   get:
 *     summary: Get promotional products
 *     tags: [Cashier]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, price, quantity]
 *         description: Sort field
 *     responses:
 *       200:
 *         description: List of promotional products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/StoreProduct'
 */
router.get('/store-products/promotional', cashierController.getPromotionalProducts.bind(cashierController));

// 13. Отримати інформацію про усі не акційні товари
/**
 * @swagger
 * /api/cashier/store-products/non-promotional:
 *   get:
 *     summary: Get non-promotional products
 *     tags: [Cashier]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, price, quantity]
 *         description: Sort field
 *     responses:
 *       200:
 *         description: List of non-promotional products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/StoreProduct'
 */
router.get('/store-products/non-promotional', cashierController.getNonPromotionalProducts.bind(cashierController));

// 14. За UPC-товару знайти ціну продажу товару, кількість наявних одиниць товару
/**
 * @swagger
 * /api/cashier/store-products/{upc}:
 *   get:
 *     summary: Get product details by UPC
 *     tags: [Cashier]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: upc
 *         schema:
 *           type: string
 *         required: true
 *         description: Product UPC
 *     responses:
 *       200:
 *         description: Product details (price and quantity)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StoreProduct'
 *       404:
 *         description: Product not found
 */
router.get('/store-products/:upc', cashierController.getProductDetailsByUPC.bind(cashierController));

// 15. Можливість отримати усю інформацію про себе
/**
 * @swagger
 * /api/cashier/profile:
 *   get:
 *     summary: Get cashier profile information
 *     tags: [Cashier]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cashier profile data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_employee:
 *                   type: integer
 *                 surname:
 *                   type: string
 *                 name:
 *                   type: string
 *                 patronymic:
 *                   type: string
 *                 role:
 *                   type: string
 *                 salary:
 *                   type: number
 *                 date_of_birth:
 *                   type: string
 *                   format: date
 *                 date_of_start:
 *                   type: string
 *                   format: date
 *                 phone_number:
 *                   type: string
 *                 city:
 *                   type: string
 *                 street:
 *                   type: string
 *                 zip_code:
 *                   type: string
 *       404:
 *         description: Profile not found
 */
router.get('/profile', cashierController.getCashierInfo.bind(cashierController));

export default router; 