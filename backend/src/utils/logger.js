import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

const LOG_LEVELS = {
    ERROR: 'ERROR',
    WARN: 'WARN',
    INFO: 'INFO',
    DEBUG: 'DEBUG'
};

const logToFile = (level, message, meta = {}) => {
    const timestamp = new Date().toISOString();
    const logData = {
        timestamp,
        level,
        message,
        ...meta
    };
    
    const logMessage = `[${timestamp}] [${level}] ${message} ${meta && Object.keys(meta).length ? JSON.stringify(meta) : ''}\n`;
    fs.appendFileSync(path.join(logDir, 'app.log'), logMessage);
    
    // Also log to console with color coding
    let consoleLog = logMessage.trim();
    switch (level) {
        case LOG_LEVELS.ERROR:
            console.error('\x1b[31m%s\x1b[0m', consoleLog); // Red
            break;
        case LOG_LEVELS.WARN:
            console.warn('\x1b[33m%s\x1b[0m', consoleLog); // Yellow
            break;
        case LOG_LEVELS.INFO:
            console.log('\x1b[36m%s\x1b[0m', consoleLog); // Cyan
            break;
        case LOG_LEVELS.DEBUG:
            console.log('\x1b[90m%s\x1b[0m', consoleLog); // Gray
            break;
        default:
            console.log(consoleLog);
    }
};

const logger = {
    error: (message, meta = {}) => logToFile(LOG_LEVELS.ERROR, message, meta),
    warn: (message, meta = {}) => logToFile(LOG_LEVELS.WARN, message, meta),
    info: (message, meta = {}) => logToFile(LOG_LEVELS.INFO, message, meta),
    debug: (message, meta = {}) => logToFile(LOG_LEVELS.DEBUG, message, meta)
};

const requestLogger = (req, res, next) => {
    const start = Date.now();
    const requestId = Math.random().toString(36).substring(7);
    
    logger.info(`Incoming ${req.method} ${req.originalUrl}`, {
        requestId,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip
    });
    
    if (req.body && Object.keys(req.body).length > 0) {
        logger.debug('Request Body', {
            requestId,
            body: req.body
        });
    }
    
    if (req.query && Object.keys(req.query).length > 0) {
        logger.debug('Query Params', {
            requestId,
            query: req.query
        });
    }

    const originalJson = res.json;
    res.json = function(body) {
        const responseTime = Date.now() - start;
        logger.info(`Response completed`, {
            requestId,
            statusCode: res.statusCode,
            responseTime: `${responseTime}ms`
        });
        
        logger.debug('Response Body', {
            requestId,
            body
        });
        
        return originalJson.call(this, body);
    };

    // Add error logging
    const originalEnd = res.end;
    res.end = function() {
        if (res.statusCode >= 400) {
            logger.error(`Request failed`, {
                requestId,
                statusCode: res.statusCode,
                method: req.method,
                url: req.originalUrl
            });
        }
        originalEnd.apply(this, arguments);
    };

    next();
};

export { logger, requestLogger };
