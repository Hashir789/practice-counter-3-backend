const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const BACKEND_URL =
  process.env.BACKEND_URL || 'http://d1tdizimiz2qsf.cloudfront.net';

// Configure Socket.io for CloudFront WebSocket support
// CloudFront requires the path to be accessible (e.g., /api/socket.io)
const io = new Server(server, {
  path: '/api/socket.io',
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
  },
  transports: ['websocket', 'polling'], // Support both WebSocket and polling fallback
  allowEIO3: true, // Allow Engine.IO v3 clients for compatibility
});

const PORT = process.env.PORT || 3000;

app.use(express.json());

// CORS middleware for CloudFront compatibility
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// API routes prefix
const apiRouter = express.Router();

// Health check endpoint
apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Server is running',
    backendUrl: BACKEND_URL,
  });
});

// Simple greeting endpoint
apiRouter.get('/', (req, res) => {
  res.json({ message: 'Welcome to Practice API', backendUrl: BACKEND_URL });
});

// Simple math endpoint for testing
apiRouter.get('/add', (req, res) => {
  const { a, b } = req.query;
  const numA = parseFloat(a);
  const numB = parseFloat(b);

  if (isNaN(numA) || isNaN(numB)) {
    return res.status(400).json({ error: 'Invalid parameters' });
  }

  const result = numA + numB;
  res.json({ result });
});

// Mount API router at /api
app.use('/api', apiRouter);

// Socket.io endpoint info
apiRouter.get('/socket-info', (req, res) => {
  res.json({
    socketPath: '/api/socket.io',
    socketUrl: `${BACKEND_URL}/api/socket.io`,
    transports: ['websocket', 'polling'],
    message: 'WebSocket endpoint available at /api/socket.io',
  });
});

// Root endpoint (for backward compatibility)
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Practice API',
    backendUrl: BACKEND_URL,
    apiBase: `${BACKEND_URL}/api`,
    socketUrl: `${BACKEND_URL}/api/socket.io`,
  });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Send welcome message to client
  socket.emit('welcome', {
    message: 'Welcome to the server!',
    socketId: socket.id,
  });

  // Handle custom events
  socket.on('message', (data) => {
    console.log('Received message:', data);
    // Echo the message back to the client
    socket.emit('message', { ...data, received: true });
  });

  // Broadcast message to all connected clients
  socket.on('broadcast', (data) => {
    console.log('Broadcasting message:', data);
    io.emit('broadcast', { ...data, from: socket.id });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`API endpoints available at: ${BACKEND_URL}/api`);
    console.log(
      `WebSocket endpoint available at: ${BACKEND_URL}/api/socket.io`
    );
    console.log('Socket.io is ready for connections');
  });
}

module.exports = { app, server, io };
