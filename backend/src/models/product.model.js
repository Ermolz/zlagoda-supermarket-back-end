export class Product {
    constructor({
        id_product,
        category_number,
        product_name,
        producer,
        characteristics
    }) {
        this.id_product = id_product;
        this.category_number = category_number;
        this.product_name = product_name;
        this.producer = producer;
        this.characteristics = characteristics;
    }

    validate() {
        if (!this.id_product || !this.category_number || !this.product_name ||
            !this.producer || !this.characteristics) {
            throw new Error('Missing required fields');
        }

        if (typeof this.id_product !== 'number') {
            throw new Error('Product ID must be a number');
        }

        if (typeof this.category_number !== 'number') {
            throw new Error('Category number must be a number');
        }

        if (this.product_name.length > 50) {
            throw new Error('Product name is too long');
        }

        if (this.producer.length > 50) {
            throw new Error('Producer name is too long');
        }

        if (this.characteristics.length > 100) {
            throw new Error('Characteristics text is too long');
        }

        return true;
    }
} 