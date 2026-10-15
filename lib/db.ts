// Prisma Client singleton setup for PostgreSQL integration
// Phase 3: Resilient database client initialization

let prisma: any = null;

try {
  const { PrismaClient } = require('@prisma/client');
  const globalForPrisma = global as unknown as { prisma: any };
  prisma = globalForPrisma.prisma || new PrismaClient({ log: ['query'] });
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
} catch (e) {
  console.warn('Prisma client not yet generated:', e);
  prisma = new Proxy({}, {
    get: () => () => {
      throw new Error('Database not connected. Please run database migrations.');
    }
  });
}

export const db = prisma;
