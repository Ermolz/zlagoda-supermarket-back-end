export class EmployeeAuth {
    constructor({
        id_employee,
        email,
        password,
        created_at,
        updated_at
    }) {
        this.id_employee = id_employee;
        this.email = email;
        this.password = password;
        this.created_at = created_at || new Date();
        this.updated_at = updated_at || new Date();
    }

    validate() {
        if (!this.id_employee || !this.email || !this.password) {
            throw new Error('Missing required fields');
        }

        if (this.id_employee.length > 10) {
            throw new Error('Employee ID is too long');
        }

        if (this.email.length > 255) {
            throw new Error('Email is too long');
        }

        if (!this.validateEmail(this.email)) {
            throw new Error('Invalid email format');
        }

        if (this.password.length > 255) {
            throw new Error('Password is too long');
        }

        return true;
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
} 