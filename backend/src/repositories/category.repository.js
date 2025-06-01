import { BaseRepository } from './base.repository.js';
import { AccessControl } from '../utils/access-control.js';

export class CategoryRepository extends BaseRepository {
    constructor() {
        super('category');
        this.idField = 'category_number';
    }

    async create(data, userRole) {
        return super.create(data, userRole);
    }

    async update(id, data, userRole) {
        return super.update(id, data, this.idField, userRole);
    }

    async delete(id, userRole) {
        return super.delete(id, this.idField, userRole);
    }

    async findById(id) {
        return super.findById(id, this.idField);
    }
} 