class PriceService {
    // TODO: Implement VAT calculation (20% of total sum)
    // Formula: VAT = total_sum * 0.2
    calculateVAT(totalSum) {
        if (typeof totalSum !== 'number' || totalSum < 0) {
            throw new Error('Total sum must be a non-negative number');
        }
        return totalSum * 0.2;
    }

    // TODO: Implement promotional price calculation (80% of regular price)
    // Formula: promotional_price = regular_price * 0.8
    calculatePromotionalPrice(regularPrice) {
        if (typeof regularPrice !== 'number' || regularPrice < 0) {
            throw new Error('Regular price must be a non-negative number');
        }
        return regularPrice * 0.8;
    }

    // TODO: Implement customer card discount calculation
    // Apply customer's percent discount to the total sum
    // Formula: discounted_price = total_sum * (1 - discount_percentage/100)
    calculateCustomerDiscount(totalSum, discountPercentage) {
        if (typeof totalSum !== 'number' || totalSum < 0) {
            throw new Error('Total sum must be a non-negative number');
        }
        if (typeof discountPercentage !== 'number' || discountPercentage < 0 || discountPercentage > 100) {
            throw new Error('Discount percentage must be between 0 and 100');
        }
        return totalSum * (1 - discountPercentage / 100);
    }

    // TODO: Implement product price recalculation for new batch
    // When new batch arrives, recalculate price for all existing items
    // Formula: new_price = newBatchPrice (according to requirements)
    recalculatePrice(currentPrice, newBatchPrice, currentQuantity, newBatchQuantity) {
        if (typeof currentPrice !== 'number' || currentPrice < 0) {
            throw new Error('Current price must be a non-negative number');
        }
        if (typeof newBatchPrice !== 'number' || newBatchPrice < 0) {
            throw new Error('New batch price must be a non-negative number');
        }
        if (typeof currentQuantity !== 'number' || currentQuantity < 0) {
            throw new Error('Current quantity must be a non-negative number');
        }
        if (typeof newBatchQuantity !== 'number' || newBatchQuantity < 0) {
            throw new Error('New batch quantity must be a non-negative number');
        }

        // According to requirements, we just use the new batch price
        return newBatchPrice;
    }
}

export default new PriceService(); 