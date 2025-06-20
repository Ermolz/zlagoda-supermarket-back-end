import { Router } from 'express';
import { StatisticsController } from '../controllers/statistics.controller.js';

const router = Router();
const statisticsController = new StatisticsController();

// Ermol's routes
router.get('/customers/city/:city/purchases', statisticsController.getCustomerPurchasesByCity.bind(statisticsController));
router.get('/cashiers/no-auth', statisticsController.getCashiersWithoutAuth.bind(statisticsController));

// Zahorui's routes
router.get('/sales/employee/:employeeId', statisticsController.getCategorySalesByEmployeeAndDate.bind(statisticsController));
router.get('/customers/only-beverages', statisticsController.getCustomersOnlyBeverages.bind(statisticsController));

// Kostenko's routes
router.get('/customers/city/:city/stats', statisticsController.getCustomerStatsByCity.bind(statisticsController));
router.get('/customers/without-manager-and-dairy', statisticsController.getCustomersWithoutManagerAndDairy.bind(statisticsController));

export default router;