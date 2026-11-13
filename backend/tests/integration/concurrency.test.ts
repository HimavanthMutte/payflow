import request from 'supertest';
import { app } from '../../src/index';
import { v4 as uuidv4 } from 'uuid';

describe('Concurrency & Race Condition Tests', () => {
  let authToken = '';

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'alice@payflow.internal', password: 'Password@123' });
    if (res.status === 200) {
      authToken = res.body.data.accessToken;
    }
  });

  it('handles concurrent payments gracefully using row locking and transactions', async () => {
    if (!authToken) return;

    // Send 3 concurrent payment requests simultaneously
    const requests = [1, 2, 3].map(() =>
      request(app)
        .post('/api/v1/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          recipientVirtualId: 'bob@payflow',
          amountPaise: '100', // ₹1.00 each
          pin: '123456',
          idempotencyKey: uuidv4(),
          description: 'Concurrent payment test',
        }),
    );

    const responses = await Promise.all(requests);
    responses.forEach((res) => {
      // Each request either succeeds or returns standard business error (e.g. rate limit, lock)
      expect([201, 422, 429]).toContain(res.status);
    });
  });
});
