import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient | null = null; // Declare prisma with type annotation

function getPrismaClient() {
    if (!prisma) {
        prisma = new PrismaClient();
    }
    return prisma;
}

const client = getPrismaClient();
export default client;

