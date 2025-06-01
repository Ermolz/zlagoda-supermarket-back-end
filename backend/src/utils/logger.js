import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

const logToFile = (message) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    fs.appendFileSync(path.join(logDir, 'app.log'), logMessage);
    console.log(logMessage.trim());
};

const requestLogger = (req, res, next) => {
    const start = Date.now();
    
    logToFile(`${req.method} ${req.originalUrl}`);
    
    if (Object.keys(req.body).length > 0) {
        logToFile(`Request Body: ${JSON.stringify(req.body)}`);
    }
    
    if (Object.keys(req.query).length > 0) {
        logToFile(`Query Params: ${JSON.stringify(req.query)}`);
    }

    const originalJson = res.json;
    res.json = function(body) {
        const responseTime = Date.now() - start;
        logToFile(`Response Status: ${res.statusCode} Time: ${responseTime}ms`);
        logToFile(`Response Body: ${JSON.stringify(body)}`);
        return originalJson.call(this, body);
    };

    next();
};

export { logToFile, requestLogger };
