import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { leagueRoutes } from './routes/leagues';
import { rosterRoutes } from './routes/rosters';
import { draftRoutes } from './routes/drafts';
import { tradeRoutes } from './routes/trades';
import { waiverRoutes } from './routes/waivers';
import { standingsRoutes } from './routes/standings';
import { playerRoutes } from './routes/players';
import { scoringRoutes } from './routes/scoring';
import { authRoutes } from './routes/auth';

const server = Fastify({ logger: true });

server.register(cors, {
  origin: true,
  credentials: true,
});

server.register(jwt, {
  secret: process.env.JWT_SECRET || 'change-me-in-production',
});

server.addHook('onRequest', async (request: any, reply) => {
  const publicRoutes = ['/api/v1/auth/login', '/api/v1/auth/register', '/health'];
  if (publicRoutes.includes(request.url)) return;
  try {
    const payload = await request.jwtVerify<{ sub: string; email: string }>() as any;
    request.userId = payload.sub;
    request.userEmail = payload.email;
  } catch {
    reply.code(401).send({ error: 'Unauthorized' });
  }
});

server.get('/health', async () => ({ status: 'ok', ts: new Date().toISOString() }));

server.register(authRoutes, { prefix: '/api/v1/auth' });
server.register(leagueRoutes, { prefix: '/api/v1/leagues' });
server.register(rosterRoutes, { prefix: '/api/v1/leagues' });
server.register(draftRoutes, { prefix: '/api/v1/leagues' });
server.register(tradeRoutes, { prefix: '/api/v1/leagues' });
server.register(waiverRoutes, { prefix: '/api/v1/leagues' });
server.register(standingsRoutes, { prefix: '/api/v1/leagues' });
server.register(playerRoutes, { prefix: '/api/v1/players' });
server.register(scoringRoutes, { prefix: '/api/v1/leagues' });

const start = async () => {
  try {
    await server.listen({ port: Number(process.env.PORT) || 3000, host: '0.0.0.0' });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
