const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../build')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Backend server is running',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// API Routes
app.get('/api/status', (req, res) => {
  res.json({
    service: 'React OAS Backend',
    version: '3.0',
    status: 'operational',
    uptime: process.uptime()
  });
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Send welcome message
  socket.emit('welcome', {
    message: 'Connected to React OAS Backend',
    timestamp: new Date().toISOString()
  });

  // Handle real-time data requests
  socket.on('request_data', (data) => {
    console.log('Data request received:', data);

    // Simulate real-time data
    const mockData = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      value: Math.random() * 100,
      status: 'active'
    };

    socket.emit('data_update', mockData);
  });

  // Handle AI analytics requests
  socket.on('ai_analysis', (data) => {
    console.log('AI analysis request:', data);

    // Simulate AI processing
    setTimeout(() => {
      const aiResult = {
        id: Date.now(),
        prediction: Math.random() * 100,
        confidence: Math.random(),
        timestamp: new Date().toISOString(),
        analysis: 'AI analysis completed'
      };

      socket.emit('ai_result', aiResult);
    }, 1000);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Serve React app for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'));
});

server.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 WebSocket server ready for connections`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});
