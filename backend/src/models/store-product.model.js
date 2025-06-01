export class StoreProduct {
    constructor({
        UPC,
        UPC_prom,
        id_product,
        selling_price,
        product_number,
        promotional_product
    }) {
        this.UPC = UPC;
        this.UPC_prom = UPC_prom;
        this.id_product = id_product;
        this.selling_price = selling_price;
        this.product_number = product_number;
        this.promotional_product = promotional_product;
    }

    validate() {
        if (!this.UPC || !this.id_product || this.selling_price === undefined ||
            this.product_number === undefined || this.promotional_product === undefined) {
            throw new Error('Missing required fields');
        }

        if (this.UPC.length > 12) {
            throw new Error('UPC is too long');
        }

        if (this.UPC_prom && this.UPC_prom.length > 12) {
            throw new Error('Promotional UPC is too long');
        }

        if (typeof this.id_product !== 'number') {
            throw new Error('Product ID must be a number');
        }

        if (this.selling_price < 0) {
            throw new Error('Selling price cannot be negative');
        }

        if (this.product_number < 0) {
            throw new Error('Product number cannot be negative');
        }

        if (typeof this.promotional_product !== 'boolean') {
            throw new Error('Promotional product must be a boolean');
        }

        return true;
    }
} 