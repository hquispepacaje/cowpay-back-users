import { PrismaClient } from '@prisma/client';

// Evita múltiples instancias en desarrollo (Hot Reload) y mantiene una única en producción
const globalForPrisma = global as unknown as { prisma: PrismaClient };

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("La variable de entorno DATABASE_URL no está definida. Asegúrate de configurarla en local.settings.json o en Azure Portal.");
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'error'],
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;