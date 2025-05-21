export class ApiError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

// Global error handler middleware
export function errorHandler(err, req, res, next) {
    console.error('API Error:', err);

    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';

    res.status(status).json({ status, message });
}