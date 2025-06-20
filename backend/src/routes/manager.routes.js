import { Router } from 'express';
import { ManagerController } from '../controllers/manager.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleMiddleware } from '../middlewares/role.middleware.js';
import { 
    validateEmployee, 
    validateCategory, 
    validateProduct, 
    validateStoreProduct, 
    validateCustomerCard 
} from '../middlewares/validation.middleware.js';

/**
 * @swagger
 * tags:
 *   name: Manager
 *   description: Manager operations
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Employee:
 *       type: object
 *       properties:
 *         id_employee:
 *           type: integer
 *         surname:
 *           type: string
 *         name:
 *           type: string
 *         patronymic:
 *           type: string
 *         role:
 *           type: string
 *           enum: [cashier, manager]
 *         salary:
 *           type: number
 *         date_of_birth:
 *           type: string
 *           format: date
 *         date_of_start:
 *           type: string
 *           format: date
 *         phone_number:
 *           type: string
 *         city:
 *           type: string
 *         street:
 *           type: string
 *         zip_code:
 *           type: string
 *     Category:
 *       type: object
 *       properties:
 *         category_number:
 *           type: integer
 *         category_name:
 *           type: string
 */

const router = Router();
const managerController = new ManagerController();

// Middleware
router.use(authMiddleware);
router.use(roleMiddleware(['manager']));

/**
 * @swagger
 * /api/manager/employees:
 *   post:
 *     summary: Add new employee
 *     tags: [Manager]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Employee'
 *     responses:
 *       201:
 *         description: Employee created successfully
 */
router.post('/employees', validateEmployee, managerController.addEmployee.bind(managerController));

/**
 * @swagger
 * /api/manager/employees/{id_employee}:
 *   put:
 *     summary: Update employee
 *     tags: [Manager]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_employee
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Employee'
 *     responses:
 *       200:
 *         description: Employee updated successfully
 */
router.put('/employees/:id_employee', validateEmployee, managerController.updateEmployee.bind(managerController));

/**
 * @swagger
 * /api/manager/employees/{id_employee}:
 *   delete:
 *     summary: Delete employee
 *     tags: [Manager]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_employee
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Employee deleted successfully
 */
router.delete('/employees/:id_employee', managerController.deleteEmployee.bind(managerController));

/**
 * @swagger
 * /api/manager/employees:
 *   get:
 *     summary: Get all employees sorted by surname
 *     tags: [Manager]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of employees
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Employee'
 */
router.get('/employees', managerController.getEmployeesSortedBySurname.bind(managerController));

/**
 * @swagger
 * /api/manager/employees/cashiers:
 *   get:
 *     summary: Get all cashiers
 *     tags: [Manager]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of cashiers
 */
router.get('/employees/cashiers', managerController.getCashiers.bind(managerController));

/**
 * @swagger
 * /api/manager/employees/contacts/{surname}:
 *   get:
 *     summary: Get employee contacts by surname
 *     tags: [Manager]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: surname
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Employee contacts
 */
router.get('/employees/contacts/:surname', managerController.getEmployeeContacts.bind(managerController));

// Операції з категоріями
/**
 * @swagger
 * /api/manager/categories:
 *   get:
 *     summary: Get all categories sorted by name
 *     tags: [Manager]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 */
router.get('/categories', managerController.getAllCategoriesSortedByName.bind(managerController));

/**
 * @swagger
 * /api/manager/categories:
 *   post:
 *     summary: Add new category
 *     tags: [Manager]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Category'
 *     responses:
 *       201:
 *         description: Category created successfully
 */
router.post('/categories', validateCategory, managerController.addCategory.bind(managerController));

/**
 * @swagger
 * /api/manager/categories/{category_number}:
 *   put:
 *     summary: Update category
 *     tags: [Manager]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: category_number
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Category'
 *     responses:
 *       200:
 *         description: Category updated successfully
 */
router.put('/categories/:category_number', validateCategory, managerController.updateCategory.bind(managerController));

/**
 * @swagger
 * /api/manager/categories/{category_number}:
 *   delete:
 *     summary: Delete category
 *     tags: [Manager]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: category_number
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Category deleted successfully
 */
router.delete('/categories/:category_number', managerController.deleteCategory.bind(managerController));

// Операції з товарами
/**
 * @swagger
 * /api/manager/products:
 *   get:
 *     summary: Get all products sorted by name
 *     tags: [Manager]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of products
 */
router.get('/products', managerController.getAllProductsSortedByName.bind(managerController));

/**
 * @swagger
 * /api/manager/products/category/{category_number}:
 *   get:
 *     summary: Get products by category
 *     tags: [Manager]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: category_number
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of products in category
 */
router.get('/products/category/:category_number', managerController.getProductsByCategory.bind(managerController));

/**
 * @swagger
 * /api/manager/products:
 *   post:
 *     summary: Add new product
 *     tags: [Manager]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Product created successfully
 */
router.post('/products', validateProduct, managerController.addProduct.bind(managerController));

/**
 * @swagger
 * /api/manager/products/{id_product}:
 *   put:
 *     summary: Update product
 *     tags: [Manager]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_product
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Product updated successfully
 */
router.put('/products/:id_product', validateProduct, managerController.updateProduct.bind(managerController));

/**
 * @swagger
 * /api/manager/products/{id_product}:
 *   delete:
 *     summary: Delete product
 *     tags: [Manager]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_product
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Product deleted successfully
 */
router.delete('/products/:id_product', managerController.deleteProduct.bind(managerController));

// Операції з товарами в магазині
/**
 * @swagger
 * /api/manager/store-products:
 *   get:
 *     summary: Get all store products sorted by quantity
 *     tags: [Manager]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of store products
 */
router.get('/store-products', managerController.getAllStoreProductsSortedByQuantity.bind(managerController));

/**
 * @swagger
 * /api/manager/store-products/promotional:
 *   get:
 *     summary: Get promotional products
 *     tags: [Manager]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of promotional products
 */
router.get('/store-products/promotional', managerController.getPromotionalProducts.bind(managerController));

/**
 * @swagger
 * /api/manager/store-products/non-promotional:
 *   get:
 *     summary: Get non-promotional products
 *     tags: [Manager]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of non-promotional products
 */
router.get('/store-products/non-promotional', managerController.getNonPromotionalProducts.bind(managerController));

/**
 * @swagger
 * /api/manager/store-products/{upc}:
 *   get:
 *     summary: Get store product by UPC
 *     tags: [Manager]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: upc
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Store product details
 */
router.get('/store-products/:upc', managerController.getStoreProductByUPC.bind(managerController));

/**
 * @swagger
 * /api/manager/store-products:
 *   post:
 *     summary: Add new store product
 *     tags: [Manager]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StoreProduct'
 *     responses:
 *       201:
 *         description: Store product created successfully
 */
router.post('/store-products', validateStoreProduct, managerController.addStoreProduct.bind(managerController));

/**
 * @swagger
 * /api/manager/store-products/{upc}:
 *   put:
 *     summary: Update store product
 *     tags: [Manager]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: upc
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StoreProduct'
 *     responses:
 *       200:
 *         description: Store product updated successfully
 */
router.put('/store-products/:upc', validateStoreProduct, managerController.updateStoreProduct.bind(managerController));

/**
 * @swagger
 * /api/manager/store-products/{upc}:
 *   delete:
 *     summary: Delete store product
 *     tags: [Manager]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: upc
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Store product deleted successfully
 */
router.delete('/store-products/:upc', managerController.deleteStoreProduct.bind(managerController));

// Операції з клієнтськими картками
/**
 * @swagger
 * /api/manager/customer-cards:
 *   get:
 *     summary: Get all customers sorted by surname
 *     tags: [Manager]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of customer cards
 */
router.get('/customer-cards', managerController.getAllCustomersSortedBySurname.bind(managerController));

/**
 * @swagger
 * /api/manager/customer-cards/percent/{percent}:
 *   get:
 *     summary: Get customers by percent
 *     tags: [Manager]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: percent
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of customers with specified percent
 */
router.get('/customer-cards/percent/:percent', managerController.getCustomersByPercent.bind(managerController));

/**
 * @swagger
 * /api/manager/customer-cards:
 *   post:
 *     summary: Add new customer card
 *     tags: [Manager]
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
router.post('/customer-cards', validateCustomerCard, managerController.addCustomerCard.bind(managerController));

/**
 * @swagger
 * /api/manager/customer-cards/{card_number}:
 *   put:
 *     summary: Update customer card
 *     tags: [Manager]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: card_number
 *         required: true
 *         schema:
 *           type: string
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
router.put('/customer-cards/:card_number', validateCustomerCard, managerController.updateCustomerCard.bind(managerController));

/**
 * @swagger
 * /api/manager/customer-cards/{card_number}:
 *   delete:
 *     summary: Delete customer card
 *     tags: [Manager]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: card_number
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Customer card deleted successfully
 */
router.delete('/customer-cards/:card_number', managerController.deleteCustomerCard.bind(managerController));

// Операції з чеками
/**
 * @swagger
 * /api/manager/checks/{check_number}:
 *   delete:
 *     summary: Delete check
 *     tags: [Manager]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: check_number
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Check deleted successfully
 */
router.delete('/checks/:check_number', managerController.deleteCheck.bind(managerController));

// Звіти
/**
 * @swagger
 * /api/manager/reports/employee-performance/{id_employee}:
 *   get:
 *     summary: Get employee performance report
 *     tags: [Manager]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_employee
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Employee performance report
 */
router.get('/reports/employee-performance/:id_employee', managerController.getEmployeePerformance.bind(managerController));

/**
 * @swagger
 * /api/manager/reports/checks:
 *   get:
 *     summary: Get checks by period
 *     tags: [Manager]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *     responses:
 *       200:
 *         description: Checks report for period
 */
router.get('/reports/checks', managerController.getChecksByPeriod.bind(managerController));

/**
 * @swagger
 * /api/manager/reports/checks/employee/{id_employee}:
 *   get:
 *     summary: Get checks by employee
 *     tags: [Manager]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_employee
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Employee checks report
 */
router.get('/reports/checks/employee/:id_employee', managerController.getChecksByEmployee.bind(managerController));

/**
 * @swagger
 * /api/manager/reports/checks/total:
 *   get:
 *     summary: Get total sales
 *     tags: [Manager]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Total sales report
 */
router.get('/reports/checks/total', managerController.getTotalSales.bind(managerController));

/**
 * @swagger
 * /api/manager/reports/product-sales:
 *   get:
 *     summary: Get product sales statistics
 *     tags: [Manager]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: upc
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Product sales statistics
 */
router.get('/reports/product-sales', managerController.getProductSalesStats.bind(managerController));

export default router; 