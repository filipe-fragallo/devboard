import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { BoardsService } from './boards.service';
import { CreateBoardDto, CreateColumnDto, UpdateBoardDto } from './dto';

@ApiBearerAuth()
@ApiTags('boards')
@UseGuards(JwtAuthGuard)
@Controller('boards')
export class BoardsController {
  constructor(private readonly boards: BoardsService) {}

  @Get()
  list(@CurrentUser() user: { sub: string }) {
    return this.boards.list(user.sub);
  }

  @Get('dashboard')
  dashboard(@CurrentUser() user: { sub: string }) {
    return this.boards.dashboard(user.sub);
  }

  @Post()
  create(@CurrentUser() user: { sub: string }, @Body() dto: CreateBoardDto) {
    return this.boards.create(user.sub, dto);
  }

  @Get(':id')
  get(@CurrentUser() user: { sub: string }, @Param('id') id: string) {
    return this.boards.getOwned(user.sub, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: { sub: string },
    @Param('id') id: string,
    @Body() dto: UpdateBoardDto,
  ) {
    return this.boards.update(user.sub, id, dto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  remove(@CurrentUser() user: { sub: string }, @Param('id') id: string) {
    return this.boards.remove(user.sub, id);
  }

  @Post(':id/columns')
  createColumn(
    @CurrentUser() user: { sub: string },
    @Param('id') id: string,
    @Body() dto: CreateColumnDto,
  ) {
    return this.boards.createColumn(user.sub, id, dto);
  }
}
