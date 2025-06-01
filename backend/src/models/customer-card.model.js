export class CustomerCard {
    constructor({
        card_number,
        cust_surname,
        cust_name,
        cust_patronymic,
        phone_number,
        city,
        street,
        zip_code,
        percent
    }) {
        this.card_number = card_number;
        this.cust_surname = cust_surname;
        this.cust_name = cust_name;
        this.cust_patronymic = cust_patronymic;
        this.phone_number = phone_number;
        this.city = city;
        this.street = street;
        this.zip_code = zip_code;
        this.percent = percent;
    }

    validate() {
        if (!this.card_number || !this.cust_surname || !this.cust_name ||
            !this.phone_number || this.percent === undefined) {
            throw new Error('Missing required fields');
        }

        if (this.card_number.length > 13) {
            throw new Error('Card number is too long');
        }

        if (this.cust_surname.length > 50) {
            throw new Error('Customer surname is too long');
        }

        if (this.cust_name.length > 50) {
            throw new Error('Customer name is too long');
        }

        if (this.cust_patronymic && this.cust_patronymic.length > 50) {
            throw new Error('Customer patronymic is too long');
        }

        if (this.phone_number.length > 13) {
            throw new Error('Phone number is too long');
        }

        if (this.city && this.city.length > 50) {
            throw new Error('City name is too long');
        }

        if (this.street && this.street.length > 50) {
            throw new Error('Street name is too long');
        }

        if (this.zip_code && this.zip_code.length > 9) {
            throw new Error('ZIP code is too long');
        }

        if (this.percent < 0 || this.percent > 100) {
            throw new Error('Percent must be between 0 and 100');
        }

        return true;
    }
} 