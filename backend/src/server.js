const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const path = require('path');

// Import routes
const reportsRoutes = require('./routes/reports');

// Import middleware (with fallbacks if files don't exist)
let authMiddleware, errorHandler, logger, rateLimiter;

try {
  const authModule = require('./middleware/auth');
  authMiddleware = authModule.authenticateToken;
} catch (e) {
  authMiddleware = (req, res, next) => next();
}

try {
  errorHandler = require('./middleware/errorHandler');
} catch (e) {
  errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
  };
}

try {
  const loggerModule = require('./middleware/logger');
  logger = loggerModule.developmentLogger;
} catch (e) {
  logger = (req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  };
}

try {
  const rateLimiterModule = require('./middleware/rateLimiter');
  rateLimiter = rateLimiterModule.apiLimiter;
} catch (e) {
  rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  });
}

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:8080', 'http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(compression());

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: process.env.MAX_REQUEST_SIZE || '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Global middleware
app.use(logger);

// Rate limiting for API routes
app.use('/api', rateLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API routes
app.use('/api/reports', reportsRoutes);

// Protected routes (require authentication)
app.use('/api/protected', authMiddleware);

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // Send initial connection confirmation
  socket.emit('connected', {
    message: 'Connected to React OAS Integration Server',
    timestamp: new Date().toISOString(),
    clientId: socket.id,
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });

  // Handle real-time dashboard data requests
  socket.on('requestDashboardData', () => {
    socket.emit('dashboardData', generateDashboardData());
  });
});

// Generate real-time dashboard data
function generateDashboardData() {
  return {
    timestamp: new Date().toISOString(),
    metrics: {
      activeUsers: Math.floor(Math.random() * 1000) + 100,
      totalRequests: Math.floor(Math.random() * 10000) + 5000,
      responseTime: Math.floor(Math.random() * 200) + 50,
      errorRate: Math.random() * 5,
      systemLoad: Math.random() * 100,
      memoryUsage: Math.random() * 80 + 20,
      diskUsage: Math.random() * 60 + 30,
      networkIO: Math.random() * 1000 + 200,
    },
    activities: [
      {
        id: Date.now(),
        type: 'user_connection',
        message: 'New user connected from Vietnam',
        timestamp: new Date().toISOString(),
        badge: '+1',
        badgeType: 'success',
      },
      {
        id: Date.now() - 1000,
        type: 'sync_complete',
        message: 'Google Sheets sync completed',
        timestamp: new Date(Date.now() - 30000).toISOString(),
        badge: '✓',
        badgeType: 'info',
      },
    ],
  };
}

// Broadcast real-time data every 2 seconds
setInterval(() => {
  io.emit('dashboardUpdate', generateDashboardData());
}, 2000);

// Error handling middleware (must be last)
if (errorHandler && typeof errorHandler === 'function') {
  app.use(errorHandler);
} else {
  // Default error handler
  app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    });
  });
}

// Static file serving (for production)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../build')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../build', 'index.html'));
  });
}

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📡 WebSocket server ready for real-time connections`);
  console.log(`📊 Broadcasting dashboard updates every 2 seconds`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
  });
});

module.exports = { app, server, io };
