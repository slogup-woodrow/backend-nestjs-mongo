import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Board, BoardSchema } from './entities/board.entity';
import { BoardRepository } from './repositories/board.repository';
import { BoardService } from './services/board.service';
import { BoardController } from './controllers/board.controller';
// import { Counter, CounterSchema } from '../../shared/schemas/counter.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Board.name, schema: BoardSchema },
      //  { name: Counter.name, schema: CounterSchema },
    ]),
  ],
  controllers: [BoardController],
  providers: [BoardRepository, BoardService],
  exports: [BoardRepository, BoardService],
})
export class BoardModule {}
