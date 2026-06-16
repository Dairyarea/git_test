import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function requireLeagueMember(
  request: FastifyRequest<{ Params: { leagueId: string } }>,
  reply: FastifyReply,
) {
  const { leagueId } = request.params;
  const member = await prisma.leagueMember.findUnique({
    where: { leagueId_userId: { leagueId, userId: request.userId } },
  });
  if (!member) {
    reply.code(403).send({ error: 'Not a member of this league' });
  }
}

export async function requireCommissioner(
  request: FastifyRequest<{ Params: { leagueId: string } }>,
  reply: FastifyReply,
) {
  const { leagueId } = request.params;
  const member = await prisma.leagueMember.findUnique({
    where: { leagueId_userId: { leagueId, userId: request.userId } },
  });
  if (!member || member.role !== 'COMMISSIONER') {
    reply.code(403).send({ error: 'Commissioner access required' });
  }
}
