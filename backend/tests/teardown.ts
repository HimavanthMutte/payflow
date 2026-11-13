import { prisma } from '../src/config/database';

export default async function teardown() {
  try {
    await prisma.$disconnect();
  } catch {
    // Ignore teardown disconnect errors if DB was unreachable
  }
}
