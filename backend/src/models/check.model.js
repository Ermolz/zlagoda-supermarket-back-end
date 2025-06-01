export class Check {
    constructor({
        check_number,
        id_employee,
        card_number,
        print_date,
        sum_total,
        vat
    }) {
        this.check_number = check_number;
        this.id_employee = id_employee;
        this.card_number = card_number;
        this.print_date = print_date;
        this.sum_total = sum_total;
        this.vat = vat;
    }

    validate() {
        if (!this.check_number || !this.id_employee || !this.print_date ||
            this.sum_total === undefined || this.vat === undefined) {
            throw new Error('Missing required fields');
        }

        if (this.check_number.length > 10) {
            throw new Error('Check number is too long');
        }

        if (this.id_employee.length > 10) {
            throw new Error('Employee ID is too long');
        }

        if (this.card_number && this.card_number.length > 13) {
            throw new Error('Card number is too long');
        }

        if (this.sum_total < 0) {
            throw new Error('Sum total cannot be negative');
        }

        if (this.vat < 0) {
            throw new Error('VAT cannot be negative');
        }

        return true;
    }
} 