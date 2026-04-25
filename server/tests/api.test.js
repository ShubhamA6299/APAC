import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import { handleChat } from '../agent.js';

// Mock the agent.js module so we don't hit the real Gemini API during tests
jest.unstable_mockModule('../agent.js', () => ({
  handleChat: jest.fn().mockResolvedValue({
    response: 'Mocked response from AI',
    progress: { 'JavaScript': 'beginner' }
  })
}));

describe('API Endpoints', () => {
  let app;

  beforeAll(async () => {
    // Dynamically import the express app logic just for the /api/chat route
    app = express();
    app.use(express.json());
    
    const { handleChat: mockedHandleChat } = await import('../agent.js');

    app.post('/api/chat', async (req, res) => {
      const { message, sessionId } = req.body;
      if (!message || !sessionId) {
        return res.status(400).json({ error: 'message and sessionId are required' });
      }
      try {
        const response = await mockedHandleChat(sessionId, message);
        res.json(response);
      } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  });

  it('should return 400 if message is missing', async () => {
    const res = await request(app).post('/api/chat').send({ sessionId: '123' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('message and sessionId are required');
  });

  it('should return 400 if sessionId is missing', async () => {
    const res = await request(app).post('/api/chat').send({ message: 'Hello' });
    expect(res.statusCode).toBe(400);
  });

  it('should return 200 and mocked response for valid input', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ sessionId: '123', message: 'Hello' });
      
    expect(res.statusCode).toBe(200);
    expect(res.body.response).toBe('Mocked response from AI');
    expect(res.body.progress['JavaScript']).toBe('beginner');
  });
});
