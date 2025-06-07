class PriceService {
    // TODO: Implement VAT calculation (20% of total sum)
    // Formula: VAT = total_sum * 0.2
    calculateVAT(totalSum) {
        throw new Error('Not implemented');
    }

    // TODO: Implement promotional price calculation (80% of regular price)
    // Formula: promotional_price = regular_price * 0.8
    calculatePromotionalPrice(regularPrice) {
        throw new Error('Not implemented');
    }

    // TODO: Implement customer card discount calculation
    // Apply customer's percent discount to the total sum
    // Formula: discounted_price = total_sum * (1 - discount_percentage/100)
    calculateCustomerDiscount(totalSum, discountPercentage) {
        throw new Error('Not implemented');
    }

    // TODO: Implement product price recalculation for new batch
    // When new batch arrives, recalculate price for all existing items
    // Formula: new_price = newBatchPrice (according to requirements)
    recalculatePrice(currentPrice, newBatchPrice, currentQuantity, newBatchQuantity) {
        throw new Error('Not implemented');
    }
}

export default new PriceService(); 