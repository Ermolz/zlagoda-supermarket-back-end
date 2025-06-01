import { Router } from 'express';
import { CashierController } from '../controllers/cashier.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleMiddleware } from '../middlewares/role.middleware.js';
import { validateCheck, validateCustomerCard } from '../middlewares/validation.middleware.js';

const router = Router();
const cashierController = new CashierController();

// Middleware
router.use(authMiddleware);
router.use(roleMiddleware(['cashier']));

// 1. Отримати інформацію про усі товари, відсортовані за назвою
router.get('/products', cashierController.getAllProducts.bind(cashierController));

// 2. Отримати інформацію про усі товари у магазині, відсортовані за назвою
router.get('/store-products', cashierController.getAllStoreProducts.bind(cashierController));

// 3. Отримати інформацію про усіх постійних клієнтів, відсортованих за прізвищем
router.get('/customers', cashierController.getAllCustomers.bind(cashierController));

// 4. Здійснити пошук товарів за назвою
router.get('/products/search', cashierController.searchProducts.bind(cashierController));

// 5. Здійснити пошук товарів, що належать певній категорії
router.get('/products/category/:categoryId', cashierController.getProductsByCategory.bind(cashierController));

// 6. Здійснити пошук постійних клієнтів за прізвищем
router.get('/customers/search', cashierController.searchCustomers.bind(cashierController));

// 7. Здійснювати продаж товарів (додавання чеків)
router.post('/checks', validateCheck, cashierController.createCheck.bind(cashierController));

// 8. Додавати/редагувати інформацію про постійних клієнтів
router.post('/customer-cards', validateCustomerCard, cashierController.addCustomerCard.bind(cashierController));
router.put('/customer-cards/:card_number', validateCustomerCard, cashierController.updateCustomerCard.bind(cashierController));

// 9. Переглянути список усіх чеків, що створив касир за цей день
router.get('/checks/today', cashierController.getTodayChecks.bind(cashierController));

// 10. Переглянути список усіх чеків, що створив касир за певний період часу
router.get('/checks', cashierController.getChecksByDateRange.bind(cashierController));

// 11. За номером чеку вивести усю інформацію про даний чек
router.get('/checks/:checkNumber', cashierController.getCheckDetails.bind(cashierController));

// 12. Отримати інформацію про усі акційні товари
router.get('/store-products/promotional', cashierController.getPromotionalProducts.bind(cashierController));

// 13. Отримати інформацію про усі не акційні товари
router.get('/store-products/non-promotional', cashierController.getNonPromotionalProducts.bind(cashierController));

// 14. За UPC-товару знайти ціну продажу товару, кількість наявних одиниць товару
router.get('/store-products/:upc', cashierController.getProductDetailsByUPC.bind(cashierController));

// 15. Можливість отримати усю інформацію про себе
router.get('/profile', cashierController.getCashierInfo.bind(cashierController));

export default router; 