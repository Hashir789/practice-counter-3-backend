const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const BACKEND_URL = process.env.BACKEND_URL || 'http://d1tdizimiz2qsf.cloudfront.net';
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 3000;

app.use(express.json());

// API routes prefix
const apiRouter = express.Router();

// Health check endpoint
apiRouter.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running', backendUrl: BACKEND_URL });
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

// Root endpoint (for backward compatibility)
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Practice API', backendUrl: BACKEND_URL, apiBase: `${BACKEND_URL}/api` });
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
    console.log('Socket.io is ready for connections');
  });
}

module.exports = { app, server, io };
