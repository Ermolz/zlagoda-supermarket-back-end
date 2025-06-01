export class AccessControl {
    static ROLES = {
        MANAGER: 'manager',
        CASHIER: 'cashier'
    };

    static checkAccess(userRole, allowedRoles) {
        if (!userRole || !allowedRoles.includes(userRole)) {
            throw new Error('Access denied');
        }
    }

    static isManager(role) {
        return role === this.ROLES.MANAGER;
    }

    static isCashier(role) {
        return role === this.ROLES.CASHIER;
    }
} 