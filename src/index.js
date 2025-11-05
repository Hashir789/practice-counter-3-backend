const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 3000;

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Simple greeting endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Practice API' });
});

// Simple math endpoint for testing
app.get('/api/add', (req, res) => {
  const { a, b } = req.query;
  const numA = parseFloat(a);
  const numB = parseFloat(b);

  if (isNaN(numA) || isNaN(numB)) {
    return res.status(400).json({ error: 'Invalid parameters' });
  }

  const result = numA + numB;
  res.json({ result });
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
