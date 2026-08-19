import { PrismaClient, Priority } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'demo@devboard.local' },
    update: {},
    create: {
      name: 'Demo User',
      email: 'demo@devboard.local',
      passwordHash: await argon2.hash('Demo1234'),
    },
  });

  await prisma.board.deleteMany({ where: { ownerId: user.id } });

  for (const [boardIndex, boardName] of [
    'Portfolio Launch',
    'API Hardening',
  ].entries()) {
    await prisma.board.create({
      data: {
        name: boardName,
        description:
          boardIndex === 0
            ? 'Ship a polished public portfolio project.'
            : 'Improve API reliability and security posture.',
        ownerId: user.id,
        columns: {
          create: [
            {
              name: 'Backlog',
              position: 0,
              tasks: {
                create: [
                  {
                    title: 'Document deployment flow',
                    priority: Priority.MEDIUM,
                    position: 0,
                  },
                  {
                    title: 'Prepare screenshots',
                    priority: Priority.LOW,
                    position: 1,
                  },
                ],
              },
            },
            {
              name: 'Em andamento',
              position: 1,
              tasks: {
                create: [
                  {
                    title: 'Implement Kanban ordering',
                    priority: Priority.HIGH,
                    dueDate: new Date(Date.now() + 86400000 * 3),
                    position: 0,
                  },
                ],
              },
            },
            {
              name: 'Concluído',
              position: 2,
              tasks: {
                create: [
                  {
                    title: 'Configure PostgreSQL and Prisma',
                    priority: Priority.URGENT,
                    position: 0,
                  },
                ],
              },
            },
          ],
        },
      },
    });
  }
}

main().finally(async () => prisma.$disconnect());
