const request = require('supertest');
const { app } = require('./index');

describe('API Endpoints', () => {
  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/api/health');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
      expect(response.body.message).toBe('Server is running');
    });
  });

  describe('GET /api/', () => {
    it('should return welcome message', async () => {
      const response = await request(app).get('/api/');
      expect(response.status).toBe(200);
      expect(response.body.message).toContain('Practice API');
    });
  });

  describe('GET /', () => {
    it('should return welcome message with backend URL', async () => {
      const response = await request(app).get('/');
      expect(response.status).toBe(200);
      expect(response.body.message).toContain('Practice API');
      expect(response.body.apiBase).toBeDefined();
    });
  });

  describe('GET /api/add', () => {
    it('should add two numbers', async () => {
      const response = await request(app).get('/api/add?a=5&b=3');
      expect(response.status).toBe(200);
      expect(response.body.result).toBe(8);
    });

    it('should return 400 for invalid parameters', async () => {
      const response = await request(app).get('/api/add?a=abc&b=3');
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid parameters');
    });
  });

  describe('GET /api/socket-info', () => {
    it('should return socket endpoint information', async () => {
      const response = await request(app).get('/api/socket-info');
      expect(response.status).toBe(200);
      expect(response.body.socketPath).toBe('/api/socket.io');
      expect(response.body.socketUrl).toContain('/api/socket.io');
      expect(response.body.transports).toContain('websocket');
      expect(response.body.transports).toContain('polling');
    });
  });

  describe('OPTIONS /api/*', () => {
    it('should handle CORS preflight requests', async () => {
      const response = await request(app).options('/api/health');
      expect(response.status).toBe(200);
    });
  });
});
