const request = require('supertest');
const app = require('../src/app');

describe('Auth API', () => {
  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'admin', password: '123456' });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.code).toBe(200);
      expect(res.body.data.token).toBeDefined();
    });

    it('should reject invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'wrong' });
      
      expect(res.statusCode).toBe(401);
    });
  });
});
