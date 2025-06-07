export class AccessControl {
    static ROLES = {
        MANAGER: 'manager',
        CASHIER: 'cashier'
    };

    static PERMISSIONS = {
        manager: {
            employee: ['create', 'read', 'update', 'delete'],
            category: ['create', 'read', 'update', 'delete'],
            product: ['create', 'read', 'update', 'delete'],
            store_in_product: ['create', 'read', 'update', 'delete'],
            customer_card: ['create', 'read', 'update', 'delete'],
            check: ['read'],
            sale: ['read']
        },
        cashier: {
            customer_card: ['create', 'read', 'update'],
            check: ['create', 'read'],
            sale: ['create', 'read'],
            product: ['read'],
            store_in_product: ['read'],
            category: ['read']
        }
    };

    static can(role, action, resource) {
        if (!role || !action || !resource) {
            return false;
        }

        const rolePermissions = this.PERMISSIONS[role];
        if (!rolePermissions) {
            return false;
        }

        const resourcePermissions = rolePermissions[resource];
        if (!resourcePermissions) {
            return false;
        }

        return resourcePermissions.includes(action);
    }

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