import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateBoardDto,
  CreateColumnDto,
  UpdateBoardDto,
  UpdateColumnDto,
} from './dto';

@Injectable()
export class BoardsService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.board.findMany({
      where: { ownerId: userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        columns: { include: { tasks: true }, orderBy: { position: 'asc' } },
      },
    });
  }

  dashboard(userId: string) {
    return this.prisma.board.findMany({
      where: { ownerId: userId },
      orderBy: { updatedAt: 'desc' },
      take: 6,
      include: { columns: { include: { tasks: true } } },
    });
  }

  async create(userId: string, dto: CreateBoardDto) {
    return this.prisma.board.create({
      data: {
        name: dto.name,
        description: dto.description,
        ownerId: userId,
        columns: {
          create: ['Backlog', 'Em andamento', 'Concluído'].map(
            (name, position) => ({ name, position }),
          ),
        },
      },
      include: {
        columns: {
          orderBy: { position: 'asc' },
          include: { tasks: { orderBy: { position: 'asc' } } },
        },
      },
    });
  }

  async getOwned(userId: string, id: string) {
    const board = await this.prisma.board.findUnique({
      where: { id },
      include: {
        columns: {
          orderBy: { position: 'asc' },
          include: { tasks: { orderBy: { position: 'asc' } } },
        },
      },
    });
    if (!board) throw new NotFoundException('Board not found');
    if (board.ownerId !== userId)
      throw new ForbiddenException('Board belongs to another user');
    return board;
  }

  async update(userId: string, id: string, dto: UpdateBoardDto) {
    await this.getOwned(userId, id);
    return this.prisma.board.update({ where: { id }, data: dto });
  }

  async remove(userId: string, id: string) {
    await this.getOwned(userId, id);
    await this.prisma.board.delete({ where: { id } });
  }

  async createColumn(userId: string, boardId: string, dto: CreateColumnDto) {
    await this.getOwned(userId, boardId);
    const count = await this.prisma.column.count({ where: { boardId } });
    return this.prisma.column.create({
      data: { boardId, name: dto.name, position: count },
    });
  }

  async updateColumn(userId: string, id: string, dto: UpdateColumnDto) {
    await this.assertColumnOwner(userId, id);
    return this.prisma.column.update({ where: { id }, data: dto });
  }

  async removeColumn(userId: string, id: string) {
    await this.assertColumnOwner(userId, id);
    const tasks = await this.prisma.task.count({ where: { columnId: id } });
    if (tasks > 0)
      throw new ForbiddenException('Only empty columns can be removed');
    await this.prisma.column.delete({ where: { id } });
  }

  async assertColumnOwner(
    userId: string,
    columnId: string,
    tx: Prisma.TransactionClient | PrismaService = this.prisma,
  ) {
    const column = await tx.column.findUnique({
      where: { id: columnId },
      include: { board: true },
    });
    if (!column) throw new NotFoundException('Column not found');
    if (column.board.ownerId !== userId)
      throw new ForbiddenException('Column belongs to another user');
    return column;
  }
}
