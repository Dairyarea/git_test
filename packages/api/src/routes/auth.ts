import { FastifyPluginAsync } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { createHash } from 'crypto';
import { z } from 'zod';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  return createHash('sha256').update(password + process.env.PASSWORD_SALT || 'salt').digest('hex');
}

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(2).max(30),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const authRoutes: FastifyPluginAsync = async (server) => {
  server.post('/register', async (request, reply) => {
    const body = registerSchema.parse(request.body);

    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) return reply.code(409).send({ error: 'Email already registered' });

    const user = await prisma.user.create({
      data: {
        email: body.email,
        displayName: body.displayName,
        passwordHash: hashPassword(body.password),
      },
    });

    const token = server.jwt.sign({ sub: user.id, email: user.email, displayName: user.displayName });
    return { token, user: { id: user.id, email: user.email, displayName: user.displayName } };
  });

  server.post('/login', async (request, reply) => {
    const body = loginSchema.parse(request.body);

    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user || user.passwordHash !== hashPassword(body.password)) {
      return reply.code(401).send({ error: 'Invalid credentials' });
    }

    const token = server.jwt.sign({ sub: user.id, email: user.email, displayName: user.displayName });
    return { token, user: { id: user.id, email: user.email, displayName: user.displayName } };
  });

  server.get('/me', async (request) => {
    const user = await prisma.user.findUnique({
      where: { id: request.userId },
      select: { id: true, email: true, displayName: true, avatarUrl: true, createdAt: true },
    });
    return user;
  });
};
