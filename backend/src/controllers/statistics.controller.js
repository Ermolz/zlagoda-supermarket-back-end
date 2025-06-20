import { StatisticsService } from '../services/statistics.service.js';
import { logger } from '../utils/logger.js';

export class StatisticsController {
    constructor() {
        this.statisticsService = new StatisticsService();
    }

    // Ermol's endpoints
    async getCustomerPurchasesByCity(req, res, next) {
        try {
            const { city } = req.params;
            const result = await this.statisticsService.getCustomerPurchasesByCity(city);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async getCashiersWithoutAuth(req, res, next) {
        try {
            const result = await this.statisticsService.getCashiersWithoutAuth();
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    // Zahorui's endpoints
    async getCategorySalesByEmployeeAndDate(req, res, next) {
        try {
            const { employeeId } = req.params;
            const { startDate, endDate } = req.query;
            const result = await this.statisticsService.getCategorySalesByEmployeeAndDate(
                employeeId,
                startDate,
                endDate
            );
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async getCustomersOnlyBeverages(req, res, next) {
        try {
            const result = await this.statisticsService.getCustomersOnlyBeverages();
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    // Kostenko's endpoints
    async getCustomerStatsByCity(req, res, next) {
        try {
            const { city } = req.params;
            const result = await this.statisticsService.getCustomerStatsByCity(city);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async getCustomersWithoutManagerAndDairy(req, res, next) {
        try {
            const result = await this.statisticsService.getCustomersWithoutManagerAndDairy();
            res.json(result);
        } catch (error) {
            next(error);
        }
    }
} 