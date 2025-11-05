const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Simple greeting endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Kitaab Backend API' });
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

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
