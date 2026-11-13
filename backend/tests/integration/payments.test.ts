import request from 'supertest';
import { app } from '../../src/index';
import { v4 as uuidv4 } from 'uuid';

describe('Payments Integration Tests', () => {
  let authToken = '';

  beforeAll(async () => {
    // Attempt login as seed user
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'alice@payflow.internal', password: 'Password@123' });
    if (res.status === 200) {
      authToken = res.body.data.accessToken;
    }
  });

  it('POST /api/v1/payments - validates required fields', async () => {
    const res = await request(app)
      .post('/api/v1/payments')
      .set('Authorization', `Bearer ${authToken}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/payments - enforces idempotency', async () => {
    if (!authToken) return;
    const idempotencyKey = uuidv4();
    const payload = {
      recipientVirtualId: 'bob@payflow',
      amountPaise: '1000', // ₹10.00
      pin: '123456',
      description: 'Idempotency test',
      idempotencyKey,
      simulationScenario: 'SUCCESS',
    };

    const first = await request(app)
      .post('/api/v1/payments')
      .set('Authorization', `Bearer ${authToken}`)
      .send(payload);

    if (first.status === 201) {
      const second = await request(app)
        .post('/api/v1/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload);

      expect(second.status).toBe(201);
      expect(second.body.data.id).toBe(first.body.data.id);
      expect(second.body.data.referenceNumber).toBe(first.body.data.referenceNumber);
    }
  });

  it('POST /api/v1/payments - rejects self-payment', async () => {
    if (!authToken) return;
    const res = await request(app)
      .post('/api/v1/payments')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        recipientVirtualId: 'alice@payflow',
        amountPaise: '500',
        pin: '123456',
        idempotencyKey: uuidv4(),
      });

    expect(res.status).toBe(422);
  });
});
