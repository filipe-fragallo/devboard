import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { BoardsController } from './boards.controller';
import { BoardsService } from './boards.service';
import { ColumnsController } from './columns.controller';

@Module({
  imports: [AuthModule],
  controllers: [BoardsController, ColumnsController],
  providers: [BoardsService],
  exports: [BoardsService],
})
export class BoardsModule {}
