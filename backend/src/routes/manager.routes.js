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

const router = Router();
const managerController = new ManagerController();

// Middleware
router.use(authMiddleware);
router.use(roleMiddleware(['manager']));

// CRUD операції для працівників
router.post('/employees', validateEmployee, managerController.addEmployee.bind(managerController));
router.put('/employees/:id_employee', validateEmployee, managerController.updateEmployee.bind(managerController));
router.delete('/employees/:id_employee', managerController.deleteEmployee.bind(managerController));
router.get('/employees', managerController.getEmployeesSortedBySurname.bind(managerController));
router.get('/employees/cashiers', managerController.getCashiers.bind(managerController));
router.get('/employees/contacts/:surname', managerController.getEmployeeContacts.bind(managerController));

// Операції з категоріями
router.get('/categories', managerController.getAllCategoriesSortedByName.bind(managerController));
router.post('/categories', validateCategory, managerController.addCategory.bind(managerController));
router.put('/categories/:category_number', validateCategory, managerController.updateCategory.bind(managerController));
router.delete('/categories/:category_number', managerController.deleteCategory.bind(managerController));

// Операції з товарами
router.get('/products', managerController.getAllProductsSortedByName.bind(managerController));
router.get('/products/category/:category_number', managerController.getProductsByCategory.bind(managerController));
router.post('/products', validateProduct, managerController.addProduct.bind(managerController));
router.put('/products/:id_product', validateProduct, managerController.updateProduct.bind(managerController));
router.delete('/products/:id_product', managerController.deleteProduct.bind(managerController));

// Операції з товарами в магазині
router.get('/store-products', managerController.getAllStoreProductsSortedByQuantity.bind(managerController));
router.get('/store-products/promotional', managerController.getPromotionalProducts.bind(managerController));
router.get('/store-products/:upc', managerController.getStoreProductByUPC.bind(managerController));
router.post('/store-products', validateStoreProduct, managerController.addStoreProduct.bind(managerController));
router.put('/store-products/:upc', validateStoreProduct, managerController.updateStoreProduct.bind(managerController));
router.delete('/store-products/:upc', managerController.deleteStoreProduct.bind(managerController));

// Операції з клієнтськими картками
router.get('/customer-cards', managerController.getAllCustomersSortedBySurname.bind(managerController));
router.get('/customer-cards/percent/:percent', managerController.getCustomersByPercent.bind(managerController));
router.post('/customer-cards', validateCustomerCard, managerController.addCustomerCard.bind(managerController));
router.put('/customer-cards/:card_number', validateCustomerCard, managerController.updateCustomerCard.bind(managerController));
router.delete('/customer-cards/:card_number', managerController.deleteCustomerCard.bind(managerController));

// Операції з чеками
router.delete('/checks/:check_number', managerController.deleteCheck.bind(managerController));

// Звіти
router.get('/reports/employee-performance/:id_employee', managerController.getEmployeePerformance.bind(managerController));
router.get('/reports/checks', managerController.getChecksByPeriod.bind(managerController));
router.get('/reports/checks/employee/:id_employee', managerController.getChecksByEmployee.bind(managerController));
router.get('/reports/checks/total', managerController.getTotalSales.bind(managerController));
router.get('/reports/product-sales', managerController.getProductSalesStats.bind(managerController));

export default router; 