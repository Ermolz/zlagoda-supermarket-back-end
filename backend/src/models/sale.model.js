export class Sale {
    constructor({
        UPC,
        check_number,
        product_number,
        selling_price
    }) {
        this.UPC = UPC;
        this.check_number = check_number;
        this.product_number = product_number;
        this.selling_price = selling_price;
    }

    validate() {
        if (!this.UPC || !this.check_number || 
            this.product_number === undefined || 
            this.selling_price === undefined) {
            throw new Error('Missing required fields');
        }

        if (this.UPC.length > 12) {
            throw new Error('UPC is too long');
        }

        if (this.check_number.length > 10) {
            throw new Error('Check number is too long');
        }

        if (this.product_number <= 0) {
            throw new Error('Product number must be positive');
        }

        if (this.selling_price < 0) {
            throw new Error('Selling price cannot be negative');
        }

        return true;
    }
} 