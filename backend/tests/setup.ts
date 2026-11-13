import { execSync } from 'child_process';
import path from 'path';

export default async function setup() {
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL =
    process.env.DATABASE_URL ||
    'postgresql://postgres:postgres@localhost:5432/payflow_test?schema=public';
  process.env.JWT_SECRET =
    process.env.JWT_SECRET || 'test_jwt_secret_must_be_at_least_32_characters_long';

  try {
    const backendDir = path.resolve(__dirname, '..');
    execSync('npx prisma migrate deploy', {
      stdio: 'ignore',
      cwd: backendDir,
    });
  } catch {
    // In unit-only or mock environment without active postgres DB
  }
}
