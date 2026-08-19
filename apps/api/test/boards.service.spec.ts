import { ForbiddenException } from '@nestjs/common';
import { BoardsService } from '../src/boards/boards.service';

describe('BoardsService', () => {
  const prisma = {
    board: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    column: {
      count: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    task: { count: jest.fn() },
  };
  const service = new BoardsService(prisma as never);

  beforeEach(() => jest.clearAllMocks());

  it('creates a board with default Kanban columns', async () => {
    prisma.board.create.mockResolvedValue({ id: 'b1' });
    await service.create('u1', { name: 'Roadmap' });
    expect(
      prisma.board.create.mock.calls[0][0].data.columns.create,
    ).toHaveLength(3);
  });

  it('blocks access to a board from another user', async () => {
    prisma.board.findUnique.mockResolvedValue({
      id: 'b1',
      ownerId: 'u2',
      columns: [],
    });
    await expect(service.getOwned('u1', 'b1')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });
});
