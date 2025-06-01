export class Category {
    constructor({
        category_number,
        category_name
    }) {
        this.category_number = category_number;
        this.category_name = category_name;
    }

    validate() {
        if (!this.category_number || !this.category_name) {
            throw new Error('Missing required fields');
        }

        if (typeof this.category_number !== 'number') {
            throw new Error('Category number must be a number');
        }

        if (this.category_name.length > 50) {
            throw new Error('Category name is too long');
        }

        return true;
    }
} 