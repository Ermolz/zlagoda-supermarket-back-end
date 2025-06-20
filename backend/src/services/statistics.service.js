import { StatisticsRepository } from '../repositories/statistics.repository.js';
import { logger } from '../utils/logger.js';

export class StatisticsService {
    constructor() {
        this.statisticsRepository = new StatisticsRepository();
    }

    // Ermol's methods
    async getCustomerPurchasesByCity(cityName) {
        return this.statisticsRepository.getCustomerPurchasesByCity(cityName);
    }

    async getCashiersWithoutAuth() {
        return this.statisticsRepository.getCashiersWithoutAuth();
    }

    // Zahorui's methods
    async getCategorySalesByEmployeeAndDate(employeeId, startDate, endDate) {
        return this.statisticsRepository.getCategorySalesByEmployeeAndDate(employeeId, startDate, endDate);
    }

    async getCustomersOnlyBeverages() {
        return this.statisticsRepository.getCustomersOnlyBeverages();
    }

    // Kostenko's methods
    async getCustomerStatsByCity(cityName) {
        return this.statisticsRepository.getCustomerStatsByCity(cityName);
    }

    async getCustomersWithoutManagerAndDairy() {
        return this.statisticsRepository.getCustomersWithoutManagerAndDairy();
    }

    async getTotalSalesByCashierAndPeriod(employeeId, startDate, endDate) {
        return this.statisticsRepository.getTotalSalesByCashierAndPeriod(employeeId, startDate, endDate);
    }

    async getTotalSalesAllCashiersByPeriod(startDate, endDate) {
        return this.statisticsRepository.getTotalSalesAllCashiersByPeriod(startDate, endDate);
    }

    async getTotalProductQuantityByPeriod(productId, startDate, endDate) {
        return this.statisticsRepository.getTotalProductQuantityByPeriod(productId, startDate, endDate);
    }
} 