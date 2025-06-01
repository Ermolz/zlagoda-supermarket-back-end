export class Employee {
    constructor({
        id_employee,
        empl_surname,
        empl_name,
        empl_patronymic,
        empl_role,
        salary,
        date_of_birth,
        date_of_start,
        phone_number,
        city,
        street,
        zip_code
    }) {
        this.id_employee = id_employee;
        this.empl_surname = empl_surname;
        this.empl_name = empl_name;
        this.empl_patronymic = empl_patronymic;
        this.empl_role = empl_role;
        this.salary = salary;
        this.date_of_birth = date_of_birth;
        this.date_of_start = date_of_start;
        this.phone_number = phone_number;
        this.city = city;
        this.street = street;
        this.zip_code = zip_code;
    }

    validate() {
        if (!this.id_employee || !this.empl_surname || !this.empl_name || !this.empl_role ||
            !this.salary || !this.date_of_birth || !this.date_of_start || !this.phone_number ||
            !this.city || !this.street || !this.zip_code) {
            throw new Error('Missing required fields');
        }

        if (!['manager', 'cashier'].includes(this.empl_role)) {
            throw new Error('Invalid employee role');
        }

        if (this.salary < 0) {
            throw new Error('Salary cannot be negative');
        }

        if (this.phone_number.length > 13) {
            throw new Error('Phone number is too long');
        }

        return true;
    }
}
