import { TasksService } from '../src/tasks/tasks.service';

describe('TasksService', () => {
  it('creates a task at the end of the target column', async () => {
    const prisma = {
      task: {
        count: jest.fn().mockResolvedValue(2),
        create: jest.fn().mockResolvedValue({ id: 't1', position: 2 }),
      },
    };
    const boards = {
      assertColumnOwner: jest.fn().mockResolvedValue({ id: 'c1' }),
    };
    const service = new TasksService(prisma as never, boards as never);
    await expect(
      service.create('u1', { title: 'Ship', columnId: 'c1', priority: 'HIGH' }),
    ).resolves.toEqual({ id: 't1', position: 2 });
    expect(prisma.task.create.mock.calls[0][0].data.position).toBe(2);
  });
});
