export class Session {
    constructor({
        id,
        employee_id,
        expires_at,
        created_at,
        updated_at
    }) {
        this.id = id;
        this.employee_id = employee_id;
        this.expires_at = expires_at;
        this.created_at = created_at || new Date();
        this.updated_at = updated_at || new Date();
    }

    validate() {
        if (!this.employee_id || !this.expires_at) {
            throw new Error('Missing required fields');
        }

        if (this.employee_id.length > 10) {
            throw new Error('Employee ID is too long');
        }

        if (!(this.expires_at instanceof Date) && !Date.parse(this.expires_at)) {
            throw new Error('Invalid expires_at date');
        }

        if (new Date(this.expires_at) <= new Date()) {
            throw new Error('Expiration date must be in the future');
        }

        return true;
    }

    isExpired() {
        return new Date() >= new Date(this.expires_at);
    }
} 