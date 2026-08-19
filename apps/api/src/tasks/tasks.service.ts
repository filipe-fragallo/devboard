import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BoardsService } from '../boards/boards.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto, MoveTaskDto, UpdateTaskDto } from './dto';

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly boards: BoardsService,
  ) {}

  async create(userId: string, dto: CreateTaskDto) {
    await this.boards.assertColumnOwner(userId, dto.columnId);
    const count = await this.prisma.task.count({
      where: { columnId: dto.columnId },
    });
    return this.prisma.task.create({
      data: {
        ...dto,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        position: count,
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateTaskDto) {
    await this.assertTaskOwner(userId, id);
    return this.prisma.task.update({
      where: { id },
      data: {
        ...dto,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
    });
  }

  async remove(userId: string, id: string) {
    const task = await this.assertTaskOwner(userId, id);
    await this.prisma.$transaction(async (tx) => {
      await tx.task.delete({ where: { id } });
      await this.reindexColumn(tx, task.columnId);
    });
  }

  async move(userId: string, id: string, dto: MoveTaskDto) {
    return this.prisma.$transaction(async (tx) => {
      const task = await this.assertTaskOwner(userId, id, tx);
      await this.boards.assertColumnOwner(userId, dto.targetColumnId, tx);
      const siblings = await tx.task.findMany({
        where: { columnId: dto.targetColumnId, NOT: { id } },
        orderBy: { position: 'asc' },
      });
      const next = [...siblings];
      next.splice(Math.min(dto.position, next.length), 0, task);
      await tx.task.update({
        where: { id },
        data: { columnId: dto.targetColumnId },
      });
      await Promise.all(
        next.map((item, position) =>
          tx.task.update({
            where: { id: item.id },
            data: { position, columnId: dto.targetColumnId },
          }),
        ),
      );
      if (task.columnId !== dto.targetColumnId)
        await this.reindexColumn(tx, task.columnId);
      return tx.task.findUniqueOrThrow({ where: { id } });
    });
  }

  private async assertTaskOwner(
    userId: string,
    id: string,
    tx: Prisma.TransactionClient | PrismaService = this.prisma,
  ) {
    const task = await tx.task.findUnique({
      where: { id },
      include: { column: { include: { board: true } } },
    });
    if (!task) throw new NotFoundException('Task not found');
    if (task.column.board.ownerId !== userId)
      throw new ForbiddenException('Task belongs to another user');
    return task;
  }

  private async reindexColumn(tx: Prisma.TransactionClient, columnId: string) {
    const tasks = await tx.task.findMany({
      where: { columnId },
      orderBy: { position: 'asc' },
    });
    await Promise.all(
      tasks.map((task, position) =>
        tx.task.update({ where: { id: task.id }, data: { position } }),
      ),
    );
  }
}
