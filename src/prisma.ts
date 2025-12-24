// src/lib/prisma.ts

import { PrismaClient } from '@prisma/client';

// Prevent multiple instances in development hot-reloads
declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// Ensure it is exported as the default instance
export default prisma;