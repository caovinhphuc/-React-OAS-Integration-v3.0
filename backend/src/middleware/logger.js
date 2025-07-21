const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logDir = 'logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Create a write stream for access logs
const accessLogStream = fs.createWriteStream(
  path.join(logDir, 'access.log'),
  { flags: 'a' }
);

// Custom token for user ID
morgan.token('user-id', (req) => {
  return req.user ? req.user.id : 'anonymous';
});

// Custom token for request ID
morgan.token('request-id', (req) => {
  return req.requestId || 'unknown';
});

// Custom format
const customFormat = ':remote-addr - :user-id [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :request-id :response-time ms';

// Request ID middleware
const requestId = (req, res, next) => {
  req.requestId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
  res.set('X-Request-ID', req.requestId);
  next();
};

// Logger configurations
const developmentLogger = morgan('dev');
const productionLogger = morgan(customFormat, { stream: accessLogStream });

module.exports = {
  requestId,
  developmentLogger,
  productionLogger,
  accessLogStream
};
