import { FastifyRequest, FastifyReply } from 'fastify';

export interface JwtPayload {
  sub: string;
  email: string;
  displayName: string;
}

declare module 'fastify' {
  interface FastifyRequest {
    userId: string;
    userEmail: string;
  }
}

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  try {
    const payload = await request.jwtVerify<JwtPayload>();
    request.userId = payload.sub;
    request.userEmail = payload.email;
  } catch {
    reply.code(401).send({ error: 'Unauthorized' });
  }
}
