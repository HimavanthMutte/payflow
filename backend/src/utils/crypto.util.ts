import argon2 from 'argon2';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return argon2.verify(hash, password);
}

export async function hashPin(pin: string): Promise<string> {
  return argon2.hash(pin, {
    type: argon2.argon2id,
    memoryCost: 32768,
    timeCost: 2,
    parallelism: 2,
  });
}

export async function verifyPin(
  pin: string,
  hash: string,
): Promise<boolean> {
  return argon2.verify(hash, pin);
}

export function generateReferenceNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `PF${timestamp}${random}`;
}

export function generateIdempotencyKey(): string {
  return uuidv4();
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function hashRequest(body: object): string {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(body))
    .digest('hex');
}

export function generateSecureToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}
